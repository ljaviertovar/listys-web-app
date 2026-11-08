# Design

## Context

Ver `proposal.md` para la motivación. La página del trip pasa todos los ítems activos a `buildSessionPriceEstimate`; en completados ya filtra los marcados. Ese helper devuelve tanto el total como el mapa de precios utilizado por las filas. Filtrar simplemente su entrada activa eliminaría también los precios visibles de las filas pendientes.

`SessionSummaryCard` oculta el importe cuando `pricedCount` es cero. Esto requiere separar disponibilidad de precios y acumulado para poder mostrar cero antes de marcar el primer ítem. El helper usa promedios por nombre normalizado, sin multiplicar por cantidad, porque representan precios de línea.

`getShoppingSession` ya proyecta `tickets.attached_total_amount` como `TripReceipt.total_amount`. `summarizeTripReceipts` filtra adjuntos y suma; `TripReceiptSummary` lo comparte entre ambos modos y conserva el guion cuando falta un total adjunto. Esta parte ya cumple el caso normal solicitado: reforzar el contrato y cubrir sus bordes sin cambiar código correcto innecesariamente.

`trip-receipt-review-redesign` figura completo sin archivar y renombra `Active session shows an estimated total` a `A session shows an estimated total until receipts say what was paid`. El delta de este cambio usa ese mismo renombrado y conserva los escenarios de completados, recibos y jerarquía del rediseño. Al sincronizar, aplicar primero el rediseño y después este cambio; si el nombre destino ya existe, conservarlo y aplicar el bloque actualizado, sin volver a crear el requisito antiguo. El resultado final debe contener una sola definición con acumulado activo y presentación de completados. Ninguno de los cambios necesita archivarse para implementar esta regla.

## Goals / Non-Goals

**Goals:** aislar el subtotal de marcados del mapa completo de precios; compartir la contabilidad de adjuntos entre modos; verificar la conexión entre datos y tarjetas.

**Non-Goals:** cambiar cómo se aprende un precio, usar precios unitarios, crear un snapshot histórico del estimado, alterar las mutaciones de marcado/adjuntar/completar, cambiar el historial o rediseñar las tarjetas.

## Decisions

### 1. Separar el mapa completo del subtotal activo

Conservar `buildSessionPriceEstimate` para obtener precios de todas las filas. Derivar con un helper puro local en shopping-sessions el subtotal y la cobertura del subconjunto con `checked === true`, reutilizando ese mapa. La página pasa este resultado a la tarjeta activa y mantiene el mapa completo para `ShoppingSessionItems`. El contador de progreso sigue usando todos los ítems. Los completados conservan su cálculo actual.

Alternativas: filtrar la entrada del helper existente rompe las filas pendientes; hacer que todos sus consumidores filtren por `checked` arriesga el estimado de la lista base; persistir otro total introduce estado redundante sin necesidad.

### 2. Mantener precios y cantidades existentes

Sumar una vez el promedio válido por ítem marcado; no multiplicar por `quantity` ni mezclar precios de recibo con promedios. Aplicar el mismo criterio `isUsablePrice` del mapa existente. Marcar o desmarcar recalcula tras la actualización existente de la página; no añadir otro store, suscripción o escritura.

### 3. Distinguir cero acumulado de ausencia de datos

Decisión para el borde no detallado en la petición: si hay al menos un precio conocido en todo el trip, permitir un estimado activo de cero aunque `pricedCount` del subconjunto sea cero. Sin precios en todo el trip, conservar solo progreso. Extender la API de `SessionSummaryCard` con disponibilidad explícita si hace falta; no fingir un ítem con precio ni alterar contadores para forzar el render. La cobertura usa marcados como denominador y deja clara la cobertura parcial.

### 4. Conservar una única suma de adjuntos

Mantener `summarizeTripReceipts` como fuente de la suma de la tarjeta en ambos modos. Consumir únicamente la proyección confirmada al adjuntar; nunca añadir `run.total_amount`, importes pendientes ni estimados. No cambiar el origen de datos ni su contrato. Extender las pruebas para múltiples adjuntos, transición de pendiente a adjunto, retirada, cero y totales desconocidos.

Conservar `Paid so far` para activos y `Paid` para completados. La petición no exige cambiar etiquetas. También se conserva la política documentada: si falta un total adjunto, el pagado completo es desconocido. Mostrar una suma parcial sin identificarla sería ambiguo y cambiaría un comportamiento ajeno al caso normal solicitado.

### 5. Reusar el diseño v2

Usar los patrones existentes de resumen de compra y de recibos del canvas de trips en `docs/design/listys-design-system.html`, y las reglas de `docs/design/DESIGN.md` sobre resumen activo y recibos. Cambian valores y cobertura, no tokens ni composición visual. Mantener los `data-testid` semánticos; cualquier helper React nuevo deberá exponerlos según AGENTS.md. Actualizar la documentación escrita y su sección 11.4 si el borde de cero/cobertura no está representado en el HTML.

## Risks / Trade-offs

- [Pérdida de precios en filas pendientes] → subtotal separado del mapa completo y prueba de página con un pendiente con precio.
- [Cero interpretado como todos los ítems gratuitos] → cobertura explícita; sin precios conocidos no mostrar importe.
- [Solapamiento entre deltas] → reconciliar el nombre del requisito con el rediseño antes del sync, conservando escenarios de completados y la regla de acumulación de este cambio.
- [Cambios previos en el working tree] → implementar sobre el estado observado sin resetear ni sobrescribir trabajo ajeno.
- [Regresión del pagado al completar] → misma suma y pruebas parametrizadas para activo/completado con los mismos recibos.
- [Redondeo] → mantener el formateo monetario existente y comparar cálculos decimales con tolerancia en pruebas.

## Migration Plan

No se requieren migraciones ni actualizaciones de registros. Desplegar como cambio de cálculo/presentación con regresiones de la lista base y de completados. Revertir únicamente el cambio de aplicación si fuera necesario; no hay datos nuevos que restaurar. Sincronizar specs solo después de reconciliar el requisito renombrado del rediseño; no archivar ni sincronizar ese otro cambio durante esta propuesta.
