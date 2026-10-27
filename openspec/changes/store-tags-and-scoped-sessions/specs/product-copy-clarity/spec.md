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
- **THEN** el texto promete listas reutilizables, el registro de las tiendas de sus recibos y la tienda donde suele comprar cada artículo, sin prometer grupos, carpetas, listas separadas por tienda, comparación de precios entre tiendas ni etiquetas de tienda para quienes comparten una lista

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
