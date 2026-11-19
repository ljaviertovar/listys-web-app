# Proposal

## Why

La tarjeta de Spending mezcla recibos cargados individualmente con compras de trips, aunque el gasto debe representar únicamente recibos confirmados dentro de un trip. También debe incluir trips activos, porque un recibo puede estar adjunto antes de completar el viaje.

## What Changes

- Cambiar la regla de gasto mensual y de todos los tiempos para sumar solo recibos válidos adjuntos a trips activos o completados.
- Excluir recibos sueltos y totales de trips que no provengan de recibos elegibles.
- Alinear conteos, desglose por tiendas y categorías, promedio y comparación mensual con los mismos recibos elegibles.

## Capabilities

### New Capabilities

### Modified Capabilities
- `dashboard-overview`: definir que el gasto de Spending procede únicamente de recibos adjuntos a trips activos o completados, tanto mensual como all time.

## Impact

- Servicio de Spending y resumen del dashboard, incluyendo el endpoint existente `/api/v1/spending`.
- Especificación OpenSpec `dashboard-overview` y pruebas correspondientes. No se requieren cambios de esquema ni migraciones de datos.
