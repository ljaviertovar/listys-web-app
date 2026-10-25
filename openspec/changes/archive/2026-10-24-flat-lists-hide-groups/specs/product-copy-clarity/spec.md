# Spec Delta

## MODIFIED Requirements

### Requirement: Consistent object and action names

El copy visible SHALL distinguir receipt, base list, shopping session e item de forma coherente y MUST NOT usar "group" para un contenedor de listas, porque la interfaz ya no tiene ese concepto. El nombre de una acción MUST mantenerse reconocible entre disparador, confirmación, estado pendiente y resultado. Las acciones genéricas o iconos MUST tener nombres accesibles que expresen su propósito en contexto.

#### Scenario: Completing shopping

- **WHEN** el usuario pasa del disparador de completar a su confirmación y estado pendiente
- **THEN** reconoce la misma acción sin cambios innecesarios entre shopping, run y session ni un disparador genérico sin propósito

#### Scenario: History count

- **WHEN** el historial presenta cero, una o varias sesiones
- **THEN** usa un nombre correcto del objeto y concordancia apropiada, sin “shoppings” ni plurales incorrectos

#### Scenario: No container vocabulary

- **WHEN** el usuario recorre listas, dashboard, historial, recibos, navegación y diálogos
- **THEN** ningún texto visible ni etiqueta accesible nombra un grupo de listas; el lugar donde se organiza lo que compra es la lista base

### Requirement: Copy describes the available capability

Las explicaciones y promesas SHALL corresponder a controles y resultados disponibles. MUST distinguir seleccionar de editar, compartir una lista de gestionar otras listas, guardar un recibo de añadir artículos a una lista y una nueva subida de reemplazar una foto existente. Ningún texto MUST prometer una función pendiente para evitar reconocer una limitación.

#### Scenario: Receipt review

- **WHEN** el usuario lee cómo revisar un recibo
- **THEN** el texto describe las opciones reales de comparación y selección, sin afirmar que puede editar nombre, cantidad o precio si esos controles no existen

#### Scenario: Sharing explanation

- **WHEN** el usuario lee cómo compartir
- **THEN** entiende que el enlace da acceso a la lista que lo genera, sin inferir que comparte sus otras listas

#### Scenario: Upload after an empty extraction

- **WHEN** una extracción vacía propone subir otra foto mediante el diálogo general
- **THEN** el texto deja claro que se crea otra subida y no promete reemplazar la imagen del recibo actual

#### Scenario: Organizing promise

- **WHEN** el usuario lee la descripción de las listas o de la página pública
- **THEN** el texto promete listas reutilizables y no una organización en grupos, carpetas o tiendas que la aplicación no ofrece

## REMOVED Requirements

### Requirement: Consequences and scope are explicit

**Reason**: Su escenario "Delete a group" describe una confirmación que la interfaz ya no ofrece (los grupos dejan de ser visibles), y una modificación no puede eliminar un escenario. El requisito se reemplaza por uno equivalente con otro nombre que trata la eliminación de una lista.

**Migration**: Ver "Destructive and sync confirmations state their scope", que conserva los escenarios de limpiar una selección, actualizar la lista base y los ítems omitidos, y sustituye "Delete a group" por "Delete a list".

## ADDED Requirements

### Requirement: Destructive and sync confirmations state their scope

Las confirmaciones destructivas y los avisos de sincronización SHALL explicar su alcance usando hechos soportados por la operación actual. MUST diferenciar cerrar un diálogo, descartar un borrador, cancelar una compra, eliminar un objeto y limpiar una selección. Los textos MUST evitar prometer reversibilidad o conservación de datos que el flujo no garantiza.

#### Scenario: Clear selected receipt items

- **WHEN** el usuario limpia una selección
- **THEN** el nombre de la acción indica que desmarca la selección y no sugiere borrar los artículos o el recibo

#### Scenario: Delete a list

- **WHEN** se solicita eliminar una lista
- **THEN** la confirmación identifica la lista, cuántos ítems se van con ella, que las personas con quienes se comparte pierden el acceso y que no se puede deshacer, antes de que se confirme

#### Scenario: Update the base list

- **WHEN** la finalización de una compra pide confirmación
- **THEN** el texto explica que los ítems marcados se guardan en el historial y se aplican a la lista base, sin ofrecer ni sugerir una opción para omitirlo
- **AND** si quedan ítems sin marcar, el texto indica que permanecen en la lista base

#### Scenario: Items that did not fit in the list

- **WHEN** la finalización omite ítems nuevos porque la lista alcanzó su máximo
- **THEN** el resultado indica cuántos ítems no se guardaron en la lista y que el viaje sí se completó
