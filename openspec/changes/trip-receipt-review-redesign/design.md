# Design

## Context

Ver `proposal.md` para el motivo. Estado actual (observado en el código, no supuesto):

- `AttachToSessionDialog` pinta tres grupos (`Already checked`, `Will be checked`, `Not in this trip`), un checkbox
  `Add as Purchased` y `Link…` (que abre `LinkItemDialog`). `useTripReview` guarda `addedItemIds` (vacío al abrir, de ahí
  el "fuera por defecto") y `linkedItems`; `buildAttachReview` clasifica y arma el payload.
- `GET /api/v1/tickets/{id}/session-matches` ya devuelve por línea `match: 'name' | 'alias' | 'none'` y el ítem del
  viaje (`TicketSessionMatch`); el cliente hoy solo usa el ítem. `getShoppingSession` ya trae los ítems del viaje con
  `quantity` y `unit`. `getTicket` ya trae por línea `price`, `quantity`, `unit` y `normalized_name`, pero
  `readTicketForReview` solo conserva `id` y `name`.
- `POST /api/v1/tickets/{id}/attach-to-session` acepta `links` (`shopping_session_item_id` puede ser `null`, que desvincula
  la línea) y `added_item_ids`. La RPC `attach_receipt_to_session` rechaza vincular y añadir la misma línea y rechaza
  vincular una coincidencia **por nombre** a otro ítem (`22023`); una vinculación a otro ítem de una coincidencia
  **recordada** (`alias`) se acepta y reemplaza el alias. Solo añade las líneas de `added_item_ids`. Una línea añadida sin
  `normalized_name` entra en el viaje pero no en la lista.
- La RPC ya reemplaza la cantidad del ítem por la suma de las líneas que coinciden (misma unidad; con unidades mezcladas no
  cambia), regla del requisito "The purchased quantity replaces the usual quantity" de `trips-and-receipt-attach`.
- Piezas reutilizables sin editar (tienen cambios sin confirmar de otra sesión): `Badge` `tag` / `tag-attention`
  (`dot`), `commons/data-line`, `commons/entity-label`, `commons/inline-counter`. Ya existen `ChoiceRow` y
  `SearchableChoiceList` (`commons/searchable-choice-list`), `SheetDialog`, `CategorySection` / `CategoryHeading`,
  `ItemQuantityChip` y `RadioGroup`.
- `docs/design/DESIGN.md` 7.6 ("Close the loop") y 7.18/7.19 ya describen el objetivo; 11.4 · 3g lo lista como hueco.

## Goals / Non-Goals

**Goals:**

- Que el valor por defecto de una línea sin coincidencia sea añadirla y que cada decisión (añadir, vincular, dejar fuera)
  sea una sola idea con un solo control (`Change`).
- Producir etiquetas, línea de resultado, secciones y contadores a partir de un único modelo de decisión por línea, para
  que pantalla y payload no puedan divergir.
- La revisión por líneas no toca la API, la RPC ni el esquema. Los varios recibos por viaje de la Fase 5 sí los tocan, con una
  migración no destructiva y cambios aditivos de API (D15 a D17).

**Non-Goals:**

- Cambiar las reglas del servidor sobre qué línea puede vincularse a qué ítem, cuándo se completa el viaje o cómo se cuentan
  las compras. Sí cambian las de cuántos recibos tiene un viaje, de qué tiendas y cómo se mueve uno (D15 a D17).
- Cambiar la revisión de añadir a una lista (`merge-review`, sugerencias `Possible match`, 7.19 F), que sigue como está.
- Cambiar la etiqueta de estado del recibo (D9) ni la pantalla del recibo. La tarjeta de recibo del *detalle del viaje* sí
  cambia (D11 y D12), porque la Fase 7 la dibuja; los textos "Reading Receipt" / "Ready to Review" del chip de
  `tickets-list` y de la pantalla del recibo no se tocan.
- Migrar a la forma `tag` las etiquetas de las filas del recibo fuera del viaje (`No price`, `No name`, `In list`, `New`,
  `Confirm match` de `ticket-item-row` y de la revisión de añadir a una lista). Decidido el 2026-11-04: solo la revisión del
  viaje usa `tag` / `tag-attention`; la coherencia con el resto del producto queda para un change posterior.
- Añadir el menú ⋯ a las tarjetas de recibo, viaje y tienda, y separar fecha y hora del recibo para mostrar sus cifras en
  mono. Son acciones y datos de tarjeta, no de la revisión; change aparte (el único borrado de recibo existente vive en la
  pantalla del recibo y necesita su propia confirmación y Undo).
- Reorganizar la navegación de la revisión (pasos, confirmación, total pagado, tienda): se mantienen.

## Decisions

### D1. El valor por defecto vive en el cliente; el contrato HTTP no cambia

La revisión rellena `added_item_ids` con todas las líneas que resuelven a "añadir". El servidor sigue sin añadir nada que
la petición no nombre (denegar por defecto), por lo que el requisito se redacta como comportamiento de la revisión y no como
nueva regla de la API. *Alternativa descartada:* un campo `add_unmatched: true` en la API; ampliaría un contrato público
para algo que la UI decide y haría que reenviar una petición antigua añadiera líneas sin que nadie lo pidiera.

### D2. Una decisión por línea, guardada solo cuando difiere del valor por defecto

```
ServerMatch = { kind: 'name' | 'alias' | 'none', item: SessionItem | null }   // de session-matches
Decision    = { kind: 'add' } | { kind: 'match', itemId } | { kind: 'leave' }
resolve(line, overrides) =
  nombre ilegible            → leave (bloqueada, sin Change)
  overrides[line.id]         → ese
  kind = name | alias        → match(item del servidor)
  kind = none                → add
```

`useTripReview` guarda `decisions: ReadonlyMap<lineId, Decision>` con **solo** los cambios del usuario; al guardar una
decisión igual a la resuelta por defecto, se borra la entrada. Cerrar la revisión y abrirla de nuevo vacía el mapa (el
valor por defecto vuelve). Sustituye a `addedItemIds`, `linkedItems`, `linkingLineId` y `toggleAdded`/`linkLine`.

Disponibilidad por tipo de coincidencia (lo que el servidor admite, decisión D2b):

| kind del servidor | `add` | `match` | `leave` |
| --- | --- | --- | --- |
| `none` (nombre legible) | por defecto | cualquier ítem del viaje | sí |
| `alias` (recordada) | no ("ya coincide con un ítem") | cualquier ítem; reemplaza el alias | sí (vínculo `null`) |
| `name` (nombre exacto) | no | solo el ítem de la coincidencia | sí (vínculo `null`) |
| nombre ilegible | no | no | fija |

Mapeo a la petición (sin cambiar su forma):

| Decisión efectiva | `added_item_ids` | `links` |
| --- | --- | --- |
| `add` | la línea | — |
| `match` con el ítem del servidor | — | — |
| `match` con otro ítem | — | `{ ticket_item_id, shopping_session_item_id: itemId }` |
| `leave` y `kind` ≠ `none` | — | `{ ticket_item_id, shopping_session_item_id: null }` |
| `leave` y `kind` = `none`, o ilegible | — | — |

Esto es una función pura (`line-decision.ts`): `resolveDecision`, `getAvailableChoices`, `toRequestParts`. `buildAttachReview`
la usa y deja de calcular a mano `notInTrip`.

### D3. Origen de la coincidencia: sin cambios de servidor

`Remembered` = `kind === 'alias'` y sin decisión del usuario; `Linked by you` = decisión `match` con un ítem distinto del
que el servidor propuso (o cualquier `match` sobre una línea `none`); la coincidencia por `name` no lleva etiqueta de
origen. El dato ya viaja en `session-matches`; solo hay que dejar de tirarlo: `TripReview.matches` ya lo guarda y
`buildAttachReview` lo lee. *Alternativa descartada:* añadir un campo `source` a la respuesta; duplica `match`.

### D4. Cantidad previa: se calcula en el cliente con lo que la revisión ya carga

`readTicketForReview` pasa a conservar `price`, `quantity`, `unit` y `normalized_name` por línea (`use-attach-to-session`
mapea lo mismo desde `TicketItem`). La cláusula "usual quantity a → b" usa `a` = `quantity` (y `unit`) del ítem del viaje
(`sessionItems`) y `b` = suma de `quantity ?? 1` de las líneas cuya decisión efectiva apunta a ese ítem, aplicando la
regla de la RPC (unidades distintas entre esas líneas → sin cláusula; igual cantidad → sin cláusula). Se muestra en cada
línea del ítem con el mismo total. Se implementa en una función pura (`plan-quantity-change.ts`) con una tabla de casos que
refleja `supabase/verification/trips-receipt-attach.sql`. *Alternativa descartada:* devolver la cantidad previa y la nueva
desde `session-matches`; obligaría a cambiar una función SQL y a recalcular en el servidor las decisiones del usuario
(vínculos) que solo existen en el cliente hasta confirmar.

### D5. Secciones y contadores derivados del modelo

`buildAttachReview` devuelve `sections: ReviewSection[]` en el orden del spec, con las líneas ya decoradas
(`tag`, `result`, `canChange`), y `counts: { matched, added, leftOut }`. Clasificación: `add` → `new`; `match` con ítem sin
marcar → `willBeChecked`; con ítem marcado → `alreadyChecked`; `leave` e ilegibles → `leftOut`. Los ítems del viaje que
ninguna línea con decisión `match` cubre van a `checkedNotOnReceipt` (marcados) o `notCheckedNotOnReceipt` (sin marcar).
Las secciones vacías no se pintan. `confirmLabel`, `storeMismatch`, `resultingStore` y el total se conservan tal cual.

### D6. Composición de la interfaz (reutilizar antes que crear)

- **Secciones:** `CategorySection` (7.19 D) con un tono/icono propios de la sección de estado. `CategoryHeading` hoy elige
  icono y color por `category`; se le añade un par opcional `icon` + `tone` (capa compartida, sin tocar los usos
  existentes) y una prop `description` para la línea de ayuda de 12px indentada 44px. La sección plegada usa
  `defaultOpen={false}`.
- **Fila de línea:** `TripReviewLineRow` en `features/tickets/attach/`, presentacional: nombre en Title Case
  (`formatItemName`), precio en mono y `ItemQuantityChip` debajo (7.18), etiqueta con `Badge` `tag` / `tag-attention` con
  icono, resultado en `text-xs` gris y `Button` `variant='quiet'` de tamaño táctil (32px visibles, 44px de objetivo). Si el
  tamaño no existe en `ui/button.tsx`, se añade como `size` ahí, nunca con `className`. Sin checkbox ni `Link`.
- **Contadores:** `StatTile` en `commons/` (tarjeta blanca de 16px de radio, azulejo de icono de 28px con tono de estado,
  cifra mono 24 sobre etiqueta de 12px) y tres instancias con `testId`. Se crea en `commons/` porque el lienzo lo reutiliza
  (resumen del recibo, dashboard) y 11.4 lo lista como pieza pendiente; nace con un único uso, sin extraer nada más.
- **Hoja Change Line:** `ChangeLineSheet` sobre `SheetDialog` + `RadioGroup`. Las tres elecciones son filas de la
  pieza A de 7.19 (56px, 16px de radio, anillo; la elegida `#EFF6FF` con anillo azul de 2px). `ChoiceRow` actual es la fila de
  lista de 48px; se añade `variant='card'` a `ChoiceRow` en lugar de crear otra. El buscador de ítems del viaje reutiliza
  `SearchableChoiceList` (`Search trip items`, contador, filas `checked` / `not checked` como `note`). `LinkItemDialog` no se
  borra: lo sigue usando la revisión de añadir a una lista.
- **Hook:** `useTripReview` conserva carga, total y envío; cambia el estado de decisiones (D2). La hoja se abre con
  `editingLineId` (`string | null`). Nada nuevo se envía hasta `submit`.
- **Archivos:** `ChangeLineSheet` y las secciones llevan estado y lógica propios, por lo que viven en archivos propios
  (`change-line-sheet.tsx`, `trip-review-section.tsx`, `trip-review-line-row.tsx`) y el diálogo queda como composición.
  Cada componente nuevo expone `data-testid`.

### D7. Identificadores de prueba

`attach-review-summary`, `attach-review-stat-{matched|new|left-out}`, `attach-review-section-{new|will-be-checked|already-checked|left-out|checked-not-on-receipt|not-checked-not-on-receipt}`,
`attach-review-line-{ticketItemId}`, `change-line-sheet`. Los id antiguos `attach-review-will-be-checked` y
`attach-review-not-in-this-trip` cambian; `e2e/ui/receipt-attach.e2e.spec.ts` se actualiza en la misma tarea.

### D8. Accesibilidad

Cada sección es un botón con `aria-expanded`; las elecciones de Change Line son un `RadioGroup` con etiqueta; el nombre de
`Change` termina con el nombre de la línea (`aria-label` = "Change <nombre>"); los contadores se anuncian como región
`status` educada para que dejar una línea fuera se oiga. Las filas deshabilitadas llevan el motivo en su nota (7.19 A).

### D9. Decisión de copy: `Reading` / `Processed` NO entran en este change

El lienzo nombra el estado del recibo `Reading` y `Processed`; el spec de `product-copy-clarity` exige `Reading Receipt` y
`Ready to Review` ("Receipt lifecycle states are distinct", escenario "Extraction finished": un recibo leído no debe
presentarse como revisado ni como añadido a una lista). Es una decisión de **vocabulario de todo el recibo** (chip de
`tickets-list`, pantalla del recibo, dashboard, e2e), sin relación con esta revisión del viaje, y `Processed` pierde el
verbo que invita a revisar. Se deja fuera para no mezclar un cambio de lenguaje transversal con uno de comportamiento y
para que pueda revertirse por separado. **Recomendación:** si se quiere el vocabulario del lienzo, abrir un change aparte
con un requisito MODIFIED de "Receipt lifecycle states are distinct" (escenario "Extraction finished": la UI indica
"Processed" y ofrece revisar los artículos, sin usar "Completed") más el cambio de `ticket-status.ts` y de `Waiting to Read` /
`Reading Receipt`. Este change solo añade el requisito de copy de la revisión del viaje y deja la nota 3g de DESIGN.md sin
cambios en lo que respecta al estado.

### D10. Documentación

**Referencia visual (`docs/design/listys-design-system.html`).** AGENTS.md dice que, si el código o `DESIGN.md` discrepan del
HTML, el HTML manda y se actualiza en el mismo cambio. Hoy el HTML dibuja todos los chips como el mismo pill y no tiene ejemplo
de la revisión de un recibo contra un viaje (los textos de `DESIGN.md` 11.4 · 3b/3g lo reconocen). Este change lo actualiza en
dos puntos y nada más: (1) la sección de chips muestra los tres niveles de 7.3 (estado con punto, etiqueta en caja con icono
incluida la variante de atención, entidad sin caja) y (2) la sección de patrones de producto añade la Fase 7 completa: la tarjeta de viaje de Trips, el detalle con su
encabezado y los cuatro estados tonales de la tarjeta de recibo (sin recibo, leyendo, listo, ilegible), la lista de elegir un
recibo (con filas deshabilitadas y vacía) y la revisión del viaje con los tres contadores, las seis secciones, una fila con su
resultado y `Change`, y la hoja Change Line. Se escribe con los
tokens y medidas de 7.3, 7.6, 7.17–7.19, sin inventar valores. El resto del HTML (estado del recibo `Reading`/`Processed`,
menús ⋯, chip `Default`) no se toca porque sus decisiones siguen abiertas. *Alternativa descartada:* dejar el HTML para
después; contradice la regla de AGENTS.md y la siguiente comparación visual se haría contra una referencia desactualizada.

`DESIGN.md` 7.6 ya describe el objetivo; se ajusta lo que difiera de lo decidido aquí (cláusula de cantidad en
`Already checked`, filas deshabilitadas en Change Line, sección `Not checked, not on the receipt`) y se reescribe el
punto "Trip receipt review" de 11.4 · 3g como construido. Quedan registrados como abiertos, cada uno con una línea: el
vocabulario `Reading`/`Processed` (y la contradicción `Ready`/`Processed` de 7.3), las etiquetas `tag` fuera de la revisión
del viaje, los menús ⋯ y la fecha en mono de las tarjetas, y el chip `Default`. 7.18 y 7.19 A reciben la nota de `ChoiceRow variant='card'`. Si `docs/reference/implementation-status.md` cita
`Add as Purchased` o `Link…` para este flujo, se actualiza.

### D11. Botones directos en la tarjeta de recibo del viaje (tableros 2 y 8)

El canvas F7 dibuja en la tarjeta los botones de cada camino; la nota v3-n9 y el código usaban un único `Add Receipt` que abría
la hoja `AddReceiptSheet` (no hay tablero 3 de esa hoja). Decisión del usuario (2026-11-04): mandan los tableros.
`getTripReceiptCard` devuelve para `none` las acciones `upload` ("Upload New Receipt", primario) y `choose` ("Choose Uploaded
Receipt", secundario) y para `failed` `open-receipt` (variante `outline`) y `upload` (primario). Se retiran de este flujo la
acción `add-receipt`, el paso `open-add` del reductor y `AddReceiptSheet`; `Choose Uploaded Receipt` abre directamente
`ChooseUploadedReceiptSheet`. `Add Receipt` sigue existiendo solo en la tarjeta de Trips (`history-session-card.tsx`).
`AddReceiptSheet` no se borra: pasa a usarse solo desde "Add Another Receipt" en un viaje que ya tiene recibos (D18), donde el
tablero F5 · 8 dibuja un único botón. La
tarjeta posterior a completar ("Trip saved", `justSaved`) no tiene tablero y conserva su comportamiento (`Upload a Receipt`,
`Choose Uploaded Receipt` si hay recibos, `Keep It Separate`).

*Supuesto a validar:* el enlace `?receipt=add` de Trips ya no abre nada (las opciones están a la vista); se conserva el
parámetro para que `/shopping/<id>?receipt=add` siga siendo válido y se usa solo para llevar el foco al título de la tarjeta
de recibo. `shouldOpenAddOnLoad` se sustituye por esa lógica de foco. *Alternativa descartada:* mantener la hoja además de los
botones; son dos caminos para la misma elección y el tablero dibuja uno.

**Actualización v4 (2026-11-05, D22):** la nota de la Fase B del canvas v4 dice que ya no se elige un recibo existente. Manda
v4: `getTripReceiptCard` devuelve para `none` solo la acción `upload`; desaparecen la acción `choose` y
`ChooseUploadedReceiptSheet` del viaje. `AddReceiptSheet` tampoco sobrevive: "Add Another Receipt" empieza la subida de un
recibo nuevo directamente, así que la hoja se elimina entera. `justSaved` ("Trip saved") sí tiene tablero en v4 (D22).

### D12. Tarjeta tonal por estado (tableros 6, 7 y 8)

La tarjeta de recibo del detalle toma el tono de su estado: sin recibo, blanca (tarjeta normal); leyendo, azul; listo, verde;
ilegible, roja. El tablero fija: fondo y anillo interior de 1px (azul `#EFF6FF` / `#DBEAFE`, verde `#F0FDF4` / `#BBF7D0`, rojo
`#FEF2F2` / `#FECACA`), azulejo de icono de 32px con radio 8 (azul `#DBEAFE` / `#1D4ED8`, verde `#DCFCE7` / `#15803D`, rojo
`#FEE2E2` / `#B91C1C`), título en el tono oscuro de la familia (`#1E3A8A`, `#14532D`, `#7F1D1D`), 14px de padding y radio 24. El
icono de lectura gira (1.6s) y se detiene con `motion-reduce`. Se implementa en la capa compartida, no en el sitio de uso: un
`tone` en `ui/card.tsx` (`info`, `success`, `danger`, con el anillo interior en lugar de la sombra) y el azulejo de icono con
`RowIcon`, que hoy vive en `features/dashboard/row-icon.tsx` y pasa a `commons/` al tener un segundo uso (AGENTS.md: dos
usos → componente compartido; se actualiza el barrel y los importadores). Los colores se expresan con la escala de Tailwind
más cercana (azul/verde/rojo 50, 100, 200, 700, 900) y se anota cualquier desvío. El chip de estado deja la tarjeta (el
estado lo dice el título); la región `role='status'` con `aria-live='polite'` envuelve el título y el texto, y
`useTicketStatus` sigue refrescando el viaje al terminar. *Alternativa descartada:* mantener `TicketStatusChip` junto al
título; el canvas lo quita y la combinación tono + icono + título ya cumple "no solo color".

### D13. Trips y encabezado del viaje (tableros 1 y 2)

- **Fecha:** nueva función pura `formatTripDate` (en `src/utils`, con su test): día de la semana corto, día y mes corto
  ("Thu 19 Feb") y el año solo si no es el actual. *Supuesto:* el canvas solo dibuja fechas del año en curso, así que el año
  para fechas anteriores se añade por claridad; el mismo formato sirve para la tarjeta de Trips y la línea de datos del
  detalle. La hora ("18:40") solo va en el detalle, con `formatTime`.
- **Tarjeta de Trips:** `HistorySessionCard` conserva su jerarquía y quita "Completed on" y la hora de su línea de datos
  (`Thu 19 Feb · $62.40`, importe al final); el padding pasa a 14px (`Card size='tight'` hoy da 12px en teléfono y 16px desde
  `md`: se ajusta con un tamaño del propio `Card`, nunca con `className`). La tienda se sigue mostrando como entidad.
- **Detalle:** el título del viaje lleva el estado `Completed` a su derecha. `PageHeader` no tiene ese hueco, así que se
  añade una prop `aside` (opcional, sin tocar los usos existentes) que se alinea al final de la fila del título. Debajo, la
  clasificación (entidad de tienda y etiqueta del recibo, ya hecha en `shopping/[runId]/page.tsx`) y una línea de datos
  `DataLine` con fecha, hora e importe. El importe es el `total_amount` del viaje (el total del recibo si hay uno adjunto, si no
  el que ya guarda la sesión).
- **No se cambian** (decisión del usuario): el subtítulo de Trips, el enlace de vuelta ("Back to Trips") ni el selector
  `Show trips from`, que el canvas no dibuja o escribe distinto; quedan como hueco registrado en `DESIGN.md` 11.4 · 3g.

### D14. Copy de la Fase 7 tomado del canvas

El tablero 9 fija el texto de las seis ayudas de sección; sustituyen a las propuestas del primer borrador y la pregunta abierta
de abajo queda resuelta. Textos nuevos o confirmados: intro "Each receipt line updates the trip and your <list> list. Nothing
changes until you attach."; título "Attach to <trip>"; ayudas de sección en el spec de copy; "Total paid" con "Read from the
receipt."; hoja de elegir recibo "Pick the receipt that belongs to this trip. You review it before anything changes." (ya
igual en el código); vacío "You don’t have any uploaded receipts available for this trip."; fila deshabilitada "Confirmed
at a different store than this trip"; sin tienda "Store not confirmed". Cifras con unidad en la caja de cantidad ("1 unit",
"3 units", "1.2 kg") y precio ausente como "—" con la etiqueta `No price`. La línea de una sección "Checked, not on the receipt"
no lleva resultado ni control. Las diferencias de estos textos con los que hoy ofrece el código se corrigen en la tarea de
copy (4.5) y en `get-trip-receipt-card.ts` ("…or upload a different receipt").

### D15. Varios recibos por viaje: modelo de datos (Fase 5)

Hoy la base de datos impide más de un recibo por viaje: `uq_tickets_shopping_session_id` (único sobre
`tickets.shopping_session_id`, `20261028000000_close_the_loop.sql`) y la RPC lanza `SESSION_HAS_RECEIPT`; además
`STORE_MISMATCH` rechaza un recibo de otra tienda en un viaje completado. Decisión del usuario (2026-11-04): varios recibos en
este change, como mucho uno por tienda confirmada.

- La migración nueva **sustituye** el índice por uno único parcial sobre `(shopping_session_id, store_id)` con
  `shopping_session_id IS NOT NULL AND store_id IS NOT NULL`: un recibo sigue en un solo viaje (columna única por fila) y un
  viaje no repite tienda; los recibos sin tienda no cuentan. Quitar un índice y crear otro no borra filas. Antes de crearlo se
  comprueba que ningún viaje tiene ya dos recibos de la misma tienda (no puede, por el índice actual).
- Se añade `tickets.attached_total_amount numeric NULL`: el total pagado que el usuario confirmó al adjuntar (el leído o el
  corregido). `shopping_sessions.total_amount` pasa a ser la suma de `attached_total_amount` de sus recibos, recalculada por la
RPC al adjuntar y por el disparador que ya mantiene la sesión al borrar un recibo. Para los recibos ya adjuntos, la
  migración copia el `total_amount` de su sesión a `attached_total_amount` (un recibo por sesión hoy, así que la copia es
  exacta) sin tocar la sesión.
- Decisión aprobada el 2026-11-05: `ticket_items` no conserva hoy el destino de la línea. Se añade
  `shopping_session_item_id UUID NULL`, con clave foránea que al borrar un ítem solo limpia el vínculo, nunca borra líneas.
  La RPC guarda el destino efectivo al adjuntar (también los ítems nuevos); `NULL` conserva las líneas dejadas fuera.
  Un guard impide alterar el vínculo fuera de la operación autorizada y comprueba que pertenece al mismo viaje y propietario.
  No se reconstruyen vínculos de recibos históricos: sus decisiones anteriores son desconocidas. Al sumar nuevos recibos
  se conserva el precio histórico ya guardado del ítem y se añade la contribución nueva; solo los vínculos conocidos
  aportan cobertura comprobable. Las estadísticas por tienda se registran con la tienda del recibo (D16).
- La tienda del viaje (`shopping_sessions.store_id`) conserva su significado: la que eligió al empezar o la del primer recibo
  si no tenía. Las demás tiendas del viaje son las de sus recibos.
- La migración se revisa línea por línea para que no borre registros ni directa ni indirectamente (AGENTS.md) y no se ejecuta
  contra el proyecto alojado sin pedirlo.

### D16. RPC `attach_receipt_to_session`

- Elimina `SESSION_HAS_RECEIPT`; lanza `SESSION_HAS_STORE_RECEIPT` (409) si el viaje ya tiene un recibo de la tienda del
  recibo (la confirmada, o la heredada de la sesión cuando el recibo no tiene). Elimina `STORE_MISMATCH`.
- Recibo sin tienda en un viaje que ya tiene recibo de la tienda de la sesión: queda sin tienda y no registra estadísticas
  por tienda (spec "Receipt without a store on a trip that has one from its store").
- Sin `p_move` (canvas v4, D22): un recibo adjunto a otro viaje sigue respondiendo `RECEIPT_ATTACHED`; no se añade el parámetro ni
  se desvincula nada.
- Un ítem cubierto por líneas de varios recibos suma sus precios y cuenta una sola compra. La cantidad comprada que reemplaza
  la habitual suma las líneas de todos los recibos del viaje que lo cubren.
- Registra las estadísticas por tienda con la tienda del recibo, no con la de la sesión.
- La función de verificación `supabase/verification/trips-receipt-attach.sql` gana casos: segundo recibo de otra tienda,
  misma tienda (409), total sumado, estadísticas en la tienda del recibo.

### D17. API v1 (cambios aditivos)

- `GET /api/v1/shopping-sessions/{id}` (y los datos de Trips) devuelve `receipts: [{ id, store, items_count, total_amount }]`.
  `receipt` se mantiene como el primer recibo (marcado obsoleto en `docs/reference/api-v1.md`) para no romper clientes.
- `POST /api/v1/tickets/{id}/attach-to-session` añade `complete_session?: boolean` (sin `move`, D22); el error nuevo es
  `SESSION_HAS_STORE_RECEIPT` (409); `SESSION_HAS_RECEIPT` y `STORE_MISMATCH` dejan de emitirse.
  Decisión aprobada el 2026-11-05: omitir `complete_session` equivale a `true` y conserva la finalización actual.
  `false` adjunta y marca solo las líneas incluidas, sin ejecutar la finalización ni incrementar compras de la lista;
  la finalización posterior aprende esas compras una sola vez. El servicio pasa `p_complete_session` a la RPC,
  con el mismo valor predeterminado. Adjuntar y completar sigue siendo una única transacción. Reenviar un recibo
  ya adjunto sigue siendo un replay sin efectos, aunque cambie el indicador; completar después usa la operación
  existente de completar viaje. Las peticiones antiguas conservan su comportamiento.
- `GET /api/v1/shopping-sessions/{id}/available-receipts` no se amplía (D22): el cliente deja de ofrecer la lista desde el
  viaje, el endpoint queda como está. `STORE_MISMATCH` deja de emitirse en la RPC, así que el endpoint tampoco lo devuelve.
- El servicio comprueba propiedad antes de llamar a la RPC. Se carga el skill
  `nextjs-saas-rest-api` para esta parte.

### D18. Detalle de un viaje con recibos (F5 · 8, corregido)

- Encabezado: título y `Completed`; clasificación con todas las tiendas del viaje como `EntityLabel` (la del viaje primero)
  y la etiqueta `Receipt attached` (uno) o `<N> receipts` (varios); línea de datos con fecha, hora y **total pagado**. El
  tablero dibuja una sola tienda y $86.40 con dos recibos de $127.52: se corrige (decisión del usuario).
- Tarjeta `Paid`: total pagado en mono, "17 items · 2 stores", "Estimate was $119.80" (de `SessionEstimate`); debajo una fila por
  recibo (tienda como entidad, "13 items · $86.40", `ActionLink` "View Receipt"), y `Add Another Receipt` (secundario) que
  empieza la subida de un recibo nuevo, sin hoja (D22). Sustituye a la tarjeta actual "Paid from receipt".
- Sin recibos: la tarjeta `Estimated` (F5 · 9: "≈ $62.40", "10 items · 9 with known prices") encima de la tarjeta "No receipt" de
  F7 · 2 con sus dos botones directos (no el único `Add Receipt` de F5 · 9). `SessionEstimate` deja de ocultarse en viajes
  completados sin recibos.
- Ítems: la fila de ítem de v4 (D22): precio del recibo sin "avg" (el "avg" solo va en la compra en curso); ya no hay etiqueta "Added from
  the receipt".

### D19. "Trip saved", todo coincide y error (V4 · 5; F5 · 6 y 7)

- **Trip saved (V4 · 5):** tarjeta centrada con el icono de bolsa verde de 64px y radio 20, h1 "Trip saved", texto, aviso
  amarillo "No receipt yet" / "Having no receipt never leaves the trip incomplete.", botones `Upload New Receipt` (primario) y
  `View Trip` (outline) y la nota "You can add a receipt later from Trips, with no deadline.". Sin `Choose Uploaded Receipt` ni
  `Keep It Separate`. Tras subir, la tarjeta sigue los estados tonales de D12.
- **Todo coincide (F5 · 6):** la revisión muestra "Everything you checked is on the receipt" / "Nothing to add or fix." como
  nota sobre las secciones. El botón conserva "Attach and Complete Trip" / "Attach to Trip" (F5 · 6 dibuja "Complete Trip";
  F5 · 5 y F7 · 9 usan las otras; se elige la de F7 por coherencia).
- **Error al adjuntar (F5 · 7):** la revisión sustituye su contenido por la tarjeta roja tonal de D12 con "Couldn’t attach
  the receipt", "Nothing was changed. Try again in a moment.", `Try Again` (primario, reintenta la misma petición) y `Attach
  Later` (secundario, cierra). Sustituye al mensaje de error genérico actual.

### D20. Precio por tienda en la hoja (F5 · 10 a 12)

Decisión del usuario: sin pantalla nueva; `ItemStorePricesSheet` adopta el contenido. Cabecera: tienda habitual como
`EntityLabel` con "Usual store · automatic" o "· set by you"; tres `StatTile` (la pieza de D6) con "Times bought", "Between
trips" ("~9d", el intervalo medio que ya calcula Likely Needed; sin cifra si no hay intervalo) y "Last bought"; sección "Last
price by store" con la ayuda "Only prices from your own receipts.", filas con "23 Feb · 2 times", las etiquetas `Cheapest` y
`Usual` (forma `tag`) y "No price yet" con "—"; `Change Usual Store` (outline) que abre la hoja de tienda habitual existente.
Estados: una sola tienda ("Bought at one store so far. Prices from other stores show here once you buy it there.") y sin datos
("Added by hand", "No prices yet", "Prices come from your receipts…", `Upload a Receipt`). El menú del ítem ofrece "Prices by
Store" siempre al propietario. Los datos vienen de `item_store_stats` y del endpoint de precios existente, que gana
`purchase_count` por tienda y las tiendas sin precio; sin escritura al abrir.

### D21. Contradicciones entre la Fase 5 y la Fase 7, y cuál manda

| Tema | Fase 5 | Fase 7 | Decisión |
| --- | --- | --- | --- |
| Revisión del recibo | "Match receipt to trip", contadores Matched / Only on receipt / Not on receipt, "Add them as purchased?" (opt-in) | "Attach to <trip>", Matched / New to / Left out, añade por defecto | Fase 7 |
| Viaje sin recibo | "No receipts attached", un `Add Receipt`, tarjeta "Estimated" | "No receipt", dos botones directos | F7 · 2 + tarjeta "Estimated" de F5 |
| Viaje con recibos | Lista de recibos, "Paid", "Add Another Receipt" | Una sola tarjeta de recibo | Fase 5, corrigiendo encabezado y total |
| Recibo de otra tienda | Permitido (un recibo por tienda) | Deshabilitado ("Confirmed at a different store") | Fase 5, pero se sube desde el viaje (D22) |
| Recibo de otro viaje | Se puede mover (F5 · 3) | Solo recibos libres | Retirado: v4 ya no elige un recibo existente (D22) |
| Botón con todo coincide | "Complete Trip" | "Attach to Trip" / "Attach and Complete Trip" | Fase 7 |
| Error al adjuntar | Texto de F5 · 7 | Tarjeta roja de F7 · 8 | Texto de F5 en la tarjeta de F7 |
| Total en la revisión | "Paid $86.40" | "Total paid · Read from the receipt." | Fase 7 |
| Precio por tienda | Pantalla de detalle del ítem | (no lo dibuja) | Contenido de F5 en la hoja actual |

### D22. Canvas v4: fases A, B y C (2026-11-05)

El canvas v4 reorganiza el flujo del viaje y se numera de V4 · 1 a 16 (las 14 a 16, el precio por tienda, son la fase D y
cuentan como D20). Donde v4 choca con las Fases 5 y 7, manda v4. Decisiones del usuario del 2026-11-05: el camino de
elegir un recibo existente y el de mover un recibo se **retiran** de los viajes; los tableros "todo coincide", "error al
adjuntar" y "recibo subido desde un viaje" se **mantienen** y se vuelven a dibujar.

| Fase | Pantallas | Qué fija |
| --- | --- | --- |
| A · Compra en curso y recibo en la tienda | V4 · 1 a 3 | `Upload Receipt` en `Actions`; hoja "Review receipt" con aviso azul y `Attach Receipt` / `Attach and Complete Trip`; tarjeta de recibos con "Paid so far", `Pending attachment` y `Attached to trip` |
| B · Del viaje guardado al recibo listo | V4 · 4 a 9 | Trips, `Trip saved` (`Upload New Receipt` / `View Trip`), viaje sin recibo con un camino, tarjetas azul, verde y roja, fila de ítem nueva |
| C · Revisar y varios recibos por viaje | V4 · 10 a 13 | Revisión de todos los casos y `Change Line` (sin cambios), viaje con uno y con varios recibos, `Add Another Receipt` sube directamente |

- **Un solo camino para añadir un recibo al viaje:** subir uno nuevo (`Upload New Receipt`, `Add Another Receipt`, `Upload
  Receipt` en `Actions`). Se eliminan `ChooseUploadedReceiptSheet`, `AddReceiptSheet`, la confirmación "Already on a trip" y
  `p_move` / `move` / `attached_to` de D16 y D17. El servicio sigue aceptando lo que ya aceptaba: un recibo sin viaje de origen
  se puede adjuntar a un viaje con una petición directa, pero el cliente no lo ofrece desde el viaje.
- **Compra en curso (Fase A).** Se reutiliza la revisión del viaje (D5, D6) con otro título y otros botones: el título
  "Review receipt", un aviso azul del sistema (fondo `#EFF6FF`, anillo `#BFDBFE`, azulejo de 32px con icono de información,
  título `#1E3A8A`), y el pie con dos botones. `Attach Receipt` envía `complete_session: false` sin completar el viaje; `Attach and
  Complete Trip` envía `complete_session: true`. Solo se marcan los ítems con línea en el recibo (la revisión ya lo hace con `Will be checked off`).
  La tarjeta de recibos de la compra (`Paid so far`) lee `receipts` de D17 y añade el estado de adjuntado por recibo
  (si `shopping_session_id` del recibo ya apunta al viaje), sin tocar la API: un recibo subido desde el viaje, leído y sin adjuntar, es
  `Pending attachment`. *Discrepancia del canvas a corregir:* V4 · 3 dibuja "Paid so far $127.52" con un recibo sin adjuntar;
  el total debe ser la suma de los recibos adjuntados ($41.12).
- **Fila de ítem (Fases A, B y C).** Cantidad con unidad en una caja a la izquierda del nombre; nota con icono de mensaje bajo el
  nombre; fila de tienda con la tienda habitual como `EntityLabel` y el texto "Also at <tienda>" solo si el ítem también se
  compró en otra (sale de `item_store_stats`, la misma fuente de D20); precio con "avg" solo en la compra en curso
  (es un promedio, y desde ahí se abren los precios por tienda) y sin "avg" en un viaje completado, donde es el precio del recibo; sin menú ⋯ ni "From receipt". Checkbox y nombre tachado solo en la compra en
  curso; el viaje completado no tacha ni lleva checkbox. *Discrepancia del canvas a corregir:* V4 · 12 y 13 dibujaban "avg" en viajes
  completados (corregido el 2026-11-05: ningún viaje completado lleva "avg") y V4 · 3, 5, 6, 7 y 12 tachaban los nombres (corregido).
- **Trip saved (V4 · 5)** sustituye a F5 · 1 (D19). **Copy:** "Pending attachment" y "Attached to trip" son los textos del
  canvas; el texto previo del canvas ("Review and attach") se descarta.

## Risks / Trade-offs

- [El cálculo de cantidad del cliente se desvía de la RPC] → una sola función pura con una tabla de casos copiada de
  `supabase/verification/trips-receipt-attach.sql`; si la regla del servidor cambia, el test falla en el cliente.
- [Añadir por defecto sorprende a quien esperaba lo contrario] → el contador `New to <list>`, la ayuda de la sección y el
  resultado "Adds as a new item" lo anuncian antes de confirmar; `Change` lo deshace en una fila; cerrar sin confirmar no
  cambia nada (escenario "Cancel keeps nothing").
- [La lista llega a su tope (250) con más líneas nuevas] → la RPC ya cuenta `over_limit_count` y no rompe el viaje; hoy
  `submit` ignora ese resumen. Tarea: leerlo y, si es mayor que 0, decirlo en el aviso de éxito. Un recibo de más de 200
  líneas por añadir (`MAX_TICKET_ITEMS_MERGE`) sigue rechazado por la validación existente (422), sin cambios.
- [Una línea por nombre no puede re-apuntarse ni añadirse como nueva] → límite de la RPC (D2). Se muestran las opciones
  deshabilitadas con motivo en lugar de ocultarlas; relajar la regla del servidor queda como decisión pendiente.
- [Cambian los `data-testid` del diálogo] → se actualiza el e2e en la misma tarea; no hay otro consumidor.
- [Dos líneas del mismo ítem repiten "usual quantity a → b" con el total] → es el total que verá el ítem; se prefiere sobre
  mostrarlo solo en la primera línea porque cada fila debe leerse sola.

- [La hoja `Add Receipt` se retira y alguien guardó el enlace `?receipt=add`] → el parámetro sigue siendo válido y lleva
  al detalle con las opciones visibles (D11); no hay otro consumidor, y el e2e y los tests de `trip-receipt-flow` se actualizan.
- [Los tonos del canvas no coinciden con la escala de Tailwind] → se usan los pasos más cercanos y se anotan en `DESIGN.md`; no
  se escriben hex sueltos en los sitios de uso (D12).
- [El año en `formatTripDate` no está dibujado en el canvas] → supuesto D13; se valida con el usuario en la revisión visual.

- [La migración cambia una restricción usada en producción] → se sustituye en una sola migración el índice único por el
  parcial y se añade la columna; ninguna fila se borra, se comprueba antes que no hay duplicados y se prueba contra un
  Supabase local antes de aplicarla. La reversión es recrear el índice antiguo, que solo falla si ya hay viajes con dos
  recibos (se documenta).
- [Clientes que leen `receipt` y `SESSION_HAS_RECEIPT`] → `receipt` se mantiene como el primer recibo; el único cliente es
  esta app, y el código que esperaba los códigos retirados se actualiza en el mismo change.
- [Precio sumado de un ítem cubierto por dos recibos] → regla explícita en el spec y casos de verificación SQL (D16).

## Migration Plan

1. Migración nueva (`supabase/migrations/<fecha>_trip_receipts_per_store.sql`): columna `tickets.attached_total_amount`,
   copia del total de la sesión para los recibos ya adjuntos, sustitución de `uq_tickets_shopping_session_id` por el índice
   parcial por tienda, y nueva versión de `attach_receipt_to_session` y de las funciones de recibos disponibles. Se revisa
   que no borre registros y se aplica primero en local.
2. Servicio, rutas y tipos de la API v1 (D17), con `docs/reference/api-v1.md`.
3. Cliente (revisión, Trips, detalle del viaje, hojas). La revisión por líneas no depende de la migración y puede ir antes.

Reversión: revertir el cliente y la API es inmediato; revertir la migración exige que ningún viaje tenga dos recibos.
Orden de archivado: `trips-and-receipt-attach` antes que este change (comparten `receipt-session-reconciliation`).

## Open Questions

Sin decisión del usuario (se dejan fuera de este change a propósito y se registran en `DESIGN.md` 11.4 · 3g):

- **Chip `Default` de la lista Pantry:** `DESIGN.md` 7.3 lo cuenta entre las etiquetas (caja con icono) y el párrafo "Canvas v3
  review pass" de 7.6 lo llama chip amarillo con estrella. Hoy es una caja amarilla con estrella (variante `list-default`).
  Falta decidir cuál redacción manda.
- **Test que comprueba la apariencia de `Default`:** `src/components/features/list-items/tests/item-note-trailing.test.ts`
  comprueba la clase `bg-amber-100`, y AGENTS.md prohíbe tests de apariencia. No se toca aquí; queda como limpieza posible.
- **Etiqueta `New` de las tarjetas de tienda:** el canvas no la dibuja; hoy es una etiqueta `tag` con icono. Revisar con el
  canvas.

- (Resuelta) Los textos de ayuda de sección salen del tablero F7 · 9 y están en el spec de copy; ver D14.
