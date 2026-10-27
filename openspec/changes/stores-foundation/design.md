# Design

## Context

Estado observado en el árbol de trabajo (rama `update/new-lists-flow`, tras la Fase 2). Motivación y alcance en
`proposal.md`; requisitos en `specs/`.

- **Tienda hoy.** `tickets.store_name TEXT NULL` lo escribe solo la subida (`uploadTicket` en
  `src/lib/server/services/tickets.service.ts`, leído de `FormData` sin Zod en el servidor). El formulario
  (`features/tickets/upload/upload-ticket-form.tsx`) lo exige con `uploadTicketSchema`. Se muestra como título en la
  pantalla del recibo, en `TicketCard` y en el dashboard (`build-dashboard-model.ts`), con "Store not recognized" de
  reserva. No existe ninguna entidad de tienda.
- **OCR.** `getOCRFunctionName()` elige `process-ticket-ocr-gemini` (por defecto) o `process-ticket-ocr-openai`; la
  función heredada `process-ticket-ocr` no se invoca. Ambas hacen **una petición por foto**, esperan un **array** de
  artículos, insertan `ticket_items` con el cliente de servicio y actualizan `tickets` (`ocr_status`, `total_items`,
  `ocr_attempts`). Gemini procesa las fotos en paralelo con `response_mime_type: application/json`; OpenAI, en serie.
- **Fusión.** `merge_ticket_items_to_base_list(p_ticket_id, p_base_list_id, p_item_ids, p_max_items)` (migración
  `20260214000000`, `SECURITY INVOKER`) exige ser propietario del recibo y de la lista, cuenta los nombres
  normalizados nuevos contra el límite, y por cada línea actualiza el artículo de igual `normalized_name`
  (`FOR UPDATE`) o inserta uno nuevo. `normalize_item_name` y los triggers mantienen `normalized_name` en
  `ticket_items` y `base_list_items`; existe `UNIQUE (base_list_id, normalized_name)`. El servicio convierte cualquier
  error del RPC en `500`.
- **Diálogo de añadir.** `MergeToBaseListDialog` + `useMergeToBaseList` + helper `merge-ticket-items.ts`: un solo paso
  (lista existente o nueva). `GET /api/v1/base-lists/{id}` devuelve los artículos de la lista (RLS: propietario y
  colaboradores).
- **Plataforma.** PostgreSQL 15 (`supabase/config.toml`), `unaccent` instalado, `update_updated_at_column()` disponible,
  helpers `current_user_owns_list` / `current_user_is_list_collaborator`. UI: shadcn con `combobox.tsx`, `dialog.tsx`
  (`sheetOnPhones`), `ConfirmSheet`.
- **Restricciones del repositorio** (`AGENTS.md`): migraciones solo aditivas y revisadas, sin ejecución sin aprobación;
  Zod en el borde; REST `/api/v1`, adiciones compatibles sin versión nueva; Design system v2; `data-testid`; pruebas en
  `tests/` del módulo; no hay Supabase local, así que las E2E se escriben pero no se ejecutan sin permiso.

## Goals / Non-Goals

**Goals:**

- Una única fuente de verdad en SQL para normalizar tiendas y para decidir cómo coincide cada línea de recibo, usada
  por la vista previa y por la fusión.
- Toda escritura con varias filas (crear, renombrar, fusionar tiendas, asignar tienda con alias, fusión con vínculos)
  en una función transaccional; integridad propietario-tienda garantizada por la base de datos.
- Cero peticiones extra al proveedor de OCR y ningún recibo que falle por la tienda.

**Non-Goals:**

- Backfill de tiendas desde `tickets.store_name` existentes, o cualquier escritura en bloque al aplicar la migración.
- Coincidencia difusa (`pg_trgm`) o sugerencias automáticas de artículos.
- Estadísticas por tienda, etiquetas de tienda habitual, `shopping_sessions.store_id` (Fase 4).
- Borrar tiendas fuera de la fusión; paginar "My Stores" (está acotada por límite).

## Decisions

### D1. Migración aditiva `20261025000000_stores_foundation.sql`

Contenido, todo nuevo salvo la función de fusión:

- `normalize_store_name(text) RETURNS text IMMUTABLE`: `unaccent` + `lower`; quita `#` seguido de dígitos; quita un
  número final suelto de **3 o más** dígitos (número de sucursal, p. ej. "No Frills 3127"); elimina todo lo que no sea
  `[a-z0-9]` (también espacios). Resultado vacío → `NULL` (sin clave; no puede ser tienda). "No Frills", "NOFRILLS",
  "no frills #123" y "No Frills 3127" dan `nofrills`; "Dollar Tree" da `dollartree`.
- `stores(id, user_id → auth.users ON DELETE CASCADE, name, normalized_name, created_at, updated_at)`: `CHECK` de
  `name` recortado de 1–100; `UNIQUE (user_id, normalized_name)`; `UNIQUE (id, user_id)` (destino de FKs compuestas);
  trigger `updated_at`; RLS con cuatro políticas `auth.uid() = user_id`.
- `store_aliases(id, user_id, store_id, alias_key, created_at, updated_at)`: FK `(store_id, user_id) → stores(id,
  user_id) ON DELETE CASCADE`; `UNIQUE (user_id, alias_key)`. **Toda** clave que resuelve a una tienda vive aquí,
  incluida la del nombre actual, así que resolver es una sola búsqueda por índice y la unicidad "una clave → una
  tienda" la garantiza el índice. RLS solo propietario.
- `tickets.store_id UUID NULL` con FK `(store_id, user_id) → stores(id, user_id) ON DELETE SET NULL (store_id)`
  (sintaxis de PG15: solo anula `store_id`, no `user_id`), más índice en `store_id`. La FK compuesta hace imposible
  que un recibo apunte a la tienda de otro usuario aunque falle la aplicación.
- `UNIQUE (id, base_list_id)` en `base_list_items` (índice nuevo; `id` ya es único, así que no puede fallar con datos
  existentes) y `base_list_item_aliases(id, base_list_id → base_lists ON DELETE CASCADE, base_list_item_id, alias_key,
  created_at, updated_at)` con FK `(base_list_item_id, base_list_id) → base_list_items(id, base_list_id) ON DELETE
  CASCADE` y `UNIQUE (base_list_id, alias_key)`. RLS: lectura propietario o colaborador; escritura propietario
  (`current_user_owns_list`). Borrar un artículo borra sus alias (spec "Deleted item").

*Revisión de no pérdida de datos* (obligatoria en la tarea): ningún `DELETE`/`UPDATE` de filas existentes; los
`ON DELETE` nuevos solo actúan ante borrados que el usuario ya puede hacer hoy; el único `DROP` es el de la firma
antigua de la función de fusión (D4), que no toca datos.

*Alternativas descartadas:* columna `stores.aliases text[]` del PRD (sin índice único entre tiendas: dos tiendas
podrían reclamar el mismo alias); validar propiedad solo en la aplicación (un fallo filtraría tiendas); backfill de
tiendas desde `store_name` (escrituras en bloque al migrar y tiendas que el usuario no eligió; el recibo antiguo ya
ofrece su texto como candidato).

### D2. Funciones de tiendas (`SECURITY INVOKER`, `search_path = public`, exigen `auth.uid()`)

- `resolve_store(p_raw_name text) RETURNS uuid`: busca `normalize_store_name(p_raw_name)` en `store_aliases` del usuario.
- `create_store(p_name text, p_max_stores int) RETURNS stores`: bloqueo `pg_advisory_xact_lock` por usuario, comprueba
  el límite, inserta tienda y alias propio. Clave nula → error de validación; clave existente → error de conflicto con
  el `id` de la tienda que la tiene.
- `rename_store(p_store_id, p_name) RETURNS stores`: actualiza nombre y clave e inserta el alias de la clave nueva; el
  alias anterior se queda (spec "Rename"). Si la clave nueva es alias de otra tienda → conflicto con su `id`.
- `assign_ticket_store(p_ticket_id, p_store_id uuid NULL)`: fija o quita `tickets.store_id`. Al fijarla, si la clave del
  `store_name` crudo existe y no resuelve ya a esa tienda, hace *upsert* del alias hacia ella (última elección gana),
  **salvo** que esa clave sea el `normalized_name` actual de otra tienda: re-apuntarla dejaría a esa tienda sin su
  propio nombre, así que se omite sin error.
- `merge_stores(p_target_id, p_source_id) RETURNS stores`: bloquea ambas filas en orden de `id` (evita interbloqueos
  entre fusiones cruzadas), mueve `tickets.store_id` y `store_aliases.store_id` de origen a destino (las claves son
  únicas por usuario, así que no hay colisiones) y borra la tienda origen. Mismo `id` → error de validación.

Errores con `ERRCODE` propios que el servicio traduce (D5): `P0002` → `404`, `22023` → `422`, `23505` → `409 CONFLICT`
(con `DETAIL` = `id` en conflicto), `P0001` con prefijo de límite → `409 LIMIT_EXCEEDED`.

*Alternativa descartada:* escribir con varias llamadas PostgREST desde el servicio: no hay transacción y la fusión o el
alias quedarían a medias ante un fallo (spec "Merge failure").

### D3. Extracción de la tienda en las Edge Functions

- Módulo puro `supabase/functions/_shared/receipt-store.ts` (sin imports de Deno, importable desde Vitest) con
  `parseOcrPayload(content)` → `{ items, storeName }` que acepta el **array antiguo** o el objeto nuevo
  `{ "store_name": string|null, "items": [...] }`, y `sanitizeStoreName(raw)` (una línea, espacios colapsados, sin
  caracteres de control, máx. 100, vacío → `null`). Cualquier valor inesperado del campo de tienda da `null`, nunca
  excepción.
- Solo el prompt de la **primera foto** pide el objeto con `store_name` ("the merchant name printed at the top, without
  address, phone or cashier"); las demás conservan su prompt y siguen devolviendo array. Mismo número de peticiones.
- Al leer el estado inicial (ya se lee `ocr_attempts`) se lee también `store_name`; la actualización final incluye
  `store_name` solo si el recibo no tenía uno. Así no se pisa un nombre enviado por un cliente ni uno extraído antes
  (spec "Re-reading keeps an existing name").
- La función heredada `process-ticket-ocr` no se toca. Desplegar las funciones es manual y se pide aprobación.

*Alternativas descartadas:* una petición aparte solo para la cabecera (duplica coste, contra PRD §11); resolver la
tienda dentro de la Edge Function (necesitaría la identidad del usuario con el cliente de servicio; se resuelve al leer,
D5).

### D4. Coincidencia de líneas: una función compartida y la fusión ampliada

- `ticket_item_matches(p_ticket_id, p_base_list_id) RETURNS TABLE(ticket_item_id, match_kind, base_list_item_id,
  base_list_item_name)` (`STABLE`, invoker): por línea, `name` si hay artículo con igual `normalized_name`; si no,
  `alias` si `base_list_item_aliases` tiene esa clave en la lista; si no, `none`. Exige propiedad de recibo y lista. Lo
  usan la lectura de coincidencias y la fusión, así que la vista previa no puede divergir de lo que se aplica.
- `merge_ticket_items_to_base_list(..., p_links jsonb DEFAULT NULL)`: `DROP FUNCTION` de la firma de 4 argumentos y
  `CREATE` de la de 5 en la misma migración (si convivieran, PostgREST no podría elegir sobrecarga). Las llamadas con
  nombre existentes (servicio y Server Action gemela) siguen funcionando sin `p_links`. `p_links` es un array de
  `{ticket_item_id, base_list_item_id|null}`; se valida antes de escribir: cada línea pertenece a `p_item_ids`, sin
  repetidas; cada artículo pertenece a la lista; una línea con coincidencia `name` no admite vínculo (`22023`).
  Resolución por línea: `name` → actualizar ese artículo; vínculo con artículo → actualizar el artículo vinculado y
  *upsert* de `(base_list_id, clave) → artículo`; vínculo `null` → insertar como nuevo y borrar el alias de esa clave
  en la lista (spec "Undo a remembered match"); sin vínculo y `alias` → actualizar el artículo recordado; si no →
  insertar. El límite cuenta solo las claves distintas que terminan en inserción. Una sola transacción, como hoy.
- La actualización de un artículo vinculado usa exactamente la rama `IF FOUND` actual (cantidad, unidad, categoría,
  `purchase_count`, `last_purchased_at`, `average_price`), para que vincular equivalga a "mismo artículo".

*Alternativas descartadas:* calcular coincidencias en el cliente con los artículos de la lista (duplicaría la
normalización SQL y los alias, que el cliente no lee); una función nueva `..._v2` (dejaría dos caminos de fusión).

### D5. Contrato v1 (compatible) y servicios

- `src/lib/server/services/stores.service.ts`: `listStores`, `createStore`, `renameStore`, `mergeStores`, y un helper
  `mapStoreRpcError` con la tabla de D2. `MAX_STORES_PER_USER = 50` en `src/lib/config/limits.ts`.
- Rutas nuevas: `GET/POST /api/v1/stores` (lista `{ data: [{ id, name, receipt_count, created_at, updated_at }],
  meta: { count, limit } }`, acotada por el límite, orden por nombre; `POST` `201` con `Location`),
  `PATCH /api/v1/stores/{storeId}` (`{ name }`), `POST /api/v1/stores/{storeId}/merge` (`{ source_store_id }`; es un
  comando con efectos sobre recibos y alias, permitido por la política de acciones), y
  `GET /api/v1/tickets/{ticketId}/matches?base_list_id=` → `{ data: [{ ticket_item_id, match: 'name'|'alias'|'none',
  base_list_item: { id, name } | null }] }` para **todas** las líneas del recibo (≤ 200; el cliente filtra su
  selección y así no viajan 200 UUID en la URL).
- `PATCH /api/v1/tickets/{ticketId}` acepta `store_id: uuid | null` (vía `assign_ticket_store`; `group_id` sigue igual).
- `merge-to-base-list` acepta `links` opcional (máx. 200, Zod estricto en forma); sin `links` el comportamiento es el de
  hoy más la aplicación de alias recordados. Errores del RPC mapeados (`404`/`422`/`409`) en lugar de `500` genérico.
- Lecturas: `getTickets` añade `store:stores(id, name)`; `getTicket` añade `store` y `store_suggestion` (`resolve_store`
  del nombre crudo cuando no hay `store_id`; un fallo de la sugerencia no rompe la lectura, deja `null`).
- Subida: el servidor valida campos con un esquema Zod nuevo (`store_name` opcional, recortado, ≤ 100; vacío →
  ausente) **antes** de subir fotos; el esquema de la UI pierde `store_name`.
- Sin versión nueva: todo son campos opcionales nuevos, recursos nuevos y campos de respuesta nuevos (los clientes
  ignoran los desconocidos). La aplicación de alias en `merge-to-base-list` solo puede ocurrir tras un vínculo que el
  propio usuario creó con la versión nueva, así que ningún cliente existente ve un cambio. Entrada en
  `docs/reference/api-v1.md` y `CHANGELOG.md`.

### D6. UI

- **Subida:** se elimina el campo y su `useId`; la nota de obligatorios queda solo para fotos. `DESIGN.md` 7.4.
- **Etiqueta de tienda:** helper puro `getReceiptStoreLabel({ store, store_name })` en `src/utils/` (lo usan recibos,
  pantalla del recibo y dashboard): tienda confirmada → crudo → "Store not recognized".
- **Pantalla del recibo:** `TicketStoreCard` (cliente, `features/tickets/receipt/`, `data-testid='ticket-store-card'`)
  encima del resumen en la columna derecha (debajo de los artículos en móvil, igual que el resumen). Cuatro estados de
  la spec; acciones `Confirm`, `Save as New Store` (diálogo con nombre propuesto por `suggestStoreName(raw)`: quita
  `#123`/número de sucursal y pasa a Title Case, editable), `Choose Another Store`/`Choose a Store`, `Remove Store`. La
  lógica (PATCH del recibo, POST de tienda y `router.refresh()`) va en un hook `useTicketStore`. Para "Save as New
  Store" son dos llamadas (crear y asignar); si la asignación falla, la tienda queda creada y el error ofrece
  reintentar la asignación (no hay pérdida, ver Riesgos).
- **Selector de tienda:** `StorePickerDialog` en `features/stores/` (hoja en móvil): un campo de búsqueda filtra una
  lista de `RadioGroup` con las tiendas y ofrece `Create “…”` cuando el texto no coincide. *Cambio durante la
  implementación:* el `Combobox` instalado (Base UI) abre su lista en un portal fuera de la hoja modal de Radix, que la
  trataría como clic exterior y le quitaría el foco; la lista dentro de la hoja evita ese conflicto y funciona igual con
  teclado y lector de pantalla. Lo reutilizan la tarjeta del recibo y la
  fusión de tiendas.
- **My Stores:** `src/app/(authenticated)/stores/page.tsx` (servidor) + `StoresList` en `features/stores/`: filas con
  nombre y "N receipts", menú con `Rename` (diálogo RHF + Zod) y `Merge Into…` (selector sin la propia tienda →
  `ConfirmSheet` "Merge “NOFRILLS” into “No Frills”? 2 receipts will move. This can’t be undone."). Estado vacío con
  enlace a recibos. Entrada "My Stores" en el grupo *Management* del sidebar y enlace en la cabecera de recibos (el tab
  bar móvil mantiene sus cuatro destinos).
- **Diálogo de añadir a lista:** pasa a dos pasos en modo `existing`. Al pulsar añadir: carga coincidencias y artículos
  de la lista; si alguna línea seleccionada es `none` o `alias` muestra el paso **Review Matches** (secciones "New
  items", "Remembered matches" y, plegada, "Updates by name"); cada línea nueva o recordada tiene `Add as New` /
  `Link to…` (la misma búsqueda sobre una lista de `RadioGroup` con los artículos de la lista, por el motivo del selector
  de tienda). Si todo es `name`, añade directamente. Helpers puros en
  `add-to-list/helpers/merge-review.ts` (`buildMergeReview`, `buildMergeLinks`) y un hook `useMergeReview`, porque
  `useMergeToBaseList` ya roza el umbral de extracción. Errores de carga con `Try Again`, sin añadir nada.
- Ningún diseño v2 cubre estas piezas: se derivan de 7.6 (fila de revisión OCR) para las filas de coincidencia, 7.7
  (tarjeta de lista) para las filas de tienda, 7.12 (diálogos y hojas) para selectores y confirmaciones, y 7.13 para
  estados vacíos y de error; se documentan en `DESIGN.md` y en 11.4.

## Risks / Trade-offs

- [La normalización une sucursales ("Metro 1234" y "Metro 5678" pasan a ser "Metro") o, raramente, dos marcas que
  solo difieren en espacios o puntuación] → unir sucursales es lo buscado en esta fase (la tienda es la cadena); para
  el caso raro no hay "separar tienda" todavía (pregunta abierta), pero ningún recibo se pierde.
- [Alias de artículo creado por error] → siempre visible como "remembered" en la revisión y deshacible en un toque;
  nunca se aplica sin revisión en la web.
- ["Save as New Store" en dos llamadas deja una tienda sin recibo si falla la segunda] → la tienda es visible en "My
  Stores", se puede asignar al reintentar o fusionar; no hay datos perdidos.
- [Restaurar un artículo borrado (`restore-item.ts`) crea un `id` nuevo y pierde sus alias] → aceptado: el siguiente
  recibo mostrará la línea como nueva y el usuario puede volver a vincularla.
- [El modelo de OCR inventa una tienda a partir de una dirección o un eslogan] → es texto crudo; la confirmación es
  explícita y la tienda solo se asigna con un toque del usuario.
- [Clientes que llaman al RPC de fusión por posición con 4 argumentos] → solo el repositorio lo llama, y siempre por
  nombre; el `DROP` + `CREATE` va en la misma transacción de migración.
- [Sin Supabase local, la lógica SQL no se prueba automáticamente] → servicios y rutas con pruebas de contrato que
  simulan el RPC, revisión manual de la migración y escenarios E2E escritos para cuando haya entorno.

## Migration Plan

1. Revisar la migración contra la lista de no pérdida de datos y pedir al usuario el destino antes de aplicarla.
2. Aplicar la migración y regenerar `src/types/database.types.ts`.
3. Desplegar `process-ticket-ocr-gemini` y `process-ticket-ocr-openai` (con aprobación). El orden 2→3 importa poco: las
   funciones solo escriben `store_name`, que ya existe.
4. Desplegar la aplicación.

Rollback: revertir la aplicación y las Edge Functions basta para volver al comportamiento anterior; las tablas y
columnas nuevas pueden quedarse (nadie las lee). Si hiciera falta la firma antigua de la fusión, una migración nueva la
recrea; no se borran datos.

## Open Questions

- ¿Hace falta "separar" una tienda fusionada por error, o basta con renombrar? Se decidirá con uso real; no cambia
  este diseño.
- ¿El número mínimo de dígitos de sucursal (3) es correcto para las cadenas del usuario? Ajustable en la función sin
  cambiar contratos.
