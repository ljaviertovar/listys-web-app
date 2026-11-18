# Spec Delta

## MODIFIED Requirements

### Requirement: The card opens the list and offers its actions in a menu
El pie de la tarjeta SHALL ser "View Items"; una lista con un viaje activo SHALL conservar "Resume Shopping". El menú SHALL ofrecer Edit List y Share; SHALL ofrecer Delete List solo cuando la lista no tenga un viaje activo.

#### Scenario: List being shopped
- **WHEN** una lista tiene un viaje activo
- **THEN** su tarjeta ofrece "Resume Shopping" en lugar de "View Items" y el menú no ofrece "Delete List"

#### Scenario: List not being shopped
- **WHEN** una lista no tiene un viaje activo
- **THEN** su tarjeta ofrece "View Items" y su menú ofrece "Delete List"

## ADDED Requirements

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
