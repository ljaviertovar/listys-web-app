## MODIFIED Requirements

### Requirement: Lines needing attention come first

La pantalla SHALL agrupar las líneas en secciones por estado, en este orden: "Needs a look", "New to <list>" y
"Matched to <list>", cada una con su número de líneas y conservando dentro el orden del recibo. Una sección vacía MUST NOT
mostrarse. La sección "Matched to <list>" SHALL empezar plegada cuando hay alguna otra sección.

#### Scenario: Mixed receipt

- **WHEN** un recibo de diez líneas tiene dos dudosas, tres nuevas y cinco en la lista
- **THEN** la pantalla muestra primero "Needs a look" con 2, después "New to Pantry" con 3 y al final "Matched to Pantry" con 5, plegada

#### Scenario: Everything is in the list

- **WHEN** todas las líneas coinciden y tienen precio
- **THEN** solo se muestra "Matched to Pantry", desplegada, y la pantalla dice que todas coinciden y que nada necesita revisión

### Requirement: Confident matches can be selected in bulk

La sección "Matched to <list>" SHALL ofrecer "Accept All N", que acepta todas sus líneas de una vez; aceptar una línea es
seleccionarla. Las líneas dudosas MUST NOT aceptarse con esa acción aunque coincidan. Con todas las líneas coincidentes
aceptadas, la sección SHALL mostrar "N accepted" y "Undo", y "Undo" SHALL deseleccionar solo esas líneas. Nada SHALL
aparecer aceptado o seleccionado al abrir el recibo y el usuario SHALL poder deseleccionar cualquier línea antes de añadir.

#### Scenario: Bulk select

- **WHEN** el usuario pulsa "Accept All 5" en "Matched to Pantry"
- **THEN** las cinco líneas quedan seleccionadas, la sección muestra "5 accepted" y la barra de selección muestra 5

#### Scenario: Undo the acceptance

- **WHEN** el usuario pulsa "Undo" tras aceptar cinco líneas, con otra línea seleccionada a mano
- **THEN** las cinco líneas dejan de estar seleccionadas y la línea elegida a mano sigue seleccionada

#### Scenario: Matched line without price

- **WHEN** una línea coincide con "Yogurt" pero no tiene precio leído
- **THEN** está en "Needs a look" y "Accept All" de "Matched to Pantry" no la selecciona

#### Scenario: Nothing preselected

- **WHEN** el usuario abre un recibo recién leído
- **THEN** ninguna línea está seleccionada ni aceptada
