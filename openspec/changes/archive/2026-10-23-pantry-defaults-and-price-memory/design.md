# Design

## Context

Motivación y alcance: ver `proposal.md`. Estado observado en el código (rama `update/new-lists-flow`):

- **Finalización.** `completeShoppingSession` existe duplicada en `src/lib/server/services/shopping-sessions.service.ts`
  (ruta `POST /api/v1/shopping-sessions/{id}/complete`, la que usa la UI vía `src/lib/api/endpoints/`) y en
  `src/actions/shopping-sessions.ts`. Ambas hacen tres escrituras separadas: leen la sesión, la marcan `completed` y,
  solo si `sync_to_base`, llaman a la RPC `sync_shopping_session_to_base_list`. No comprueban que la sesión siga
  `active`, así que una segunda finalización volvería a incrementar `purchase_count`. La RPC lanza una excepción si los
  ítems nuevos superan `MAX_ITEMS_PER_BASE_LIST` (250), pero solo después de haber completado la sesión.
- **PATCH.** `updateShoppingSessionSchema` acepta `status: 'completed'` y `sync_to_base`, lo que permite completar sin
  aprender saltándose `/complete`. La UI no usa ese camino.
- **Precios.** `base_list_items.average_price` se calcula en la RPC de fusión de recibos (media ponderada por
  `purchase_count`) y en la de sincronización a partir de `shopping_session_items.price`, que hoy siempre es `null`
  porque `createShoppingSession` no copia precios. `ticket_items.price` es el importe de la línea del recibo (la barra
  de selección suma esos importes como total), no un precio unitario. Ninguna pantalla muestra `average_price`.
- **Primer uso.** No hay perfiles ni aprovisionamiento: `groups` y `base_lists` se crean solo a mano
  (`MAX_GROUPS_PER_USER` = 10). Todos los accesos (Google, correo con y sin confirmación) acaban en `/dashboard`
  (`src/app/auth/callback/route.ts`, `auth-form.tsx`). El layout autenticado y la página se renderizan en paralelo, por
  lo que una provisión en el layout no garantiza que el dashboard la vea en la primera carga.
- **Entorno de verificación.** No hay Supabase local ni usuario de prueba autenticado; `.env.local` apunta a un proyecto
  alojado. El change `stabilize-test-foundation` (0/22 tareas) aún no deja ejecutar E2E de forma segura.
- El producto es solo inglés (`lang='en'`, sin librería i18n); `docs/design/DESIGN.md` §10.4 pide copy listo para
  localizar, sin concatenar fragmentos.

## Goals / Non-Goals

**Goals:**

- Un único camino de finalización, transaccional e idempotente, que siempre aprende.
- Provisión de Pantry garantizada por restricciones de base de datos, sin pasos nuevos para el usuario.
- Mostrar `average_price` y una estimación honesta sin escribir datos nuevos.
- Migración estrictamente aditiva y revisable según `AGENTS.md` (Database & Supabase Patterns).

**Non-Goals:**

- Eliminar la columna `shopping_sessions.sync_to_base` ni la RPC `sync_shopping_session_to_base_list` (migración
  destructiva; se retiran en un change posterior). Se deja de leer la columna y la RPC antigua queda sin uso.
- Unificar el servicio HTTP y las Server Actions duplicados (gap conocido en `implementation-status.md`): se cambian
  ambos y se prueban ambos.
- Corregir la dilución del promedio cuando hay compras sin precio (ver Riesgos) y cualquier precio por tienda.
- Ocultar grupos de la UI o decidir qué es el "grupo predeterminado" para usuarios que ya tienen listas (Fase 2).
- Localizar el nombre "Pantry" (no hay i18n); queda como constante de producto en inglés.

## Decisions

### D1. Una RPC transaccional `complete_shopping_session`

Nueva función SQL `SECURITY INVOKER` (RLS sigue aplicando, como las RPC existentes) con
`(p_session_id uuid, p_total_amount numeric, p_general_notes text, p_max_items integer)` que devuelve
`new_count, updated_count, skipped_count, over_limit_count`. Dentro de una transacción:

1. `SELECT … FROM shopping_sessions WHERE id = p AND user_id = auth.uid() FOR UPDATE`. Sin fila →
   `RAISE EXCEPTION 'SESSION_NOT_FOUND'`; `status <> 'active'` → `RAISE EXCEPTION 'SESSION_NOT_ACTIVE'`. El bloqueo de
   fila serializa finalizaciones simultáneas: la segunda ve `completed` y falla sin efectos (idempotencia).
2. Marca `completed`, `completed_at = now()`, `sync_to_base = true` (el dato persistido describe lo que ocurrió),
   y `total_amount`/`general_notes` solo si se enviaron.
3. Aplica los ítems marcados a la lista: una compra por `normalized_name` distinto y viaje (`DISTINCT ON
   (normalized_name) … ORDER BY normalized_name, sort_order`), actualizando como hoy `quantity`, `unit`, `notes`,
   `category`, `purchase_count + 1`, `last_purchased_at` y `average_price` (misma fórmula que la RPC actual). Los
   ítems nuevos se insertan por `sort_order` mientras quede capacidad (`p_max_items` − filas actuales); los demás
   cuentan en `skipped_count` y `over_limit_count`. Un nombre que normaliza a vacío cuenta solo en `skipped_count`.

*Alternativas:* (a) mantener tres escrituras y reintentar la sincronización → deja ventanas con sesión completada sin
aprender, justo lo que FR‑1 quiere eliminar; (b) llamar a la RPC antigua desde la nueva → hereda la excepción por
límite y el doble conteo; (c) un trigger al pasar a `completed` → oculta el efecto y no se puede devolver el resumen.
La RPC antigua no se modifica para no cambiar a otros llamadores.

El servicio HTTP y la Server Action quedan delgados: validan con Zod, llaman a la RPC y traducen errores. Mapeo
estable por el token del mensaje: `SESSION_NOT_FOUND` → `404 NOT_FOUND`, `SESSION_NOT_ACTIVE` → `409 CONFLICT`,
cualquier otro → `500 INTERNAL_ERROR` con mensaje genérico ("Could not complete the shopping session. Please try
again."); el detalle de base de datos se registra solo en el servidor. Éxito → `200` con
`{ data: { success: true, sync: { new_count, updated_count, skipped_count, over_limit_count } } }` (campo `sync`
aditivo y compatible; `success` se mantiene).

### D2. `sync_to_base` deja de ser una decisión del cliente (contrato v1)

`completeShoppingSessionSchema` conserva `sync_to_base: z.boolean().optional()` solo para aceptar clientes antiguos
(se ignora y se documenta como deprecado en `docs/reference/api-v1.md`, con nota de migración y entrada en
`CHANGELOG.md`). `updateShoppingSessionSchema` elimina `sync_to_base` y rechaza `status: 'completed'` con `422`
indicando `/complete`.

*Por qué no `/api/v2`:* `AGENTS.md` pide nueva versión mayor al cambiar el significado de un campo; aquí el único
consumidor es la propia UI y PRD‑v3 §2 decide explícitamente eliminar el interruptor. Ignorar el campo evita romper
clientes que lo envían; el cambio observable (enviar `false` ya no omite la sincronización) es la intención del
producto y queda documentado. Si más adelante existe un consumidor externo real, se sirve una versión de la ruta; no
se ramifica la lógica (ver "Decisión a confirmar" abajo).

### D3. El tope de 250 ítems no bloquea el viaje

La RPC nueva omite en lugar de lanzar. Se prefiere esto a mantener la excepción porque, al ser atómica, la excepción
dejaría la sesión activa sin salida para quien añadió ítems nuevos durante el viaje en una lista llena. La UI muestra
un `toast` con `over_limit_count` ("N new items weren’t saved to your list because it’s full.") solo cuando es > 0.
Los ítems omitidos siguen en el historial de la sesión.

### D4. Pantry: `ensure_default_pantry()` con índice único parcial

Migración aditiva: `ALTER TABLE groups ADD COLUMN is_default boolean NOT NULL DEFAULT false` (metadato, sin reescribir
filas existentes ni cambiar su valor), `CREATE UNIQUE INDEX uq_groups_one_default_per_user ON groups(user_id) WHERE
is_default`, y la función `SECURITY INVOKER` `ensure_default_pantry(p_group_name, p_list_name) returns boolean` (los nombres los pasa la
aplicación desde una constante única; la función valida que no estén vacíos ni superen 100 caracteres):

```text
si no hay auth.uid()            → error
si existe base_lists propia     → return false           (cuentas con listas: nada cambia)
insert groups(name 'My Lists', is_default = true)
  ON CONFLICT (user_id) WHERE is_default DO NOTHING RETURNING id
si no devolvió id               → return false           (otra petición o provisión previa ganó)
insert base_lists(group_id, user_id, name 'Pantry')
return true
```

Todo ocurre en una transacción; el índice parcial es la garantía en base de datos: dos peticiones simultáneas
compiten por la inserción del grupo y solo la ganadora crea la lista (la perdedora espera el commit y recibe
`DO NOTHING`). El propio grupo predeterminado funciona como marcador de "ya aprovisionado", por lo que borrar
"Pantry" no la recrea y no hace falta una tabla de perfiles. El nombre del grupo ("My Lists") no se ve tras la Fase 2;
mientras tanto la lista aparece como "My Lists › Pantry". Cuenta para `MAX_GROUPS_PER_USER`.

*Alternativas:* (a) trigger `AFTER INSERT ON auth.users` con `SECURITY DEFINER` → no cubre cuentas existentes sin
listas, puede abortar el registro si falla, ejecuta lógica en el esquema `auth` y crearía "Pantry" a cada usuario
creado por las fixtures E2E; (b) comprobar-y-crear en TypeScript → carrera entre pestañas; (c) tabla
`user_onboarding` → más superficie solo para un marcador que el grupo ya proporciona.

*Dónde se llama:* `DashboardContent` (`src/app/(authenticated)/dashboard/page.tsx`) espera a `ensureDefaultPantry()`
**antes** de su `Promise.all` de lecturas, de modo que la primera carga ya incluye la lista. El dashboard es el destino
de todos los inicios de sesión y de la confirmación por correo, así que hay un único punto de llamada. Coste: una
consulta `EXISTS` sobre `idx_base_lists_user_id` por carga del dashboard; si se mide como relevante, se omite con una
cookie marcadora más adelante. *Alternativas descartadas:* el layout (se renderiza en paralelo con la página → carrera
en la primera carga), `auth/callback` (no cubre el inicio con contraseña, que ocurre en el cliente) y una Server Action
desde el formulario (dos puntos de llamada y no cubre sesiones ya abiertas).

El servicio nuevo `src/lib/server/services/default-pantry.service.ts` usa `createAuthenticatedClient`, llama a la RPC
y **nunca lanza**: ante error registra `console.error('[default-pantry] provisioning failed', { code })` (sin datos
del usuario ni mensajes de base de datos) y devuelve `false`; el dashboard se renderiza con lo que haya y reintenta en
la siguiente visita. Un usuario nuevo ve ahora `hasLists = true` con una lista vacía; el dashboard y la lista vacía
deben ofrecer el siguiente paso (añadir ítems o subir un recibo) como exige `product-copy-clarity`.

### D5. Precio promedio: derivado y solo lectura

- **Datos:** no se copia `average_price` a `shopping_session_items.price`. Ese campo es el precio *registrado* (FR‑13
  lo llenará con recibos reales) y la RPC de finalización lo promedia: copiar la estimación la realimentaría como
  si fuera un precio pagado.
- **Estimación:** la página `shopping/[runId]` lee `base_list_items(normalized_name, average_price)` de la lista de la
  sesión (≤ 250 filas; RLS ya permite a los colaboradores, como el resto de la lista compartida) y un helper puro
  `buildSessionPriceEstimate(sessionItems, baseItems)` en `shopping-sessions/helpers/` devuelve
  `{ priceByItemId, total, pricedCount, itemCount }`, emparejando por `normalized_name` (también para ítems añadidos
  durante el viaje). Solo se consideran precios finitos > 0. El total es la **suma de `average_price`**, sin multiplicar
  por la cantidad de la sesión, porque `average_price` promedia importes de línea de recibo. Las sesiones completadas no
  calculan nada. El listener realtime ya hace `router.refresh()`, que recalcula la estimación.
- **UI:** un componente de presentación `AveragePrice` en `components/features/list-items/` (lo usan la fila de la
  lista base y la de sesión, dos sitios → se extrae, `AGENTS.md`) renderiza importe en mono con numerales tabulares y
  la etiqueta "avg"; devuelve `null` sin precio. `SessionEstimate` en `components/features/shopping-sessions/` muestra
  "Estimated total", el importe y "N of M items priced", entre la tarjeta de progreso y la barra de herramientas; no se
  renderiza sin precios. Formato con `formatCurrency` existente (USD, `en-US`). Ambos componentes llevan `testId` y se
  construyen según `docs/design/DESIGN.md` §6.3, §7.8 y §10.4 (sin concatenar fragmentos traducibles) y el HTML v2.

*Alternativas:* columna `estimated_price` en `shopping_session_items` (foto estática, escritura nueva y una columna más
para un dato derivable); ampliar la respuesta de `GET /shopping-sessions/{id}` con `base_list.items` (cambia el
contrato público para un cálculo de presentación).

### D6. Interfaz de finalización

`CompleteSessionSheet` pierde el estado, la casilla `complete-session-sync` y su `Checkbox`; envía `{}` (o los campos
reales de importe/notas si existieran). Copy (inglés, sin fragmentos concatenados): con todo marcado, "All items are
checked. Complete shopping to save this trip to your history and update your list."; con pendientes, "{n} item(s)
still unchecked. Complete shopping and save the items you collected to your history and your list? Unchecked items
stay in your list." Tras el éxito, si `over_limit_count > 0`, `toast` informativo. Los textos de
`docs/design/DESIGN.md` §6.3 y §7.12, que aún describen "Sync changes back to base list", se corrigen en el mismo
cambio.

### D7. Datos existentes y orden de despliegue

La migración solo añade una columna con valor por defecto, un índice único parcial (sin filas que lo violen, porque
nadie tiene `is_default = true`) y dos funciones; no ejecuta `UPDATE`/`DELETE` ni `DROP`. El historial no se
recalcula. Despliegue: migración primero, código después; el código nuevo depende de ambas funciones, el código
antiguo sigue funcionando con la migración aplicada (la RPC antigua y la columna `sync_to_base` permanecen).

## Risks / Trade-offs

- **[Cambio observable en v1: enviar `sync_to_base: false` ya sincroniza]** → documentado como deprecación con nota
  de migración; el único consumidor conocido es la UI. *Decisión a confirmar* antes de aplicar (ver resumen).
- **[Dilución de `average_price`]** la RPC incrementa `purchase_count` aunque el ítem no tuviera precio, y la media usa
  `purchase_count` como peso; un ítem comprado 5 veces sin precio y luego con precio muestra un promedio muy bajo. Como
  FR‑3 lo hace visible, el valor puede parecer extraño → no se corrige aquí (requiere una columna de compras con
  precio, migración propia); se registra en `implementation-status.md` y como pregunta abierta. Hoy el único origen de
  precios son los recibos fusionados, por lo que el efecto aparece sobre todo en ítems comprados por sesión.
- **[El grupo predeterminado ocupa un cupo de grupos]** → 9 grupos restantes para cuentas nuevas; se documenta en
  `limits.md` y se revisa cuando Fase 2 oculte los grupos.
- **[Usuarios con listas no reciben grupo predeterminado]** → deliberado para no tocar sus datos; la Fase 2 debe
  resolver o designar el grupo implícito (se anota como handoff en `implementation-status.md`).
- **[Dashboard espera una consulta más]** → una consulta indexada; si degrada la carga se sustituye por un marcador de
  cookie sin cambiar el contrato.
- **[Fixtures E2E]** → los usuarios que entren por la UI tendrán "Pantry"; las fixtures de
  `stabilize-test-foundation` no deben asumir cuentas vacías ni contar grupos globalmente.
- **[Verificación sin Supabase local]** → no se aplican migraciones ni se ejecuta E2E contra el proyecto alojado; la
  migración se valida revisándola, y las pruebas de RPC requieren que el usuario proporcione un Supabase local o
  autorice otro destino (ver tareas 6.2).
- **[Duplicación servicio/acción]** → se cambian los dos con las mismas pruebas parametrizadas para que no diverjan.

## Migration Plan

1. Crear `supabase/migrations/<timestamp>_pantry_defaults_and_session_completion.sql` (solo `ADD COLUMN`, `CREATE
   UNIQUE INDEX`, `CREATE OR REPLACE FUNCTION`) y revisar explícitamente que no borra ni reescribe filas.
2. Solicitar confirmación del usuario antes de aplicar la migración a cualquier proyecto; no ejecutarla en el alojado
   sin permiso.
3. Regenerar `src/types/database.types.ts` (`pnpm gen:types`) tras aplicarla donde el usuario indique.
4. Desplegar el código. **Reversión:** el código nuevo puede revertirse sin tocar la base de datos (la columna y las
   funciones son inocuas si nadie las llama); la migración no se revierte, porque eliminar `is_default` y las
   funciones es destructivo y solo se haría con confirmación explícita.

## Open Questions

- Si algún cliente externo envía `sync_to_base: false` a `/complete`, ¿se atiende con una versión `/api/v2` en lugar de
  ignorar el campo? (se asume que no hay clientes externos).
- ¿La estimación debe multiplicar por la cantidad de la sesión cuando `average_price` proviene de líneas con cantidad
  distinta de 1? (se asume suma de importes de línea; la medición real de precios decidirá).
- ¿Conviene guardar el conteo de compras con precio para corregir la dilución del promedio en una fase posterior?
