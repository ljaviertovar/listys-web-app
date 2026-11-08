## MODIFIED Requirements

### Requirement: Attaching a receipt records its prices per store once

Al adjuntar un recibo con tienda (la suya confirmada o la que hereda de la sesión), cada artículo coincidente o añadido con
precio SHALL guardar ese precio como último precio en la tienda del recibo, no en la de la sesión. Los artículos cuya compra
el viaje ya registró en esa tienda MUST NOT sumar otra compra. Si la sesión no tenía tienda y la toma del recibo, cada artículo
comprado en ella SHALL sumar una compra allí. Un artículo que aparece en el recibo de otra tienda del mismo viaje SHALL sumar
su compra en esa tienda, no en la de la sesión.

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

#### Scenario: Second store of the trip

- **WHEN** una sesión completada en "No Frills" recibe un segundo recibo, de "Costco", con "Eggs" a 3.99
- **THEN** "Eggs" guarda 3.99 como último precio en "Costco" y su compra de ese viaje queda en "Costco", no en "No Frills"
