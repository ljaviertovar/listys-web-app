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
- No tocar la API, la RPC ni el esquema.

**Non-Goals:**

- Cambiar las reglas del servidor (qué puede vincularse, cuándo se completa el viaje, cuenta de compras).
- Cambiar la revisión de añadir a una lista (`merge-review`, sugerencias `Possible match`, 7.19 F), que sigue como está.
- Cambiar la etiqueta de estado del recibo (D9) ni la pantalla del recibo.
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
incluida la variante de atención, entidad sin caja) y (2) la sección de patrones de producto añade la revisión del viaje con
los tres contadores, las seis secciones, una fila con su resultado y `Change`, y la hoja Change Line. Se escribe con los
tokens y medidas de 7.3, 7.6, 7.17–7.19, sin inventar valores. El resto del HTML (estado del recibo `Reading`/`Processed`,
menús ⋯, chip `Default`) no se toca porque sus decisiones siguen abiertas. *Alternativa descartada:* dejar el HTML para
después; contradice la regla de AGENTS.md y la siguiente comparación visual se haría contra una referencia desactualizada.

`DESIGN.md` 7.6 ya describe el objetivo; se ajusta lo que difiera de lo decidido aquí (cláusula de cantidad en
`Already checked`, filas deshabilitadas en Change Line, sección `Not checked, not on the receipt`) y se reescribe el
punto "Trip receipt review" de 11.4 · 3g como construido. Quedan registrados como abiertos, cada uno con una línea: el
vocabulario `Reading`/`Processed` (y la contradicción `Ready`/`Processed` de 7.3), las etiquetas `tag` fuera de la revisión
del viaje, los menús ⋯ y la fecha en mono de las tarjetas, y el chip `Default`. 7.18 y 7.19 A reciben la nota de `ChoiceRow variant='card'`. Si `docs/reference/implementation-status.md` cita
`Add as Purchased` o `Link…` para este flujo, se actualiza.

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

## Migration Plan

Sin migración de base de datos ni de API: solo cliente. Despliegue normal; la reversión es revertir el commit, sin datos que
reparar. Orden de archivado: `trips-and-receipt-attach` antes que este change (comparten `receipt-session-reconciliation`);
este no modifica ningún requisito que aquel ya modifica.

## Open Questions

Sin decisión del usuario (se dejan fuera de este change a propósito y se registran en `DESIGN.md` 11.4 · 3g):

- **Chip `Default` de la lista Pantry:** `DESIGN.md` 7.3 lo cuenta entre las etiquetas (caja con icono) y el párrafo "Canvas v3
  review pass" de 7.6 lo llama chip amarillo con estrella. Hoy es una caja amarilla con estrella (variante `list-default`).
  Falta decidir cuál redacción manda.
- **Test que comprueba la apariencia de `Default`:** `src/components/features/list-items/tests/item-note-trailing.test.ts`
  comprueba la clase `bg-amber-100`, y AGENTS.md prohíbe tests de apariencia. No se toca aquí; queda como limpieza posible.
- **Etiqueta `New` de las tarjetas de tienda:** el canvas no la dibuja; hoy es una etiqueta `tag` con icono. Revisar con el
  canvas.

- ¿Los textos de ayuda de sección que propone el spec ("Added to this trip and to <list>.", "Marked as bought, with the
  receipt price.", "Already bought on the trip; they only get the receipt price.", "Not saved to the trip or to <list>.",
  "These stay as bought, without a price.", "These stay unbought.") coinciden con el lienzo? DESIGN.md 7.6 fija que cada sección lleva una ayuda de 12px, pero no su texto; son propuestas
  nuestras y se pueden ajustar en la implementación sin cambiar specs ni tareas.
