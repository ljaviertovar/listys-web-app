## 1. Viaje completado

- [x] 1.1 `complete-session-sheet` navega a `/shopping/{id}?saved=1`.
- [x] 1.2 `TripReceiptsCard` con los estados "Trip saved" y "No receipts attached".
- [x] 1.3 La página del viaje la muestra solo en viajes completados sin recibo.

## 2. Revisión de adjuntar

- [x] 2.1 `buildAttachReview` devuelve `checkedNotOnReceipt`; el diálogo muestra el resumen y la sección.
- [x] 2.2 Nota de recibo ya añadido a una lista en la pantalla del recibo.

## 3. Pruebas y documentación

- [x] 3.1 Pruebas de la tarjeta, de `checkedNotOnReceipt` y de la página del viaje.
- [x] 3.2 `CHANGELOG.md`.
- [x] 3.3 Comprobación a 390 px de la tarjeta "Trip saved" y del resumen del diálogo.
- [ ] 3.4 Comprobar de punta a punta que completar un viaje abre `?saved=1` (se probó la URL, no el redirect).