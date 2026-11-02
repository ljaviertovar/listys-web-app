# Proposal

## Why

La revisión de un recibo leído compara bien, pero se entiende mal: "Comparing with" no dice que es la lista a la que irán
los artículos, "Add to a List" no avisa de que también actualiza artículos existentes (y hoy les suma la cantidad del
recibo), las sugerencias "Looks like…?" no se pueden resolver en la pantalla, el badge "Check" mezcla dos problemas
distintos y, una vez decidida, una línea ni se mueve de sección ni se puede corregir. Además, cualquier recibo propone
adjuntarse a un viaje aunque se subiera sin relación con ninguno.

## What Changes

- El selector de lista deja de decir "Comparing with" y nombra la lista destino ("Add to"), con una nota de que los
  estados se calculan frente a ella.
- Al añadir líneas a una lista existente, los artículos que ya están conservan su cantidad habitual; solo los artículos
  nuevos toman la cantidad del recibo. **BREAKING** (comportamiento): hoy la cantidad del recibo se suma a la del artículo.
- La acción de la barra de selección y el diálogo dicen que se añaden productos nuevos y se actualizan los existentes,
  con el desglose "N new · M updated" frente a la lista destino.
- Las líneas con sugerencia muestran una coincidencia propuesta con tres opciones en la propia pantalla: confirmarla,
  elegir otro artículo o añadirla como nueva. Las decisiones pasan al diálogo de añadir ya aplicadas.
- El badge "Check" se divide en "Confirm match" (coincidencia pendiente) y "No price" (precio no leído).
- Una línea resuelta muestra su resultado y ofrece "Change"; sale de "Needs a look" hacia "Matched to"/"New to" salvo que
  le quede otro motivo pendiente (precio no leído).
- Resolver una decisión actualiza los contadores de las secciones y ofrece "Undo".
- La casilla de cada línea significa incluirla en lo que se añade: el texto lo dice ("Include") y la acción en bloque pasa
  de "Accept All N" a "Include All N". Confirmar una coincidencia no marca ni desmarca la línea.
- Al cambiar de lista destino, en lugar de volver a la vista por categorías, se muestra una tarjeta "Comparing with
  <list>…" que se reemplaza por las secciones al terminar.
- Dentro de "Needs a look", "New to" y "Matched to", las líneas se agrupan por categoría (estado → categoría → artículos).
- Un recibo subido fuera de un viaje deja de ofrecer adjuntarse a uno. Un recibo subido desde la tarjeta de recibos de un
  viaje recuerda ese viaje y solo ofrece adjuntarse a él. **BREAKING** (comportamiento): desaparece la elección entre
  varios viajes candidatos.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `receipt-review`: lista destino nombrada, estados con motivo propio, decisiones de coincidencia en la pantalla con
  Change y Undo, secciones que se recalculan, agrupación por categoría, casilla como inclusión, tarjeta de carga al
  cambiar de lista y acción de añadir que explica que añade y actualiza.
- `receipt-item-matching`: añadir a una lista existente conserva la cantidad de los artículos que actualiza; la revisión
  de coincidencias recibe las decisiones tomadas en la pantalla.
- `receipt-session-reconciliation`: la oferta de adjuntar depende del viaje desde el que se subió el recibo; se retira la
  elección entre varios candidatos y el orden del selector de viajes.
- `trip-receipts`: subir un recibo desde la tarjeta de recibos de un viaje lo asocia a ese viaje como origen.

## Impact

- UI: `src/components/features/tickets/receipt/` (lista de líneas, triage, selección, barra), `add-to-list/` (diálogo y
  revisión de coincidencias), `attach/` (tarjeta y diálogo de adjuntar), `upload/` (formulario de subida) y
  `shopping-sessions/trip-receipts-card.tsx`.
- Base de datos: migración aditiva con una columna nula de origen en `tickets` (FK compuesta con `ON DELETE SET NULL`),
  `CREATE OR REPLACE` de `merge_ticket_items_to_base_list` (cantidad) y de `ticket_session_candidates` (solo el viaje de
  origen). Sin borrados ni reescritura de filas.
- API: `POST /api/upload-ticket` acepta un `shopping_session_id` opcional validado; `GET
  /api/v1/tickets/:id/session-candidates` devuelve como mucho el viaje de origen; el servicio de adjuntar rechaza otro viaje.
- Documentación: `docs/design/DESIGN.md` (nota de triage en 7.6 y "Close the loop").
- Tests: helpers de triage y decisiones, revisión de coincidencias, servicio de subida y candidatos, verificación SQL de la
  cantidad, y el E2E `e2e/ui/receipt-attach.e2e.spec.ts`.
