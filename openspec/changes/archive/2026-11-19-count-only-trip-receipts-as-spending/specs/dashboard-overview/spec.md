# Spec Delta

## MODIFIED Requirements

### Requirement: This Month sums only known totals

"This Month" SHALL sumar los importes conocidos de recibos adjuntos o subidos desde trips activos o completados del usuario, según la fecha del recibo en la zona horaria del visitante. "All time" SHALL aplicar la misma regla a todo el historial. Ambos periodos SHALL excluir recibos sueltos y totales propios del trip.

#### Scenario: Trips and receipts

- **WHEN** el mes contiene un recibo válido de $40 adjunto a un trip activo y otro de $25 adjunto a un trip completado
- **THEN** la tarjeta muestra $65 y cuenta ambos recibos una vez

#### Scenario: Trip without total

- **WHEN** un trip elegible no tiene un recibo válido adjunto
- **THEN** su total propio no contribuye al gasto

#### Scenario: Month boundary in the visitor's timezone

- **WHEN** un recibo adjunto válido se registró a las 23:30 del último día del mes en la zona horaria del visitante, aunque ya sea el mes siguiente en UTC
- **THEN** se cuenta en el mes del visitante

#### Scenario: Nothing known

- **WHEN** no hay recibos válidos adjuntos a trips elegibles en el mes
- **THEN** la tarjeta indica que no hay gasto registrado y no muestra "$0"

#### Scenario: Shared trips

- **WHEN** un trip de una lista ajena no pertenece al usuario
- **THEN** sus recibos adjuntos no se incluyen en el gasto del usuario

#### Scenario: Standalone receipt is excluded

- **WHEN** el mes también contiene un recibo suelto con total válido
- **THEN** su importe y conteo no contribuyen al gasto de la tarjeta

#### Scenario: Receipts awaiting review

- **WHEN** un trip completado tiene un recibo confirmado por $60 y dos recibos subidos desde el trip pendientes de revisión por $15 y $25
- **THEN** la tarjeta suma $100 y cuenta los tres recibos en los periodos que los contienen
- **AND** al confirmar uno de los pendientes, su importe confirmado sustituye al anterior sin contar el recibo dos veces

#### Scenario: Receipt lines do not cover the total

- **WHEN** un recibo del trip tiene importe conocido y sus líneas están incompletas
- **THEN** su importe registrado sigue contando en el gasto

### Requirement: Spend This Month breaks the total down by store

La tarjeta Spending SHALL desglosar el gasto elegible por tienda en ambos periodos. SHALL mostrar las tiendas principales de mayor a menor, "Other" para las demás tiendas confirmadas y "Unknown Store" para los recibos sin tienda confirmada. Si el desglose no puede leerse, el total SHALL mostrarse igual.

#### Scenario: Receipt without a store

- **WHEN** recibos adjuntos elegibles sin tienda confirmada forman parte del total
- **THEN** su importe se incluye en el total y se muestra como "Unknown Store" tanto en el mes como en "All time"
- **AND** el gráfico muestra ese segmento aunque no haya gasto en tiendas confirmadas

#### Scenario: Breakdown unavailable

- **WHEN** falla la lectura del desglose por tienda
- **THEN** se ve el total calculado con recibos adjuntos elegibles aunque no se muestren tiendas


