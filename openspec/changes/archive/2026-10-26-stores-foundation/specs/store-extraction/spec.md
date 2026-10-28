# Spec Delta

## Purpose

Obtener el nombre de la tienda directamente del recibo durante la lectura OCR, para que el usuario no tenga que
escribirlo al subir y para que ese nombre pueda resolverse después a una de sus tiendas.

## ADDED Requirements

### Requirement: Upload does not ask for a store

El formulario de subida de recibos SHALL pedir solo fotos y MUST NOT mostrar ni exigir un campo de nombre de tienda o
de recibo. La subida por API SHALL seguir aceptando `store_name` como campo opcional de hasta 100 caracteres; si llega
vacío o solo con espacios se trata como ausente.

#### Scenario: Upload with photos only

- **WHEN** el usuario elige una o más fotos válidas y pulsa subir
- **THEN** el recibo se crea y se lee sin que la interfaz haya pedido un nombre

#### Scenario: Existing client still sends a name

- **WHEN** un cliente de la API sube un recibo con `store_name` "Corner Market"
- **THEN** el recibo se crea con ese nombre crudo y la lectura posterior no lo sobrescribe

#### Scenario: Name too long

- **WHEN** un cliente sube un recibo con un `store_name` de más de 100 caracteres
- **THEN** la subida se rechaza con un error de validación y no se guarda ninguna foto

### Requirement: OCR extracts the store name from the receipt header

La lectura de un recibo SHALL intentar obtener el nombre de la tienda impreso en la cabecera, en la misma petición al
proveedor que ya extrae los artículos, sin peticiones adicionales. En recibos de varias fotos SHALL buscarlo en la
primera foto. El nombre extraído SHALL guardarse como texto crudo del recibo cuando el recibo aún no tiene uno.

#### Scenario: Header with a store name

- **WHEN** se lee un recibo de una foto cuya cabecera dice "NO FRILLS #3127"
- **THEN** el recibo queda leído con sus artículos y con el nombre crudo "NO FRILLS #3127"

#### Scenario: Long receipt in several photos

- **WHEN** se lee un recibo de tres fotos y solo la primera muestra la cabecera
- **THEN** el nombre crudo se toma de la primera foto y el número de peticiones al proveedor es el mismo que antes del cambio

#### Scenario: Re-reading keeps an existing name

- **WHEN** se vuelve a leer un recibo que ya tiene un nombre crudo
- **THEN** el nombre crudo existente se conserva

### Requirement: Store extraction never fails a receipt

La ausencia, ilegibilidad o formato inesperado del nombre de la tienda MUST NOT hacer fallar la lectura ni impedir
guardar los artículos. En esos casos el recibo SHALL quedar sin nombre crudo y sin tienda, listo para revisión. El
nombre guardado SHALL limpiarse de espacios sobrantes y caracteres de control y limitarse a 100 caracteres.

#### Scenario: No store printed

- **WHEN** se lee un recibo sin nombre de tienda legible
- **THEN** la lectura termina con sus artículos, el recibo no tiene nombre crudo y la pantalla lo muestra como "Store not recognized"

#### Scenario: Provider answers in the previous shape

- **WHEN** el proveedor devuelve solo la lista de artículos, sin el campo de tienda
- **THEN** los artículos se guardan igual que antes y el recibo queda sin nombre crudo

#### Scenario: Oversized or noisy name

- **WHEN** el proveedor devuelve un nombre con saltos de línea, espacios repetidos y más de 100 caracteres
- **THEN** se guarda en una sola línea, sin espacios repetidos y recortado a 100 caracteres
