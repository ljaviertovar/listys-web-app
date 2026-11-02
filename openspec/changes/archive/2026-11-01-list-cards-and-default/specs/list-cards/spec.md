# list-cards Specification

## Purpose

Que cada tarjeta de la pantalla Lists diga cuándo se compró por última vez la lista, con quién se comparte y cuál es la lista
por defecto, y que borrarla se pueda deshacer.

## ADDED Requirements

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

El pie de la tarjeta SHALL ser "View Items"; una lista con un viaje activo SHALL conservar "Resume Shopping". El menú SHALL
ofrecer Edit List, Share y Delete List.

#### Scenario: List being shopped
- **WHEN** una lista tiene un viaje activo
- **THEN** su tarjeta ofrece "Resume Shopping" en lugar de "View Items"

### Requirement: Deleting a list can be undone for a few seconds

Borrar una lista SHALL ocultar su tarjeta y avisar "“<nombre>” deleted" con "Undo" durante 6 segundos; el borrado real SHALL
correr al cerrarse el aviso o al salir de la página, nunca después de "Undo", y un fallo SHALL mostrarse y devolver la tarjeta.

#### Scenario: Undo
- **WHEN** el usuario borra una lista y pulsa "Undo" a tiempo
- **THEN** la tarjeta vuelve y la lista sigue existiendo

#### Scenario: Let it expire
- **WHEN** el usuario borra una lista y no pulsa "Undo"
- **THEN** la lista se borra al cerrarse el aviso