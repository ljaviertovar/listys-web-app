# Spec Delta

## ADDED Requirements

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
