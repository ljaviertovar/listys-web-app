# Item Price Memory Specification

## Purpose

Hacer visible la memoria de precios que la lista ya acumula: cuánto suele pagarse por cada ítem y cuánto costaría aproximadamente un viaje, usando solo datos registrados y diciendo claramente qué es una estimación.

## Requirements

### Requirement: Base list items show their average price

Cada ítem de una lista base con `average_price` mayor que cero SHALL mostrar ese importe como precio promedio, en la moneda y el formato de importes existentes, de modo que se distinga de un precio pagado. Un ítem sin `average_price` o con valor cero MUST NOT mostrar ningún importe ni un marcador de cero.

#### Scenario: Item with price memory

- **WHEN** la lista muestra un ítem con `average_price` 3.49
- **THEN** su fila muestra "$3.49" con una etiqueta que indica que es un promedio
- **AND** la fila sigue mostrando nombre, cantidad y nota sin truncar las acciones

#### Scenario: Item without price memory

- **WHEN** la lista muestra un ítem sin `average_price`
- **THEN** su fila no incluye importe, espacio reservado vacío ni "$0.00"

#### Scenario: Narrow phone

- **WHEN** la fila de un ítem con nombre largo y precio se ve a 320 CSS px
- **THEN** el precio y las acciones permanecen visibles y el nombre completo sigue accesible

### Requirement: A session shows an estimated total until receipts say what was paid

Una sesión activa SHALL mostrar `Estimated total` como suma de los precios promedio conocidos de sus ítems marcados, con cobertura de esos ítems. Cada fila con precio conocido SHALL conservarlo aunque no esté marcada. El estimado MUST NOT presentarse como pagado ni modificar la estimación de la lista base o de Start Shopping. Se conservan las reglas de precio por línea, sin multiplicar por cantidad.

Una sesión completada sin recibos SHALL conservar la estimación de sus ítems comprados; con recibos SHALL mostrar el pagado y, aparte, "Estimate was <estimado>" cuando hay precios conocidos, sin sustituir el importe real.

#### Scenario: Partial price coverage

- **WHEN** hay 12 ítems, 4 marcados y solo 3 de los marcados tienen precio conocido: 3.50, 4.25 y 2.00
- **THEN** `Estimated total` muestra aproximadamente 9.75 y cobertura de 3 de 4 ítems marcados
- **AND** los precios de los 8 ítems sin marcar no contribuyen aunque sean conocidos

#### Scenario: No price data

- **WHEN** ningún ítem del trip tiene precio promedio conocido
- **THEN** no se muestra importe ni línea de estimación y el progreso sigue disponible

#### Scenario: Item added during the trip

- **WHEN** se añade un ítem sin marcar cuyo nombre normalizado coincide con uno de la lista base con precio promedio
- **THEN** su fila muestra el precio y el acumulado no aumenta hasta marcarlo

#### Scenario: Check and uncheck an item

- **WHEN** el acumulado es 3.50 y se marca otro ítem con precio promedio 4.25
- **THEN** pasa a 7.75 y al desmarcar ese ítem vuelve a 3.50
- **AND** el resultado se conserva al volver a abrir el trip

#### Scenario: No items checked yet

- **WHEN** el trip contiene precios conocidos y ningún ítem está marcado
- **THEN** `Estimated total` muestra aproximadamente 0.00 con cobertura de 0 de 0 ítems marcados

#### Scenario: Only unpriced items are checked

- **WHEN** hay precios conocidos en el trip pero sus 2 ítems marcados no tienen precio conocido
- **THEN** el acumulado muestra aproximadamente 0.00 con cobertura de 0 de 2 ítems marcados, sin atribuirles un precio cero

#### Scenario: Base list estimate stays independent

- **WHEN** la lista base y Start Shopping estiman 20.00 y se marca o desmarca un ítem de su trip activo
- **THEN** el estimado de la lista base y Start Shopping sigue en 20.00 si no cambian sus datos de precios
- **AND** abrir el trip y mostrar el acumulado no escribe precios ni totales

#### Scenario: Unchecked rows retain their price

- **WHEN** un ítem sin marcar tiene precio promedio conocido de 4.25
- **THEN** su fila conserva el precio promedio aunque no aporte al acumulado

#### Scenario: Completed session

- **WHEN** se abre una sesión completada sin recibos con 10 ítems comprados, 9 con precio conocido, y un estimado de 62.40
- **THEN** muestra la tarjeta "Estimated" con "≈ $62.40" y "10 items · 9 with known prices"

#### Scenario: Completed session with receipts

- **WHEN** se abre una sesión completada con recibos por 127.52 y un estimado de 119.80
- **THEN** muestra "Paid $127.52" y "Estimate was $119.80", sin presentar el estimado como pagado

#### Scenario: Estimate hierarchy and header

- **WHEN** se abre un viaje completado sin recibos y con precios conocidos
- **THEN** Estimated y el importe aproximado aparecen a la izquierda y la cobertura a la derecha; el importe de cabecera también lleva ≈

#### Scenario: Active trip with receipts

- **WHEN** un trip activo tiene ítems marcados estimados en 7.75 y recibos adjuntos por 9.00
- **THEN** muestra `Estimated total` aproximadamente 7.75 y `Paid so far` 9.00 como importes distintos, sin sumarlos entre sí

### Requirement: Price display uses recorded data only

La visualización SHALL derivarse solo de precios ya almacenados (`average_price` y los últimos precios por tienda registrados desde recibos) y MUST NOT inferir, copiar ni escribir precios en ítems de sesión, listas o recibos al mostrarlos. Mostrar precios SHALL NOT alterar cálculos, moneda ni datos persistidos.

#### Scenario: Viewing does not write

- **WHEN** el usuario abre una lista o una sesión con precios
- **THEN** no se crea ni modifica ningún dato de precio

#### Scenario: Collaborator view

- **WHEN** un colaborador abre la sesión compartida de una lista con precios
- **THEN** ve la misma estimación que el propietario sin acceder a datos de otras listas

#### Scenario: Prices by store

- **WHEN** el propietario consulta los precios por tienda de un artículo
- **THEN** solo ve últimos precios registrados desde recibos, con su fecha, y la consulta no escribe nada

### Requirement: A receipt attached to a trip updates the average price once

Al adjuntar un recibo a una sesión, el precio pagado de cada artículo coincidente o añadido SHALL incorporarse a su
`average_price` exactamente una vez, como si ese precio hubiera llegado con la compra que la sesión registró. Reenviar la
operación MUST NOT volver a incorporarlo. Los artículos sin precio en el recibo MUST conservar su `average_price`.

#### Scenario: Price arrives after the trip

- **WHEN** "Milk" tenía `average_price` 5.00 y `purchase_count` 4 tras completar la sesión, y se adjunta un recibo con "Milk" a 5.40
- **THEN** su `average_price` pasa a 5.10 y su `purchase_count` sigue en 4

#### Scenario: First known price

- **WHEN** "Eggs" no tenía `average_price` y el recibo adjunto trae "Eggs" a 4.29
- **THEN** su `average_price` pasa a 4.29

#### Scenario: Item without price on the receipt

- **WHEN** una línea coincidente del recibo adjunto no tiene precio
- **THEN** el `average_price` del artículo no cambia

### Requirement: The average price sits at the right of the item

La fila de un artículo con precio medio SHALL mostrarlo a la derecha, en mono, con "avg"; sin precio no muestra nada.

#### Scenario: Item with average price
- **WHEN** un artículo tiene precio medio $3.49
- **THEN** la fila muestra "$3.49 avg" a la derecha

### Requirement: Starting a shopping session shows the estimated total

La hoja de Start Shopping de una lista con precios conocidos SHALL mostrar "Estimated total", de cuántos ítems sale y su
suma con "≈", y SHALL decir "One trip at a time per list.". Sin ningún precio conocido no muestra el total.

#### Scenario: Known prices
- **WHEN** 8 de 9 ítems tienen precio medio
- **THEN** la hoja muestra "From 8 of 9 items" y el total estimado
