## ADDED Requirements

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