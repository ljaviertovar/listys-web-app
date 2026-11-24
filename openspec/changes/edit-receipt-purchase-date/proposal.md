# Proposal

## Why

La fecha de compra se extrae del recibo con OCR y decide en qué mes cuenta el recibo en el gasto, pero la lectura puede no encontrarla o leer el día equivocado y hoy no hay forma de corregirla. Un día mal leído mueve el importe a otro mes sin que la persona sepa por qué.

## What Changes

- Mostrar la fecha de compra como campo editable en la tarjeta de la tienda del recibo, donde la persona ya comprueba lo que leyó el escaneo.
- Decir de dónde viene la fecha: leída del recibo, no encontrada (se usa la fecha de carga) o fijada por la persona.
- Guardar el día al elegirlo, sin botón de guardar, y no admitir días posteriores a hoy.
- Recordar que la fecha la fijó la persona (`purchase_date_by_user`) para que una nueva lectura del recibo no la sobrescriba.
- Aclarar con "(upload date)" que la fecha de compra mostrada en la metadata es la de carga cuando no se leyó otra.

## Capabilities

### New Capabilities

### Modified Capabilities
- `receipt-review`: la fecha de compra se puede corregir desde la tarjeta de la tienda y una fecha fijada por la persona se conserva.

## Impact

- `PATCH /api/v1/tickets/{id}` admite `purchase_date`; nueva columna `tickets.purchase_date_by_user` (migración aditiva).
- Funciones OCR (Gemini y OpenAI): no escriben la fecha leída cuando la fijó la persona.
- UI: `TicketStoreCard` gana el campo `PurchaseDateField`; la pantalla del recibo le pasa la fecha.
