# trip-receipts Specification

## Purpose
Que un viaje completado pida y recuerde sus recibos: el recibo cierra el viaje con los precios y el total reales.

## Requirements

### Requirement: Completing a trip asks for its receipts

Al completar un viaje, la app SHALL abrir su página con "Trip saved", el número de ítems actualizados y la lista, e invitar
a subir recibos ("Upload a Receipt", uno por tienda visitada) o a dejarlos aparte ("Keep It Separate"), con la nota de que
puede adjuntarse un recibo en 48 horas.

#### Scenario: Complete a trip
- **WHEN** el usuario completa un viaje con 3 ítems marcados
- **THEN** ve "Trip saved", "3 items updated in <lista>", "Upload a Receipt" y "Keep It Separate"

### Requirement: A completed trip without a receipt says so

Una visita posterior a un viaje completado sin recibo SHALL decir "No receipts attached" y ofrecer "Add Receipt". Un viaje con
recibo adjunto MUST NOT mostrar esa tarjeta, y un viaje en curso tampoco.

#### Scenario: Later visit
- **WHEN** el usuario abre desde el historial un viaje completado sin recibo
- **THEN** ve "No receipts attached" y "Add Receipt", sin "Keep It Separate"

### Requirement: A receipt uploaded from a trip remembers that trip

Subir un recibo con "Upload a Receipt" o "Add Receipt" desde la página de un viaje SHALL guardar ese viaje como origen
del recibo. Una subida desde cualquier otro punto de la app MUST NOT tener origen. La subida SHALL rechazarse sin guardar
nada si el viaje indicado no existe o no es del usuario, sin revelar cuál de las dos cosas ocurre.

#### Scenario: Upload from the trip page

- **WHEN** el usuario completa un viaje y pulsa "Upload a Receipt"
- **THEN** el recibo subido queda asociado a ese viaje como origen y su pantalla ofrece adjuntarlo a él una vez leído

#### Scenario: Upload from elsewhere

- **WHEN** el usuario sube un recibo desde la pantalla de recibos o desde el botón de subir de la barra inferior
- **THEN** el recibo no tiene viaje de origen

#### Scenario: Another user's trip

- **WHEN** una petición de subida indica la sesión de otro usuario
- **THEN** recibe `404`, no se guarda ninguna foto ni recibo

#### Scenario: Deleted origin trip

- **WHEN** el usuario elimina el viaje desde el que subió un recibo
- **THEN** el recibo se conserva y deja de tener viaje de origen
