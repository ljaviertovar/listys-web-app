## Why

El tablero V3 F5 ("el recibo cierra el viaje") dibuja lo que pasa tras completar una compra y cómo se revisa un recibo contra
un viaje. La implementación de la Fase 5 ya reconcilia recibos y viajes, pero completar llevaba al dashboard sin pedir los
recibos, el viaje completado sin recibo no decía nada y la revisión de adjuntar no resumía qué coincide.

## What Changes

- **Al completar un viaje** se abre la página del viaje (`/shopping/{id}?saved=1`) con "Trip saved", cuántos ítems se
  actualizaron en qué lista, "Upload a Receipt" y "Keep It Separate", y la nota de que un recibo puede adjuntarse en 48 horas.
- **Un viaje completado sin recibo** dice "No receipts attached" con "Add Receipt".
- **La revisión de adjuntar** muestra "N Matched", "N Only on receipt" y "N Not on receipt", la sección "Checked, not on the
  receipt" con los ítems marcados que ninguna línea cubre, y dice "Everything you checked is on the receipt. Nothing to add or
  fix." cuando todo coincide.
- **Un recibo que ya se añadió a una lista** explica que por eso no se le ofrece un viaje.
- Contratos v1 y base de datos: sin cambios.

Fuera de alcance: el estimado en el viaje completado (la regla vigente es que un viaje terminado muestra lo comprado, no una
estimación) y "Attach Later" en el error de adjuntar (el diálogo ya ofrece "Retry").

## Capabilities

### New Capabilities

- `trip-receipts`: lo que dice y ofrece un viaje completado respecto de sus recibos.

### Modified Capabilities

- `receipt-session-reconciliation`: resumen de la revisión, ítems marcados sin línea y nota de recibo ya añadido a una lista.

## Impact

- UI: `complete-session-sheet`, `trip-receipts-card` (nuevo), `shopping/[runId]/page`, `attach-to-session-dialog`,
  `build-attach-review` (`checkedNotOnReceipt`), `receipt-added-to-list-note` (nuevo) y la página del recibo.
- Pruebas: `shopping-run-page`, `attach-review`.
- Sin migración.