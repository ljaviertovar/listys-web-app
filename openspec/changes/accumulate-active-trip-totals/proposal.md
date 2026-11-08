# Proposal

## Why

En un trip activo, `Estimated total` debe reflejar lo que se va comprando: hoy incluye también ítems sin marcar. El importe de la tarjeta de recibos debe expresar exclusivamente la suma de los totales confirmados de los recibos adjuntos, con la misma regla mientras se compra y después de completar el trip.

## What Changes

- Calcular `Estimated total` del trip activo con los precios promedio conocidos de sus ítems con `checked === true`; marcar suma y desmarcar resta.
- Mantener el estimado completo de la lista base y de `Start Shopping`, y los precios visibles en las filas aún sin marcar.
- Mostrar cobertura referida a los ítems marcados. Antes de marcar ninguno, mostrar el acumulado cero cuando el trip tiene precios conocidos; sin datos de precios, conservar la ausencia de estimación.
- Garantizar que `Paid so far` (activo) y `Paid` (completado) sumen solo los totales confirmados de recibos adjuntos, incluidas las correcciones al adjuntar. Los recibos pendientes no aportan.
- Conservar la regla actual de importe no disponible si algún recibo adjunto carece de total, sin sustituirlo por el estimado ni por el total guardado del trip.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `item-price-memory`: limitar el acumulado estimado activo a ítems marcados, sin alterar la estimación de la lista base ni sus reglas de precios.
- `trip-receipts`: explicitar una única regla de total pagado para las tarjetas de recibos de trips activos y completados.

## Impact

- Orquestación de `src/app/(authenticated)/shopping/[runId]/page.tsx`, cálculo de precios de shopping-sessions y `SessionSummaryCard`.
- `summarizeTripReceipts`, `TripReceiptSummary` y pruebas de página/feature; el origen existente `attached_total_amount` ya respeta las correcciones de la revisión.
- Documentación de producto y diseño afectada durante la implementación. Sin cambios previstos de API, esquema, migraciones, RLS ni dependencias.
- El delta conserva el renombrado y los escenarios de completados de `trip-receipt-review-redesign`, terminado pero aún sin archivar. Sincronizar primero el rediseño y después este cambio; el nombre destino se conserva si ya existe, sin duplicar requisitos.
