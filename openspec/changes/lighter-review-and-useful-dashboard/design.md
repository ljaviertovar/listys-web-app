# Design

## Context

Motivación y alcance en `proposal.md`; requisitos en `specs/`. Estado observado en la rama `update/new-lists-flow`,
**suponiendo aplicadas la Fase 4** (`store-tags-and-scoped-sessions`, migración `20261027000000`, en implementación en
el árbol de trabajo) **y la Fase 5** (`close-the-loop`, migración `20261028000000`, sin implementar).

- **Pantalla del recibo.** `tickets/[ticketId]/page.tsx` (servidor) compone `TicketReview`, que comparte
  `useTicketSelection` entre `TicketItemsCard` → `TicketItemsList` (secciones por categoría con `CategorySection`,
  nada preseleccionado), `TicketSelectionBar`, `TicketCompareDialog` y `MergeToBaseListDialog`. La lista se elige
  dentro del diálogo (`use-merge-to-base-list`), que después pide `GET /tickets/{id}/matches?base_list_id=` y monta
  Review Matches con `buildMergeReview` (`byName`, `remembered`, `fresh`); sin `remembered` ni `fresh` añade directo.
- **Coincidencias.** `ticket_item_matches(ticket, list)` (invoker, `STABLE`, propietario de recibo y lista) devuelve
  `name` → `alias` → `none` por línea; `getTicketMatches` lo traduce a `{ ticket_item_id, match, base_list_item }`.
  `ticket_items` tiene `normalized_name` y `price` (nullable; el prompt del OCR pone `null` cuando no ve el precio con
  claridad). No hay confianza por línea ni `pg_trgm`.
- **Artículos.** `base_list_items.purchase_count` (por defecto 1 al crearse), `first_seen_at` (alta),
  `last_purchased_at` y, con la Fase 4, `usual_store_id`. No hay historial de compras por artículo.
- **Dashboard.** `DashboardContent` (servidor) lee listas, recibos, historial y sesión activa por `apiGet`, y
  `buildDashboardModel` (puro, probado) construye hero, "Up Next" y las tarjetas Lists, Receipts, History. Las lecturas
  de recibos e historial no tienen límite. La fecha del saludo se resuelve en el cliente porque el servidor no conoce
  la zona horaria.
- **Restricciones** (`AGENTS.md`): migraciones aditivas y revisadas, aplicadas solo con aprobación; REST v1
  compatible con Zod en la frontera, DTOs y colecciones acotadas; Design system v2; `data-testid`; pruebas en `tests/`
  del módulo; sin Supabase local, las E2E se escriben pero no se ejecutan sin permiso.

## Goals / Non-Goals

**Goals:**

- Las reglas (lista destino, sugerencia, ritmo de compra, gasto, última visita) viven en un solo sitio cada una: SQL
  para lo que lee muchas filas, helpers puros probados para lo que solo presenta.
- La pantalla del recibo usa la misma fuente de coincidencias que el diálogo, para que estado y resultado no discrepen.
- Ninguna escritura nueva: esta fase solo lee.

**Non-Goals:**

- Cambiar `merge_ticket_items_to_base_list`: una sugerencia aceptada viaja como el vínculo explícito que ya existe.
- Índices de trigramas: se comparan como mucho 200 líneas con 250 artículos de una lista.
- Cachear o materializar los datos del dashboard.

## Decisions

### D1. Migración aditiva `20261029000000_lighter_review_and_dashboard.sql`

Comprueba al inicio que existen `shopping_sessions.store_id`, `base_list_items.usual_store_id`, `tickets.total_amount`
y `tickets.shopping_session_id` y aborta con un mensaje claro si falta alguna. Después:

- `CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions`.
- `receipt_suggestion_threshold()` (IMMUTABLE, `0.45`), única definición del umbral.
- Funciones de lectura (invoker, `STABLE`, `search_path = public, extensions`, `auth.uid()` obligatorio):
  `ticket_item_suggestions`, `likely_needed_items`, `spending_summary`, `store_last_visits`.
- Índices: `idx_shopping_sessions_user_completed ON shopping_sessions(user_id, completed_at) WHERE status =
  'completed'` e `idx_tickets_user_created ON tickets(user_id, created_at)`, ambos `IF NOT EXISTS`.

*Revisión de no pérdida de datos:* sin `DELETE`, `UPDATE`, `DROP`, backfill ni columnas; una extensión, funciones
nuevas e índices. *Alternativa descartada:* columna de confianza en `ticket_items` rellenada por el OCR (descartada por
el usuario: poco fiable y cambia las Edge Functions).

### D2. Sugerencias: `ticket_item_suggestions(p_ticket_id, p_base_list_id)`

Mismas comprobaciones de propiedad y errores (`P0002`) que `ticket_item_matches`. Para cada línea con `normalized_name`
no vacío que **no** tiene coincidencia por nombre ni por alias en la lista (misma condición que `ticket_item_matches`),
el artículo con mayor `similarity(línea, artículo)` ≥ umbral; desempate por `purchase_count desc`, `name`, `id`
(`DISTINCT ON`). Devuelve `ticket_item_id, base_list_item_id, base_list_item_name`.

*Por qué una función aparte y no ampliar `ticket_item_matches`:* cambiar su tabla de retorno exige `DROP FUNCTION`;
una función nueva es aditiva. `getTicketMatches` llama a las dos en paralelo y une por `ticket_item_id`.
*Alternativa descartada:* calcular parecido en TypeScript: obliga a bajar todos los artículos de la lista al cliente.

### D3. Lista destino y contrato de `/matches`

`GET /api/v1/tickets/{ticketId}/matches`: `base_list_id` pasa a opcional. Sin él, el servicio resuelve la lista
destino (spec "A read receipt is compared with a target list"): `tickets.base_list_id` si la lista es del usuario →
`base_list_id` del recibo más reciente del usuario (`created_at desc`) cuya lista es suya → su lista más antigua
(`created_at asc, id`). Tres consultas acotadas en `resolveReviewTarget` (servicio, probado con cliente simulado);
ninguna lista → `200 { data: [], meta: { base_list: null } }`. Respuesta: `{ data: [{ ticket_item_id, match,
base_list_item, suggestion: { id, name } | null }], meta: { base_list: { id, name } | null } }`. `match` conserva sus
tres valores: un valor nuevo rompería clientes con enumeraciones cerradas; `suggestion` y `meta` son campos nuevos.

*Por qué en el servidor:* una sola petición da destino y estados, y la regla no se duplica entre pantalla y diálogo.

### D4. Clasificación y vista de la pantalla del recibo

- Helper puro `build-receipt-triage.ts` en `features/tickets/receipt/helpers/`: de líneas + coincidencias produce
  `check` (sugerencia, o `price === null`), `fresh` y `matched` (nombre o alias con precio), con motivos por línea, en
  el orden del recibo. Probado.
- Hook `use-receipt-triage.ts` (`receipt/hooks/`): estado `loading | ready | failed | unavailable`, lista destino,
  cambio de lista (vuelve a pedir `/matches?base_list_id=`), reintento. Las listas del selector salen de las listas
  propias (`getBaseLists`, filtrando por propietario, como hace el diálogo). Solo se activa con recibo `completed`,
  con líneas y sin `shopping_session` (Fase 5).
- `TicketItemsList` gana un modo por estado: tres `CategorySection` (o su variante) con título, recuento y chip por
  fila (`StatusChip` de v2 7.3), "In <list>" plegada salvo que sea la única; cabecera de sección con "Select all N".
  El modo por categoría actual queda como respaldo (`loading`, `failed`, `unavailable`). `TicketCompareDialog` recibe
  el mismo modelo.
- `useTicketSelection` gana `selectMany(ids)`; "Select all N" llama con los ids de `matched`.
- Selector de lista destino: fila "Comparing with <list>" con `Select` de shadcn, encima de las secciones.

*Alternativa descartada:* preseleccionar las coincidencias seguras: haría la revisión implícita, contra "Review stays
mandatory".

### D5. Diálogo de añadir

- `MergeToBaseListDialog` recibe `defaultBaseListId` (la lista destino) y lo usa como valor inicial.
- `buildMergeReview` separa las líneas `fresh` con sugerencia en `suggested` (nuevo grupo); `needsReview` cuenta
  también `suggested`. `MergeReviewStep` muestra "Possible matches" antes de "New items": "Link to “X”" decide
  `{ kind: 'link', item: suggestion }` en un toque; "Link to…" y "Add as New" como en `fresh`. `buildMergeLinks`
  trata `suggested` como `fresh`: solo un vínculo elegido viaja en `links`, así que el RPC de fusión no cambia.
- El diálogo sigue pidiendo `/matches` con la lista elegida (puede ser otra): una sola fuente de verdad.

### D6. Artículos probablemente necesarios: `likely_needed_items(p_limit int)`

Sobre `base_list_items` de listas con `user_id = auth.uid()` (los colaboradores quedan fuera por propiedad, no solo por
RLS), con `purchase_count >= 3`: `interval = (last_purchased_at - first_seen_at) / (purchase_count - 1)`, `elapsed =
now() - last_purchased_at`; filtra `interval >= 1 day`, `elapsed >= interval`, `elapsed <= least(4 * interval, 120
days)`; ordena por `elapsed / interval desc, last_purchased_at asc, name, id`; `LIMIT least(greatest(p_limit,1),10)`.
Devuelve id, nombre, lista (id, nombre), tienda habitual (id, nombre), `interval_days` y `days_since` (numéricos), y
`has_history` (si existe algún artículo propio con 3 compras) para distinguir los dos vacíos de la tarjeta.

*Nota sobre los datos:* el alta cuenta como primera compra (`purchase_count` empieza en 1 y `first_seen_at` = alta),
así que "compras − 1" intervalos entre alta y última compra es coherente con lo guardado. Un artículo dado de alta a
mano y comprado después tiene su alta como primer punto: aproximación aceptada y documentada.

Contrato: `GET /api/v1/base-list-items?filter=likely_needed&limit=1..10` (por defecto 5) → `{ data: LikelyNeeded[],
meta: { limit, has_history } }`. `filter` es obligatorio y solo admite `likely_needed` (`422` si falta o es otro): la
colección no tiene otra lectura en v1, y los artículos de una lista siguen bajo `/base-lists/{id}`. *Alternativa
descartada:* `/api/v1/dashboard`: un recurso por pantalla acopla la API a la UI.

### D7. Gasto: `spending_summary(p_from timestamptz, p_to timestamptz)`

Sumas en `[p_from, p_to)` del usuario: `shopping_sessions` `status = 'completed'`, `user_id = auth.uid()`,
`total_amount IS NOT NULL` por `completed_at`; `tickets` con `total_amount IS NOT NULL` y `shopping_session_id IS
NULL` por `created_at`. Devuelve `total`, `trips_count`, `receipts_count` y `trips_without_total` (completadas en el
rango con total nulo). Un recibo adjunto no suma porque su importe ya está (o decidió no estar) en la compra.

Contrato: `GET /api/v1/spending?from=<ISO con zona>&to=<ISO con zona>` → `{ data: { from, to, total, trips_count,
receipts_count, trips_without_total } }`; `422` si falta un extremo, `to <= from` o el rango supera 92 días.

*Zona horaria:* la tarjeta "This Month" es un componente cliente que calcula el inicio del mes y del siguiente en la
zona del visitante (helper puro `currentMonthRange(now, timeZone)`, probado con zonas y cambio de horario) y pide el
gasto; muestra esqueleto y error con reintento propios (hook `use-month-spending.ts` en `features/dashboard/hooks/`).
*Alternativas descartadas:* calcular el mes en UTC en el servidor (falla en los bordes del mes); sumar en el cliente
las lecturas completas de historial y recibos (crecen sin límite).

### D8. Última visita por tienda: `store_last_visits()` y `GET /api/v1/stores`

Por tienda del usuario, la visita más reciente entre compras completadas con `store_id` (`completed_at`) y recibos con
`store_id` y `shopping_session_id IS NULL` (`created_at`): un recibo adjunto se representa por su compra. Devuelve
`store_id, kind ('trip'|'receipt'), id, at, total_amount`. `listStores` la llama junto a su consulta y añade a cada
tienda `last_visit: { kind, id, at, total_amount } | null` (campo nuevo; acotado por `MAX_STORES_PER_USER`). El
dashboard lee `getStores()`, ordena por `at desc` y toma 4 en `buildDashboardModel`. Fila de compra → `/shopping-history`
(la historia no tiene detalle por URL, como hoy las filas de History); fila de recibo → `/tickets/{id}`.

### D9. Dashboard

- `DashboardContent` añade `getLikelyNeededItems()` y `getStores()` al `Promise.all`; cualquier error → 
  `DashboardLoadError` (spec "Dashboard failure stays explicit"). Las lecturas de recibos e historial se mantienen:
  alimentan "Up Next", el hero y su "last trip".
- `buildDashboardModel` gana `likelyNeeded` (con textos ya formados: `formatCadence(interval_days, days_since)`) y
  `storeVisits`; deja de producir `receipts` y `trips` para tarjetas (y `counts`, que nada usa).
- Componentes nuevos en `features/dashboard/`: `LikelyNeededCard`, `MonthSpendingCard` (cliente), `StoreVisitsCard`,
  sobre `DashboardSectionCard`, `DashboardRow`, `RowIcon` y `DashboardEmptyState`. Se retiran `ReceiptsSectionCard` e
  `HistorySectionCard` y sus exportaciones si nada más los usa.
- Rejilla: una columna en teléfonos; de `sm` dos columnas (Lists, Likely Needed / This Month, Last Trip by Store).
  Tintes de v2: Likely Needed ámbar, This Month verde, Last Trip by Store cian; importe en mono como History.
- Derivado de v2 §6.5 (tarjetas de sección, filas y vacíos); se documenta en `DESIGN.md` §6.5 y §11.4.

### D10. Contrato v1 compatible

Rutas nuevas (`/base-list-items` GET colección, `/spending`), campos nuevos (`suggestion`, `meta.base_list`,
`last_visit`) y un parámetro que pasa de obligatorio a opcional: todo aditivo, sin versión nueva. Esquemas Zod en
`src/lib/validations/api/`, DTOs explícitos, entradas en `docs/reference/api-v1.md` y `CHANGELOG.md`, pruebas de
contrato con RPC simulados.

## Risks / Trade-offs

- [El umbral de parecido sugiere productos distintos ("Milk" ↔ "Silk")] → la sugerencia nunca se aplica sola, el texto
  la presenta como parecido de nombre; el umbral es una función que se ajusta sin cambiar contratos.
- [Sin precio no siempre es una mala lectura (artículos gratuitos, ofertas)] → solo pide mirar la foto, no bloquea.
- [El alta manual distorsiona el primer intervalo] → mínimo de 3 compras y límite de 4 intervalos/120 días; documentado.
- [Doble cuenta en el gasto: recibo añadido a una lista y compra del mismo viaje sin adjuntar] → la tarjeta dice de
  dónde sale la suma; mismo límite conocido que la Fase 5.
- [Retirar Receipts e History del dashboard quita accesos directos] → siguen en la navegación; "Up Next" cubre los
  recibos que necesitan acción y el hero muestra la última compra.
- [Una petición más desde el cliente en el dashboard] → solo la tarjeta del gasto espera; el resto se pinta en servidor.
- [Dependencia de Fases 4 y 5] → comprobación al inicio de la migración; el change no se aplica antes que ellas.
- [Sin Supabase local la lógica SQL no se prueba automáticamente] → script de verificación en transacción con
  `ROLLBACK`, contratos con RPC simulados, E2E escritas.

## Migration Plan

1. Confirmar que las migraciones de las Fases 4 y 5 están aplicadas en el destino aprobado por el usuario.
2. Revisar la migración contra la lista de no pérdida de datos, aplicarla (con aprobación) y regenerar tipos.
3. Ejecutar `supabase/verification/lighter-review-and-dashboard.sql` (siempre `ROLLBACK`).
4. Desplegar la aplicación (requiere la migración: llama a funciones nuevas).

Rollback: revertir la aplicación; extensión, funciones e índices pueden quedarse sin efecto. No se borran datos.

## Open Questions

- ¿0,45 es un buen umbral de parecido? Se ajusta en `receipt_suggestion_threshold()` según cuántas sugerencias se
  aceptan.
- ¿3 compras y 4 intervalos/120 días son los cortes correctos para "Likely Needed"? Se ajustan dentro de
  `likely_needed_items` sin cambiar el contrato.
