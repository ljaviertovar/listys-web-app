# Spec Delta

## ADDED Requirements

### Requirement: Attached receipt totals determine the paid summary in every trip state

La tarjeta de recibos SHALL calcular el pagado como suma de los totales confirmados de sus recibos adjuntos, tanto en trips activos como completados. SHALL usar el importe confirmado al adjuntar, incluida su corrección, y excluir recibos pendientes. MUST NOT sumar precios de ítems ni usar el estimado o un total guardado del trip como sustituto.

#### Scenario: Multiple attached receipts during shopping

- **WHEN** un trip activo tiene recibos adjuntos por 86.40 y 41.12 y otro pendiente por 20.00
- **THEN** `Paid so far` muestra 127.52, sin incluir los 20.00 pendientes

#### Scenario: Same receipts after completion

- **WHEN** se completa el trip anterior sin cambiar sus recibos
- **THEN** `Paid` muestra los mismos 127.52

#### Scenario: Corrected attachment total

- **WHEN** un recibo leído como 86.40 se adjunta con total confirmado 82.50 y otro adjunto tiene total 41.12
- **THEN** la tarjeta muestra 123.62 tanto en modo activo como completado
- **AND** el total leído originalmente se conserva y no se suma en lugar del confirmado

#### Scenario: Receipt becomes attached

- **WHEN** se confirma la revisión de un recibo por 20.00 en un trip con otros adjuntos por 41.12
- **THEN** el pagado pasa a 61.12 sin volver a contar los otros recibos

#### Scenario: An attached receipt is deleted

- **WHEN** se elimina un recibo adjunto por 20.00 y queda otro por 41.12
- **THEN** la tarjeta recalcula el pagado como 41.12 en cualquiera de los dos estados del trip

### Requirement: The paid summary preserves unavailable and pending states

La tarjeta SHALL mostrar el pagado solo si hay recibos adjuntos y todos tienen total confirmado conocido; en caso contrario el importe SHALL ser no disponible. Un trip activo sin recibos adjuntos SHALL conservar las filas de pendientes sin tarjeta de pagado. Un total confirmado de cero SHALL ser un importe conocido válido.

#### Scenario: Attached receipt with an unknown total

- **WHEN** hay recibos adjuntos por 41.12 y por importe desconocido
- **THEN** la tarjeta muestra un guion como importe no disponible en ambos estados del trip, sin presentar 41.12 como total completo

#### Scenario: Pending receipts do not hide known attached totals

- **WHEN** el único adjunto tiene total 41.12 y hay otro pendiente sin total conocido
- **THEN** la tarjeta muestra 41.12

#### Scenario: Zero total is known

- **WHEN** el único recibo adjunto tiene total confirmado 0.00
- **THEN** la tarjeta muestra 0.00 y no lo trata como importe desconocido

#### Scenario: No attached receipts

- **WHEN** el trip activo solo tiene recibos pendientes
- **THEN** muestra sus estados sin tarjeta `Paid so far`
- **AND** después de completar no presenta el estimado ni un total antiguo como pagado de esos recibos
