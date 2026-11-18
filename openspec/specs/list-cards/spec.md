# list-cards Specification

## Purpose
Que cada tarjeta de la pantalla Lists diga cuándo se compró por última vez la lista, con quién se comparte y cuál es la lista
por defecto.

## Requirements

### Requirement: The card says when the list was last shopped and who shares it

La tarjeta SHALL mostrar "Last trip <fecha>" con la fecha del último viaje completado de la lista, o "No trips yet", y, si la
lista se comparte, " · Shared with N people" (o "1 person").

#### Scenario: Shopped and shared
- **WHEN** una lista tiene un viaje completado y dos colaboradores
- **THEN** la tarjeta dice "Last trip <fecha> · Shared with 2 people"

### Requirement: The default list is marked

La lista por defecto del usuario SHALL llevar el chip "Default". Un usuario MUST NOT tener más de una lista por defecto, y la
Pantry de una cuenta nueva nace marcada.

#### Scenario: Marked list
- **WHEN** una lista tiene `is_default`
- **THEN** su tarjeta muestra "Default" y las demás no

### Requirement: The card opens the list and offers its actions in a menu
El pie de la tarjeta SHALL ser "View Items"; una lista con un viaje activo SHALL conservar "Resume Shopping". El menú SHALL ofrecer Edit List y Share; SHALL ofrecer Delete List solo cuando la lista no tenga un viaje activo.

#### Scenario: List being shopped
- **WHEN** una lista tiene un viaje activo
- **THEN** su tarjeta ofrece "Resume Shopping" en lugar de "View Items" y el menú no ofrece "Delete List"

#### Scenario: List not being shopped
- **WHEN** una lista no tiene un viaje activo
- **THEN** su tarjeta ofrece "View Items" y su menú ofrece "Delete List"

### Requirement: Deleting a list completes from its confirmation
La confirmación de borrar una lista SHALL permanecer abierta y bloquear la pantalla mientras se completa el borrado. Si tiene éxito, la interfaz SHALL navegar a Lists y cualquier aviso SHALL carecer de "Undo"; si falla, SHALL conservar la lista y la confirmación con un error accionable, y permitir reintentar o cancelar.

#### Scenario: Confirm and delete a list
- **WHEN** el usuario confirma borrar una lista que no tiene un viaje activo y el borrado tiene éxito
- **THEN** la lista se borra inmediatamente, la interfaz navega a Lists y no se ofrece "Undo"

#### Scenario: Delete is rejected because a trip is active
- **WHEN** una solicitud intenta borrar una lista asociada a un viaje activo, incluso desde una interfaz desactualizada
- **THEN** el sistema rechaza el borrado como conflicto, conserva la lista y el viaje, y la interfaz explica que primero debe terminar o cancelarse el viaje

#### Scenario: List deletion fails
- **WHEN** falla el borrado de una lista
- **THEN** la tarjeta y la lista siguen existiendo, la confirmación continúa abierta con un error accionable y no aparece un aviso con "Undo"

### Requirement: A list with an active trip cannot be deleted
El sistema SHALL rechazar el borrado de una lista asociada a un viaje activo y conservar ambos registros. El rechazo SHALL ser un conflicto reconocible por la interfaz para explicar que primero hay que completar o cancelar el viaje.

#### Scenario: Delete requested while the trip is active
- **WHEN** se solicita borrar una lista asociada a un viaje activo, incluso desde una interfaz desactualizada
- **THEN** el sistema rechaza la solicitud como conflicto, conserva la lista y el viaje, y la interfaz informa que debe finalizarse el viaje primero

#### Scenario: Delete races with starting a trip
- **WHEN** el borrado de una lista y el inicio de un viaje para esa lista ocurren simultáneamente
- **THEN** las operaciones se serializan de modo que no se confirme el borrado mientras exista un viaje activo asociado

#### Scenario: Delete after the trip ends
- **WHEN** el viaje asociado se completa o cancela y ya no está activo
- **THEN** el usuario puede borrar la lista al confirmar, la hoja permanece bloqueada hasta refrescar Lists y no se ofrece "Undo"
