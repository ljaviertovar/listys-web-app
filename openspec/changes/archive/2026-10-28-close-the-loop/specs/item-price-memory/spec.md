# Spec Delta

## MODIFIED Requirements

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

## ADDED Requirements

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
