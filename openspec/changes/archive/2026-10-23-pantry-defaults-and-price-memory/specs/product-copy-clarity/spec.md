# Spec Delta

## MODIFIED Requirements

### Requirement: Consequences and scope are explicit

Las confirmaciones destructivas y los avisos de sincronización SHALL explicar su alcance usando hechos soportados por la operación actual. MUST diferenciar cerrar un diálogo, descartar un borrador, cancelar una compra, eliminar un objeto y limpiar una selección. Los textos MUST evitar prometer reversibilidad o conservación de datos que el flujo no garantiza.

#### Scenario: Clear selected receipt items

- **WHEN** el usuario limpia una selección
- **THEN** el nombre de la acción indica que desmarca la selección y no sugiere borrar los artículos o el recibo

#### Scenario: Delete a group

- **WHEN** se solicita eliminar un grupo
- **THEN** la confirmación identifica el grupo, sus objetos afectados y la irreversibilidad según la operación existente antes de que se confirme

#### Scenario: Update the base list

- **WHEN** la finalización de una compra pide confirmación
- **THEN** el texto explica que los ítems marcados se guardan en el historial y se aplican a la lista base, sin ofrecer ni sugerir una opción para omitirlo
- **AND** si quedan ítems sin marcar, el texto indica que permanecen en la lista base

#### Scenario: Items that did not fit in the list

- **WHEN** la finalización omite ítems nuevos porque la lista alcanzó su máximo
- **THEN** el resultado indica cuántos ítems no se guardaron en la lista y que el viaje sí se completó

### Requirement: Totals and account information describe what is known

Los textos de importes SHALL distinguir total de artículos extraídos de importe pagado, e indicar cobertura parcial cuando ya se dispone de ese dato. Un importe estimado con precios promedio MUST etiquetarse como estimación, indicar cuántos ítems tienen precio conocido y no presentarse como importe pagado. La información de cuenta MUST usar términos del usuario sin sugerir controles de gestión inexistentes. La primera iteración MUST conservar cálculos, moneda y datos persistidos actuales.

#### Scenario: Incomplete receipt prices

- **WHEN** solo una parte de los artículos tiene precio
- **THEN** el resumen aclara qué cubre el importe mostrado sin presentarlo como el total pagado del recibo

#### Scenario: Estimated session total

- **WHEN** una sesión activa muestra un importe calculado a partir de precios promedio
- **THEN** el texto lo llama estimación, indica cuántos de los ítems de la sesión tienen precio y no lo presenta como lo que se pagará ni como lo pagado

#### Scenario: Read-only account information

- **WHEN** la cuenta muestra el proveedor de acceso sin herramientas para modificarlo
- **THEN** el texto presenta esa información como informativa y no invita a realizar una gestión ausente
