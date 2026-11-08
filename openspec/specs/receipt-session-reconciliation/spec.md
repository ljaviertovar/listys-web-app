# Receipt Session Reconciliation Specification

## Purpose

Cerrar el ciclo entre el viaje de compra y su recibo: el recibo que termina un viaje se adjunta a esa sesión, la
completa si seguía activa y le aporta total, precios reales y tienda, sin que el mismo viaje enseñe dos veces a la lista.

## Requirements

### Requirement: A read receipt offers to attach to a recent trip

En la pantalla de un recibo leído, sin adjuntar y no añadido a ninguna lista, SHALL ofrecerse adjuntarlo solo al viaje
desde el que se subió, cuando ese viaje sigue siendo candidato: activo, o completado sin un recibo adjunto de la misma tienda
confirmada que este, sin importar cuánto tiempo pasó desde que se completó. La tarjeta SHALL decir "You uploaded this receipt
from a trip" y "Attach it to finish the trip and save its prices.", con "Review <trip>". Un recibo subido fuera de un viaje
MUST NOT ofrecer adjuntarse a ninguno desde su pantalla.

#### Scenario: Active trip

- **WHEN** el viaje de origen del recibo es la sesión activa de "Pantry" y el recibo se lee
- **THEN** la pantalla ofrece adjuntar el recibo a la compra de "Pantry"

#### Scenario: Trip completed after the upload

- **WHEN** el viaje de origen del recibo se completó después de la subida y antes de revisarlo
- **THEN** la pantalla del recibo ofrece adjuntarlo a ese viaje completado

#### Scenario: Trip completed an hour before the upload

- **WHEN** el propietario sube un recibo desde la tarjeta de recibos de un viaje completado hace una hora y el recibo se lee
- **THEN** la pantalla del recibo ofrece adjuntarlo a ese viaje

#### Scenario: Standalone receipt with a recent trip

- **WHEN** el propietario completó un viaje hace una hora y sube un recibo desde la pantalla de recibos
- **THEN** la pantalla del recibo no ofrece adjuntarlo a ningún viaje

#### Scenario: Origin trip already has a receipt from another store

- **WHEN** el recibo, confirmado en "Costco", se subió desde un viaje que ya tiene adjunto un recibo de "No Frills"
- **THEN** la pantalla ofrece adjuntarlo a ese viaje

#### Scenario: Origin trip already has a receipt

- **WHEN** el recibo, confirmado en "No Frills", se subió desde un viaje que ya tiene adjunto un recibo de "No Frills"
- **THEN** la pantalla no ofrece adjuntarlo y dice que el viaje ya tiene un recibo de "No Frills"

#### Scenario: Old trip

- **WHEN** el recibo se subió desde un viaje completado tres días antes y sin recibo
- **THEN** la pantalla ofrece adjuntarlo a ese viaje

#### Scenario: Origin trip deleted

- **WHEN** el propietario eliminó el viaje desde el que subió el recibo
- **THEN** la pantalla no ofrece adjuntarlo y el recibo se revisa como uno independiente

#### Scenario: Receipt already added to a list

- **WHEN** el propietario abre un recibo cuyas líneas ya añadió a una lista
- **THEN** la pantalla no ofrece adjuntarlo

#### Scenario: Receipt not read yet

- **WHEN** el recibo está pendiente de lectura o su lectura falló
- **THEN** la pantalla no ofrece adjuntarlo

### Requirement: Attaching is reviewed line by line before it is applied

Antes de confirmar, la revisión SHALL mostrar cada línea del recibo como coincidente con un ítem ya marcado, coincidente
con un ítem sin marcar que se marcará comprado, o sin coincidencia. También SHALL mostrar el total que se guardará y la
tienda resultante. Nada MUST cambiar hasta que el usuario confirme: cancelar deja el viaje sin cambios y el recibo sin
vincular y disponible para revisarlo después.

#### Scenario: Mixed receipt

- **WHEN** un recibo con "Milk", "Eggs" y "Batteries" se revisa contra una sesión con "Milk" marcado y "Eggs" sin marcar
- **THEN** "Milk" aparece como ya marcado, "Eggs" como que se marcará comprado y "Batteries" como sin coincidencia

#### Scenario: Remembered match

- **WHEN** una línea "2% MILK 4L" coincide con el ítem "Milk" de la sesión por un vínculo recordado en esa lista
- **THEN** la revisión la muestra como coincidente con "Milk", identificada como recordada y modificable

#### Scenario: Cancel

- **WHEN** el usuario cierra la revisión sin confirmar
- **THEN** el recibo, la sesión y la lista no cambian, el recibo no queda vinculado al viaje y el viaje sigue mostrando "No receipt"

#### Scenario: Cancel a receipt uploaded from the trip

- **WHEN** el usuario cancela la revisión de un recibo que acaba de subir desde el viaje
- **THEN** el viaje sigue ofreciendo "Review Receipt" para ese recibo y el recibo sigue disponible para elegirlo

#### Scenario: Preview cannot load

- **WHEN** falla la carga de las coincidencias
- **THEN** la revisión explica que no pudo comprobar la sesión, ofrece reintentar y no adjunta nada

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

### Requirement: Attaching to an active session completes it

Confirmar con una sesión activa SHALL completarla en la misma operación: quedan comprados los ítems ya marcados, los que
coinciden con líneas del recibo y las líneas añadidas, y la lista aprende como en cualquier finalización. Los ítems sin
marcar que el recibo no menciona MUST quedar sin comprar. La confirmación MUST decir que la compra se completará.

#### Scenario: Receipt finishes the trip

- **WHEN** el usuario adjunta un recibo con "Milk" y "Eggs" a una sesión activa con "Milk" marcado, "Eggs" y "Bread" sin marcar
- **THEN** la sesión queda completada con "Milk" y "Eggs" comprados, "Bread" sin comprar, y cada uno suma una sola compra en la lista

#### Scenario: Confirmation copy

- **WHEN** el usuario va a confirmar contra una sesión activa
- **THEN** el texto indica que la compra se completará y que los ítems del recibo se marcarán comprados

### Requirement: Receipt prices and total fill the session without counting twice

Cada recibo adjunto SHALL aportar a cada ítem coincidente su precio pagado (suma de sus líneas) y SHALL guardar su propio
total pagado: el total impreso leído o el que el usuario escriba en la revisión. El total pagado del viaje SHALL ser la suma
de los totales pagados de sus recibos adjuntos. Si la sesión ya estaba completada, los artículos que ya contó MUST NOT sumar
otra compra; solo reciben el precio. Las líneas añadidas SHALL contar como una compra nueva. Un ítem que coincide con
líneas de dos recibos del viaje SHALL quedar con la suma de esas líneas como precio pagado y una sola compra.

#### Scenario: Recently completed trip

- **WHEN** el usuario adjunta un recibo con "Milk" a 5.49 a una sesión completada en la que "Milk" ya sumó su compra
- **THEN** "Milk" no suma otra compra, la sesión muestra 5.49 para "Milk" y el precio promedio de "Milk" incorpora 5.49 una sola vez

#### Scenario: Two lines for one item

- **WHEN** el recibo trae dos líneas de "Milk" a 5.49 que coinciden con el mismo ítem
- **THEN** el ítem queda con 10.98 pagados y una sola compra

#### Scenario: Total read from the receipt

- **WHEN** el recibo tiene un total impreso leído de 84.12, el usuario no lo cambia y es el único recibo del viaje
- **THEN** el viaje queda con un total pagado de 84.12

#### Scenario: Corrected total

- **WHEN** el usuario cambia en la revisión el total leído a 82.50
- **THEN** ese recibo aporta 82.50 al total pagado del viaje y el total leído del recibo no cambia

#### Scenario: Second receipt adds to the paid total

- **WHEN** un viaje con un recibo de "No Frills" de 86.40 recibe un recibo de "Costco" de 41.12
- **THEN** el viaje queda con un total pagado de 127.52

#### Scenario: No total read

- **WHEN** el recibo no tiene total leído y el usuario no escribe ninguno
- **THEN** ese recibo no aporta total; el viaje suma los totales de sus otros recibos o, si no tiene otro, conserva el total
  que tuviera, sin sustituirlo por la suma de las líneas

### Requirement: The receipt's store reconciles with the session's store

Si la sesión no tenía tienda y el recibo tiene una confirmada, la sesión SHALL tomarla como su tienda. Si la sesión ya tenía
tienda, SHALL conservarla y la del recibo SHALL sumarse a las tiendas del viaje; una tienda distinta MUST NOT rechazar el
adjuntar. Cada ítem SHALL tomar la tienda del recibo en el que aparece su línea. Si el recibo no tiene tienda y la sesión sí, el
recibo SHALL quedar con la de la sesión solo cuando el viaje no tiene ya un recibo de esa tienda; si lo tiene, el recibo SHALL
quedar sin tienda.

#### Scenario: Whole-list trip and a receipt from No Frills

- **WHEN** el usuario adjunta un recibo confirmado en "No Frills" a una sesión sin tienda
- **THEN** la sesión queda registrada en "No Frills"

#### Scenario: Active trip at the wrong store

- **WHEN** una sesión activa se inició en "Costco" y el usuario adjunta un recibo confirmado en "Metro"
- **THEN** la sesión se completa con "Costco" como su tienda y "Metro" entre las tiendas del viaje, y los ítems de ese recibo
  quedan en "Metro"

#### Scenario: Completed trip at another store

- **WHEN** una sesión completada en "Costco" recibe un recibo confirmado en "Metro"
- **THEN** el recibo se adjunta, el viaje muestra "Costco" y "Metro" y los ítems de ese recibo quedan en "Metro"

#### Scenario: Receipt without a store

- **WHEN** el usuario adjunta un recibo sin tienda a una sesión iniciada en "No Frills" que aún no tiene recibo
- **THEN** el recibo queda en "No Frills", y el nombre leído del recibo no se aprende como alias de esa tienda

#### Scenario: Receipt without a store on a trip that has one from its store

- **WHEN** el usuario adjunta un recibo sin tienda a una sesión de "No Frills" que ya tiene un recibo de "No Frills"
- **THEN** el recibo se adjunta sin tienda y no aporta estadísticas por tienda

### Requirement: A receipt belongs to one trip and a trip has one receipt per store

Un recibo SHALL adjuntarse a lo sumo a una sesión. Una sesión SHALL poder tener varios recibos, como mucho uno por tienda
confirmada; los recibos sin tienda no cuentan para ese límite. La base de datos SHALL garantizar ambas reglas. Reenviar la
misma petición MUST responder con éxito sin ningún efecto nuevo. Adjuntar a una sesión un segundo recibo de una tienda que ya
tiene MUST rechazarse con un conflicto sin cambios. Adjuntar a otra sesión un recibo ya adjunto MUST rechazarse con un
conflicto sin cambios.

#### Scenario: Repeated request

- **WHEN** se envía dos veces, de forma secuencial o simultánea, la misma petición de adjuntar
- **THEN** la sesión, la lista y las estadísticas cambian una sola vez y ambas respuestas son correctas

#### Scenario: Receipt attached elsewhere

- **WHEN** se pide adjuntar a "Office" un recibo ya adjunto a la sesión de "Pantry"
- **THEN** la respuesta es un conflicto y el recibo sigue adjunto a "Pantry"

#### Scenario: Second store

- **WHEN** se pide adjuntar un recibo de "Costco" a una sesión que ya tiene uno de "No Frills"
- **THEN** el recibo se adjunta y la sesión tiene dos recibos

#### Scenario: Session already has a receipt

- **WHEN** se pide adjuntar un segundo recibo de "No Frills" a una sesión que ya tiene uno de "No Frills"
- **THEN** la respuesta es un conflicto y nada cambia

### Requirement: Attaching is atomic and limited to the owner

Adjuntar SHALL ejecutarse en una sola transacción: recibo, sesión, ítems, lista, vínculos y estadísticas cambian todos o
ninguno. Solo el propietario del recibo y de la sesión SHALL poder adjuntar; recibos o sesiones ajenos MUST rechazarse sin
revelar si existen. La antigüedad de una sesión completada MUST NOT impedir adjuntarle un recibo.

#### Scenario: Failure while reconciling

- **WHEN** falla un paso de la reconciliación con una sesión activa
- **THEN** la sesión sigue activa, el recibo sigue sin adjuntar y ni la lista ni las estadísticas cambian

#### Scenario: Another user's session

- **WHEN** una petición intenta adjuntar un recibo propio a la sesión de otro usuario
- **THEN** recibe `404` y nada cambia

#### Scenario: Collaborator

- **WHEN** un colaborador de una lista compartida intenta adjuntar un recibo a la sesión de esa lista
- **THEN** la petición se rechaza con `404` y nada cambia

#### Scenario: Session outside the window

- **WHEN** una petición adjunta un recibo a una sesión completada más de 48 horas (una semana) antes de subirlo
- **THEN** el recibo se adjunta y la sesión recibe sus precios y total sin sumar otra compra

### Requirement: An attached receipt is not added to a list again

Las líneas de un recibo adjunto ya llegan a la lista a través de la sesión, así que añadirlo a una lista o crear una
lista con él MUST rechazarse con un conflicto. Un recibo cuyas líneas ya se añadieron a una lista MUST NOT poder
adjuntarse.

#### Scenario: Add an attached receipt to a list

- **WHEN** se pide añadir a una lista las líneas de un recibo adjunto
- **THEN** la respuesta es un conflicto y la lista no cambia

#### Scenario: Attach a receipt already added

- **WHEN** se pide adjuntar un recibo cuyas líneas ya se añadieron a "Pantry"
- **THEN** la respuesta es un conflicto y nada cambia

### Requirement: Receipt and session show their link

Un recibo adjunto SHALL mostrar a qué compra pertenece con un enlace a ella, en lugar de ofrecer añadirlo a una lista.
Una sesión con recibos SHALL mostrar su total como pagado según la suma de sus recibos, la lista de sus recibos con su tienda,
número de ítems, total y un enlace a cada uno, y "Trips" SHALL indicar qué viajes tienen recibos. Si un recibo se elimina,
la sesión SHALL conservar los precios que ese recibo dio a sus ítems, dejar de listarlo y recalcular su total pagado con los
recibos que quedan; sin ninguno, SHALL conservar el último total y volver a mostrar "No receipt".

#### Scenario: Attached receipt screen

- **WHEN** el propietario abre un recibo adjunto a la compra de "Pantry"
- **THEN** ve "Attached to" la compra de "Pantry" con un enlace y no ve las acciones de añadir a una lista

#### Scenario: Session with a receipt

- **WHEN** el propietario abre una sesión completada con un recibo de "No Frills" y otro de "Costco"
- **THEN** ve el total pagado como la suma de ambos, cada recibo con su tienda, ítems, total y "View Receipt", y el precio
  de cada ítem con precio

#### Scenario: Deleted receipt of two

- **WHEN** el propietario elimina el recibo de "Costco" de un viaje que también tiene uno de "No Frills"
- **THEN** el viaje conserva los precios de sus ítems, deja de listar "Costco" y su total pagado pasa a ser el del recibo de
  "No Frills"

#### Scenario: Deleted receipt

- **WHEN** el propietario elimina el único recibo adjunto
- **THEN** la sesión conserva su total y precios, deja de mostrar el enlace al recibo y vuelve a mostrar "No receipt"

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

### Requirement: A receipt added to a list explains why it has no trip

Un recibo leído subido desde un viaje que ya se añadió a una lista SHALL decir que por eso no puede adjuntarse también a
ese viaje, en lugar de omitir la tarjeta de viaje sin explicación. Un recibo subido fuera de un viaje MUST NOT mostrar esa
explicación.

#### Scenario: Receipt already in a list

- **WHEN** el usuario abre un recibo subido desde un viaje cuyos ítems se añadieron a una lista
- **THEN** ve "The items of this receipt were added to a list, so it can’t also be attached to a trip."

#### Scenario: Standalone receipt already in a list

- **WHEN** el usuario abre un recibo subido desde la pantalla de recibos cuyos ítems se añadieron a una lista
- **THEN** no ve ninguna nota sobre viajes

### Requirement: Attaching is limited to the receipt's origin trip

Adjuntar un recibo SHALL aceptarse con el viaje desde el que se subió o, si el recibo no tiene viaje de origen, con el viaje que indica el propietario. Cualquier otra petición que intenta adjuntar a otra sesión un
recibo subido desde un viaje MUST rechazarse con un conflicto sin cambios.

#### Scenario: Another own session

- **WHEN** una petición intenta adjuntar a la sesión de "Office" un recibo subido desde la sesión de "Pantry" que no está adjunto
- **THEN** la respuesta es un conflicto y nada cambia

#### Scenario: Standalone receipt

- **WHEN** el propietario adjunta al viaje de "Pantry" un recibo subido desde la pantalla de recibos (el cliente ya no lo ofrece desde el viaje)
- **THEN** el recibo queda adjunto al viaje de "Pantry"

### Requirement: The purchased quantity replaces the usual quantity

Al adjuntar, cada ítem del viaje que coincide con líneas del recibo SHALL tomar como cantidad la comprada (la suma de esas
líneas, 1 por línea sin cantidad leída), y el artículo de la lista SHALL quedar con esa cantidad en lugar de la habitual.
MUST NOT sumarse a la cantidad anterior. Con unidades distintas entre esas líneas, ítem y artículo MUST conservar su
cantidad y unidad.

#### Scenario: Bought more than usual

- **WHEN** "Milk" tiene cantidad habitual 2 y el recibo adjunto trae "Milk" con cantidad 3
- **THEN** el ítem del viaje y "Milk" en la lista quedan con cantidad 3, no 5

#### Scenario: Bought less than usual

- **WHEN** "Eggs" tiene cantidad habitual 2 y el recibo trae "Eggs" con cantidad 1
- **THEN** "Eggs" queda con cantidad 1 en el viaje y en la lista

#### Scenario: Two lines for one item

- **WHEN** el recibo trae dos líneas "Milk" de cantidad 1 que coinciden con el mismo ítem y "Milk" tenía cantidad 4
- **THEN** "Milk" queda con cantidad 2

#### Scenario: Active trip completed by the receipt

- **WHEN** el usuario adjunta a una sesión activa un recibo con "Bread" de cantidad 2 y "Bread" se planificó con cantidad 1
- **THEN** la sesión se completa y "Bread" queda con cantidad 2 en el viaje y en la lista

#### Scenario: Checked item not on the receipt

- **WHEN** "Paper towels" estaba marcado en el viaje y ninguna línea lo cubre
- **THEN** su cantidad en el viaje y en la lista no cambia por el recibo

#### Scenario: Mixed units

- **WHEN** dos líneas que coinciden con "Apples" tienen unidades "kg" y "each"
- **THEN** "Apples" conserva su cantidad y unidad en el viaje y en la lista

#### Scenario: Receipt added to a list without a trip

- **WHEN** el usuario añade a una lista un recibo independiente con "Milk" de cantidad 3 y "Milk" tiene cantidad 2
- **THEN** "Milk" sigue con cantidad 2, como hasta ahora

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

### Requirement: A failed attach changes nothing and says so

Si adjuntar falla, la revisión SHALL mostrar la tarjeta roja de estado con "Couldn’t attach the receipt", "Nothing was
changed. Try again in a moment.", "Try Again" (reintenta la misma petición) y "Attach Later" (cierra la revisión). MUST
NOT quedar ningún cambio parcial ni enviarse dos veces la petición.

#### Scenario: Network failure

- **WHEN** el envío de la revisión falla por la red
- **THEN** la revisión muestra "Couldn’t attach the receipt" con "Try Again" y "Attach Later", y el viaje, el recibo y la
  lista no cambian

#### Scenario: Attach later

- **WHEN** el usuario pulsa "Attach Later"
- **THEN** la revisión se cierra y la tarjeta de recibo del viaje vuelve a ofrecer "Review Receipt"

### Requirement: Items on another receipt of the trip are not reported as missing

La revisión SHALL excluir de las secciones de ausentes los ítems cubiertos por otro recibo del viaje, usando únicamente destinos persistidos y autorizados.

#### Scenario: Complete contract for items on another receipt of the trip are not reported as missing

- **WHEN** se presenta este flujo al usuario
- **THEN** Al revisar un recibo de un viaje que ya tiene otro, los ítems cubiertos por líneas de otro recibo MUST NOT aparecer en
  "Checked, not on the receipt" ni en "Not checked, not on the receipt", y una línea que coincide con uno de esos ítems SHALL
  tratarse como "Already checked" y sumar su precio al del ítem.
    La operación de adjuntar SHALL conservar el destino efectivo de cada línea en `ticket_items.shopping_session_item_id`,
  incluidos los ítems nuevos. Las líneas dejadas fuera SHALL conservar `NULL`. Solo la operación autorizada SHALL escribir
  ese vínculo, que MUST apuntar a un ítem del mismo viaje y propietario. Las líneas históricas MUST permanecer sin vínculo:
  no se reconstruyen decisiones pasadas ni se supone cobertura a partir del nombre.

#### Scenario: Item on the first receipt

- **WHEN** "Milk" se cubrió con el recibo de "No Frills" y se revisa el recibo de "Costco", que no trae "Milk"
- **THEN** "Milk" no aparece en "Checked, not on the receipt"

#### Scenario: Same item on both receipts

- **WHEN** "Eggs" se cubrió con el recibo de "No Frills" a 4.49 y el recibo de "Costco" trae "Eggs" a 3.99
- **THEN** la línea de "Costco" aparece en "Already checked" y, al adjuntar, "Eggs" queda con 8.48 pagados y una sola compra

#### Scenario: Everything matches

- **WHEN** todas las líneas del recibo coinciden y todos los ítems marcados tienen línea en algún recibo del viaje
- **THEN** la revisión dice "Everything you checked is on the receipt" y "Nothing to add or fix."

### Requirement: Reviewing a receipt on an active trip keeps it shopping

La revisión de un recibo en un viaje activo SHALL permitir adjuntar sin completar o adjuntar y completar, con confirmación explícita y compatibilidad con peticiones existentes.

#### Scenario: Complete contract for reviewing a receipt on an active trip keeps it shopping

- **WHEN** se presenta este flujo al usuario
- **THEN** Revisar un recibo de un viaje en curso SHALL abrir la hoja "Review receipt" con el texto "Each receipt line updates this trip
  and your <lista> list. Nothing changes until you attach.", la tienda del recibo, un aviso azul de información "The trip is still
  shopping" con "Only the items on this receipt are checked off. The other <N> items stay on the list for your next store.", los
  tres contadores y las secciones de la revisión del viaje, "Total paid" leído del recibo y dos acciones: "Attach Receipt"
  (primaria), que adjunta el recibo y deja el viaje en "Shopping", y "Attach and Complete Trip" (secundaria), que lo adjunta y
  completa el viaje. Solo los ítems que tienen línea en el recibo SHALL marcarse; el resto MUST quedar sin marcar en la lista.
  Cerrar la hoja sin adjuntar MUST NOT cambiar nada.
    La petición de adjuntar SHALL aceptar `complete_session` como booleano opcional. Omitirlo SHALL equivaler a `true`,
  conservando la compatibilidad con las peticiones existentes. `Attach Receipt` SHALL enviar `false`; `Attach and Complete
  Trip` SHALL enviar `true`. La RPC SHALL ejecutar adjuntar y, cuando corresponda, completar en una sola transacción.
  Un replay de un recibo ya adjunto MUST NOT completar posteriormente el viaje ni repetir sus efectos; para completar
  después de adjuntar sin completar se usa la operación existente de completar el viaje.

#### Scenario: Existing client omits the completion flag

- **WHEN** una petición válida adjunta un recibo a un viaje activo sin incluir `complete_session`
- **THEN** adjunta y completa el viaje como antes

#### Scenario: Attach without completing then complete later

- **WHEN** el propietario adjunta con `complete_session: false` y después completa el viaje
- **THEN** adjuntar deja el viaje activo y completar registra las compras una sola vez

#### Scenario: Replay cannot change the completion choice

- **WHEN** se reenvía un recibo ya adjunto con un valor distinto de `complete_session`
- **THEN** responde como replay sin completar el viaje ni repetir cambios

#### Scenario: Attach and keep shopping

- **WHEN** el propietario revisa el recibo de "No Frills" de una compra en curso con 4 ítems, 2 de ellos en el recibo, y pulsa
  "Attach Receipt"
- **THEN** esos 2 ítems quedan marcados con el precio del recibo, los otros 2 siguen sin marcar y el viaje sigue en "Shopping"

#### Scenario: Attach and complete

- **WHEN** el propietario pulsa "Attach and Complete Trip"
- **THEN** el recibo queda adjunto y el viaje se completa

#### Scenario: Info alert

- **WHEN** se abre la hoja de una compra en curso con 2 ítems fuera del recibo
- **THEN** ve el aviso azul "The trip is still shopping" y "The other 2 items stay on the list for your next store."

#### Scenario: Close without attaching

- **WHEN** el propietario cierra la hoja sin pulsar ninguna acción
- **THEN** el recibo, la lista y el viaje no cambian y el recibo queda en la tarjeta de recibos con "Pending attachment"

### Requirement: Permanent store conflicts explain how to recover

El conflicto 409 SESSION_HAS_STORE_RECEIPT SHALL mostrar "This trip already has a receipt from this store.", indicar que
nada cambió y ofrecer View Trip Receipts y Close Review. MUST NOT ofrecer Retry para ese conflicto. Los errores transitorios
SHALL conservar Try Again y Attach Later, con el mismo payload y una sola petición por intento.

#### Scenario: Another receipt from the same store

- **WHEN** el viaje ya tiene un recibo confirmado de esa tienda
- **THEN** se explica el conflicto sin sugerir reintentos ni modificar el total o los artículos

#### Scenario: Search belongs to the match choice

- **WHEN** se elige Match a trip item en Change Line
- **THEN** su buscador y resultados aparecen antes de Leave out, con el estado de cada ítem a la derecha; cancelar conserva la decisión y devuelve el foco a Change
