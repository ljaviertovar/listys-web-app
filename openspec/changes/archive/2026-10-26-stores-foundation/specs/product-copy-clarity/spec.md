# Spec Delta

## MODIFIED Requirements

### Requirement: Consistent object and action names

El copy visible SHALL distinguir receipt, base list, shopping session, store e item de forma coherente y MUST NOT usar "group" para un contenedor de listas, porque la interfaz ya no tiene ese concepto. Store SHALL nombrar solo el lugar donde se compra, nunca un contenedor de listas. El nombre de una acción MUST mantenerse reconocible entre disparador, confirmación, estado pendiente y resultado. Las acciones genéricas o iconos MUST tener nombres accesibles que expresen su propósito en contexto.

#### Scenario: Completing shopping

- **WHEN** el usuario pasa del disparador de completar a su confirmación y estado pendiente
- **THEN** reconoce la misma acción sin cambios innecesarios entre shopping, run y session ni un disparador genérico sin propósito

#### Scenario: History count

- **WHEN** el historial presenta cero, una o varias sesiones
- **THEN** usa un nombre correcto del objeto y concordancia apropiada, sin “shoppings” ni plurales incorrectos

#### Scenario: No container vocabulary

- **WHEN** el usuario recorre listas, dashboard, historial, recibos, navegación y diálogos
- **THEN** ningún texto visible ni etiqueta accesible nombra un grupo de listas; el lugar donde se organiza lo que compra es la lista base

#### Scenario: Store vocabulary

- **WHEN** el usuario confirma la tienda de un recibo, la gestiona en "My Stores" o la ve en un recibo
- **THEN** se usa "store" de forma coherente, sin alternar con merchant, shop o receipt name para el mismo concepto

### Requirement: Copy describes the available capability

Las explicaciones y promesas SHALL corresponder a controles y resultados disponibles. MUST distinguir seleccionar de editar, compartir una lista de gestionar otras listas, guardar un recibo de añadir artículos a una lista, una nueva subida de reemplazar una foto existente y vincular una línea a un artículo de crear uno nuevo. Ningún texto MUST prometer una función pendiente para evitar reconocer una limitación.

#### Scenario: Receipt review

- **WHEN** el usuario lee cómo revisar un recibo
- **THEN** el texto describe las opciones reales de comparación, selección, confirmación de tienda y vínculo con artículos existentes, sin afirmar que puede editar nombre, cantidad o precio si esos controles no existen

#### Scenario: Sharing explanation

- **WHEN** el usuario lee cómo compartir
- **THEN** entiende que el enlace da acceso a la lista que lo genera, sin inferir que comparte sus otras listas

#### Scenario: Upload after an empty extraction

- **WHEN** una extracción vacía propone subir otra foto mediante el diálogo general
- **THEN** el texto deja claro que se crea otra subida y no promete reemplazar la imagen del recibo actual

#### Scenario: Organizing promise

- **WHEN** el usuario lee la descripción de las listas, de "My Stores" o de la página pública
- **THEN** el texto promete listas reutilizables y el registro de las tiendas de sus recibos, sin prometer grupos, carpetas, listas por tienda ni etiquetas de tienda por artículo que la aplicación no ofrece

#### Scenario: Remembered match

- **WHEN** la revisión muestra una línea que coincide por un vínculo recordado
- **THEN** el texto dice que la coincidencia se recuerda de un recibo anterior y que puede cambiarse, sin presentarla como una detección automática segura
