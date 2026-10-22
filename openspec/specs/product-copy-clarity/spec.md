# Product Copy Clarity Specification

## Purpose

Definir textos coherentes, comprensibles y verificables para las acciones y estados existentes de Listys, de modo que el usuario pueda anticipar lo que ocurrirá y sus consecuencias, especialmente durante el uso móvil con atención limitada.

## Requirements

### Requirement: Consistent object and action names

El copy visible SHALL distinguir receipt, base list, shopping session, group e item de forma coherente. El nombre de una acción MUST mantenerse reconocible entre disparador, confirmación, estado pendiente y resultado. Las acciones genéricas o iconos MUST tener nombres accesibles que expresen su propósito en contexto.

#### Scenario: Completing shopping

- **WHEN** el usuario pasa del disparador de completar a su confirmación y estado pendiente
- **THEN** reconoce la misma acción sin cambios innecesarios entre shopping, run y session ni un disparador genérico sin propósito

#### Scenario: History count

- **WHEN** el historial presenta cero, una o varias sesiones
- **THEN** usa un nombre correcto del objeto y concordancia apropiada, sin “shoppings” ni plurales incorrectos

### Requirement: Copy describes the available capability

Las explicaciones y promesas SHALL corresponder a controles y resultados disponibles. MUST distinguir seleccionar de editar, una lista compartida de un grupo organizativo, guardar un recibo de añadir artículos a una lista y una nueva subida de reemplazar una foto existente. Ningún texto MUST prometer una función pendiente para evitar reconocer una limitación.

#### Scenario: Receipt review

- **WHEN** el usuario lee cómo revisar un recibo
- **THEN** el texto describe las opciones reales de comparación y selección, sin afirmar que puede editar nombre, cantidad o precio si esos controles no existen

#### Scenario: Sharing explanation

- **WHEN** el usuario lee cómo compartir
- **THEN** entiende que el enlace da acceso a la lista que lo genera, sin inferir que comparte todo el grupo

#### Scenario: Upload after an empty extraction

- **WHEN** una extracción vacía propone subir otra foto mediante el diálogo general
- **THEN** el texto deja claro que se crea otra subida y no promete reemplazar la imagen del recibo actual

### Requirement: Receipt lifecycle states are distinct

El copy SHALL distinguir subida, espera, lectura, revisión y adición a una lista. Un procesamiento finalizado MUST evitar afirmar que el usuario ya revisó o guardó los artículos en una lista. El progreso de duración desconocida MUST evitar porcentajes o tiempos inventados.

#### Scenario: Extraction finished

- **WHEN** la lectura del recibo termina y existen artículos seleccionables
- **THEN** la UI indica “Ready to Review” y ofrece la revisión de los artículos sin usar “Completed” como si el usuario ya los hubiera revisado o añadido a una lista

#### Scenario: Upload pending

- **WHEN** se están enviando las fotos
- **THEN** el usuario reconoce la subida en curso y no recibe un porcentaje, número de fotos completadas o duración no proporcionados por la operación actual

#### Scenario: Upload success and navigation

- **WHEN** el recibo se guarda y la interfaz navega a su revisión
- **THEN** el mensaje de éxito confirma la subida y deja claro el destino de revisión sin describir como pendiente una redirección que ya ocurrió

### Requirement: Consequences and scope are explicit

Las confirmaciones destructivas y los avisos de sincronización SHALL explicar su alcance usando hechos soportados por la operación actual. MUST diferenciar cerrar un diálogo, descartar un borrador, cancelar una compra, eliminar un objeto y limpiar una selección. Los textos MUST evitar prometer reversibilidad o conservación de datos que el flujo no garantiza.

#### Scenario: Clear selected receipt items

- **WHEN** el usuario limpia una selección
- **THEN** el nombre de la acción indica que desmarca la selección y no sugiere borrar los artículos o el recibo

#### Scenario: Delete a group

- **WHEN** se solicita eliminar un grupo
- **THEN** la confirmación identifica el grupo, sus objetos afectados y la irreversibilidad según la operación existente antes de que se confirme

#### Scenario: Update the base list

- **WHEN** la finalización ofrece actualizar la lista base
- **THEN** explica qué implica la opción conforme al comportamiento actual sin alterar su valor por defecto ni inventar campos que no se sincronizan

### Requirement: Errors and empty states give an available next step

Los errores SHALL expresar en lenguaje seguro qué no pudo hacerse y qué acción disponible puede intentar el usuario. MUST evitar trazas, SQL, proveedores internos y errores sin filtrar. Los vacíos MUST orientar a un siguiente paso existente y diferenciar falta de datos de fallo de carga.

#### Scenario: List loading error

- **WHEN** no se pueden cargar las listas
- **THEN** el texto comunica el fallo y una recuperación real sin usar un mensaje definitivo de que no hay listas

#### Scenario: Authentication provider fails to open

- **WHEN** falla la apertura del acceso con el proveedor
- **THEN** existe un mensaje visible y accionable sin detalles internos ni afirmaciones sobre la existencia de una cuenta

### Requirement: Claims and destinations are verifiable

Las superficies públicas y de autenticación SHALL evitar garantías universales, cifras de precisión, rendimiento o adopción sin evidencia mantenida. Los enlaces visibles MUST tener destinos existentes y relacionados con su etiqueta; un placeholder no puede aparentar una política publicada ni un flujo de recuperación disponible.

#### Scenario: Unsupported marketing claim

- **WHEN** no existe evidencia mantenida que respalde una cifra pública de precisión
- **THEN** el copy describe el proceso y su revisión sin presentar la cifra como un resultado demostrado

#### Scenario: Unavailable destination

- **WHEN** una ruta de recuperación o información no existe
- **THEN** la pantalla no la ofrece como una acción operativa y no sustituye el destino con un enlace vacío que aparenta funcionar

### Requirement: Totals and account information describe what is known

Los textos de importes SHALL distinguir total de artículos extraídos de importe pagado, e indicar cobertura parcial cuando ya se dispone de ese dato. La información de cuenta MUST usar términos del usuario sin sugerir controles de gestión inexistentes. La primera iteración MUST conservar cálculos, moneda y datos persistidos actuales.

#### Scenario: Incomplete receipt prices

- **WHEN** solo una parte de los artículos tiene precio
- **THEN** el resumen aclara qué cubre el importe mostrado sin presentarlo como el total pagado del recibo

#### Scenario: Read-only account information

- **WHEN** la cuenta muestra el proveedor de acceso sin herramientas para modificarlo
- **THEN** el texto presenta esa información como informativa y no invita a realizar una gestión ausente

### Requirement: Text remains concise and localization tolerant

Los textos de interfaz SHALL mantener el idioma inglés actual, frases completas y concordancia de números. MUST tolerar expansión de texto sin perder el significado de botones o advertencias y expresar los estados pendientes de forma consistente.

#### Scenario: Text expansion in a mobile confirmation

- **WHEN** las etiquetas y advertencias aumentan un 30% de longitud
- **THEN** conservan su contenido completo mediante reflujo o disposición vertical sin truncar las consecuencias
