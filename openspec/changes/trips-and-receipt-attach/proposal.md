# Proposal

## Why

"History" no describe lo que el usuario busca ahí (sus viajes), y un viaje sin recibo no se distingue de uno con recibo
salvo por un badge pequeño, así que "Add Receipt" pasa desapercibido. Desde un viaje solo se puede subir un recibo nuevo,
que además saca al usuario a la pantalla del recibo; un recibo ya subido no se puede elegir, la revisión del viaje se
anuncia antes de que haya un recibo leído, y al adjuntarlo la lista conserva la cantidad planificada en vez de aprender
la que realmente se compró.

## What Changes

- La sección "History" pasa a llamarse "Trips" en la navegación, el título, el estado vacío y los enlaces de vuelta
  ("Back to Trips"). La ruta pasa a `/trips`; `/shopping-history` (con su filtro `list`) y `/shopping-history/{groupId}`
  redirigen a ella. **BREAKING** (URL, con redirección).
- Cada viaje muestra por separado su estado (Completed) y el estado de su recibo ("Receipt attached" o "No receipt").
  Un viaje sin recibo destaca "Add Receipt" en la lista de viajes y en su detalle; no tener recibo nunca cambia que el
  viaje esté completado.
- "Add Receipt" en el detalle del viaje ofrece dos caminos: subir uno nuevo o elegir uno ya subido y disponible (leído,
  sin adjuntar, no añadido a una lista y sin otro viaje de origen).
- Subir un recibo desde el viaje deja al usuario en el viaje: la tarjeta muestra que se está leyendo y, al terminar,
  ofrece revisarlo. La revisión "Review how this receipt will update the trip" solo se muestra con un recibo elegido o
  ya leído, nunca mientras se carga o se lee.
- Adjuntar sigue requiriendo confirmar: hasta entonces el viaje no cambia y el recibo queda sin vincular. Cancelar deja
  el recibo disponible para revisarlo después.
- Se retira el límite de 48 horas para adjuntar un recibo a un viaje completado. **BREAKING** (comportamiento): un viaje
  antiguo sin recibo puede recibir uno; solo aporta precios y total, nunca otra compra.
- Al actualizar la lista desde el recibo del viaje, la cantidad comprada (suma de las líneas del artículo) reemplaza la
  cantidad habitual del artículo; nunca se suma. **BREAKING** (comportamiento): hoy se conserva la cantidad planificada
  del viaje. No cambia la regla de añadir un recibo independiente a una lista (conserva la cantidad).

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `shopping-history-by-list`: la sección se llama Trips y vive en `/trips` con redirección de las rutas antiguas; cada
  viaje muestra el estado de su recibo separado del suyo y destaca "Add Receipt".
- `trip-receipts`: el detalle del viaje distingue estado del viaje y del recibo, ofrece subir o elegir un recibo, sigue la
  lectura de un recibo subido desde él y abre la revisión solo con un recibo listo; sin aviso de 48 horas.
- `receipt-session-reconciliation`: sin ventana de 48 horas; adjuntar acepta el viaje de origen o un recibo sin origen
  elegido desde el viaje; cancelar conserva recibo y viaje; la cantidad comprada reemplaza la habitual.

## Impact

- UI: `src/app/(authenticated)/shopping-history/` → `src/app/(authenticated)/trips/`, `data/constants/nav.ts`,
  enlaces del dashboard, `features/shopping-sessions/` (`history-session-card.tsx`, `trip-receipts-card.tsx`,
  `resolve-session-back-link.ts`), la página del viaje `shopping/[runId]/page.tsx`, `features/tickets/upload/` y
  `features/tickets/attach/` (la revisión se abre también desde el viaje).
- Base de datos: migración aditiva con `CREATE OR REPLACE` de `attach_receipt_to_session` (sin ventana, cantidad
  comprada) y `ticket_session_candidates` (sin ventana). Sin borrados ni reescritura de filas.
- API: nuevo `GET /api/v1/shopping-sessions/{sessionId}/available-receipts`; el servicio de adjuntar acepta recibos sin
  origen.
- Documentación: `docs/design/DESIGN.md` ("Close the loop", navegación 7.11 y 11.6 History) y
  `docs/reference/api-v1.md`.
- Dependencia: parte de las reglas que `clarify-receipt-review` (completo, sin archivar) añade a `trip-receipts` y
  `receipt-session-reconciliation`; ese change debe archivarse antes que este.
