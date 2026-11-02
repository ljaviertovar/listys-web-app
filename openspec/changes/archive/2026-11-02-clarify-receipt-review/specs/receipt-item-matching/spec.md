# Spec Delta

## MODIFIED Requirements

### Requirement: A new line can be linked to an existing item

En la revisión, cada línea que se añadiría como nueva SHALL poder vincularse a un artículo existente de la lista
elegida mediante un buscador por nombre de los artículos de esa lista. Una línea vinculada SHALL actualizar ese
artículo (compra y precio, sin cambiar su cantidad) en lugar de crear uno nuevo. Las líneas con nombre igual a un
artículo MUST NOT poder vincularse a otro.

#### Scenario: Link a line

- **WHEN** el usuario vincula la línea "LECHE 2% 4L" al artículo "2% Milk 4L" y añade
- **THEN** "2% Milk 4L" suma una compra y su precio, conserva su cantidad, y la lista no gana un artículo "Leche 2% 4L"

#### Scenario: Search the list

- **WHEN** el usuario escribe "milk" en el buscador de una línea
- **THEN** ve solo los artículos de la lista elegida cuyo nombre contiene "milk"

#### Scenario: Link to an item of another list

- **WHEN** una petición vincula una línea a un artículo que no pertenece a la lista elegida, o una línea que no pertenece al recibo
- **THEN** se rechaza con un error y no se añade ni actualiza nada

## ADDED Requirements

### Requirement: Updated items keep their usual quantity

Al añadir líneas de un recibo a una lista existente, un artículo que se actualiza (por nombre, por vínculo recordado o
por vínculo explícito) MUST conservar su cantidad; si no tenía cantidad, SHALL tomar la de la línea. Un artículo creado
por una línea SHALL tomar la cantidad de la línea, o 1 si no se leyó. La cantidad y unidad de la línea SHALL seguir
registrándose en las estadísticas por tienda.

#### Scenario: Existing item

- **WHEN** "Milk" tiene cantidad 2 en "Pantry" y el usuario añade una línea "Milk" con cantidad 3
- **THEN** "Milk" sigue con cantidad 2 y suma una compra y el precio de la línea

#### Scenario: Two lines for one item

- **WHEN** el recibo trae dos líneas "Milk" de cantidad 1 y "Milk" tiene cantidad 2
- **THEN** "Milk" sigue con cantidad 2

#### Scenario: Existing item without quantity

- **WHEN** "Rice" no tiene cantidad y el usuario añade una línea "Rice" con cantidad 2
- **THEN** "Rice" queda con cantidad 2

#### Scenario: New item

- **WHEN** el usuario añade una línea "Soap" con cantidad 3 que no coincide con ningún artículo
- **THEN** se crea "Soap" con cantidad 3

#### Scenario: Store statistics

- **WHEN** el recibo tiene tienda confirmada y la línea "Milk" de cantidad 3 actualiza "Milk"
- **THEN** la última compra de "Milk" en esa tienda registra cantidad 3 aunque el artículo conserve su cantidad

### Requirement: Review Matches starts from the decisions made on the receipt

Cuando el diálogo de añadir usa la misma lista destino que la pantalla del recibo, la revisión de coincidencias SHALL
mostrar ya aplicadas las decisiones que el usuario tomó en la pantalla, que SHALL poder cambiarse allí. Si el usuario
elige otra lista en el diálogo, MUST NOT aplicarse ninguna decisión de la pantalla.

#### Scenario: Confirmed on the screen

- **WHEN** el usuario confirmó en la pantalla "Organic Bananas" para "ORG BANANAS" y añade a "Pantry"
- **THEN** la revisión muestra que "ORG BANANAS" actualizará "Organic Bananas" y permite cambiarlo antes de confirmar

#### Scenario: Another list in the dialog

- **WHEN** el usuario confirmó "Organic Bananas" frente a "Pantry" y en el diálogo elige "Office"
- **THEN** la revisión de "Office" no aplica esa decisión
