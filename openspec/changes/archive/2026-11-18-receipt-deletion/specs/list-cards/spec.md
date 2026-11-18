# Spec Delta

## MODIFIED Requirements

### Requirement: The card opens the list and offers its actions in a menu
El pie de la tarjeta SHALL ser "View Items"; una lista con un viaje activo SHALL conservar "Resume Shopping". El menú SHALL ofrecer Edit List y Share, y SHALL ofrecer Delete List solo cuando la lista no tenga un viaje activo.

#### Scenario: List being shopped
- **WHEN** una lista tiene un viaje activo
- **THEN** su tarjeta ofrece "Resume Shopping" en lugar de "View Items" y el menú no ofrece "Delete List"

#### Scenario: List not being shopped
- **WHEN** una lista no tiene un viaje activo
- **THEN** su tarjeta ofrece "View Items" y su menú ofrece "Delete List"

## REMOVED Requirements

### Requirement: Deleting a list can be undone for a few seconds
**Reason**: La decisión de producto elimina el periodo de Undo para que la confirmación represente el momento real del borrado.
**Migration**: Borrar la lista inmediatamente después de confirmar; conservar el bloqueo de listas con viaje activo.

## ADDED Requirements

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
