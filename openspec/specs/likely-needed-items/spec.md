# Likely Needed Items Specification

## Purpose

Decir qué artículos probablemente hacen falta a partir del ritmo con que el usuario los compra, con una regla simple y
explicable que muestra los hechos en los que se basa y nunca una puntuación.

## Requirements

### Requirement: An item is likely needed when its usual interval has passed

Un artículo de una lista propia del usuario SHALL considerarse probablemente necesario cuando tiene al menos 3 compras
registradas, su intervalo medio es de al menos un día y el tiempo desde su última compra alcanza ese intervalo. El
intervalo medio SHALL ser el tiempo entre su alta en la lista y su última compra dividido entre sus compras menos una.

#### Scenario: Due item

- **WHEN** "Milk" tiene 5 compras, se dio de alta hace 48 días, se compró por última vez hace 12 días y su intervalo medio es 9 días
- **THEN** "Milk" es probablemente necesario

#### Scenario: Not due yet

- **WHEN** "Rice" tiene un intervalo medio de 30 días y se compró hace 10
- **THEN** "Rice" no es probablemente necesario

#### Scenario: Not enough history

- **WHEN** "Saffron" tiene 2 compras
- **THEN** no se evalúa, aunque haga mucho de la última

#### Scenario: Same-day purchases

- **WHEN** las compras de un artículo dan un intervalo medio menor de un día
- **THEN** el artículo no es probablemente necesario

### Requirement: Items no longer bought are left out

Un artículo cuyo tiempo desde la última compra supera 4 veces su intervalo medio, o 120 días, SHALL dejar de
considerarse probablemente necesario, para no mostrar indefinidamente lo que el usuario ya no compra.

#### Scenario: Abandoned item

- **WHEN** "Formula" tiene un intervalo de 7 días y se compró por última vez hace 40
- **THEN** no aparece entre los probablemente necesarios

#### Scenario: Long interval cap

- **WHEN** un artículo con intervalo de 45 días lleva 130 días sin comprarse
- **THEN** no aparece entre los probablemente necesarios

### Requirement: Most overdue items come first and the list is short

Los artículos probablemente necesarios SHALL ordenarse por el tiempo desde la última compra dividido entre su intervalo,
de mayor a menor; con empate, por última compra más antigua y después por nombre. Se SHALL devolver como máximo el
límite pedido, entre 1 y 10, y 5 si no se pide.

#### Scenario: Ordering

- **WHEN** "Milk" lleva 1,5 intervalos sin comprarse y "Eggs" 1,1
- **THEN** "Milk" aparece antes que "Eggs"

#### Scenario: Limit

- **WHEN** hay ocho artículos probablemente necesarios y no se pide límite
- **THEN** se devuelven los cinco más atrasados

### Requirement: Each item explains itself with facts

Cada artículo probablemente necesario SHALL mostrarse con su nombre, su lista, su intervalo redondeado a días enteros y
los días desde su última compra ("Usually every 9 days · last bought 12 days ago"), y su tienda habitual cuando la
tiene. MUST NOT mostrar puntuaciones, porcentajes ni lenguaje de predicción.

#### Scenario: Item with usual store

- **WHEN** "Milk" de "Pantry" tiene tienda habitual "No Frills"
- **THEN** su fila muestra "Milk", "Pantry", "No Frills" y "Usually every 9 days · last bought 12 days ago"

#### Scenario: Open the list

- **WHEN** el usuario toca un artículo probablemente necesario
- **THEN** se abre la lista que lo contiene

### Requirement: Only the owner's lists are considered

La regla SHALL aplicarse solo a artículos de listas propiedad del usuario. Las listas compartidas con él MUST NOT
aportar artículos, y una petición sin sesión SHALL rechazarse.

#### Scenario: Collaborator

- **WHEN** el usuario colabora en una lista ajena con artículos atrasados
- **THEN** esos artículos no aparecen entre sus probablemente necesarios
