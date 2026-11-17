## MODIFIED Requirements

### Requirement: Store extraction never fails a receipt

La ausencia, ilegibilidad o formato inesperado del nombre de la tienda MUST NOT hacer fallar la lectura ni impedir
guardar los artículos. En esos casos el recibo SHALL quedar sin nombre crudo y sin tienda, listo para revisión, llamarse
"Unnamed Receipt" y pedir al usuario la tienda en su pantalla. El nombre guardado SHALL limpiarse de espacios sobrantes y
caracteres de control y limitarse a 100 caracteres.

#### Scenario: No store printed

- **WHEN** se lee un recibo sin nombre de tienda legible
- **THEN** la lectura termina con sus artículos, el recibo no tiene nombre crudo, se llama "Unnamed Receipt" y su pantalla permite escribir o elegir la tienda

#### Scenario: Provider answers in the previous shape

- **WHEN** el proveedor devuelve solo la lista de artículos, sin el campo de tienda
- **THEN** los artículos se guardan igual que antes y el recibo queda sin nombre crudo

#### Scenario: Oversized or noisy name

- **WHEN** el proveedor devuelve un nombre con saltos de línea, espacios repetidos y más de 100 caracteres
- **THEN** se guarda en una sola línea, sin espacios repetidos y recortado a 100 caracteres
