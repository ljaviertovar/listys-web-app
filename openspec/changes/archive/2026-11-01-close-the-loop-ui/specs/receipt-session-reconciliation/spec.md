## ADDED Requirements

### Requirement: The attach review summarises what matches

La revisión de adjuntar SHALL mostrar cuántas líneas coinciden con ítems del viaje ("Matched"), cuántas solo están en el recibo
("Only on receipt", incluidas las que el usuario añade como compradas) y cuántos ítems del viaje marcados no aparecen en el
recibo ("Not on receipt"), y listar estos últimos en "Checked, not on the receipt" con la nota de que quedan como comprados
sin precio. Cuando no hay líneas sobrantes ni ítems sin línea, SHALL decir que todo lo marcado está en el recibo.

#### Scenario: Items without a line
- **WHEN** el viaje tiene "Paper towels" marcado y ninguna línea del recibo lo cubre
- **THEN** aparece en "Checked, not on the receipt" y cuenta en "Not on receipt"

#### Scenario: Linked line
- **WHEN** el usuario enlaza una línea con un ítem marcado
- **THEN** ese ítem deja de estar en "Checked, not on the receipt"

### Requirement: A receipt added to a list explains why it has no trip

Un recibo leído que ya se añadió a una lista SHALL decir que por eso no puede adjuntarse también a un viaje, en lugar de
omitir la tarjeta de viaje sin explicación.

#### Scenario: Receipt already in a list
- **WHEN** el usuario abre un recibo cuyos ítems se añadieron a una lista
- **THEN** ve "The items of this receipt were added to a list, so it can’t also be attached to a trip."