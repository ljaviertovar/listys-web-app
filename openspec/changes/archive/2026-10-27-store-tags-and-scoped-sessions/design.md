# Design

## Context

Estado observado en el árbol de trabajo (rama `update/new-lists-flow`, tras la Fase 3). Motivación y alcance en
`proposal.md`; requisitos en `specs/`.

- **Aprendizaje actual.** Dos funciones `SECURITY INVOKER` aprenden en una transacción:
  `merge_ticket_items_to_base_list(p_ticket_id, p_base_list_id, p_item_ids, p_max_items, p_links)` (migración
  `20261025000000`; resuelve cada línea por nombre, vínculo o alias recordado y actualiza o inserta el artículo) y
  `complete_shopping_session(p_session_id, p_total_amount, p_general_notes, p_max_items)` (migración `20261023000000`;
  bloquea la sesión `FOR UPDATE`, empareja ítems marcados por `normalized_name`, una compra por nombre distinto). Ambas
  exigen que el llamante sea el propietario (del recibo y la lista, o de la sesión). Ninguna conoce la tienda.
- **Tiendas.** `stores` con `UNIQUE (id, user_id)` como destino de FKs compuestas; `tickets.store_id` con FK
  `(store_id, user_id) ON DELETE SET NULL (store_id)`; `merge_stores(p_target_id, p_source_id)` mueve recibos y alias y
  borra la origen. RLS de `stores` solo propietario. `StorePickerDialog` (búsqueda, `Create “…”`, `excludeStoreId`,
  `testId`) y `useStores` existen en `features/stores/`.
- **Sesiones.** `createShoppingSession` (`shopping-sessions.service.ts`) comprueba "una activa por usuario" con una
  lectura previa (carrera posible), busca la lista con `.eq('user_id', user.id)` (los colaboradores reciben `404`),
  inserta la sesión y después los ítems ordenados en TypeScript (`purchase_count` desc, `last_purchased_at` desc,
  `sort_order`) en dos llamadas sin transacción. La Server Action gemela de `src/actions/shopping-sessions.ts` repite la
  comprobación. `shopping_session_items` no guarda el artículo de origen; se empareja por `normalized_name`.
- **Supuesto de sesión única en la UI.** Leen "la" sesión activa con `.maybeSingle()` filtrando por usuario, lo que
  **falla** con dos filas: `shopping-lists/page.tsx`, la segunda consulta de `base-lists/[baseListId]/edit/page.tsx` y
  `active-session-provider.tsx` (exportado pero sin uso). `initActiveSession` (store Zustand) y
  `getActiveShoppingSession` ya usan `order + limit(1)`. `StartShoppingDialog` se oculta si existe cualquier sesión y
  reconoce el `409` por el texto `'active shopping run'`. La barra, el sidebar y el dashboard muestran una sola sesión.
- **Filas.** `BaseListItemRow` (chip de cantidad, nombre, `AveragePrice`, nota, `RowMenu` deshabilitado si la lista está
  bloqueada). `ShoppingSessionItems` agrupa por categoría con `CategorySection` (plegable, `defaultOpen`).
- **Restricciones del repositorio** (`AGENTS.md`): migraciones solo aditivas y revisadas, aplicadas solo donde el usuario
  apruebe; Zod en el borde; REST `/api/v1` con adiciones compatibles; Design system v2; `data-testid`; pruebas en
  `tests/` del módulo; sin Supabase local, las E2E se escriben pero no se ejecutan sin permiso.

## Goals / Non-Goals

**Goals:**

- Una sola definición en SQL de la regla de tienda habitual, ejecutada en la misma transacción que cambia las
  estadísticas; la aplicación nunca la recalcula.
- Las tres operaciones que aprenden (fusión de recibo, finalización, fusión de tiendas) siguen siendo una transacción
  cada una, sin firmas nuevas que obliguen a cambiar a sus llamantes.
- El límite de sesiones activas lo garantiza un índice, no una lectura previa.

**Non-Goals:**

- Guardar el historial de compras individual por tienda (solo agregados).
- Exponer estadísticas o nombres de tienda a colaboradores; abrir `stores` con nuevas políticas RLS.
- Recalcular etiquetas por paso del tiempo (un trabajo programado) o al leer.
- Mostrar el último precio por tienda en la UI (Fase 5, FR‑14); aquí solo se guarda.

## Decisions

### D1. Migración aditiva `20261027000000_store_tags_and_scoped_sessions.sql`

- `base_list_item_store_stats(id, user_id, base_list_item_id, store_id, purchase_count int ≥ 0, last_purchased_at,
  last_price numeric NULL, last_price_at NULL, created_at, updated_at)`: `UNIQUE (base_list_item_id, store_id)`; FK
  `base_list_item_id → base_list_items ON DELETE CASCADE`; FK `(store_id, user_id) → stores(id, user_id) ON DELETE
  CASCADE` (una tienda solo se borra al fusionarla, después de mover sus filas, D4); índice en `store_id`; trigger
  `updated_at`. `user_id` es el propietario de la lista y de la tienda: la FK compuesta impide una estadística con la
  tienda de otro usuario. RLS: `SELECT`, `INSERT`, `UPDATE` y `DELETE` con `auth.uid() = user_id`, porque las funciones
  son `SECURITY INVOKER` y escriben como el propietario. Para que ese mismo propietario no pueda escribir directamente
  por PostgREST (spec "Direct write"), un trigger `BEFORE INSERT OR UPDATE OR DELETE` rechaza la escritura salvo que la
  transacción haya fijado `set_config('listys.learning', 'on', true)`, que solo fijan las funciones de D3–D6. El borrado
  en cascada de un artículo no pasa por el trigger de la tabla padre sino por el de esta: el trigger permite `DELETE`
  cuando el artículo padre ya no existe.
  *Alternativa descartada:* funciones `SECURITY DEFINER` sin políticas de escritura: cada una tendría que repetir a mano
  todas las comprobaciones de propiedad que hoy hace la RLS.
- `base_list_items.usual_store_id UUID NULL REFERENCES stores(id) ON DELETE SET NULL` y `usual_store_source TEXT NOT
  NULL DEFAULT 'auto' CHECK IN ('auto','manual')` (valor constante: sin reescritura de filas en PG ≥ 11). Como
  `base_list_items` no tiene `user_id`, un trigger `BEFORE UPDATE OF usual_store_id, usual_store_source` exige que la
  tienda pertenezca al propietario de la lista y, como en las estadísticas, que la escritura venga de una función de
  aprendizaje o de `set_item_usual_store`; la edición genérica de artículos (colaboradores incluidos) no puede tocarlas.
- `shopping_sessions.store_id UUID NULL` con FK `(store_id, user_id) → stores(id, user_id) ON DELETE SET NULL
  (store_id)` e índice, igual que `tickets.store_id`.
- `shopping_session_items.is_other_store BOOLEAN NOT NULL DEFAULT FALSE`: la sección se fija al empezar (spec "The
  session keeps the sections it started with"); los ítems añadidos después quedan en la sección de la tienda por el
  valor por defecto.
- `CREATE UNIQUE INDEX uq_shopping_sessions_one_active_per_list ON shopping_sessions(base_list_id) WHERE status =
  'active'`. Si ya existieran dos sesiones activas en una lista, el índice falla y la migración entera se revierte sin
  tocar datos; la tarea comprueba antes que no las hay.

*Revisión de no pérdida de datos* (obligatoria): ningún `DELETE`/`UPDATE` al migrar; columnas nuevas nullable o con
constante; los `ON DELETE` nuevos solo actúan ante borrados que el usuario ya puede hacer (artículo, tienda vía fusión);
las funciones reemplazadas mantienen firma (`CREATE OR REPLACE`, sin `DROP`).

*Alternativas descartadas:* calcular la etiqueta al leer (repetiría la regla en TypeScript y en cada lectura, y no
permitiría "Abrir una lista no cambia etiquetas" con una etiqueta manual guardada aparte); `stores.user_id` implícito
sin `user_id` en las estadísticas (no habría FK que impida tiendas ajenas); guardar `base_list_item_id` en los ítems de
sesión (cambia el modelo de emparejamiento por nombre del que dependen la estimación y la finalización).

### D2. La regla en una función: `recompute_usual_store(p_item_ids uuid[])`

Interna, invocada solo por las funciones de D3–D5. Como esas funciones son `SECURITY INVOKER`, PostgreSQL exige que
`authenticated` tenga permiso para ejecutar el helper anidado; por eso se revoca `EXECUTE` de `PUBLIC` y `anon`, y se
concede a `authenticated`. El helper rechaza la llamada salvo que `listys.learning = 'on'` esté fijado localmente en la
transacción por una función de aprendizaje. Las llamadas RPC directas no establecen ese contexto y reciben `42501`.
Para cada artículo con `usual_store_source = 'auto'`: `latest = max(last_purchased_at)` de sus filas;
candidatas = filas con `last_purchased_at ≥ latest − 180 días` y `purchase_count ≥ 3`; gana `purchase_count` desc,
`last_purchased_at` desc, `store_id` (desempate determinista); sin candidatas → `NULL`. Solo escribe si el valor cambia
(evita eventos realtime inútiles). Constantes en la propia función (`180`, `3`) con un comentario; cambiarlas no cambia
contratos. La ventana es relativa a la última compra del artículo, no a `now()`, así que el resultado no caduca con el
tiempo y calcularlo solo al escribir es correcto.

### D3. Fusión de recibo y finalización registran compras

- `merge_ticket_items_to_base_list` (misma firma): lee `tickets.store_id` al validar el recibo. Si no es nulo, acumula en
  el bucle `(artículo destino, precio de la línea)`; tras el bucle hace un *upsert* por artículo distinto: `purchase_count
  + 1`, `last_purchased_at = now()`, y `last_price/last_price_at` solo si el precio de la última línea con precio de ese
  artículo no es nulo. Después `recompute_usual_store` de esos artículos.
- `complete_shopping_session` (misma firma): lee `store_id` en el `SELECT … FOR UPDATE` existente; en cada rama
  "actualizado" o "insertado" acumula el id del artículo; al final, si hay tienda, *upsert* sin precio (spec "Session
  price is not a receipt price") y recálculo. El bloqueo de la sesión ya hace que una segunda finalización falle sin
  efectos, así que tampoco duplica estadísticas.
- `now()` es el momento de la transacción: la "fecha de compra" es la del registro, coherente con `last_purchased_at`
  actual. No se usa una fecha impresa en el recibo (no se extrae).

*Alternativa descartada:* un trigger sobre `base_list_items` que infiera compras: no sabe la tienda ni distingue fusión,
finalización o edición manual.

### D4. `merge_stores` combina estadísticas y etiquetas

Antes de borrar la origen (mismo orden de bloqueo actual): `UPDATE shopping_sessions SET store_id = destino`; para cada
fila de estadística de la origen, *upsert* en la destino sumando `purchase_count`, `greatest(last_purchased_at)` y el
`last_price` de la fila con `last_price_at` más reciente; borrar las filas origen; `UPDATE base_list_items SET
usual_store_id = destino` conservando `usual_store_source`; `recompute_usual_store` de los artículos afectados en modo
auto. El `DELETE` de filas de estadísticas ocurre solo dentro de la fusión que el usuario confirma (ya hoy borra la
tienda).

### D5. Tienda habitual manual: `set_item_usual_store(p_item_id uuid, p_store_id uuid NULL)`

Invoker; exige `auth.uid()` propietario de la lista del artículo (`P0002` si no, también para colaboradores, que no
pueden distinguir artículos ajenos), y que la tienda sea suya (`P0002`). Con tienda → `manual`; con `NULL` → `auto` y
recálculo inmediato (spec "Clearing a manual tag"). Devuelve el artículo con su resumen de tiendas (D7). Se descartó
aceptar `usual_store_source` en el `PATCH` genérico: dos campos que deben cambiar juntos y con reglas distintas.

### D6. Empezar una sesión: `start_shopping_session(p_base_list_id, p_name, p_store_id NULL)`

Invoker, una transacción: lista propia (`P0002`); tienda propia si viene (`P0002`); lista sin artículos (`P0001
LIST_EMPTY`); `INSERT` de la sesión — una violación del índice de D1 se captura y se relanza como `23505` con `DETAIL` =
id de la sesión activa; `INSERT … SELECT` de los artículos con el mismo orden que hoy hace TypeScript y
`is_other_store = NOT (usual_store_id = p_store_id OR EXISTS stats(artículo, p_store_id))` cuando hay tienda (falso sin
tienda). Devuelve la sesión. El servicio deja de leer "sesiones activas del usuario" y traduce errores con el patrón de
`rpc-errors.ts`: `P0002` → `404`, `LIST_EMPTY` → `409`, `23505` → `409 CONFLICT` con `details.activeSessionId` (la clave
que el cliente ya lee). La Server Action gemela llama al mismo RPC.

*Alternativa descartada:* mantener las dos llamadas e insertar `is_other_store` desde TypeScript: la carrera del
límite seguiría resuelta por el índice, pero un fallo al copiar ítems dejaría una sesión vacía que además bloquearía la
lista (spec "Starting a session is all or nothing").

### D7. Contrato v1 (compatible) y lecturas

- `POST /api/v1/shopping-sessions`: `store_id` opcional (`uuid | null`); respuesta añade `store_id`. El `409` por lista en
  curso conserva `CONFLICT` y `details.activeSessionId`; el mensaje pasa a "This list already has a shopping session in
  progress." El cliente deja de buscar texto y usa `activeSessionId`.
- `PATCH /api/v1/base-list-items/{itemId}`: `usual_store_id: uuid | null` opcional. Si viene, el servicio llama a
  `set_item_usual_store` y no mezcla esa escritura con otros campos en la misma petición (`422` si se combinan, para que
  el resultado sea atómico y predecible).
- Lectura de lista (`getBaseList`, `GET /api/v1/base-lists/{id}`): cada artículo añade `usual_store: { id, name, source }
  | null` y `other_stores: [{ id, name, purchase_count }]` (orden por compras desc, última compra desc; sin la habitual).
  Se obtiene con un *embed* de `base_list_item_store_stats(… , store:stores(id, name))` y `usual_store:stores(id,
  name)`; para un colaborador la RLS devuelve vacío y el mapeo da `null`/`[]` (spec "Collaborator reads a shared list").
  Un helper puro `buildItemStoreSummary` hace el mapeo y se prueba; `formatAlsoAt(otherStores)` produce "Also at A, B
  +N".
- Sesión (`getShoppingSession`) y historial añaden `store: { id, name } | null` (embed; `null` para quien no puede
  leerla) y los ítems `is_other_store`.
- Sin versión nueva: campos opcionales y de respuesta nuevos; el `409` mantiene código y detalle. Entradas en
  `docs/reference/api-v1.md` y `CHANGELOG.md`.

### D8. UI

- **Fila de artículo:** bajo el nombre, junto a precio y nota, un chip de tienda con el nombre de la tienda habitual y
  un texto secundario "Also at …" (truncable, nombre completo en la etiqueta accesible). Se deriva de 7.8 (fila de ítem)
  y del chip de estado de 7.3; se documenta en `DESIGN.md` y en 11.4. Menú: "Set Usual Store…"/"Change Usual Store…"
  abre `StorePickerDialog` (descripción "Automatic, from your purchases" o "Chosen by you"); "Use Automatic Store" solo
  si es manual. Solo para el propietario y deshabilitado con la lista bloqueada. La lógica (PATCH y `router.refresh()`)
  va en `useBaseListItemActions`.
- **Hoja "Start Shopping":** fila "Store" con "Whole list" por defecto que abre `StorePickerDialog` anidado (permite
  crear); al elegir, un aviso dice cuántos artículos van primero o advierte que no hay ninguno de esa tienda (contado en
  cliente con el resumen de D7). Se quita "Only one shopping session can be active at a time." El botón se oculta solo
  si **esta** lista está en curso, y se sustituye por "Resume Shopping".
- **Sesión:** con tienda, `ShoppingSessionItems` pinta dos bloques: la sección de la tienda ("At No Frills", o "At this
  store" si no se puede leer el nombre) con sus categorías, y una `CategorySection`-like plegada "Other Stores and
  Untagged" con contador; abierta si la primera está vacía. Helper puro `splitSessionSections(items)` probado. La cabecera
  muestra la tienda junto al estado.
- **Varias sesiones:** el store Zustand pasa a `sessions: ActiveSessionSummary[]` (`id`, `name`, `base_list_id`,
  `started_at`) con `activeSession` derivado (la más reciente) y `otherCount`; `initActiveSession` carga todas las
  activas visibles (acotado por el límite de listas). La barra, el sidebar y el dashboard muestran la más reciente y "+N
  more in progress" que lleva a la pantalla de listas. Las consultas con `.maybeSingle()` sobre sesiones del usuario pasan
  a consultas por lista o a `order + limit`. `active-session-provider.tsx` no se usa y codifica la regla antigua: se
  elimina junto con su export.
- **Añadir a lista desde un recibo sin tienda:** nota informativa en el diálogo (spec "Learning from a receipt without
  a store"), sin bloquear.

## Risks / Trade-offs

- [Un mismo viaje cuenta dos veces si se completa la sesión en una tienda y después se añade su recibo] → ya ocurre con
  `purchase_count`; la Fase 5 (adjuntar recibo a sesión) lo reconcilia. Aceptado aquí.
- [Cambiar la tienda de un recibo ya añadido no mueve sus compras] → la tienda se lee al fusionar; el diálogo invita a
  confirmar antes. Documentado como límite conocido.
- [Volver a añadir el mismo recibo suma otra compra] → comportamiento existente de la fusión; sin cambio.
- [Colaboradores no ven etiquetas ni el nombre de la tienda de la sesión] → coherente con tiendas privadas; texto
  genérico. Se revisará con uso real.
- [El trigger con `set_config` es una convención que una función futura podría olvidar] → comentario en la migración y
  verificación SQL que intenta escrituras directas.
- [Rendimiento del *embed* de estadísticas en listas de 250 artículos] → índices en las FKs; filas por artículo acotadas
  por el límite de tiendas (50).
- [Sin Supabase local, la lógica SQL no se prueba automáticamente] → script de verificación en transacción con
  `ROLLBACK`, pruebas de contrato que simulan los RPC y E2E escritas.

## Migration Plan

1. Comprobar en el destino aprobado que ninguna lista tiene dos sesiones activas.
2. Revisar la migración contra la lista de no pérdida de datos, registrar recuentos de filas, aplicarla y regenerar los
   tipos.
3. Ejecutar el script de verificación.
4. Desplegar la aplicación. El orden importa: la aplicación nueva llama a `start_shopping_session`, que no existe antes
   de la migración; la aplicación antigua sigue funcionando sobre el esquema nuevo (columnas nuevas opcionales, firmas
   intactas; su comprobación por usuario es más estricta que el índice).

Rollback: revertir la aplicación basta; las tablas, columnas, índice y funciones nuevas pueden quedarse. Si hiciera
falta volver a las funciones anteriores, una migración nueva las recrea; no se borran datos.

## Open Questions

- ¿Los colaboradores deberían ver la tienda habitual de una lista compartida? Exigiría abrir la lectura de `stores`; se
  decidirá con uso real sin cambiar este diseño.
- ¿Son 180 días y 3 compras los valores correctos? Ajustables en `recompute_usual_store` sin cambiar contratos; la
  métrica "auto tags overridden" del PRD lo dirá.
