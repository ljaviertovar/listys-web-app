## ADDED Requirements

### Requirement: Spend This Month breaks the total down by store

La tarjeta "Spend This Month" SHALL listar hasta cinco tiendas con lo gastado en ellas en el mes (viajes completados más
recibos no adjuntos a un viaje), de mayor a menor, y una fila "Other" con lo que el total tiene y esas tiendas no (recibos sin
tienda confirmada, tiendas más allá de las cinco). Si el desglose no puede leerse, el total SHALL mostrarse igual.

#### Scenario: Receipt without a store
- **WHEN** el total del mes es $1,275.71 y las tiendas listadas suman $994.26
- **THEN** "Other" muestra $281.45

#### Scenario: Breakdown unavailable
- **WHEN** falla la lectura del desglose
- **THEN** se ve el total sin tiendas

### Requirement: Up Next names a list running low and a trip to join

"Up Next" SHALL incluir "<lista> is running low" con cuántos ítems se necesitarán, para la lista con más ítems cuyo intervalo
habitual ya pasó, y "Someone is shopping “<lista>”" con su progreso y "Join the trip" cuando otra persona tiene un viaje activo
en una lista compartida. Los viajes del propio usuario MUST NOT generar el segundo aviso. Up Next SHALL mostrar como máximo
cuatro entradas.

#### Scenario: Partner trip
- **WHEN** otra persona tiene un viaje activo con 1 de 3 ítems marcados en "Weekly Groceries"
- **THEN** Up Next dice "Someone is shopping “Weekly Groceries”" y "1 of 3 items · Join the trip"

#### Scenario: Own trip
- **WHEN** el único viaje activo es del propio usuario
- **THEN** no aparece el aviso de viaje de otra persona