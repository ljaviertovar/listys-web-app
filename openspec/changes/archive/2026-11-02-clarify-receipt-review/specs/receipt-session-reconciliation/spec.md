# Spec Delta

## MODIFIED Requirements

### Requirement: A read receipt offers to attach to a recent trip

En la pantalla de un recibo leído, sin adjuntar y no añadido a ninguna lista, SHALL ofrecerse adjuntarlo solo al viaje
desde el que se subió, cuando ese viaje sigue siendo candidato: activo, o completado como mucho 48 horas antes de la
subida o después de ella, y sin recibo adjunto. Un recibo subido fuera de un viaje MUST NOT ofrecer adjuntarse a ninguno.

#### Scenario: Active trip

- **WHEN** el viaje de origen del recibo es la sesión activa de "Pantry" y el recibo se lee
- **THEN** la pantalla ofrece adjuntar el recibo a la compra de "Pantry"

#### Scenario: Trip completed after the upload

- **WHEN** el viaje de origen del recibo se completó después de la subida y antes de revisarlo
- **THEN** la pantalla del recibo ofrece adjuntarlo a ese viaje completado

#### Scenario: Trip completed an hour before the upload

- **WHEN** el propietario sube un recibo desde la tarjeta de recibos de un viaje completado hace una hora y el recibo se lee
- **THEN** la pantalla del recibo ofrece adjuntarlo a ese viaje

#### Scenario: Standalone receipt with a recent trip

- **WHEN** el propietario completó un viaje hace una hora y sube un recibo desde la pantalla de recibos
- **THEN** la pantalla del recibo no ofrece adjuntarlo a ningún viaje

#### Scenario: Origin trip already has a receipt

- **WHEN** el recibo se subió desde un viaje que ya tiene otro recibo adjunto
- **THEN** la pantalla no ofrece adjuntarlo

#### Scenario: Old trip

- **WHEN** el recibo se subió desde un viaje completado tres días antes
- **THEN** la pantalla no ofrece adjuntarlo

#### Scenario: Origin trip deleted

- **WHEN** el propietario eliminó el viaje desde el que subió el recibo
- **THEN** la pantalla no ofrece adjuntarlo y el recibo se revisa como uno independiente

#### Scenario: Receipt already added to a list

- **WHEN** el propietario abre un recibo cuyas líneas ya añadió a una lista
- **THEN** la pantalla no ofrece adjuntarlo

#### Scenario: Receipt not read yet

- **WHEN** el recibo está pendiente de lectura o su lectura falló
- **THEN** la pantalla no ofrece adjuntarlo

### Requirement: A receipt added to a list explains why it has no trip

Un recibo leído subido desde un viaje que ya se añadió a una lista SHALL decir que por eso no puede adjuntarse también a
ese viaje, en lugar de omitir la tarjeta de viaje sin explicación. Un recibo subido fuera de un viaje MUST NOT mostrar esa
explicación.

#### Scenario: Receipt already in a list

- **WHEN** el usuario abre un recibo subido desde un viaje cuyos ítems se añadieron a una lista
- **THEN** ve "The items of this receipt were added to a list, so it can’t also be attached to a trip."

#### Scenario: Standalone receipt already in a list

- **WHEN** el usuario abre un recibo subido desde la pantalla de recibos cuyos ítems se añadieron a una lista
- **THEN** no ve ninguna nota sobre viajes

## ADDED Requirements

### Requirement: Attaching is limited to the receipt's origin trip

Adjuntar un recibo SHALL aceptarse solo con el viaje desde el que se subió. Una petición que intenta adjuntarlo a otra
sesión propia, o adjuntar un recibo sin viaje de origen, MUST rechazarse con un conflicto sin cambios.

#### Scenario: Another own session

- **WHEN** una petición intenta adjuntar a la sesión de "Office" un recibo subido desde la sesión de "Pantry"
- **THEN** la respuesta es un conflicto y nada cambia

#### Scenario: Standalone receipt

- **WHEN** una petición intenta adjuntar a una sesión un recibo subido desde la pantalla de recibos
- **THEN** la respuesta es un conflicto y nada cambia

## REMOVED Requirements

### Requirement: Several candidates are chosen explicitly

**Reason**: Un recibo solo puede adjuntarse al viaje desde el que se subió, así que nunca hay más de un candidato.
**Migration**: La revisión de adjuntar se abre directamente con el viaje de origen; no hay paso de elección.

### Requirement: The trip chooser tells trips apart

**Reason**: Sin varios candidatos desaparece el selector de viaje y su orden por tienda.
**Migration**: La revisión de adjuntar sigue mostrando nombre, tienda y estado del viaje de origen.
