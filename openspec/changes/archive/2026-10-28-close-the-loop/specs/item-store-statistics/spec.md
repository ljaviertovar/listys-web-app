# Spec Delta

## MODIFIED Requirements

### Requirement: Receipt prices are remembered per store

Cuando la línea que registra la compra tiene precio, SHALL guardarse como último precio del artículo en esa tienda junto
con la fecha en que se registró y la cantidad y unidad de esa línea. Una línea sin precio MUST conservar el último precio
anterior con su fecha, cantidad y unidad. Las compras registradas por una sesión MUST NOT cambiar el último precio, de
modo que ese precio siempre procede de un recibo.

#### Scenario: Line with price

- **WHEN** el artículo "Milk" se compra en "No Frills" mediante una línea de recibo de 5.49
- **THEN** su último precio en "No Frills" es 5.49 con la fecha de ese registro

#### Scenario: Line with quantity and unit

- **WHEN** "Apples" se compra en "Metro" mediante una línea de 3.20 por 1 kg
- **THEN** su último precio en "Metro" es 3.20 con cantidad 1 y unidad "kg"

#### Scenario: Line without price

- **WHEN** "Milk" tenía último precio 5.49 en "No Frills" y un recibo posterior de esa tienda trae la línea sin precio
- **THEN** "Milk" suma la compra y su último precio en "No Frills" sigue siendo 5.49 con su fecha anterior

#### Scenario: Session price is not a receipt price

- **WHEN** "Milk" tenía último precio 5.49 en "No Frills" y se completa una sesión en "No Frills" con "Milk" marcado
- **THEN** "Milk" suma la compra en "No Frills" y su último precio en esa tienda sigue siendo 5.49 con su fecha anterior

#### Scenario: Prices recorded before quantity was kept

- **WHEN** un último precio se registró antes de este cambio
- **THEN** conserva su precio y fecha, y su cantidad y unidad quedan sin valor

## ADDED Requirements

### Requirement: Attaching a receipt records its prices per store once

Al adjuntar un recibo a una sesión con tienda, cada artículo coincidente o añadido con precio SHALL guardar ese precio
como último precio en la tienda. Los artículos cuya compra la sesión ya registró en esa tienda MUST NOT sumar otra
compra. Si la sesión no tenía tienda y la toma del recibo, cada artículo comprado en ella SHALL sumar una compra allí.

#### Scenario: Completed trip at a store

- **WHEN** una sesión completada en "No Frills" registró una compra de "Milk" y se le adjunta un recibo con "Milk" a 5.49
- **THEN** "Milk" sigue con esa única compra en "No Frills" y su último precio allí es 5.49

#### Scenario: Whole-list trip gets its store from the receipt

- **WHEN** una sesión completada sin tienda con "Milk" y "Eggs" comprados recibe un recibo confirmado en "Metro"
- **THEN** "Milk" y "Eggs" suman una compra cada uno en "Metro" y la tienda habitual automática se recalcula

#### Scenario: Line added from the receipt

- **WHEN** el usuario añade como comprada la línea "Batteries" a 9.99 al adjuntar un recibo de "Metro"
- **THEN** "Batteries" suma una compra en "Metro" con último precio 9.99

#### Scenario: Trip and receipt without store

- **WHEN** se adjunta un recibo sin tienda a una sesión sin tienda
- **THEN** ninguna estadística por tienda cambia
