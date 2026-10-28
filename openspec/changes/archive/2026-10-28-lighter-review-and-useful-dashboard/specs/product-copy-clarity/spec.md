# Spec Delta

## MODIFIED Requirements

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
