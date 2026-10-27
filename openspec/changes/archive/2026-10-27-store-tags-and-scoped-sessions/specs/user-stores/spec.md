# Spec Delta

## MODIFIED Requirements

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
