# Receipt Total Extraction Specification

## Purpose

Leer el importe total impreso en el recibo durante la misma lectura OCR que ya extrae artículos y tienda, para que el
recibo pueda aportar el total pagado de un viaje sin que el usuario lo escriba.

## Requirements

### Requirement: OCR reads the printed total in the same request

La lectura de un recibo SHALL intentar obtener el total final impreso (el importe pagado, con impuestos) en la misma
petición al proveedor que ya extrae los artículos, sin peticiones adicionales. En recibos de varias fotos SHALL buscarlo
en la última foto. El total leído SHALL guardarse en el recibo.

#### Scenario: Receipt with a total

- **WHEN** se lee un recibo de una foto que imprime "SUBTOTAL 79.10", "HST 5.02" y "TOTAL 84.12"
- **THEN** el recibo queda leído con sus artículos y con total 84.12

#### Scenario: Long receipt in several photos

- **WHEN** se lee un recibo de tres fotos y el total aparece en la tercera
- **THEN** el total se toma de la tercera foto y el número de peticiones al proveedor es el mismo que antes del cambio

#### Scenario: Single photo

- **WHEN** el recibo tiene una sola foto
- **THEN** esa foto se usa tanto para la tienda como para el total en la misma petición

### Requirement: Total extraction never fails a receipt

La ausencia, ilegibilidad o formato inesperado del total MUST NOT hacer fallar la lectura ni impedir guardar los
artículos o la tienda. El total SHALL guardarse solo si es un número finito mayor o igual que cero, redondeado a dos
decimales; en otro caso el recibo SHALL quedar sin total.

#### Scenario: No total printed

- **WHEN** la foto no muestra un total legible
- **THEN** la lectura termina con sus artículos y el recibo queda sin total

#### Scenario: Unexpected value

- **WHEN** el proveedor devuelve como total un texto, un número negativo o un valor no finito
- **THEN** el recibo queda sin total y la lectura no falla

#### Scenario: Provider answers in the previous shape

- **WHEN** el proveedor devuelve solo la lista de artículos para la última foto
- **THEN** los artículos se guardan igual que antes y el recibo queda sin total

### Requirement: Re-reading a receipt refreshes its total

Volver a leer un recibo SHALL reemplazar el total leído por el de la nueva lectura, o dejarlo vacío si la nueva lectura
no lo obtiene, igual que reemplaza sus artículos. Recibos leídos antes de este cambio MUST quedar sin total hasta que se
vuelvan a leer.

#### Scenario: Retry after a bad read

- **WHEN** un recibo con total 12.00 leído por error se vuelve a leer y la nueva lectura obtiene 84.12
- **THEN** el recibo queda con total 84.12

#### Scenario: Existing receipts

- **WHEN** se aplica el cambio en una cuenta con recibos ya leídos
- **THEN** esos recibos no tienen total y sus artículos y tienda no cambian

### Requirement: The receipt screen distinguishes the printed total

Cuando el recibo tiene total leído, su pantalla SHALL mostrarlo como total del recibo, distinto de la suma de precios
de las líneas extraídas. Sin total leído SHALL mostrarse solo la suma de líneas con su aviso de cobertura actual.

#### Scenario: Both amounts

- **WHEN** un recibo tiene total leído 84.12 y sus líneas suman 79.10
- **THEN** la pantalla muestra "Receipt Total" 84.12 y, aparte, la suma de las líneas extraídas

#### Scenario: Only lines

- **WHEN** un recibo no tiene total leído
- **THEN** la pantalla muestra la suma de las líneas extraídas como hasta ahora y no muestra un total del recibo
