# Spec Delta

## RENAMED Requirements

- FROM: `### Requirement: Active session shows an estimated total`
- TO: `### Requirement: A session shows an estimated total until receipts say what was paid`

## MODIFIED Requirements

### Requirement: A session shows an estimated total until receipts say what was paid

Una sesión activa SHALL mostrar `Estimated total` como suma de los precios promedio conocidos de sus ítems marcados, con cobertura de esos ítems. Cada fila con precio conocido SHALL conservarlo aunque no esté marcada. El estimado MUST NOT presentarse como pagado ni modificar la estimación de la lista base o de Start Shopping. Se conservan las reglas de precio por línea, sin multiplicar por cantidad.

Una sesión completada sin recibos SHALL conservar la estimación de sus ítems comprados; con recibos SHALL mostrar el pagado y, aparte, "Estimate was <estimado>" cuando hay precios conocidos, sin sustituir el importe real.

#### Scenario: Partial price coverage

- **WHEN** hay 12 ítems, 4 marcados y solo 3 de los marcados tienen precio conocido: 3.50, 4.25 y 2.00
- **THEN** `Estimated total` muestra aproximadamente 9.75 y cobertura de 3 de 4 ítems marcados
- **AND** los precios de los 8 ítems sin marcar no contribuyen aunque sean conocidos

#### Scenario: No price data

- **WHEN** ningún ítem del trip tiene precio promedio conocido
- **THEN** no se muestra importe ni línea de estimación y el progreso sigue disponible

#### Scenario: Item added during the trip

- **WHEN** se añade un ítem sin marcar cuyo nombre normalizado coincide con uno de la lista base con precio promedio
- **THEN** su fila muestra el precio y el acumulado no aumenta hasta marcarlo

#### Scenario: Check and uncheck an item

- **WHEN** el acumulado es 3.50 y se marca otro ítem con precio promedio 4.25
- **THEN** pasa a 7.75 y al desmarcar ese ítem vuelve a 3.50
- **AND** el resultado se conserva al volver a abrir el trip

#### Scenario: No items checked yet

- **WHEN** el trip contiene precios conocidos y ningún ítem está marcado
- **THEN** `Estimated total` muestra aproximadamente 0.00 con cobertura de 0 de 0 ítems marcados

#### Scenario: Only unpriced items are checked

- **WHEN** hay precios conocidos en el trip pero sus 2 ítems marcados no tienen precio conocido
- **THEN** el acumulado muestra aproximadamente 0.00 con cobertura de 0 de 2 ítems marcados, sin atribuirles un precio cero

#### Scenario: Base list estimate stays independent

- **WHEN** la lista base y Start Shopping estiman 20.00 y se marca o desmarca un ítem de su trip activo
- **THEN** el estimado de la lista base y Start Shopping sigue en 20.00 si no cambian sus datos de precios
- **AND** abrir el trip y mostrar el acumulado no escribe precios ni totales

#### Scenario: Unchecked rows retain their price

- **WHEN** un ítem sin marcar tiene precio promedio conocido de 4.25
- **THEN** su fila conserva el precio promedio aunque no aporte al acumulado

#### Scenario: Completed session

- **WHEN** se abre una sesión completada sin recibos con 10 ítems comprados, 9 con precio conocido, y un estimado de 62.40
- **THEN** muestra la tarjeta "Estimated" con "≈ $62.40" y "10 items · 9 with known prices"

#### Scenario: Completed session with receipts

- **WHEN** se abre una sesión completada con recibos por 127.52 y un estimado de 119.80
- **THEN** muestra "Paid $127.52" y "Estimate was $119.80", sin presentar el estimado como pagado

#### Scenario: Estimate hierarchy and header

- **WHEN** se abre un viaje completado sin recibos y con precios conocidos
- **THEN** Estimated y el importe aproximado aparecen a la izquierda y la cobertura a la derecha; el importe de cabecera también lleva ≈

#### Scenario: Active trip with receipts

- **WHEN** un trip activo tiene ítems marcados estimados en 7.75 y recibos adjuntos por 9.00
- **THEN** muestra `Estimated total` aproximadamente 7.75 y `Paid so far` 9.00 como importes distintos, sin sumarlos entre sí
