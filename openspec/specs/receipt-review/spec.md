# Receipt Review Specification

## Purpose

Que revisar un recibo leído cueste poco sin dejar de ser una revisión: la pantalla del recibo dice qué líneas ya están
en la lista, cuáles son nuevas y cuáles conviene comprobar, y permite aceptar en bloque lo que coincide con seguridad.

## Requirements

### Requirement: A read receipt is compared with a target list

La pantalla de un recibo leído, con líneas y sin adjuntar a una compra, SHALL comparar sus líneas con una lista destino
propia del usuario: la lista a la que el recibo ya se añadió; si no, la lista a la que el usuario añadió su recibo más
reciente; si no, su lista más antigua. La pantalla SHALL presentarla como la lista a la que irán los artículos ("Add to"
con el selector), decir que cada línea se compara con ella y permitir elegir otra de sus listas. MUST NOT usar el texto
"Comparing with" para el selector.

#### Scenario: First receipt of a new user

- **WHEN** un usuario cuya única lista es "Pantry" abre su primer recibo leído
- **THEN** la pantalla muestra "Add to" con "Pantry" elegida y la nota de que cada línea se compara con esa lista

#### Scenario: Last list used

- **WHEN** el usuario tiene "Pantry" y "Office", y su último recibo añadido fue a "Office"
- **THEN** un recibo nuevo propone "Office" como lista destino

#### Scenario: Receipt already added to a list

- **WHEN** el usuario abre un recibo que ya añadió a "Pantry"
- **THEN** el recibo propone "Pantry" aunque su último recibo fuera a otra lista

#### Scenario: Change the target list

- **WHEN** el usuario elige "Office" en el selector de lista destino
- **THEN** los estados de todas las líneas se recalculan frente a "Office"

#### Scenario: Shared lists are not targets

- **WHEN** el usuario colabora en una lista de otra persona
- **THEN** esa lista no aparece en el selector de lista destino ni se elige por defecto

#### Scenario: Deleted list

- **WHEN** la lista del último recibo añadido ya no existe
- **THEN** se aplica la siguiente regla y se propone la lista más antigua del usuario

### Requirement: Each line shows its status against the target list

Cada línea SHALL mostrar su estado frente a la lista destino con badges de motivo propio: "In list" si coincide por nombre
o por vínculo recordado (indicando cuándo es recordado), "New" si no coincide y no tiene nada pendiente, "Confirm match"
si trae una coincidencia propuesta sin decidir y "No price" si el OCR no leyó su precio. Una línea con ambos motivos
pendientes SHALL mostrar los dos badges. MUST NOT mostrarse un badge genérico "Check".

#### Scenario: Match by name

- **WHEN** la línea "Bananas" y la lista tiene el artículo "Bananas"
- **THEN** la línea muestra "In list"

#### Scenario: Remembered match

- **WHEN** la línea "LECHE 2% 4L" coincide con "2% Milk 4L" por un vínculo recordado
- **THEN** la línea muestra "In list" y que la coincidencia se recordó de un recibo anterior

#### Scenario: Line without price

- **WHEN** el OCR leyó la línea "Yogurt" sin precio y la línea coincide con "Yogurt"
- **THEN** la línea muestra "No price" y "In list"

#### Scenario: Similar item

- **WHEN** la línea "ORG BANANAS" no coincide con ningún artículo y la lista tiene "Organic Bananas"
- **THEN** la línea muestra "Confirm match" y la coincidencia propuesta "Organic Bananas"

#### Scenario: Both reasons

- **WHEN** la línea "ORG BANANAS" no tiene precio leído y trae la propuesta "Organic Bananas"
- **THEN** la línea muestra "Confirm match" y "No price"

#### Scenario: New line

- **WHEN** la línea tiene precio, no coincide y no se parece a ningún artículo
- **THEN** la línea muestra "New"

### Requirement: Lines needing attention come first

La pantalla SHALL agrupar las líneas en secciones por estado, en este orden: "Needs a look", "New to <list>" y
"Matched to <list>", cada una con su número de líneas. Dentro de cada sección las líneas SHALL agruparse por categoría,
en el orden de categorías que usan las listas, con su número de líneas y conservando dentro el orden del recibo. Una
sección o categoría vacía MUST NOT mostrarse. "Matched to <list>" SHALL empezar plegada cuando hay alguna otra sección.

#### Scenario: Mixed receipt

- **WHEN** un recibo de diez líneas tiene dos pendientes, tres nuevas y cinco en la lista
- **THEN** la pantalla muestra primero "Needs a look" con 2, después "New to Pantry" con 3 y al final "Matched to Pantry" con 5, plegada

#### Scenario: Categories inside a section

- **WHEN** "New to Pantry" tiene "Apples" y "Pears" de Produce y "Soap" de Household
- **THEN** la sección muestra Produce con 2 y Household con 1, cada una con sus líneas en el orden del recibo

#### Scenario: Everything is in the list

- **WHEN** todas las líneas coinciden y tienen precio
- **THEN** solo se muestra "Matched to Pantry", desplegada, y la pantalla dice que todas coinciden y que nada necesita revisión

### Requirement: Confident matches can be selected in bulk

La sección "Matched to <list>" SHALL ofrecer "Include All N", que incluye todas sus líneas de una vez. Las líneas de
"Needs a look" MUST NOT incluirse con esa acción aunque coincidan. Con todas las líneas coincidentes incluidas, la
sección SHALL mostrar "N included" y "Undo", y "Undo" SHALL quitar solo esas líneas. Nada SHALL aparecer incluido al
abrir el recibo y el usuario SHALL poder quitar cualquier línea antes de añadir.

#### Scenario: Bulk select

- **WHEN** el usuario pulsa "Include All 5" en "Matched to Pantry"
- **THEN** las cinco líneas quedan incluidas, la sección muestra "5 included" y la barra de selección cuenta 5

#### Scenario: Undo the acceptance

- **WHEN** el usuario pulsa "Undo" tras incluir cinco líneas, con otra línea incluida a mano
- **THEN** las cinco líneas dejan de estar incluidas y la línea incluida a mano sigue incluida

#### Scenario: Matched line without price

- **WHEN** una línea coincide con "Yogurt" pero no tiene precio leído
- **THEN** está en "Needs a look" y "Include All" de "Matched to Pantry" no la incluye

#### Scenario: Nothing preselected

- **WHEN** el usuario abre un recibo recién leído
- **THEN** ninguna línea está incluida

### Requirement: Review stays mandatory

Incluir líneas MUST NOT añadirlas a una lista: añadir SHALL seguir requiriendo la acción de añadir de la barra y su
confirmación. El diálogo SHALL proponer la lista destino de la pantalla, que el usuario puede cambiar. Ninguna coincidencia
propuesta SHALL aplicarse sin una elección explícita del usuario, en la pantalla del recibo o en el diálogo.

#### Scenario: Add after bulk select

- **WHEN** el usuario incluye en bloque cinco líneas y pulsa la acción de añadir
- **THEN** el diálogo propone "Pantry" y no se añade nada hasta que el usuario confirma

#### Scenario: Suggestion left untouched

- **WHEN** el usuario añade la línea "ORG BANANAS" con la propuesta "Organic Bananas" sin decidir
- **THEN** la línea se añade como artículo nuevo y "Organic Bananas" no cambia

### Requirement: The comparison degrades to the category view

Si el usuario no tiene listas propias, si la comparación no carga, o mientras carga la primera vez, la pantalla SHALL
mostrar las líneas agrupadas por categoría y seleccionables como antes. Un fallo SHALL explicarse con la opción de
reintentar la lista elegida y MUST NOT impedir incluir ni añadir líneas.

#### Scenario: Comparison fails

- **WHEN** la petición de coincidencias falla
- **THEN** la pantalla muestra las líneas por categoría, un aviso de que no pudo compararlas con la lista y "Try Again"

#### Scenario: Retry after changing the list

- **WHEN** la comparación con "Office", elegida en el selector, falla y el usuario pulsa "Try Again"
- **THEN** la pantalla vuelve a comparar con "Office"

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

### Requirement: Changing the target list shows the comparison in place

Mientras se recalculan los estados tras elegir otra lista destino, la pantalla SHALL mantener el selector con la lista
elegida y mostrar en lugar de las secciones una tarjeta "Comparing with <list>…", que SHALL reemplazarse por las
secciones al terminar. MUST NOT volver a la vista por categorías durante el cambio.

#### Scenario: Switch lists

- **WHEN** el usuario cambia la lista destino de "Pantry" a "Office"
- **THEN** ve "Comparing with Office…" en el lugar de las secciones y después las secciones frente a "Office", sin pasar por la vista por categorías

#### Scenario: Selection survives the switch

- **WHEN** el usuario tenía tres líneas incluidas y cambia de lista destino
- **THEN** las tres líneas siguen incluidas tras la comparación

### Requirement: Proposed matches are decided on the receipt screen

Una línea con coincidencia propuesta SHALL mostrar el artículo propuesto y tres opciones: "Confirm Match" (la vincula a
ese artículo), "Choose Another" (abre el buscador de artículos de la lista destino) y "Add as New" (se añadirá como
artículo nuevo). Decidir MUST NOT cambiar si la línea está incluida. Las decisiones pertenecen a la lista destino y SHALL
descartarse al cambiarla.

#### Scenario: Confirm a proposal

- **WHEN** el usuario pulsa "Confirm Match" en "ORG BANANAS" con la propuesta "Organic Bananas"
- **THEN** la línea muestra que actualizará "Organic Bananas" y su estado de inclusión no cambia

#### Scenario: Choose another item

- **WHEN** el usuario pulsa "Choose Another" en "ORG BANANAS" y elige "Bananas"
- **THEN** la línea muestra que actualizará "Bananas"

#### Scenario: Add as new

- **WHEN** el usuario pulsa "Add as New" en "ORG BANANAS"
- **THEN** la línea muestra que se añadirá como artículo nuevo

#### Scenario: Decisions reset with the list

- **WHEN** el usuario confirmó "Organic Bananas" en "Pantry" y cambia la lista destino a "Office"
- **THEN** la línea se muestra según su comparación con "Office", sin la decisión anterior

### Requirement: Resolved lines move to their outcome section

Una línea cuya coincidencia se decidió SHALL salir de "Needs a look": a "Matched to <list>" si se vinculó a un artículo,
o a "New to <list>" si se añadirá como nueva. Si le queda otro motivo pendiente (precio no leído) SHALL seguir en "Needs a
look" con ese badge y el resultado de su decisión. Los contadores de las secciones SHALL actualizarse en el momento.

#### Scenario: Resolved match leaves Needs a look

- **WHEN** "Needs a look" tiene 2 líneas y el usuario confirma la propuesta de una con precio
- **THEN** "Needs a look" muestra 1 y la línea aparece en "Matched to Pantry", cuyo contador sube en 1

#### Scenario: Resolved as new

- **WHEN** el usuario pulsa "Add as New" en una línea con precio
- **THEN** la línea pasa a "New to Pantry"

#### Scenario: Another reason remains

- **WHEN** el usuario confirma la propuesta de una línea sin precio leído
- **THEN** la línea sigue en "Needs a look" con "No price" y muestra que actualizará el artículo elegido

#### Scenario: Last pending line resolved

- **WHEN** el usuario resuelve la única línea de "Needs a look"
- **THEN** la sección desaparece

### Requirement: Resolved decisions can be changed and undone

Una línea resuelta SHALL mostrar su resultado ("Matches <item>" o "Adds as new item") y "Change", que vuelve a ofrecer
confirmar la propuesta, elegir otro artículo o añadirla como nueva. Cada decisión SHALL anunciarse con un aviso con
"Undo", que restaura la decisión anterior de la línea y su sección.

#### Scenario: Change a decision

- **WHEN** el usuario pulsa "Change" en una línea que confirmó con "Organic Bananas" y elige "Add as New"
- **THEN** la línea muestra "Adds as new item" y pasa a "New to Pantry"

#### Scenario: Undo a decision

- **WHEN** el usuario confirma "Organic Bananas" y pulsa "Undo" en el aviso
- **THEN** la línea vuelve a "Needs a look" con "Confirm match" y los contadores vuelven a sus valores

### Requirement: Including a line is separate from matching it

La casilla de cada línea SHALL significar incluirla en lo que se añade a la lista, y su texto accesible SHALL decirlo
("Include <name>"). Incluir o quitar una línea MUST NOT confirmar ni descartar su coincidencia, y decidir una coincidencia
MUST NOT incluir ni quitar la línea.

#### Scenario: Include a line with a proposal

- **WHEN** el usuario marca la casilla de "ORG BANANAS", que trae la propuesta "Organic Bananas"
- **THEN** la línea queda incluida y sigue mostrando "Confirm match"

#### Scenario: Screen reader label

- **WHEN** un lector de pantalla llega a la casilla de la línea "Bananas"
- **THEN** anuncia "Include Bananas"

### Requirement: The add action says it adds and updates

Con líneas incluidas y la comparación lista, la barra de selección SHALL mostrar cuántas añadirán artículos nuevos y
cuántas actualizarán artículos existentes de la lista destino ("N new · M updated"), según las coincidencias y
decisiones actuales. La acción y el diálogo SHALL decir que los productos nuevos se añaden y los existentes se actualizan
conservando su cantidad habitual.

#### Scenario: Mixed selection

- **WHEN** el usuario incluye dos líneas nuevas, dos que coinciden por nombre y una con la propuesta confirmada
- **THEN** la barra muestra "2 new · 3 updated"

#### Scenario: Without comparison

- **WHEN** la comparación falló y el usuario incluye cuatro líneas
- **THEN** la barra muestra 4 incluidas y su total, sin desglose, y la acción sigue disponible

#### Scenario: Dialog copy

- **WHEN** el usuario abre el diálogo de añadir
- **THEN** el diálogo explica que los productos nuevos se añaden a la lista y los que ya están se actualizan sin cambiar su cantidad
