## ADDED Requirements

### Requirement: A total far above the lines read is flagged

Cuando el recibo tiene total impreso y las líneas leídas suman menos del 90 % de ese total, la pantalla SHALL avisar de que
pueden faltar líneas y pedir comprobar la foto. Una diferencia menor (impuestos, descuentos) MUST NOT avisar.

#### Scenario: Lines fall short
- **WHEN** las líneas suman $68.26 y el total impreso es $88.93
- **THEN** la pantalla dice que los ítems leídos suman menos que el total y que faltan líneas posibles

#### Scenario: Small difference
- **WHEN** las líneas suman $79.19 y el total impreso es $84.50
- **THEN** no hay aviso