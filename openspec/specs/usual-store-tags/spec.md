# usual-store-tags Specification

## Purpose

Mostrar junto a cada artículo de una lista base la tienda donde se suele comprar, aprendida de las compras registradas
y corregible por el usuario, sin que el aprendizaje deshaga nunca una corrección manual.

## Requirements

### Requirement: Automatic usual store follows the statistics

La tienda habitual automática de un artículo SHALL ser, entre las tiendas donde se compró en los 180 días anteriores a su
compra más reciente en cualquier tienda, la que tiene más compras, siempre que tenga al menos 3; ante empate, la de
compra más reciente. Sin ninguna tienda que cumpla, el artículo MUST NOT tener tienda habitual automática.

#### Scenario: Enough evidence

- **WHEN** "Milk" tiene 4 compras en "No Frills" y 1 en "Costco", todas en los últimos 180 días
- **THEN** su tienda habitual automática es "No Frills"

#### Scenario: Not enough evidence

- **WHEN** "Milk" tiene 2 compras en "No Frills" y ninguna en otra tienda
- **THEN** "Milk" no tiene tienda habitual

#### Scenario: Tie

- **WHEN** "Eggs" tiene 3 compras en "No Frills" y 3 en "Costco", y la última fue en "Costco"
- **THEN** su tienda habitual automática es "Costco"

#### Scenario: Old habit

- **WHEN** "Rice" tiene 6 compras en "Costco" con la última hace 300 días, y 3 compras recientes en "No Frills"
- **THEN** su tienda habitual automática es "No Frills"

### Requirement: Automatic tags update when the statistics change

La tienda habitual automática SHALL recalcularse en la misma operación que cambia las estadísticas del artículo: añadir
artículos de un recibo, completar una sesión y fusionar tiendas. Abrir una lista MUST NOT cambiar ninguna etiqueta.

#### Scenario: Third purchase

- **WHEN** "Milk" tiene 2 compras en "No Frills" y el usuario completa una sesión en "No Frills" con "Milk" marcado
- **THEN** al terminar la operación "Milk" muestra "No Frills" como tienda habitual

#### Scenario: Habit changes

- **WHEN** "Milk" tiene tienda habitual automática "No Frills" con 3 compras y acumula 4 compras en "Costco"
- **THEN** su tienda habitual automática pasa a ser "Costco"

### Requirement: The owner can set the usual store manually

El propietario de la lista SHALL poder fijar como tienda habitual de un artículo cualquiera de sus tiendas, tenga o no
estadísticas allí. Una tienda habitual fijada a mano MUST NOT cambiarse por ningún aprendizaje posterior. Una tienda ajena
o inexistente SHALL rechazarse con `404`; un colaborador MUST NOT poder fijarla.

#### Scenario: Correcting an automatic tag

- **WHEN** "Milk" tiene tienda habitual automática "No Frills" y el propietario fija "Costco"
- **THEN** "Milk" muestra "Costco" y sigue mostrándolo después de nuevas compras en "No Frills"

#### Scenario: Tagging an item without data

- **WHEN** el propietario fija "Dollarama" como tienda habitual de "Foil", que nunca se compró con tienda
- **THEN** "Foil" muestra "Dollarama"

#### Scenario: Another user's store

- **WHEN** el propietario intenta fijar el identificador de una tienda de otro usuario
- **THEN** recibe `404` y la tienda habitual del artículo no cambia

#### Scenario: Collaborator

- **WHEN** un colaborador de la lista intenta fijar la tienda habitual de un artículo
- **THEN** la petición se rechaza y la tienda habitual del artículo no cambia

### Requirement: Clearing a manual tag returns the item to automatic

El propietario SHALL poder quitar una tienda habitual fijada a mano. Al quitarla, el artículo MUST volver a la regla
automática en esa misma operación, que puede dejarlo con la tienda que indiquen sus estadísticas o sin tienda.

#### Scenario: Back to automatic with data

- **WHEN** "Milk" tiene "Costco" fijada a mano y 4 compras en "No Frills", y el propietario la quita
- **THEN** "Milk" muestra "No Frills" como tienda habitual automática

#### Scenario: Back to automatic without data

- **WHEN** "Foil" tiene "Dollarama" fijada a mano, sin estadísticas, y el propietario la quita
- **THEN** "Foil" no muestra tienda habitual

### Requirement: Items show their usual store and where else they were bought

En la lista base, cada artículo con tienda habitual SHALL mostrar su nombre. Si se compró además en otras tiendas, SHALL
mostrar "Also at" con hasta dos de ellas por número de compras y cuántas más hay. Un artículo sin tienda habitual ni
estadísticas MUST NOT mostrar etiqueta ni marcador vacío. El texto MUST NOT hablar de puntuaciones, modelos ni certeza.

#### Scenario: Item bought at several stores

- **WHEN** "Milk" tiene tienda habitual "No Frills" y compras en "Costco", "Walmart" y "Metro"
- **THEN** su fila muestra "No Frills" y "Also at Costco, Walmart +1" ordenadas por número de compras

#### Scenario: Bought elsewhere but no usual store yet

- **WHEN** "Eggs" tiene 1 compra en "No Frills" y no tiene tienda habitual
- **THEN** su fila no muestra tienda habitual y muestra "Also at No Frills"

#### Scenario: Item without data

- **WHEN** un artículo no tiene tienda habitual ni estadísticas
- **THEN** su fila no incluye etiqueta de tienda ni espacio reservado

#### Scenario: Narrow phone

- **WHEN** la fila de un artículo con nombre largo, precio promedio, tienda habitual y "Also at" se ve a 320 CSS px
- **THEN** las acciones siguen visibles, no hay desplazamiento horizontal y el texto completo sigue accesible

#### Scenario: Renamed store

- **WHEN** el propietario renombra la tienda "No Frills" a "No Frills Bloor"
- **THEN** los artículos con esa tienda habitual o en "Also at" muestran "No Frills Bloor"

### Requirement: Usual store controls live in the item menu

El menú de cada artículo de la lista base SHALL ofrecer al propietario fijar o cambiar la tienda habitual eligiendo entre
sus tiendas, y quitarla cuando está fijada a mano. El control MUST indicar si la tienda actual es automática o fijada a
mano, y MUST NOT ofrecerse a colaboradores ni mientras la lista se está comprando.

#### Scenario: Owner opens the menu

- **WHEN** el propietario abre el menú de "Milk", que tiene tienda habitual automática "No Frills"
- **THEN** ve la opción de cambiar la tienda habitual y el control indica que "No Frills" es automática

#### Scenario: Manual tag in the menu

- **WHEN** el propietario abre el menú de un artículo con tienda fijada a mano
- **THEN** ve la opción de volver a la tienda automática

#### Scenario: Collaborator opens the menu

- **WHEN** un colaborador abre el menú de un artículo de una lista compartida
- **THEN** no ve opciones de tienda habitual

### Requirement: Setting a usual store can be undone

Fijar la tienda habitual de un artículo SHALL avisar "Usual store set to <tienda>" con "It won’t change on its own." y un
"Undo" que devuelve el artículo a su tienda manual anterior o, si no tenía, a automático.

#### Scenario: Undo
- **WHEN** el usuario fija "Walmart" en un artículo sin tienda y pulsa "Undo"
- **THEN** el artículo vuelve a no tener tienda habitual manual

### Requirement: The usual-store sheet explains how the store is decided

La hoja para fijar la tienda habitual SHALL abrir con el nombre del artículo y decir si la tienda es automática (con cuántas de
sus compras registradas ocurrieron allí), manual ("It stays there until you change it.") o aún no existe (cuántas compras hacen
falta). SHALL mostrar por tienda el último precio y su fecha cuando hay, o el número de compras, o "Not bought there yet", y
SHALL cerrar con que una tienda elegida se queda hasta que el usuario la cambie y que los recibos no la mueven.

#### Scenario: Automatic store
- **WHEN** "Milk" tiene 5 de 7 compras en "No Frills" y la tienda es automática
- **THEN** la hoja dice "Automatic · No Frills" y "Bought there 5 of 7 times"

#### Scenario: Price per store
- **WHEN** el artículo tiene un precio registrado de $1.68 en Walmart el 28 Oct 2026
- **THEN** la fila de Walmart dice "Last $1.68 · 28 Oct 2026"

#### Scenario: Hidden store embeds
- **WHEN** un colaborador no puede leer las tiendas de las estadísticas
- **THEN** `purchase_total` no cuenta esas filas

### Requirement: A list can be narrowed to the items of one store

Una lista con al menos un artículo con tienda habitual SHALL ofrecer "Show items from" con All Stores, cada tienda con su
recuento y "No Usual Store". La elección SHALL guardarse en `?store=`, actualizar el recuento de la pantalla y MUST NOT cambiar
los ítems con los que se empieza un viaje. Un valor sin ítems en esa lista SHALL ignorarse.

#### Scenario: Narrow to a store
- **WHEN** el usuario elige "Walmart"
- **THEN** la pantalla muestra solo los ítems cuya tienda habitual es Walmart y el recuento los cuenta

#### Scenario: Stale link
- **WHEN** la URL trae `?store=` de una tienda sin ítems en la lista
- **THEN** la pantalla muestra todos los ítems
