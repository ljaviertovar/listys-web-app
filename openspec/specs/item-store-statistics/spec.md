# item-store-statistics Specification

## Purpose

Registrar, por cada artículo de una lista base y cada tienda del usuario, cuántas veces se compró allí, cuándo fue la
última vez y a qué precio según el último recibo, para que la lista pueda saber dónde se suele comprar cada cosa.

## Requirements

### Requirement: Adding receipt items with a confirmed store records a purchase per item

Al añadir artículos de un recibo con tienda confirmada a una lista, cada artículo de la lista que la operación actualiza o
crea SHALL sumar una compra en esa tienda y fijar su fecha de última compra en ese momento. Un artículo MUST contar una
sola compra por recibo aunque varias líneas del recibo lo actualicen. Un recibo sin tienda confirmada MUST NOT registrar
estadísticas por tienda.

#### Scenario: Receipt with a store

- **WHEN** el usuario añade a "Pantry" las líneas "Milk" y "Eggs" de un recibo confirmado en "No Frills"
- **THEN** "Milk" y "Eggs" tienen cada uno una compra más en "No Frills" con la fecha de ese momento

#### Scenario: Two lines for one item

- **WHEN** un recibo de "No Frills" trae dos líneas que actualizan el mismo artículo "Milk"
- **THEN** "Milk" suma una sola compra en "No Frills"

#### Scenario: Linked line

- **WHEN** una línea "2% MILK 4L" de un recibo de "Costco" se vincula al artículo "Milk"
- **THEN** la compra se registra en "Milk" para "Costco"

#### Scenario: Receipt without a store

- **WHEN** el usuario añade artículos de un recibo sin tienda confirmada
- **THEN** los artículos se actualizan como hasta ahora y ninguna estadística por tienda cambia

### Requirement: Receipt prices are remembered per store

Cuando la línea que registra la compra tiene precio, SHALL guardarse como último precio del artículo en esa tienda junto
con la fecha en que se registró. Una línea sin precio MUST conservar el último precio anterior. Las compras registradas
por una sesión MUST NOT cambiar el último precio, de modo que ese precio siempre procede de un recibo.

#### Scenario: Line with price

- **WHEN** el artículo "Milk" se compra en "No Frills" mediante una línea de recibo de 5.49
- **THEN** su último precio en "No Frills" es 5.49 con la fecha de ese registro

#### Scenario: Line without price

- **WHEN** "Milk" tenía último precio 5.49 en "No Frills" y un recibo posterior de esa tienda trae la línea sin precio
- **THEN** "Milk" suma la compra y su último precio en "No Frills" sigue siendo 5.49 con su fecha anterior

#### Scenario: Session price is not a receipt price

- **WHEN** "Milk" tenía último precio 5.49 en "No Frills" y se completa una sesión en "No Frills" con "Milk" marcado
- **THEN** "Milk" suma la compra en "No Frills" y su último precio en esa tienda sigue siendo 5.49 con su fecha anterior

### Requirement: Completing a store-scoped session records a purchase per checked item

Completar una sesión iniciada con una tienda SHALL sumar una compra en esa tienda a cada artículo de la lista que la
finalización actualiza o crea a partir de un ítem marcado, con la fecha de la finalización. Los ítems sin marcar MUST NOT
registrar compra. Una sesión sin tienda MUST NOT registrar estadísticas por tienda.

#### Scenario: Trip without a receipt

- **WHEN** el propietario completa una sesión iniciada en "No Frills" con "Milk" marcado y "Bread" sin marcar
- **THEN** "Milk" suma una compra en "No Frills" y "Bread" no cambia sus estadísticas

#### Scenario: New item added during a scoped trip

- **WHEN** se completa una sesión en "No Frills" con un ítem nuevo marcado que la lista tiene capacidad de guardar
- **THEN** el artículo creado tiene una compra en "No Frills"

#### Scenario: Whole-list trip

- **WHEN** se completa una sesión iniciada sin tienda
- **THEN** ninguna estadística por tienda cambia

### Requirement: Statistics are recorded atomically with the existing learning

El registro de estadísticas SHALL formar parte de la misma transacción que añade los artículos del recibo o completa la
sesión. Si cualquier parte falla, MUST NOT quedar ningún cambio en artículos, estadísticas, etiquetas, recibo ni sesión.
Completar dos veces una sesión MUST NOT registrar dos compras.

#### Scenario: Failure while recording

- **WHEN** falla el registro de estadísticas al completar una sesión con tienda
- **THEN** la sesión sigue activa y ni la lista ni las estadísticas cambian

#### Scenario: Repeated completion

- **WHEN** se envía dos veces la finalización de una sesión con tienda
- **THEN** cada artículo marcado suma una sola compra en esa tienda

### Requirement: Statistics belong to the list owner

Las estadísticas por tienda de un artículo SHALL ser visibles solo para el propietario de la lista y MUST referirse solo
a tiendas de ese propietario. Ningún cliente MUST poder escribirlas directamente; solo cambian por las operaciones de
este capability y por la fusión de tiendas. Borrar un artículo SHALL borrar sus estadísticas.

#### Scenario: Collaborator reads a shared list

- **WHEN** un colaborador abre una lista compartida cuyos artículos tienen estadísticas por tienda
- **THEN** ve los artículos y no recibe estadísticas ni nombres de tiendas del propietario

#### Scenario: Direct write

- **WHEN** un usuario intenta crear o modificar una estadística por tienda sin pasar por una de esas operaciones
- **THEN** la escritura se rechaza y nada cambia

#### Scenario: Deleted item

- **WHEN** el propietario borra un artículo con estadísticas
- **THEN** sus estadísticas dejan de existir y las de los demás artículos no cambian

### Requirement: Existing history does not create statistics

Aplicar este cambio MUST NOT crear estadísticas a partir de recibos fusionados ni de sesiones completadas antes de él, ni
modificar contadores, precios o fechas ya guardados en los artículos.

#### Scenario: Deploy with prior receipts

- **WHEN** se aplica el cambio en una cuenta con recibos ya añadidos a listas con tienda confirmada
- **THEN** ningún artículo tiene estadísticas por tienda hasta la siguiente fusión o sesión con tienda
- **AND** `purchase_count`, `last_purchased_at` y `average_price` de cada artículo no cambian
