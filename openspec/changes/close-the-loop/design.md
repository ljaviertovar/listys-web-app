# Design

## Context

Motivación y alcance en `proposal.md`; requisitos en `specs/`. Estado observado en la rama `update/new-lists-flow`,
**suponiendo aplicada la Fase 4** (`store-tags-and-scoped-sessions`, todavía sin implementar): este diseño se apoya en
su migración `20261027000000`, sus funciones y su convención de escritura guardada.

- **Recibos.** `tickets` no tiene total ni vínculo con sesiones. El OCR activo es `process-ticket-ocr-gemini` u
  `-openai` (`src/lib/config/ocr.ts`); ambos piden la tienda solo en la primera foto con `STORE_NAME_INSTRUCTIONS` y
  parsean con `parseOcrPayload` de `supabase/functions/_shared/receipt-store.ts` (TypeScript puro, probado con Vitest).
  `retryTicketOCR` borra las líneas y reinicia los campos de lectura. `tickets.base_list_id` lo fijan la fusión
  (`merge_ticket_items_to_base_list`) y `createBaseListFromTicket` (servicio y su Server Action gemela en
  `src/actions/tickets.ts`, que inserta sin RPC). La pantalla del recibo (`tickets/[ticketId]/page.tsx`) compone
  `TicketReview` con `TicketStoreCard` y `TicketSummaryCard` ("Extracted Item Total" = suma de líneas).
- **Sesiones.** `shopping_sessions.total_amount` existe pero ninguna pantalla lo pide. `shopping_session_items.price`
  existe pero ningún flujo lo escribe (no lo copia el inicio, no lo aceptan los esquemas de ítem): hoy siempre es
  `NULL`. `complete_shopping_session` bloquea la sesión `FOR UPDATE`, empareja ítems marcados con artículos por
  `normalized_name` (una compra por nombre distinto) y usa `rec.price` en el promedio. La Fase 4 le añade el registro
  de estadísticas sin precio y `recompute_usual_store`, y crea `start_shopping_session` y el límite por lista.
- **Estadísticas (Fase 4).** `base_list_item_store_stats(purchase_count, last_purchased_at, last_price, last_price_at)`,
  escrita solo con `set_config('listys.learning','on',true)`; el promedio de `base_list_items` lo mantienen las
  funciones de aprendizaje.
- **Coincidencias.** `ticket_item_matches(ticket, list)` (nombre → alias → ninguna) y `base_list_item_aliases` por
  lista; `LinkItemDialog` y `use-merge-review` implementan el paso de vínculos de la fusión.
- **API.** Rutas finas con `withApiHandler`, `parseRouteParams`/`parseSearchParams`, servicios en
  `src/lib/server/services/` y errores de RPC traducidos en `rpc-errors.ts` (solo mensajes propios llegan al cliente).
  `ErrorCode` tiene un conjunto cerrado (`CONFLICT`, `NOT_FOUND`, …); las variantes se distinguen en `details`.
- **Restricciones** (`AGENTS.md`): migraciones aditivas y revisadas, aplicadas solo donde el usuario apruebe;
  transacciones y restricciones en vez de leer y escribir; REST v1 compatible; Design system v2; `data-testid`;
  pruebas en `tests/` del módulo; sin Supabase local, las E2E se escriben pero no se ejecutan sin permiso.

## Goals / Non-Goals

**Goals:**

- Una sola función SQL hace toda la reconciliación en una transacción; la aplicación no repite reglas de conteo.
- La finalización por recibo y la finalización normal comparten el mismo código SQL, para que no puedan divergir.
- La deduplicación la garantizan restricciones y bloqueos, no una comprobación previa en TypeScript.

**Non-Goals:**

- Un `Idempotency-Key` genérico: el par (recibo, sesión) ya identifica la operación y la restricción única la
  deduplica (ver D6).
- Guardar el historial completo de precios por tienda (solo el último, como en la Fase 4).
- Cambiar el modelo de emparejamiento por nombre de sesión ↔ lista ni añadir `base_list_item_id` a los ítems de sesión.
- Paginación en las nuevas lecturas: son listas pequeñas y acotadas en SQL.

## Decisions

### D1. Migración aditiva `20261028000000_close_the_loop.sql` (después de la de la Fase 4)

- `tickets.total_amount NUMERIC(12,2) NULL CHECK (total_amount >= 0)`.
- `CREATE UNIQUE INDEX uq_shopping_sessions_id_user_id ON shopping_sessions(id, user_id)` (destino de FK compuesta;
  `id` ya es PK, no puede fallar).
- `tickets.shopping_session_id UUID NULL`, FK compuesta `(shopping_session_id, user_id) → shopping_sessions(id,
  user_id) ON DELETE SET NULL (shopping_session_id)` y `CREATE UNIQUE INDEX uq_tickets_shopping_session_id ON
  tickets(shopping_session_id) WHERE shopping_session_id IS NOT NULL`. La FK compuesta impide adjuntar la sesión de otro
  usuario aunque falle la aplicación; el índice único da "un recibo por sesión" y, por ser una columna, "una sesión por
  recibo".
- Guarda: trigger `BEFORE INSERT OR UPDATE OF shopping_session_id ON tickets` que rechaza fijar o cambiar la columna
  salvo con `listys.learning = 'on'` (misma convención que la Fase 4). Poner `NULL` por la cascada de `ON DELETE SET
  NULL` pasa por la FK, no por un `UPDATE` de usuario, y se permite cuando la sesión ya no existe.
- `base_list_item_store_stats.last_quantity NUMERIC NULL` y `last_unit TEXT NULL`; las filas existentes quedan sin
  valor (spec "Prices recorded before quantity was kept").
- Funciones: `receipt_attach_window()` (IMMUTABLE, devuelve `interval '48 hours'`, única definición de la ventana);
  `apply_session_completion(p_session_id, p_max_items)` interna; `ticket_session_candidates`,
  `ticket_session_matches`, `attach_receipt_to_session`; `CREATE OR REPLACE` de `complete_shopping_session` y
  `merge_ticket_items_to_base_list` con la misma firma.

*Revisión de no pérdida de datos:* ningún `DELETE`/`UPDATE`/backfill al migrar; columnas nullable sin valor por
defecto; el único `ON DELETE` nuevo vacía una columna cuando el usuario borra o cancela una sesión, cosa que ya puede
hacer; funciones reemplazadas sin `DROP`.

### D2. Un solo núcleo de finalización

El cuerpo actual de `complete_shopping_session` (más lo que añade la Fase 4) pasa a `apply_session_completion`, que
asume la sesión bloqueada y activa y devuelve el resumen y los ids de artículos tocados. `complete_shopping_session`
queda como envoltorio: bloquea, valida y llama al núcleo, con los mismos códigos `SESSION_NOT_FOUND`/
`SESSION_NOT_ACTIVE`. `attach_receipt_to_session` llama al mismo núcleo para una sesión activa. PostgreSQL aplica los
permisos de función invoker con el rol del usuario que llamó, también en llamadas anidadas; por eso no puede revocarse
`EXECUTE` a `authenticated` y conservar el wrapper y la reconciliación como `SECURITY INVOKER`. El permiso del núcleo
se limita a `authenticated` (no `PUBLIC` ni `anon`), y el propio núcleo repite la comprobación de propietario/estado y
bloquea la sesión. Su resultado adicional son ids de artículos de la lista visible para ese usuario. *Alternativa
descartada:* que la función de adjuntar llame a `complete_shopping_session`: repetiría el bloqueo y la validación, y no
devuelve los artículos tocados que la reconciliación necesita.

### D3. Coincidencias recibo ↔ sesión: `ticket_session_matches(p_ticket_id, p_session_id)`

Invoker, `STABLE`, propietario de ambos (`P0002`). Por línea: `match_kind` (`name` si algún ítem de la sesión tiene su
`normalized_name`; `alias` si un alias de la lista de la sesión resuelve a un artículo cuyo `normalized_name` tiene un
ítem de la sesión; `none`), `shopping_session_item_id`, nombre y `checked`. Si varios ítems de la sesión comparten nombre
se elige el de menor `sort_order` (el mismo que la finalización trata como representante, `DISTINCT ON`). Las líneas sin
nombre normalizado salen como `none` y no pueden añadirse. Misma regla que usa `attach_receipt_to_session`, así la
vista previa no puede discrepar del resultado (patrón de `ticket_item_matches`).

### D4. Candidatas: `ticket_session_candidates(p_ticket_id)`

Invoker, `STABLE`. Sesiones del propietario del recibo con `status = 'active'` o `completed_at >= ticket.created_at -
receipt_attach_window()`, sin recibo adjunto; vacío si el recibo no está leído, ya está adjunto o tiene
`base_list_id`. Orden: activas por `started_at desc`, después completadas por `completed_at desc`, desempate por `id`;
`LIMIT 20` (las activas están acotadas por el límite de listas; las completadas por la ventana). Devuelve id, nombre,
lista (id, nombre), estado, fechas, tienda (id, nombre) y recuentos de ítems marcados y totales.

### D5. Reconciliar: `attach_receipt_to_session(p_ticket_id, p_session_id, p_links jsonb, p_added_item_ids uuid[], p_total_amount numeric, p_max_items int)`

Invoker; fija `listys.learning`. Orden:

1. Bloquea el recibo y después la sesión (`FOR UPDATE`, siempre en ese orden, como "receipt first" para evitar
   interbloqueos con la fusión) y la lista de la sesión.
2. **Repetición:** si `tickets.shopping_session_id = p_session_id`, devuelve el estado actual con `replayed = true` y
   sale sin escribir. Si el recibo está adjunto a otra sesión, o la sesión ya tiene recibo → `23505` con `DETAIL` =
   razón.
3. Valida: propietario de ambos (`P0002`), recibo leído (`RECEIPT_NOT_READ`), `base_list_id` nulo
   (`RECEIPT_ADDED_TO_LIST`), sesión activa o dentro de la ventana (`SESSION_OUT_OF_WINDOW`), vínculos y añadidos
   pertenecientes al recibo y a la sesión, sin solapes y sin líneas con coincidencia por nombre vinculadas a otro ítem
   (`22023`), tienda (D7, `STORE_MISMATCH`). Errores de estado con `ERRCODE 'P0001'` y mensaje = razón.
4. Resuelve cada línea: vínculo explícito > nombre > alias > ninguna; guarda el alias de los vínculos en la lista de la
   sesión cuando el ítem enlazado corresponde a un artículo (como la fusión de la Fase 3).
5. **Sesión activa:** marca los ítems coincidentes; inserta las líneas añadidas como ítems marcados (nombre, cantidad,
   unidad, categoría de la línea; `sort_order` al final); escribe en cada ítem coincidente o añadido `price` = suma de
   sus líneas con precio; fija `store_id` y `total_amount` (D7, D8) y llama a `apply_session_completion`, que cuenta
   compras, actualiza promedios con esos precios y registra estadísticas sin precio.
6. **Sesión completada:** escribe los precios en los ítems coincidentes; para cada uno cuyo artículo exista, ajusta el
   promedio como compra ya contada: `avg' = avg IS NULL ? p : (avg·(n−1) + p)/n` con `n = purchase_count`. Las líneas
   añadidas se insertan como ítems marcados y se aplican como compra nueva con la misma lógica por ítem que el núcleo
   (respetando capacidad; las que no caben cuentan en `over_limit_count`). Si la sesión toma tienda ahora (D7), registra
   una compra en esa tienda para cada artículo comprado en la sesión.
7. Con tienda: `last_price/last_quantity/last_unit/last_price_at` para los artículos con precio (cantidad = suma de
   cantidades de sus líneas, unidad = la común o `NULL` si difieren) y `recompute_usual_store` de los tocados.
8. Fija `tickets.shopping_session_id`, `base_list_id` = lista de la sesión y, si el recibo no tenía tienda, la de la
   sesión **sin** aprender alias (spec "Receipt without a store"; aprender alias sigue reservado a una elección
   explícita en `assign_ticket_store`).

Devuelve `completed_now`, `matched_count`, `checked_now_count`, `added_count`, `priced_count`, `over_limit_count`,
`replayed`. *Alternativa descartada:* reconciliar desde TypeScript con varias llamadas: rompe la atomicidad que exige la
spec y reabre carreras con la finalización.

### D6. Idempotencia y concurrencia

El bloqueo del recibo serializa dos peticiones iguales: la segunda ve `shopping_session_id = p_session_id` y responde
como repetición (`200`, `replayed: true`, sin efectos). Dos peticiones con sesiones distintas: la segunda ve el recibo
adjunto → `409`. Dos recibos a la misma sesión: el bloqueo de la sesión los serializa y el índice único es la última
red. `complete_shopping_session` después de un adjuntar que completó la sesión ya falla con `SESSION_NOT_ACTIVE`. Por
esto no hace falta `Idempotency-Key`: la operación se identifica por su par y no tiene efectos externos.

### D7. Regla de tienda

`R` = `tickets.store_id`, `S` = `shopping_sessions.store_id`. `S` nulo y `R` → sesión toma `R` (y, si ya estaba
completada, se registran sus compras en `R`: antes no se registró ninguna, así que no hay doble cuenta). Activa con
`S ≠ R` → la sesión toma `R` antes de completar (aún no hay estadísticas de `S`). Completada con `S ≠ R` → `409
STORE_MISMATCH`: mover compras ya contadas entre tiendas no puede restaurar fechas anteriores. `R` nulo y `S` → el
recibo toma `S`. Ambos nulos → sin estadísticas. La revisión muestra la tienda resultante antes de confirmar.

### D8. Total

`p_total_amount` (opcional, `≥ 0`, dos decimales) es lo que el usuario confirma en la revisión, precargado con
`tickets.total_amount`; si llega, sustituye `shopping_sessions.total_amount`; si no, se conserva el de la sesión.
`tickets.total_amount` nunca se reescribe al adjuntar (spec "Corrected total"). Nunca se usa la suma de líneas como
total pagado.

### D9. OCR del total

`receipt-store.ts` gana `sanitizeReceiptTotal(raw)` (número finito `≥ 0` redondeado a 2 decimales, o `null`; acepta
también una cadena numérica con `.` o `,` decimal) y `TOTAL_INSTRUCTIONS` para la **última** foto, con la respuesta
`{ "total": number | null, "items": [...] }`; con una sola foto se combinan tienda y total en un objeto `{ store_name,
total, items }`. `parseOcrPayload` devuelve también `total`, conservando el soporte de la forma de array. Las dos
funciones guardan `total_amount` del resultado de la última foto en la actualización final; `retryTicketOCR` lo
reinicia a `NULL` con los demás campos de lectura. Sin peticiones nuevas (spec "Long receipt in several photos").

### D10. Bloqueo de la fusión y de crear lista

`merge_ticket_items_to_base_list` (misma firma) rechaza un recibo con `shopping_session_id` (`P0001`
`RECEIPT_ATTACHED`) y registra `last_quantity`/`last_unit` junto al precio. `createBaseListFromTicket` (servicio y
Server Action gemela) lee el recibo del propietario antes de crear la lista y responde `409` si está adjunto; la guarda
del trigger no aplica aquí porque no escribe `shopping_session_id`, y la carrera residual (adjuntar mientras se crea
una lista) termina con una lista nueva y un recibo adjunto, sin doble cuenta en la misma lista: se acepta y se
documenta.

### D11. Contrato v1 (compatible)

- `GET /api/v1/tickets/{ticketId}/session-candidates` → `{ data: Candidate[] }` (D4).
- `GET /api/v1/tickets/{ticketId}/session-matches?shopping_session_id=uuid` → `{ data: SessionMatch[] }` (D3), mismo
  patrón que `/matches`.
- `POST /api/v1/tickets/{ticketId}/attach-to-session`, cuerpo estricto `{ shopping_session_id, links?: [{
  ticket_item_id, shopping_session_item_id: uuid | null }], added_item_ids?: uuid[], total_amount?: number | null }`
  (máximos `MAX_TICKET_ITEMS_MERGE`) → `200 { data: AttachSummary }`. Errores: `404` (recibo o sesión no visibles,
  incluidos los de colaboradores), `422 VALIDATION_ERROR`, `409 CONFLICT` con `details.reason` ∈ {`RECEIPT_NOT_READ`,
  `RECEIPT_ATTACHED`, `RECEIPT_ADDED_TO_LIST`, `SESSION_HAS_RECEIPT`, `SESSION_OUT_OF_WINDOW`, `STORE_MISMATCH`} y
  `details.shopping_session_id` cuando aplica; `409 LIMIT_EXCEEDED` no aplica (el límite nunca bloquea, como en la
  finalización).
- `merge-to-base-list` y `create-base-list`: `409 CONFLICT` con `details.reason = 'RECEIPT_ATTACHED'`.
- Lecturas: recibo añade `total_amount` y `shopping_session: { id, name, status } | null`; sesión y historial añaden
  `receipt: { id } | null`; artículo de lista añade `store_prices: [{ store: {id, name}, last_price, last_quantity,
  last_unit, last_price_at }]` (ampliando el *embed* de estadísticas de la Fase 4; vacío para colaboradores por RLS).
- `rpc-errors.ts` gana un mapeo de contexto `attach` (razones conocidas → `409` con `details.reason`; el `DETAIL` de
  `23505` → razón). Sin versión nueva: rutas y campos nuevos, y un `409` nuevo para un estado que antes no existía.
  Entradas en `docs/reference/api-v1.md` y `CHANGELOG.md`. Solo REST (el diálogo usa `src/lib/api/endpoints/`, como la
  fusión); no se añade Server Action gemela para adjuntar.

### D12. UI

- **Recibo:** `TicketAttachCard` (nueva, `features/tickets/attach/`) encima de la tarjeta de tienda cuando hay
  candidatas: "This receipt may be from a recent trip" con la candidata o "Choose a trip". Abre `AttachToSessionDialog`
  (hoja en teléfonos): paso de elección si hay varias; paso de revisión con tres grupos ("Already checked", "Will be
  checked", "Not in this trip" con acciones "Add as Purchased" y "Link…" que reutiliza `LinkItemDialog` con los ítems
  de la sesión), fila de tienda resultante, campo "Total paid" precargado y botón "Attach and Complete Trip" o "Attach
  to Trip". Estado y llamadas en `use-attach-to-session.ts`; agrupación y payload en un helper puro probado
  (`build-attach-review.ts`). Un recibo adjunto muestra "Attached to <trip>" con enlace y oculta "Add Items to List"
  (`TicketSelectionBar` y diálogo). `TicketSummaryCard` muestra "Receipt Total" cuando existe.
- **Sesión:** con recibo, la cabecera o la tarjeta de progreso muestra "Paid · $X · from receipt" y "View Receipt"; las
  filas de ítems completados muestran su precio cuando lo tienen (reutiliza el hueco de precio de
  `ShoppingSessionItemRow`). Historial: marca de recibo en `HistorySessionCard`.
- **Precios por tienda:** acción "Prices by Store" en `RowMenu` de `BaseListItemRow` (propietario, artículo con algún
  precio); hoja `ItemStorePricesSheet` en `features/base-lists/items/`. Helper puro `compareStorePrices(storePrices)`
  (precio por unidad, comparables por unidad normalizada, empate por fecha, `null` sin dos comparables) probado.
- Todo se deriva de v2 (hoja 7.12, filas 7.8, chip de estado 7.3, tarjeta de aviso) y se documenta en `DESIGN.md`
  §11.4. Las sesiones activas que se completan desde el recibo actualizan la pantalla de sesión por el listener
  realtime existente.

## Risks / Trade-offs

- [El OCR lee un total equivocado (subtotal, cambio)] → instrucciones explícitas, total editable en la revisión y el
  recibo conserva el leído para poder volver a leer.
- [Emparejar por nombre deja líneas abreviadas sin coincidencia] → vínculos manuales recordados como alias; las
  siguientes compras coinciden solas.
- [Promedio ajustado "como compra ya contada" es aproximado si una compra antigua no tuvo precio] → mismo grado de
  aproximación que el promedio actual; documentado.
- [La doble cuenta de recibos añadidos a listas antes de este cambio persiste] → sin recálculo retroactivo (no
  destructivo); límite conocido.
- [Sesión completada con otra tienda bloquea adjuntar] → mensaje claro; el usuario puede corregir la tienda del recibo
  si era el recibo el equivocado.
- [Carrera crear‑lista/adjuntar (D10)] → muy improbable en un solo usuario; aceptada y documentada.
- [Cambio de forma de la respuesta del modelo en la última foto] → `parseOcrPayload` acepta ambas formas; pruebas de
  parseo; sin total el recibo funciona como antes.
- [Dependencia de la Fase 4 no aplicada] → la migración comprueba al inicio que existen `base_list_item_store_stats` y
  `shopping_sessions.store_id` y aborta con un mensaje claro si no.
- [Sin Supabase local la lógica SQL no se prueba automáticamente] → verificación en transacción con `ROLLBACK`,
  contratos con RPC simulados, E2E escritas.

## Migration Plan

1. Confirmar que la Fase 4 está aplicada en el destino aprobado por el usuario.
2. Revisar la migración contra la lista de no pérdida de datos, registrar recuentos de `tickets`, `shopping_sessions`,
   `shopping_session_items`, `base_list_items` y `base_list_item_store_stats`, aplicar, comprobar recuentos idénticos y
   regenerar tipos.
3. Ejecutar `supabase/verification/close-the-loop.sql`.
4. Desplegar las Edge Functions de OCR (con permiso del usuario); antes o después de la aplicación da igual: el campo
   nuevo es opcional.
5. Desplegar la aplicación (requiere la migración: llama a las funciones nuevas).

Rollback: revertir la aplicación y, si hace falta, las Edge Functions; columnas, índices y funciones nuevas pueden
quedarse. Volver a las funciones anteriores requiere una migración nueva que las recree; no se borran datos.

## Open Questions

- ¿48 horas es la ventana correcta? Se ajusta en `receipt_attach_window()` sin cambiar contratos; la métrica "completed
  sessions with an attached receipt" del PRD lo dirá.
