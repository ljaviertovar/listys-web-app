# Receipt Review Specification

## Purpose

Que revisar un recibo leído cueste poco sin dejar de ser una revisión: la pantalla del recibo dice qué líneas ya están
en la lista, cuáles son nuevas y cuáles conviene comprobar, y permite aceptar en bloque lo que coincide con seguridad.

## Requirements

### Requirement: A read receipt is compared with a target list

La pantalla de un recibo leído, con líneas y sin adjuntar a una compra, SHALL comparar sus líneas con una lista destino
propia del usuario: la lista a la que el recibo ya se añadió; si no, la lista a la que el usuario añadió su recibo más
reciente; si no, su lista más antigua. La pantalla SHALL nombrar la lista destino y permitir elegir otra de sus listas.

#### Scenario: First receipt of a new user

- **WHEN** un usuario cuya única lista es "Pantry" abre su primer recibo leído
- **THEN** la pantalla indica que las líneas se comparan con "Pantry"

#### Scenario: Last list used

- **WHEN** el usuario tiene "Pantry" y "Office", y su último recibo añadido fue a "Office"
- **THEN** un recibo nuevo se compara con "Office"

#### Scenario: Receipt already added to a list

- **WHEN** el usuario abre un recibo que ya añadió a "Pantry"
- **THEN** el recibo se compara con "Pantry" aunque su último recibo fuera a otra lista

#### Scenario: Change the target list

- **WHEN** el usuario elige "Office" en el selector de lista destino
- **THEN** los estados de todas las líneas se recalculan frente a "Office"

#### Scenario: Shared lists are not targets

- **WHEN** el usuario colabora en una lista de otra persona
- **THEN** esa lista no aparece en el selector de lista destino ni se elige por defecto

#### Scenario: Deleted list

- **WHEN** la lista del último recibo añadido ya no existe
- **THEN** se aplica la siguiente regla y se compara con la lista más antigua del usuario

### Requirement: Each line shows its status against the target list

Cada línea SHALL mostrar uno de tres estados frente a la lista destino: "In <list>" si coincide con un artículo por
nombre o por vínculo recordado (indicando cuándo es recordado), "New" si no coincide, o "Check" si es dudosa. El estado
"Check" SHALL decir su motivo: "No price read" o "Looks like <item>?". Una línea con ambos motivos los muestra los dos.

#### Scenario: Match by name

- **WHEN** la línea "Bananas" y la lista tiene el artículo "Bananas"
- **THEN** la línea muestra "In Pantry"

#### Scenario: Remembered match

- **WHEN** la línea "LECHE 2% 4L" coincide con "2% Milk 4L" por un vínculo recordado
- **THEN** la línea muestra que está en la lista y que la coincidencia se recordó de un recibo anterior

#### Scenario: Line without price

- **WHEN** el OCR leyó la línea "Yogurt" sin precio
- **THEN** la línea muestra "Check" con el motivo "No price read", tenga o no coincidencia

#### Scenario: Similar item

- **WHEN** la línea "ORG BANANAS" no coincide con ningún artículo y la lista tiene "Organic Bananas"
- **THEN** la línea muestra "Check" con el motivo "Looks like Organic Bananas?"

#### Scenario: New line

- **WHEN** la línea tiene precio, no coincide y no se parece a ningún artículo
- **THEN** la línea muestra "New"

### Requirement: Lines needing attention come first

La pantalla SHALL agrupar las líneas en secciones por estado, en este orden: "Check these", "New to <list>" e
"In <list>", cada una con su número de líneas y conservando dentro el orden del recibo. Una sección vacía MUST NOT
mostrarse. La sección "In <list>" SHALL empezar plegada cuando hay alguna otra sección.

#### Scenario: Mixed receipt

- **WHEN** un recibo de diez líneas tiene dos dudosas, tres nuevas y cinco en la lista
- **THEN** la pantalla muestra primero "Check these" con 2, después "New to Pantry" con 3 y al final "In Pantry" con 5, plegada

#### Scenario: Everything is in the list

- **WHEN** todas las líneas coinciden y tienen precio
- **THEN** solo se muestra "In Pantry", desplegada

### Requirement: Confident matches can be selected in bulk

La sección "In <list>" SHALL ofrecer "Select all N", que añade a la selección todas sus líneas de una vez. Las líneas
dudosas MUST NOT seleccionarse con esa acción aunque coincidan. Nada SHALL aparecer seleccionado al abrir el recibo y
el usuario SHALL poder deseleccionar cualquier línea antes de añadir.

#### Scenario: Bulk select

- **WHEN** el usuario pulsa "Select all 5" en "In Pantry"
- **THEN** las cinco líneas quedan seleccionadas y la barra de selección muestra 5

#### Scenario: Matched line without price

- **WHEN** una línea coincide con "Yogurt" pero no tiene precio leído
- **THEN** está en "Check these" y "Select all" de "In Pantry" no la selecciona

#### Scenario: Nothing preselected

- **WHEN** el usuario abre un recibo recién leído
- **THEN** ninguna línea está seleccionada

### Requirement: Review stays mandatory

Seleccionar líneas MUST NOT añadirlas a una lista: añadir SHALL seguir requiriendo "Add Items to List" y su
confirmación. El diálogo SHALL proponer la lista destino de la pantalla, que el usuario puede cambiar. Ninguna
sugerencia por parecido SHALL aplicarse sin una elección explícita del usuario.

#### Scenario: Add after bulk select

- **WHEN** el usuario selecciona en bloque cinco líneas y pulsa "Add Items to List"
- **THEN** el diálogo propone "Pantry" y no se añade nada hasta que el usuario confirma

#### Scenario: Suggestion left untouched

- **WHEN** el usuario añade una línea con la sugerencia "Organic Bananas" sin elegirla
- **THEN** la línea se añade como artículo nuevo y "Organic Bananas" no cambia

### Requirement: The comparison degrades to the category view

Si el usuario no tiene listas propias, si la comparación no carga, o mientras carga, la pantalla SHALL mostrar las
líneas agrupadas por categoría y seleccionables como antes. Un fallo SHALL explicarse con la opción de reintentar y
MUST NOT impedir seleccionar ni añadir líneas.

#### Scenario: Comparison fails

- **WHEN** la petición de coincidencias falla
- **THEN** la pantalla muestra las líneas por categoría, un aviso de que no pudo compararlas con la lista y "Try Again"

#### Scenario: No own lists

- **WHEN** el usuario no tiene listas propias
- **THEN** la pantalla muestra las líneas por categoría sin estados ni selector de lista destino

### Requirement: Receipts outside review keep their current view

Un recibo pendiente, en lectura, fallido, sin líneas o adjunto a una compra MUST NOT mostrar estados por línea ni
selector de lista destino; conserva la vista que ya tenía.

#### Scenario: Attached receipt

- **WHEN** el usuario abre un recibo adjunto a una compra
- **THEN** ve sus líneas sin estados ni selector, como hasta ahora

### Requirement: The photo comparison shows the same statuses

La vista que compara la foto con las líneas SHALL mostrar el mismo estado por línea y compartir la selección con la
pantalla del recibo.

#### Scenario: Check a line against the photo

- **WHEN** el usuario abre la comparación con la foto
- **THEN** cada línea muestra el mismo estado que en la pantalla y seleccionar allí se refleja en la pantalla
