## ADDED Requirements

### Requirement: A standalone receipt can be included in spending

An individually uploaded receipt SHALL start excluded. Its owner SHALL be able to use the Count in spending switch in the receipt detail to include or remove its recorded amount in This Month and All Time. The detail SHALL describe whether the receipt counts. The receipt list SHALL show In spending beside the amount only while that standalone receipt contributes.

#### Scenario: Standalone receipt starts excluded

- **WHEN** a receipt is uploaded individually and its owner has not enabled the preference
- **THEN** it does not contribute and the list shows no spending indicator

#### Scenario: Owner enables a standalone receipt

- **WHEN** the owner enables spending for a standalone receipt with a known amount
- **THEN** it contributes in periods containing its purchase date, or its upload date when no printed date is available
- **AND** its detail shows that it counts and its list card shows In spending

#### Scenario: Owner disables a standalone receipt

- **WHEN** the owner switches the preference off
- **THEN** its amount is excluded, the detail shows that it is left out, and the list indicator is removed

#### Scenario: Receipt has no recorded amount

- **WHEN** a standalone receipt has no known amount
- **THEN** the owner cannot enable the preference and can disable a previously enabled preference

#### Scenario: Receipt later joins a trip

- **WHEN** an opted-in receipt is attached to a trip
- **THEN** the trip rules apply and its amount is counted only once


## MODIFIED Requirements

### Requirement: This Month sums only known totals

"This Month" SHALL sumar los importes conocidos de recibos adjuntos o subidos desde trips activos o completados del usuario y de recibos sueltos habilitados por su propietario. SHALL usar la fecha de compra o, cuando falte, la fecha de carga en la zona horaria del visitante. "All time" SHALL incluir todo el historial elegible. Ambos periodos SHALL excluir los totales propios del trip.

#### Scenario: Trips and receipts

- **WHEN** el mes contiene un recibo válido de $40 adjunto a un trip activo y otro de $25 adjunto a un trip completado
- **THEN** la tarjeta muestra $65 y cuenta ambos recibos una vez

#### Scenario: Trip without total

- **WHEN** un trip elegible no tiene un recibo válido adjunto
- **THEN** su total propio no contribuye al gasto

#### Scenario: Month boundary in the visitor's timezone

- **WHEN** un recibo adjunto válido sin fecha impresa se cargó a las 23:30 del último día del mes en la zona horaria del visitante, aunque ya sea el mes siguiente en UTC
- **THEN** cuenta en octubre para ese visitante

#### Scenario: Purchase date differs from the upload date

- **WHEN** un recibo elegible del 28 de octubre se carga el 3 de noviembre
- **THEN** el importe, el conteo y los desgloses del recibo cuentan en octubre y en All Time
- **AND** si la fecha impresa no está disponible, el recibo cuenta en el mes de carga, en la zona horaria del visitante

#### Scenario: Nothing known

- **WHEN** no hay recibos con importe conocido que contribuyan al gasto del mes
- **THEN** la tarjeta indica que no hay gasto registrado y no muestra "$0"

#### Scenario: Shared trips

- **WHEN** un trip de una lista ajena no pertenece al usuario
- **THEN** sus recibos adjuntos no se incluyen en el gasto del usuario

#### Scenario: Standalone receipt is excluded

- **WHEN** el mes también contiene un recibo suelto con total válido cuya preferencia sigue apagada
- **THEN** su importe y conteo no contribuyen al gasto de la tarjeta

#### Scenario: Receipts awaiting review

- **WHEN** un trip completado tiene un recibo confirmado por $60 y dos recibos subidos desde el trip pendientes de revisión por $15 y $25
- **THEN** la tarjeta suma $100 y cuenta los tres recibos en los periodos que los contienen
- **AND** al confirmar uno de los pendientes, su importe confirmado sustituye al anterior sin contar el recibo dos veces

#### Scenario: Receipt lines do not cover the total

- **WHEN** un recibo del trip tiene importe conocido y sus líneas están incompletas
- **THEN** su importe registrado sigue contando en el gasto
