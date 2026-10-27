# user-stores Specification

## Purpose
Dar a cada usuario un conjunto propio de tiendas normalizadas ("My stores") a las que se asocian sus recibos, de modo
que las distintas formas de escribir una misma tienda se resuelvan a una sola y las fases siguientes puedan aprender
dónde se compra cada artículo.

## Requirements

### Requirement: Stores are private to their owner

Cada tienda SHALL pertenecer a un único usuario. Solo su propietario MUST poder verla, crearla, renombrarla, fusionarla o
asignarla a un recibo; esta regla SHALL aplicarse en el servidor y en las políticas de la base de datos. Un recibo MUST
NOT poder referenciar una tienda de otro usuario. Una tienda ajena o inexistente SHALL tratarse igual (`404`).

#### Scenario: Another user's store

- **WHEN** un usuario lee, renombra, fusiona o asigna a su recibo el identificador de una tienda de otro usuario
- **THEN** recibe `404` y nada cambia

#### Scenario: Listing stores

- **WHEN** un usuario pide sus tiendas
- **THEN** recibe solo las suyas, ordenadas por nombre

### Requirement: Store names resolve to one store per user

Cada tienda SHALL tener un nombre visible de 1 a 100 caracteres y una clave normalizada que ignora mayúsculas, acentos,
espacios, puntuación y números de sucursal. Cada clave, propia o alias, MUST resolver como máximo a una tienda del
usuario. Crear una tienda cuya clave ya pertenece a otra SHALL rechazarse con `409` indicando cuál es.

#### Scenario: Spelling variants

- **WHEN** el usuario tiene la tienda "No Frills" y un recibo trae "NOFRILLS", "no frills #123" o "No Frills 3127"
- **THEN** los tres se resuelven a "No Frills"

#### Scenario: Different stores stay apart

- **WHEN** el usuario tiene "Dollarama" y un recibo trae "Dollar Tree"
- **THEN** "Dollar Tree" no se resuelve a "Dollarama"

#### Scenario: Duplicate creation

- **WHEN** el usuario intenta crear "no-frills" teniendo ya "No Frills"
- **THEN** recibe `409` con el identificador de "No Frills" y no se crea una tienda nueva

#### Scenario: Store limit

- **WHEN** el usuario ya tiene el número máximo de tiendas permitido e intenta crear otra
- **THEN** recibe `409` con un mensaje que indica el límite y que puede fusionar tiendas

### Requirement: Receipt review proposes the matching store

La pantalla de un recibo leído SHALL mostrar su tienda en uno de cuatro estados: confirmada (nombre de la tienda),
coincidente (el nombre crudo resuelve a una tienda y se confirma con un toque), sin coincidencia (el nombre crudo puede
guardarse como tienda nueva) o sin nombre ("Store not recognized"). En todos SHALL poder elegirse otra tienda.

#### Scenario: One-tap confirmation

- **WHEN** un recibo con nombre crudo "NOFRILLS" se abre y el usuario tiene "No Frills"
- **THEN** la pantalla propone "No Frills" y un solo toque en "Confirm" asocia el recibo a esa tienda

#### Scenario: Save as a new store

- **WHEN** un recibo con nombre crudo "Fresh Co #12" no coincide con ninguna tienda y el usuario pulsa "Save as New Store"
- **THEN** se crea la tienda con un nombre editable propuesto a partir del texto crudo y el recibo queda asociado a ella

#### Scenario: Unrecognized store

- **WHEN** un recibo sin nombre crudo se abre
- **THEN** la pantalla muestra "Store not recognized" y permite elegir una tienda existente o crear una escribiendo su nombre

#### Scenario: Older receipt with a typed name

- **WHEN** se abre un recibo subido antes de este cambio con el nombre escrito a mano "Grocery Store"
- **THEN** ese texto se trata como nombre crudo y se propone, confirma o guarda igual que uno extraído

### Requirement: Choosing a store teaches its alias

Al asociar un recibo a una tienda cuyo nombre crudo no resolvía a ella, el nombre crudo SHALL recordarse como alias de
esa tienda, de modo que el siguiente recibo con ese texto se proponga directamente. La última elección explícita del
usuario SHALL prevalecer sobre un alias anterior de otra tienda.

#### Scenario: Learned alias

- **WHEN** el usuario asocia un recibo con nombre crudo "NF Bloor St" a "No Frills" y después sube otro recibo con "NF Bloor St"
- **THEN** el segundo recibo propone "No Frills"

#### Scenario: Correcting an alias

- **WHEN** "SuperC" era alias de "Super Saver" y el usuario asocia un recibo "SuperC" a la tienda "Super C"
- **THEN** los siguientes recibos "SuperC" proponen "Super C" y los recibos ya asociados no cambian

#### Scenario: Another store keeps its own name

- **WHEN** el usuario asocia un recibo con nombre crudo "Metro" a la tienda "Food Basics" teniendo también la tienda "Metro"
- **THEN** el recibo queda en "Food Basics" y los siguientes recibos "Metro" siguen proponiendo la tienda "Metro"

### Requirement: Store confirmation is optional

Confirmar o elegir la tienda MUST NOT ser condición para añadir artículos del recibo a una lista ni para ninguna otra
acción del recibo. Un recibo SHALL poder cambiar de tienda o quedarse sin ella en cualquier momento.

#### Scenario: Adding items without a store

- **WHEN** el usuario añade artículos a una lista desde un recibo sin tienda confirmada
- **THEN** la operación se completa y el recibo sigue sin tienda

#### Scenario: Clearing the store

- **WHEN** el usuario quita la tienda de un recibo
- **THEN** el recibo vuelve a mostrar la propuesta según su nombre crudo y la tienda sigue existiendo

### Requirement: Receipt surfaces show the store name

La pantalla del recibo, la lista de recibos y el dashboard SHALL mostrar como título el nombre de la tienda confirmada;
sin tienda confirmada, el nombre crudo; sin ninguno, "Store not recognized". Renombrar una tienda SHALL reflejarse en
todos sus recibos.

#### Scenario: Confirmed store title

- **WHEN** un recibo con nombre crudo "NOFRILLS #3127" está asociado a "No Frills"
- **THEN** la lista de recibos, su pantalla y el dashboard lo titulan "No Frills"

#### Scenario: Renamed store

- **WHEN** el usuario renombra "No Frills" a "No Frills Bloor"
- **THEN** todos los recibos asociados se titulan "No Frills Bloor"

### Requirement: My Stores screen lists the user's stores

La aplicación SHALL ofrecer una pantalla "My Stores", accesible desde la navegación y desde la pantalla de recibos, que
lista las tiendas del usuario con su número de recibos asociados. Sin tiendas SHALL explicar que se crean al revisar
recibos y ofrecer ir a los recibos.

#### Scenario: Stores with receipts

- **WHEN** el usuario abre "My Stores" con dos tiendas, una con 3 recibos y otra con 1
- **THEN** ve ambas con "3 receipts" y "1 receipt"

#### Scenario: No stores yet

- **WHEN** el usuario sin tiendas abre "My Stores"
- **THEN** ve un estado vacío que explica cómo aparecen las tiendas y un enlace a sus recibos

### Requirement: Renaming a store keeps its previous name as an alias

El usuario SHALL poder renombrar una tienda. El nombre anterior MUST seguir resolviendo a la misma tienda. Un nombre
nuevo cuya clave pertenece a otra tienda SHALL rechazarse con `409` y una sugerencia de fusionar.

#### Scenario: Rename

- **WHEN** el usuario renombra "Grocery Store" a "Metro"
- **THEN** la tienda se llama "Metro" y un recibo nuevo con "Grocery Store" la propone

#### Scenario: Rename onto another store

- **WHEN** el usuario intenta renombrar "NF" a "No Frills" teniendo ya la tienda "No Frills"
- **THEN** recibe un error que ofrece fusionar "NF" en "No Frills" y nada cambia

### Requirement: Merging stores combines them into one

El usuario SHALL poder fusionar una tienda en otra tras una confirmación que diga cuántos recibos se moverán. En una
sola transacción, los recibos, alias, sesiones, estadísticas por artículo y tiendas habituales de la tienda origen SHALL
pasar a la destino, el nombre de la origen SHALL quedar como alias de la destino y la origen SHALL dejar de existir.
Ningún recibo, sesión ni compra registrada MUST perderse ni quedar sin tienda.

#### Scenario: Merge

- **WHEN** el usuario fusiona "NOFRILLS" (2 recibos) en "No Frills" (5 recibos)
- **THEN** queda solo "No Frills" con 7 recibos y un recibo nuevo con "NOFRILLS" la propone

#### Scenario: Merge into itself

- **WHEN** se pide fusionar una tienda en sí misma
- **THEN** se rechaza con un error de validación y nada cambia

#### Scenario: Merge failure

- **WHEN** la fusión falla a mitad de la operación
- **THEN** ninguna tienda, recibo, alias, sesión, estadística ni tienda habitual cambia

#### Scenario: Purchases are combined

- **WHEN** "Milk" tiene 2 compras en "NOFRILLS" y 2 en "No Frills", y el usuario fusiona "NOFRILLS" en "No Frills"
- **THEN** "Milk" tiene 4 compras en "No Frills" con la fecha de compra más reciente y el último precio registrado más reciente de las dos

#### Scenario: Combined purchases reach the threshold

- **WHEN** después de esa fusión "Milk" no tenía tienda habitual y ahora cumple la regla automática con "No Frills"
- **THEN** "Milk" muestra "No Frills" como tienda habitual automática

#### Scenario: Manual tag on the source store

- **WHEN** "Foil" tiene "NOFRILLS" fijada a mano como tienda habitual y el usuario fusiona "NOFRILLS" en "No Frills"
- **THEN** "Foil" queda con "No Frills" fijada a mano

#### Scenario: Sessions of the source store

- **WHEN** una sesión, activa o completada, se inició en "NOFRILLS" y el usuario fusiona "NOFRILLS" en "No Frills"
- **THEN** esa sesión queda registrada en "No Frills"
