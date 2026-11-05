## RENAMED Requirements

- FROM: `### Requirement: Active session shows an estimated total`
- TO: `### Requirement: A session shows an estimated total until receipts say what was paid`

## MODIFIED Requirements

### Requirement: A session shows an estimated total until receipts say what was paid

Una sesión activa, y una completada sin recibos, SHALL mostrar un total estimado igual a la suma de los precios promedio
conocidos de sus ítems, marcado como estimación y con su cobertura. Una sesión completada con recibos SHALL mostrar el
total pagado y, aparte, "Estimate was <estimado>". La estimación MUST NOT presentarse como importe pagado ni sustituir al
total real.

#### Scenario: Partial price coverage

- **WHEN** 3 de 12 ítems de la sesión tienen precio promedio conocido
- **THEN** la sesión muestra la suma de esos 3 importes marcada como estimación y "3 of 12 items priced"

#### Scenario: No price data

- **WHEN** ningún ítem de la sesión tiene precio promedio conocido
- **THEN** la sesión no muestra tarjeta ni línea de estimación

#### Scenario: Item added during the trip

- **WHEN** el usuario añade a la sesión un ítem cuyo nombre normalizado coincide con un ítem de la lista base con precio promedio
- **THEN** la estimación y la cobertura se actualizan para incluirlo

#### Scenario: Completed session

- **WHEN** se abre una sesión completada sin recibos con 10 ítems, 9 con precio conocido, y un estimado de 62.40
- **THEN** muestra la tarjeta "Estimated" con "≈ $62.40" y "10 items · 9 with known prices"

#### Scenario: Completed session with receipts

- **WHEN** se abre una sesión completada con recibos por 127.52 y un estimado de 119.80
- **THEN** muestra "Paid $127.52" y "Estimate was $119.80", sin presentar el estimado como pagado
