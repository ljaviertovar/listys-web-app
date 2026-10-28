# Product Copy Clarity Specification

## Purpose

Definir textos coherentes, comprensibles y verificables para las acciones y estados existentes de Listys, de modo que el usuario pueda anticipar lo que ocurrirá y sus consecuencias, especialmente durante el uso móvil con atención limitada.

## Requirements

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
- **THEN** el texto promete listas reutilizables, el registro de las tiendas de sus recibos, la tienda donde suele comprar cada artículo y el último precio de cada artículo en cada tienda según sus recibos, sin prometer grupos, carpetas, listas separadas por tienda, precios actuales o de fuentes externas, ni etiquetas o precios por tienda para quienes comparten una lista

#### Scenario: Remembered match

- **WHEN** la revisión muestra una línea que coincide por un vínculo recordado
- **THEN** el texto dice que la coincidencia se recuerda de un recibo anterior y que puede cambiarse, sin presentarla como una detección automática segura

#### Scenario: Usual store wording

- **WHEN** el usuario ve o cambia la tienda habitual de un artículo
- **THEN** el texto la presenta como la tienda donde suele comprarlo según sus compras o como la que eligió, y distingue una de otra, sin hablar de puntuaciones, predicciones ni certeza

#### Scenario: Learning from a receipt without a store

- **WHEN** el usuario añade a una lista artículos de un recibo sin tienda confirmada
- **THEN** el diálogo indica que confirmar la tienda permite recordar dónde se compran, sin impedir añadir los artículos

#### Scenario: Store-scoped trip

- **WHEN** el usuario elige una tienda al empezar una compra o recorre una sesión con tienda
- **THEN** el texto dice que los artículos de esa tienda van primero y que el resto sigue disponible en otra sección, sin afirmar que los demás artículos se quitaron de la lista

#### Scenario: Attaching a receipt to a trip

- **WHEN** el usuario ve la oferta o la confirmación de adjuntar un recibo a una compra
- **THEN** el texto distingue adjuntar a una compra de añadir artículos a una lista, dice si la compra se completará y que los artículos ya contados no se cuentan otra vez, sin afirmar que el recibo se emparejó solo

#### Scenario: Line statuses on a receipt

- **WHEN** el usuario ve los estados "In <list>", "New" y "Check" de las líneas de un recibo
- **THEN** el texto dice frente a qué lista se comparan, que seleccionar no añade nada hasta confirmar y, para "Check", el motivo concreto ("No price read", "Looks like <item>?"), sin hablar de confianza, puntuaciones ni detección segura

#### Scenario: Suggested match

- **WHEN** la revisión ofrece vincular una línea a un artículo parecido
- **THEN** el texto la presenta como posible coincidencia por parecido de nombre que solo se aplica si el usuario la elige

#### Scenario: Likely needed wording

- **WHEN** el dashboard muestra artículos probablemente necesarios
- **THEN** el texto da los hechos de cada uno (cada cuánto suele comprarse y hace cuánto se compró) sin prometer avisos, predicciones ni certeza

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

Los textos SHALL distinguir los totales de artículos, recibos, sesiones y gastos agregados, e indicar la cobertura o los datos faltantes cuando corresponda. Las estimaciones MUST identificarse como tales y la información de cuenta MUST usar términos del usuario sin sugerir controles inexistentes.

#### Scenario: Incomplete receipt prices

- **WHEN** solo una parte de los artículos tiene precio
- **THEN** el resumen aclara qué cubre el importe mostrado sin presentarlo como el total pagado del recibo

#### Scenario: Estimated session total

- **WHEN** una sesión activa muestra un importe calculado a partir de precios promedio
- **THEN** el texto lo llama estimación, indica cuántos de los ítems de la sesión tienen precio y no lo presenta como lo que se pagará ni como lo pagado

#### Scenario: Read-only account information

- **WHEN** la cuenta muestra el proveedor de acceso sin herramientas para modificarlo
- **THEN** el texto presenta esa información como informativa y no invita a realizar una gestión ausente

#### Scenario: Printed receipt total

- **WHEN** un recibo tiene un total impreso leído y también la suma de sus líneas extraídas
- **THEN** el texto llama "Receipt Total" al impreso y mantiene la suma de líneas como total de artículos extraídos, sin presentarlos como el mismo importe

#### Scenario: Session total from its receipt

- **WHEN** una sesión completada tiene el total de su recibo adjunto
- **THEN** el texto lo presenta como pagado según el recibo, sin llamarlo estimación

#### Scenario: Monthly spending

- **WHEN** el dashboard muestra el gasto del mes
- **THEN** el texto dice de cuántas compras y recibos procede y cuántas compras del mes no tienen total, sin presentarlo como todo lo gastado ni como un presupuesto

#### Scenario: Existing total calculations

- **WHEN** Listys presenta totales de artículos, recibos, sesiones o gastos agregados
- **THEN** conserva los cálculos, la moneda y los datos persistidos actuales

### Requirement: Text remains concise and localization tolerant

Los textos de interfaz SHALL mantener el idioma inglés actual, frases completas y concordancia de números. MUST tolerar expansión de texto sin perder el significado de botones o advertencias y expresar los estados pendientes de forma consistente.

#### Scenario: Text expansion in a mobile confirmation

- **WHEN** las etiquetas y advertencias aumentan un 30% de longitud
- **THEN** conservan su contenido completo mediante reflujo o disposición vertical sin truncar las consecuencias
