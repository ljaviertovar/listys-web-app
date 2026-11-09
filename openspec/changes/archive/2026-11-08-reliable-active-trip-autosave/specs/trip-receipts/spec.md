# Spec Delta

## ADDED Requirements

### Requirement: Receipt review waits for local checked intentions

Antes de abrir la revisión de un recibo contra un trip activo, la interfaz SHALL confirmar sus checks locales pendientes y cargar los datos actuales del trip. Antes de confirmar el adjunto SHALL comprobar de nuevo que no quedan pendientes ni conflictos. Si la sincronización falla, SHALL conservar la intención y ofrecer reintento sin adjuntar el recibo.

#### Scenario: Open review while checks are saving

- **WHEN** el usuario abre la revisión con checks pendientes o en vuelo
- **THEN** se espera su confirmación antes de cargar la revisión

#### Scenario: Confirmation encounters an unresolved check

- **WHEN** se intenta confirmar un recibo y existe un check local sin confirmar o un conflicto
- **THEN** el adjunto espera la sincronización y la resolución del conflicto
- **AND** un fallo no modifica el trip ni el recibo por esa acción

### Requirement: Receipt mutations participate in item versioning

Las modificaciones efectivas de campos editables de un ítem causadas por adjuntar un recibo SHALL incrementar su versión del servidor en la misma transacción. Los ítems nuevos SHALL obtener una versión inicial. Un check pendiente basado en datos anteriores al recibo MUST NOT sobrescribir sus cambios sin reconciliación.

#### Scenario: Receipt changes an existing item

- **WHEN** un recibo cambia el check o la cantidad de un ítem existente
- **THEN** el ítem refleja una versión superior al confirmar el adjunto
- **AND** una edición con la versión anterior recibe conflicto o rechazo por sesión completada

#### Scenario: Receipt adds an item

- **WHEN** el adjunto añade un ítem nuevo al trip
- **THEN** ese ítem aparece con una versión válida para futuras lecturas

### Requirement: Receipt attachment coordinates with manual saves

El adjunto de recibos SHALL coordinarse transaccionalmente con los guardados manuales y la finalización de la misma sesión. SHALL conservar la posibilidad existente de adjuntar recibos a trips completados, sin permitir por ello checks manuales tardíos ni duplicar el aprendizaje de la lista.

#### Scenario: Attach after a queued save

- **WHEN** un check se confirma antes de que comience la transacción del adjunto
- **THEN** el adjunto parte del estado confirmado y conserva las reglas existentes de reconciliación

#### Scenario: Attach to completed trip

- **WHEN** el propietario adjunta un recibo válido a un trip completado
- **THEN** se mantienen las reglas actuales de recibos y precios reales
- **AND** el trip no vuelve a aceptar ediciones manuales de checks
