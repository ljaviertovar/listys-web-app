## RENAMED Requirements

- FROM: `### Requirement: Unmatched lines are added only when the user chooses`
- TO: `### Requirement: Unmatched lines are added by default and can be left out`

## MODIFIED Requirements

### Requirement: Unmatched lines are added by default and can be left out

Cada línea del recibo sin coincidencia con un ítem del viaje y con nombre legible SHALL añadirse por defecto como ítem
nuevo del viaje, comprado y con su precio, y a la lista de la sesión, porque cada viaje enseña a la lista. La revisión
SHALL mostrarla en "New to <list>" y SHALL permitir, con "Change", dejarla fuera, vincularla a un ítem del viaje mediante
un buscador por nombre o volver a añadirla. Dejar una línea fuera MUST NOT guardarla en el viaje ni en la lista. Una línea
cuyo nombre no pudo leerse MUST quedar fuera y no ofrecer forma de añadirla. Una línea vinculada SHALL tratarse como
coincidente y su nombre SHALL recordarse como vínculo del artículo correspondiente en la lista de la sesión. El valor por
defecto lo aplica la revisión al construir la petición: el servidor SHALL seguir añadiendo únicamente las líneas que la
petición nombra.

#### Scenario: Add a line as purchased

- **WHEN** un recibo con "Batteries", sin coincidencia en el viaje, se revisa y el usuario confirma sin tocar la línea
- **THEN** la sesión incluye "Batteries" marcado con su precio, la lista lo aprende como cualquier ítem marcado y la línea
  aparece en "New to <list>" antes de confirmar

#### Scenario: Leave a line out

- **WHEN** el usuario elige "Leave out" para "BAG FEE" desde "Change" y confirma
- **THEN** "BAG FEE" aparece en "Left out" con "Left out by you" y no aparece en la sesión ni en la lista

#### Scenario: Add a line back

- **WHEN** el usuario dejó fuera "BAG FEE" y vuelve a elegir "Add as a new item" en "Change"
- **THEN** la línea regresa a "New to <list>" y se añade al confirmar

#### Scenario: Link a line to a session item

- **WHEN** el usuario vincula "LECHE 2% 4L" al ítem "Milk" de la sesión desde "Change" y confirma
- **THEN** "Milk" recibe el precio de esa línea y el siguiente recibo con "Leche 2% 4L" coincide con "Milk" en esa lista

#### Scenario: Line with an unreadable name

- **WHEN** una línea del recibo no tiene nombre legible
- **THEN** aparece en "Left out" con la etiqueta "No name", sin "Change", y la petición no la añade ni la vincula

#### Scenario: The request carries the default

- **WHEN** el usuario confirma un recibo con "Batteries" (sin coincidencia), "BAG FEE" (dejada fuera) y "Milk" (coincide por nombre)
- **THEN** la petición nombra "Batteries" entre las líneas a añadir y no nombra "BAG FEE" ni "Milk" como líneas a añadir

#### Scenario: Leave out a matched line

- **WHEN** el usuario elige "Leave out" para una línea que coincide con "Milk" y confirma
- **THEN** la línea no marca ni da precio a "Milk", y "Milk" pasa a "Checked, not on the receipt" si estaba marcado o a
  "Not checked, not on the receipt" si no lo estaba

#### Scenario: Cancel keeps nothing

- **WHEN** el usuario cambia decisiones de varias líneas y cierra la revisión sin confirmar
- **THEN** el recibo, la sesión y la lista no cambian y una nueva revisión empieza otra vez con el valor por defecto

### Requirement: The attach review summarises what matches

La revisión de adjuntar SHALL mostrar tres contadores: "Matched" (líneas que coinciden con ítems del viaje, ya marcados o
por marcar, incluidas las vinculadas por el usuario), "New to <list>" (líneas que se añadirán) y "Left out" (líneas que no se
guardarán, incluidas las de nombre ilegible). SHALL listar los ítems marcados del viaje que ninguna línea cubre en "Checked,
not on the receipt", con la nota de que quedan como comprados sin precio, y los no marcados que ninguna línea cubre en "Not
checked, not on the receipt", plegada y con la nota de que siguen sin comprarse. Los contadores y ambas listas SHALL
actualizarse al cambiar la decisión de una línea. Cuando no hay líneas nuevas ni dejadas fuera ni ítems marcados sin línea
y al menos una línea coincide, SHALL decir que todo lo marcado está en el recibo.

#### Scenario: Items without a line

- **WHEN** el viaje tiene "Paper towels" marcado y ninguna línea del recibo lo cubre
- **THEN** aparece en "Checked, not on the receipt"

#### Scenario: Unchecked items without a line

- **WHEN** el viaje tiene "Bread" sin marcar y ninguna línea del recibo lo cubre
- **THEN** aparece en "Not checked, not on the receipt", sección plegada, y no cuenta en ningún contador

#### Scenario: Linked line

- **WHEN** el usuario enlaza una línea con un ítem marcado
- **THEN** ese ítem deja de estar en "Checked, not on the receipt" y "Matched" suma la línea

#### Scenario: Counters follow the decisions

- **WHEN** un recibo con 5 líneas muestra "Matched" 3, "New to <list>" 2 y "Left out" 0, y el usuario deja una nueva fuera
- **THEN** los contadores pasan a 3, 1 y 1

#### Scenario: Everything matches

- **WHEN** todas las líneas coinciden y todos los ítems marcados están en el recibo
- **THEN** la revisión dice que todo lo marcado está en el recibo y que no hay nada que añadir ni corregir

## ADDED Requirements

### Requirement: Each receipt line shows one result and one Change

Cada línea SHALL mostrar nombre, precio, caja de cantidad, una etiqueta opcional, **una** línea de resultado en texto gris
que dice lo que hará adjuntar y un único botón "Change", cuyo nombre accesible termina con el nombre de la línea. La fila
MUST NOT llevar checkbox, botón "Link" ni chip que parezca una acción. El resultado dice "Adds as a new item", "Matches
<item>" más sus cláusulas, "Left out by you" o por qué el nombre no pudo leerse.

#### Scenario: New line

- **WHEN** "Takis Fuego 280g" no coincide con ningún ítem del viaje
- **THEN** su fila muestra el nombre, el precio, la cantidad, "Adds as a new item" y "Change", sin checkbox ni "Link"

#### Scenario: Matched line with a changed quantity

- **WHEN** "Neilson 2% Milk" coincide con "Milk", que tiene cantidad habitual 2, y el recibo trae cantidad 3
- **THEN** su resultado dice "Matches Milk" y "usual quantity 2 → 3"

#### Scenario: Matched line without a price

- **WHEN** una línea coincide con un ítem sin marcar y el recibo no leyó su precio
- **THEN** su fila muestra la etiqueta "No price" y su resultado termina en "checked off without a price"

#### Scenario: Already checked line

- **WHEN** "PC Greek Yogurt" coincide con un ítem que ya estaba marcado y su cantidad no cambia
- **THEN** su resultado dice "Matches" y el nombre del ítem, sin cláusula de cantidad

#### Scenario: Left out line

- **WHEN** el usuario dejó fuera "Bag Fee"
- **THEN** su resultado dice "Left out by you" y conserva "Change"

#### Scenario: Accessible name of Change

- **WHEN** un lector de pantalla recorre la fila de "Lay’s Classic"
- **THEN** el botón se anuncia como "Change" seguido del nombre de la línea

### Requirement: The review groups lines by what attaching will do

La revisión SHALL colocar cada línea en exactamente una sección plegable, en este orden: "New to <list>", "Will be checked
off", "Already checked", "Left out", "Checked, not on the receipt" y "Not checked, not on the receipt". Cada sección SHALL
llevar una línea de ayuda de 12px bajo el título y su número de elementos, y omitirse si está vacía. Solo la última SHALL
abrir plegada. La línea SHALL cambiar de sección al cambiar su decisión.


#### Scenario: Section order

- **WHEN** la revisión tiene líneas nuevas, por marcar, ya marcadas y dejadas fuera, y un ítem marcado sin línea
- **THEN** las secciones aparecen en el orden "New to <list>", "Will be checked off", "Already checked", "Left out",
  "Checked, not on the receipt"

#### Scenario: Empty sections are omitted

- **WHEN** ninguna línea queda fuera
- **THEN** la revisión no muestra la sección "Left out"

#### Scenario: A line moves with its decision

- **WHEN** el usuario deja fuera una línea de "New to <list>"
- **THEN** la línea sale de esa sección, aparece en "Left out" y los contadores se actualizan

#### Scenario: Not checked section starts folded

- **WHEN** el viaje tiene ítems sin marcar que ninguna línea cubre
- **THEN** "Not checked, not on the receipt" aparece plegada con su número de ítems

### Requirement: Change Line decides one line

"Change" SHALL abrir la hoja "Change Line" con tres elecciones excluyentes: "Add as a new item", "Match a trip item" (con
buscador "Search trip items" y los ítems del viaje) y "Leave out", más "Save" y "Cancel". La hoja SHALL abrir con la
decisión actual y aplicarla solo al guardar; MUST NOT enviar nada al servidor hasta que el usuario confirme el adjuntar. Una
elección que el servidor no admite para esa línea SHALL mostrarse deshabilitada con el motivo.


#### Scenario: Open on the current decision

- **WHEN** el usuario abre "Change" en una línea añadida por defecto
- **THEN** la hoja muestra "Add as a new item" elegida

#### Scenario: Match a trip item

- **WHEN** el usuario elige "Match a trip item", busca "milk", elige "Milk" y guarda
- **THEN** la hoja se cierra, la línea pasa a "Will be checked off" o "Already checked" con la etiqueta "Linked by you" y
  su resultado termina en "remembered for next time"

#### Scenario: Save needs an item

- **WHEN** el usuario elige "Match a trip item" sin escoger ningún ítem
- **THEN** "Save" está deshabilitado

#### Scenario: Cancel

- **WHEN** el usuario cambia la elección y pulsa "Cancel"
- **THEN** la decisión de la línea no cambia

#### Scenario: Line that matches by name

- **WHEN** el usuario abre "Change" en una línea que coincide con "Milk" por nombre
- **THEN** "Add as a new item" aparece deshabilitada con el motivo, "Match a trip item" solo ofrece "Milk" y "Leave out" está disponible

#### Scenario: Remembered match replaced

- **WHEN** el usuario vincula una línea recordada a otro ítem del viaje y confirma
- **THEN** la coincidencia recordada pasa al nuevo ítem para esa lista

### Requirement: Tags and results say where a match came from

La revisión SHALL distinguir con etiquetas informativas una coincidencia recordada de un recibo anterior ("Remembered") de
una vinculada por el usuario en esta revisión ("Linked by you"); una coincidencia por nombre exacto MUST NOT llevar etiqueta
de origen. La cláusula "usual quantity <a> → <b>" SHALL comparar la cantidad actual del ítem con la suma de las líneas que
coinciden con él, y MUST omitirse si son iguales o si esas líneas tienen unidades distintas.


#### Scenario: Remembered match

- **WHEN** "2% MILK 4L" coincide con "Milk" por un vínculo recordado en esa lista y el usuario no lo ha cambiado
- **THEN** la fila lleva la etiqueta "Remembered" y su resultado incluye "from an earlier receipt"

#### Scenario: Linked by the user

- **WHEN** el usuario vincula una línea a un ítem en esta revisión
- **THEN** la fila lleva la etiqueta "Linked by you" y no "Remembered"

#### Scenario: Exact name match

- **WHEN** una línea coincide con un ítem por nombre exacto
- **THEN** la fila no lleva etiqueta "Remembered" ni "Linked by you"

#### Scenario: Two lines for one item

- **WHEN** dos líneas de cantidad 1 coinciden con "Milk", que tiene cantidad 4
- **THEN** ambas muestran "usual quantity 4 → 2"

#### Scenario: Mixed units

- **WHEN** dos líneas que coinciden con "Apples" tienen unidades "kg" y "each"
- **THEN** ninguna muestra la cláusula de cantidad
