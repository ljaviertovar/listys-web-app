# Proposal

## Why

La revisión de un recibo contra un viaje (`AttachToSessionDialog`) deja **fuera por defecto** toda línea sin coincidencia
y obliga a marcar `Add as Purchased` línea a línea, además de ofrecer un `Link…` aparte. El lienzo v3 (F7, pantallas 9 y
10) invierte el valor por defecto: cada viaje enseña a la lista (principio 4 del PRD v3), así que lo que el recibo trae y
el viaje no tenía se **añade por defecto** y el usuario solo decide qué dejar fuera. Eso contradice el requisito vigente
"Unmatched lines are added only when the user chooses", por lo que necesita su propio cambio de especificación antes de
tocar el código. De paso, el lienzo reordena la pantalla (una línea de resultado y un único `Change` por fila, secciones
por destino, tres contadores) y pide etiquetas (`Remembered`, `Linked by you`) y un resultado ("usual quantity 2 → 3")
que hoy el modelo de la revisión no conserva.

## What Changes

- **BREAKING** (comportamiento): una línea del recibo sin coincidencia con el viaje y con nombre legible se **añade por
  defecto** como ítem nuevo del viaje y de la lista; el usuario la deja fuera con `Change`. Una línea cuyo nombre no se
  pudo leer sigue fuera y no puede añadirse. El contrato de decisiones por línea no cambia: el cliente sigue enviando `added_item_ids`, solo
  que ahora lo rellena por defecto.
- Cada línea muestra nombre, precio, caja de cantidad, una etiqueta opcional (`Remembered`, `Linked by you`, `No price`,
  `No name`), **una** línea de resultado en gris y un único botón `Change`. Desaparecen el checkbox `Add as Purchased` y
  el botón `Link…`.
- Las líneas se agrupan en secciones plegables, en este orden: `New to <list>`, `Will be checked off`, `Already checked`,
  `Left out`, `Checked, not on the receipt` y `Not checked, not on the receipt` (plegada), cada una con una línea de
  ayuda de 12px.
- El resumen pasa a tres contadores: `Matched`, `New to <list>`, `Left out` (sustituyen a `Matched`, `Only on receipt`,
  `Not on receipt`).
- Nueva hoja **Change Line** con tres filas de elección (radio): `Add as a new item`, `Match a trip item` (con buscador
  de ítems del viaje) y `Leave out`, más `Save` y `Cancel`. Sustituye al `LinkItemDialog` en este flujo.
- La revisión conserva el origen de la coincidencia (`name` / `alias` / vínculo del usuario) y la cantidad anterior del
  ítem del viaje para producir las etiquetas y "usual quantity 2 → 3". Se calcula en el cliente con datos que la
  revisión ya carga; esta parte no cambia ni la API ni la base de datos.
- **Fase 7 completa del canvas v3 (tableros F7 · 1 a 10).** Además de la revisión (9) y Change Line (10), el change recoge lo
  que los tableros 1 a 8 dibujan y el código no tiene, aunque toque el recibo:
  - **Tarjeta de recibo del viaje con botones directos** (tableros 2 y 8): sin recibo, `Upload New Receipt` como único botón (canvas v4: ya no se elige un recibo existente) en la propia tarjeta; ilegible, `Open Receipt` y `Upload New Receipt`, con el texto
    "…or upload a different receipt". Desaparece la hoja intermedia `Add Receipt` del detalle; `Add Receipt` queda solo en la
    tarjeta de Trips y su enlace aterriza en el detalle con el botón ya visible. **BREAKING** (comportamiento) para el
    requisito "Add Receipt offers a new or an uploaded receipt", que se renombra a "The trip receipt card offers to upload a receipt".
  - **Tarjeta tonal por estado** (tableros 6, 7 y 8): azul con icono girando para "Reading your receipt…" (sin chip), verde
    para "Your receipt is ready", roja para "We couldn’t read this receipt", blanca sin recibo; icono de 32px.
  - **Trips y encabezado del viaje** (tableros 1 y 2): fecha "Thu 19 Feb" sin "Completed on" y sin hora en la tarjeta,
    tarjeta de 14px de padding, estado "Completed" a la derecha del título, tienda como entidad y etiqueta del recibo en la
    fila de clasificación, y en el detalle la línea de datos "Thu 19 Feb · 18:40 · $62.40" bajo la clasificación.
  - **Copy exacto del canvas** para las ayudas de sección, la hoja de elegir recibo y la revisión (tableros 4, 5 y 9).
- **Fase 5 del canvas v3 ("Un recibo por tienda cierra el viaje", tableros F5 · 1, 3, 6, 7, 8, 9, 10 a 12 y nota v3-n6)**,
  integrada con la Fase 7; donde ambas chocan manda la Fase 7 (revisión con añadir por defecto, botones directos sin recibo):
  - **BREAKING** (modelo y API): un viaje puede tener **varios recibos, como mucho uno por tienda confirmada**; un recibo
    sigue perteneciendo a un solo viaje. Una tienda distinta ya no bloquea el adjuntar. El total pagado del viaje es la suma
    de sus recibos y cada recibo guarda su propio total pagado. Cada ítem toma la tienda del recibo en que aparece; la tienda
    con la que empezó el viaje sigue siendo la suya y se muestra primero.
  - **Mover un recibo desde otro viaje: retirado** (canvas v4, 2026-11-05; ver el punto de las fases A, B y C y design D22). Sin
    lista de recibos disponibles en el viaje no hay recibo de otro viaje que mover.
  - **Viaje con recibos** (F5 · 8): tarjeta "Paid" con la suma, ítems, tiendas y "Estimate was", lista de recibos con "View
    Receipt" y "Add Another Receipt"; el encabezado muestra todas las tiendas, "N receipts" y el total pagado (corrige el
    $86.40 que dibuja el tablero). **Sin recibo** (F7 · 2 + F5 · 9): la tarjeta "Estimated" sobre "No receipt".
  - **"Trip saved"** (F5 · 1), **todo coincide** (F5 · 6) y **error al adjuntar** con el copy de F5 · 7 dibujado como la
    tarjeta roja de F7 · 8.
  - **Precio por tienda** (F5 · 10 a 12) dentro de la hoja `Prices by Store` existente: tienda habitual, veces comprado,
    días entre viajes, última compra, "Cheapest" / "Usual" / "No price yet", "Change Usual Store", y los estados de una sola
    tienda y sin datos ("Added by hand", "No prices yet", "Upload a Receipt"). La acción se ofrece siempre al propietario.
- **Canvas v4, fases A, B y C (2026-11-05).** El canvas v4 reorganiza el flujo del viaje en tres fases y sustituye lo que las
  Fases 5 y 7 dibujaban para el viaje; donde chocan, manda v4 (design D22):
  - **Fase A · Compra en curso y recibo en la tienda** (V4 · 1 a 3): `Upload Receipt` en `Actions` de una compra en curso; la
    hoja "Review receipt" con el aviso azul "The trip is still shopping" y los botones `Attach Receipt` (el viaje sigue en
    `Shopping`) y `Attach and Complete Trip`; ambas acciones usan el nuevo campo opcional `complete_session` (`false` / `true`,
    respectivamente). Omitirlo conserva el comportamiento actual (`true`), decisión aprobada el 2026-11-05. La tarjeta de recibos de la compra con "Paid so far", "N receipts · M to review",
    la etiqueta amarilla `Pending attachment` (recibo leído sin adjuntar, p. ej. si se cerró la ventana) y `Attached to trip`, y
    `Add Another Receipt`. Requisitos nuevos en `trip-receipts` y `receipt-session-reconciliation`.
  - **Fase B · Del viaje guardado al recibo listo** (V4 · 4 a 9): `Trip saved` con `Upload New Receipt` y `View Trip` (sin
    `Choose Uploaded Receipt` ni `Keep It Separate`); el viaje sin recibo con un único camino; las tres tarjetas tonales; y la
    fila de ítem nueva: cantidad a la izquierda del nombre, nota con icono de mensaje, tienda habitual como entidad más "Also
    at <otra tienda>", precio con `avg`, sin menú ⋯ ni etiqueta "From receipt", y tachado solo en la compra en curso.
    **BREAKING** (comportamiento): se retiran elegir un recibo ya subido desde el viaje, su lista de recibos disponibles y
    mover un recibo de otro viaje.
  - **Fase C · Revisar y varios recibos por viaje** (V4 · 10 a 13): la revisión de todos los casos y `Change Line` no cambian;
    `Add Another Receipt` empieza la subida de un recibo nuevo sin hoja intermedia. Los tres tableros que se eliminaron del
    canvas ("todo coincide", "error al adjuntar" y "recibo subido desde un viaje" en Receipts) se mantienen y se vuelven a
    dibujar; sus requisitos no cambian.
- Copy: la etiqueta de estado del recibo (`Reading` / `Processed` del lienzo frente a `Reading Receipt` / `Ready to
  Review` del spec) **no se cambia aquí**; queda como decisión separada (ver `design.md`, D9). Sí se añade un requisito
  de copy para lo que anuncia la revisión (qué se añade y qué se deja fuera).
- `docs/design/DESIGN.md`: se actualiza el hueco 3g de 11.4 (queda construido el review del viaje) y se registran las
  piezas nuevas.
- `docs/design/listys-design-system.html`: por la regla de AGENTS.md ("si el código o DESIGN.md discrepan del HTML, manda el
  HTML") y porque hoy dibuja los chips antiguos y no tiene ejemplo de la revisión del viaje, se actualiza para mostrar los
  tres niveles de chip (estado con punto, etiqueta en caja con icono, entidad sin caja) y la revisión del viaje con sus
  secciones, contadores y hoja Change Line.
- **Fuera de alcance, decidido con el usuario el 2026-11-04** (cada punto queda registrado como hueco o decisión pendiente,
  no se pierde):
  - Vocabulario del estado del recibo (`Reading` / `Processed` frente a `Reading Receipt` / `Ready to Review`): change
    aparte (D9). La contradicción interna de `DESIGN.md` 7.3 (`Ready` frente a `Processed`) se deja como está hasta ese change.
  - Las etiquetas de las filas del recibo fuera del viaje (`No price`, `No name`, `In list`, `New`, `Confirm match`) y la
    revisión de añadir a una lista no pasan a la forma `tag`; solo la revisión del viaje la usa.
  - Menú ⋯ en las tarjetas de recibo, viaje y tienda, y la fecha y hora del recibo con cifras en mono (hoy llega como una
    sola cadena ya formateada): change aparte, registrado en 11.4 · 3g.
  - Lo que el canvas F7 no dibuja o dibuja distinto y se conserva como está, registrado como hueco en `DESIGN.md` 11.4 · 3g:
    el selector `Show trips from` de Trips (Fase 2, no aparece en el tablero 1), el subtítulo ("Completed trips, newest
    first") y el enlace de vuelta ("Trips") que el canvas escribe distinto del código, la tarjeta "Trip saved" tras
    completar (sin tablero) y la hoja `Add Receipt` (el tablero 3 no existe).
  - El chip `Default` (7.3 lo llama etiqueta, la revisión v3 chip amarillo) y el test `item-note-trailing.test.ts` que
    comprueba su color: sin decisión; ver Open Questions de `design.md`.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `receipt-session-reconciliation`: el requisito "Unmatched lines are added only when the user chooses" se renombra y
  cambia (añadidas por defecto, se dejan fuera con `Change`); "The attach review summarises what matches" pasa a los tres
  contadores y a las nuevas secciones; se añaden los requisitos de la fila de línea, la hoja Change Line y el origen de la
  coincidencia/cantidad previa.
- `product-copy-clarity`: se añade el requisito de copy de la revisión del viaje (qué se añade por defecto, qué se deja
  fuera y por qué una línea no puede añadirse), con las ayudas de sección tal como las dibuja el canvas, sin tocar los
  estados del recibo.
- `trip-receipts`: "A completed trip without a receipt says so" (encabezado y botones directos), "Add Receipt offers a new or
  an uploaded receipt" se renombra a "The trip receipt card offers to upload a receipt" (un solo camino, sin hoja intermedia), "The
  trip follows the reading of a receipt uploaded from it" (tarjeta tonal y botones del estado ilegible) y "The trip review
  appears only with a receipt ready" (título y secciones).
- `shopping-history-by-list`: "History shows every completed trip on one screen" (fecha sin hora), "Each trip shows its
  receipt status apart from its own status" (jerarquía de la tarjeta, varias tiendas, "N receipts", total pagado) y "A trip
  without a receipt highlights Add Receipt" (el enlace aterriza con el botón visible).
- `receipt-session-reconciliation` (Fase 5): "A read receipt offers to attach to a recent trip" (uno por tienda), "Receipt
  prices and total fill the session without counting twice" (suma de recibos), "The receipt's store reconciles with the
  session's store" (varias tiendas, sin rechazo), "A receipt and a session are attached at most once" se renombra a "A receipt
  belongs to one trip and a trip has one receipt per store", "Receipt and session show their link" (lista de recibos) y
  "Attaching is limited to the receipt's origin trip" (sin la excepción de mover); se añaden "A failed attach changes nothing and
  says so", "Reviewing a receipt on an active trip keeps it shopping" e "Items on another receipt of the trip are not reported as missing".
- `trip-receipts` (Fases 5 y v4): además, "Completing a trip asks for its receipts" (`Trip saved` de v4: `Upload New Receipt` y
  `View Trip`); se retira "Only available receipts can be chosen for a trip"; se añaden "A trip with receipts lists them and
  takes another", "An active trip takes receipts while shopping" y "The items of a trip show what was bought".
- `item-store-statistics`: "Attaching a receipt records its prices per store once" usa la tienda de cada recibo.
- `item-price-memory`: "Active session shows an estimated total" se renombra y cubre el viaje completado sin recibos
  ("Estimated") y con recibos ("Estimate was").
- `store-price-comparison`: "Items offer their prices by store" (siempre al propietario, filas "No price yet", estado vacío) y
  se añade "The prices sheet shows how the item is bought".

## Impact

- Decisión aprobada el 2026-11-05: la migración añade `ticket_items.shopping_session_item_id` para conservar el destino
  efectivo de cada línea al adjuntar. Las líneas históricas conservan `NULL`: no se inventan decisiones anteriores.

- UI: `src/components/features/tickets/attach/` (`attach-to-session-dialog.tsx`, `hooks/use-trip-review.ts`,
  `helpers/build-attach-review.ts`, `helpers/read-ticket-for-review.ts`, nuevos componentes de fila, secciones, contadores
  y hoja `Change Line`), `use-attach-to-session.ts` (mapeo de líneas del recibo) y piezas compartidas:
  `commons/category-section` (icono/tono por sección de estado), un `StatTile` en `commons/`, y `Badge` `tag` /
  `tag-attention` ya existentes (sin editar `badge.tsx`).
- UI adicional de la Fase 7: `src/components/features/shopping-sessions/` (`trip-receipts-card.tsx`, `add-receipt-sheet.tsx`
  que se elimina del detalle, `helpers/get-trip-receipt-card.ts`, `helpers/trip-receipt-flow.ts`, `history-session-card.tsx`),
  `src/app/(authenticated)/shopping/[runId]/page.tsx` (encabezado y `?receipt=add`), `src/app/(authenticated)/trips/page.tsx`,
  `PageHeader` (un slot para el estado a la derecha del título), `ui/card.tsx` (tonos `info` / `success` / `danger`), el
  formateo de fecha de Trips en `src/utils` y la pieza `RowIcon` (hoy en `features/dashboard`), que pasa a `commons/` al
  tener un segundo uso.
- **Base de datos y API (Fase 5).** Migración no destructiva: se sustituye el índice único `uq_tickets_shopping_session_id`
  por uno parcial (un recibo por viaje y tienda confirmada), se añade el total pagado por recibo y la RPC
  `attach_receipt_to_session` deja de lanzar `SESSION_HAS_RECEIPT` y `STORE_MISMATCH`, lanza un conflicto nuevo por tienda
  repetida, suma totales y registra estadísticas en la tienda de cada recibo. La API v1 cambia de forma aditiva: `receipts` (lista) en el viaje junto al `receipt` actual (se mantiene como el
  primero, marcado como obsoleto). `move` y los recibos de otro viaje en `available-receipts` quedan fuera (design D22). La implementación de esa parte carga el skill
  `nextjs-saas-rest-api` (AGENTS.md) y actualiza `docs/reference/api-v1.md`.
- Lo que sigue sin cambiar de API (revisión por líneas): `GET .../session-matches` ya devuelve `match: 'name' | 'alias' | 'none'`;
  `POST .../attach-to-session` ya acepta `links` (incluido `shopping_session_item_id: null`) y `added_item_ids`; la revisión
  por líneas no necesita migraciones propias.
- Tests: `tickets/attach/tests/` (nuevo helper de decisiones y de resultado), `e2e/ui/receipt-attach.e2e.spec.ts` (usa
  `attach-review-will-be-checked` y `attach-review-not-in-this-trip`).
- Documentación: `docs/design/DESIGN.md` (7.6 y 11.4 · 3g), `docs/design/listys-design-system.html` (referencia visual
  canónica) y `docs/reference/implementation-status.md` si menciona el flujo.
- Dependencia: parte del estado de `receipt-session-reconciliation` después de `trips-and-receipt-attach` (revisión
  abierta desde el viaje, cantidad comprada que reemplaza la habitual). Ese change debe archivarse antes que este. No
  modifica ningún requisito que `trips-and-receipt-attach` ya modifica.

## Corrective audit pass approved 2026-11-06

Implement the eleven findings of the v4 visual audit without replacing existing local work: fail empty OCR results in both
providers and at historical read/attach boundaries; explain permanent store conflicts; correct sheets, Change Line, review
hierarchy, trip header/navigation, estimates, receipt rows, the saved warning and the origin-trip receipt action. No new
endpoint, database migration or historical data rewrite. PNG v4 composition is reconciled into the canonical HTML and DESIGN.md.
