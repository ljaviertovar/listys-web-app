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

### Requirement: Active session shows an estimated total

Una sesión activa SHALL mostrar un total estimado igual a la suma de los precios promedio conocidos de sus ítems, con la etiqueta "estimate" (estimado) y la cobertura "N of M items priced". Cada ítem de la sesión con precio promedio conocido en la lista base SHOULD mostrarlo. La estimación MUST NOT presentarse como importe pagado ni sustituir al total real indicado al completar.

#### Scenario: Partial price coverage

- **WHEN** 3 de 12 ítems de la sesión tienen precio promedio conocido
- **THEN** la sesión muestra la suma de esos 3 importes marcada como estimación y "3 of 12 items priced"

#### Scenario: No price data

- **WHEN** ningún ítem de la sesión tiene precio promedio conocido
- **THEN** la sesión no muestra tarjeta ni línea de estimación

#### Scenario: Item added during the trip

- **WHEN** el usuario añade a la sesión un ítem cuyo nombre normalizado coincide con un ítem de la lista base con precio promedio
- **THEN** la estimación y la cobertura se actualizan para incluirlo

#### Scenario: Completed session

- **WHEN** se abre una sesión completada
- **THEN** no se muestra estimación y solo aparece el total real si se registró

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
