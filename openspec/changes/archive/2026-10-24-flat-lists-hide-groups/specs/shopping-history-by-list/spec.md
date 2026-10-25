# Spec Delta

## Purpose

Mostrar el historial de compras como una sola lista de viajes completados que se puede acotar a una lista base, de modo que el usuario recupere un viaje sin saber en qué grupo estaba la lista y sin que ninguna sesión pasada se pierda.

## ADDED Requirements

### Requirement: History shows every completed trip on one screen

La pantalla de historial SHALL mostrar todas las sesiones completadas del usuario, de la más reciente a la más antigua, sin agruparlas por grupo ni exigir elegir un contenedor antes. Cada viaje MUST indicar su nombre, fecha y hora de cierre, importe cuando existe y número de ítems comprados, y llevar al detalle de la sesión. El texto de la pantalla MUST NOT mencionar grupos.

#### Scenario: Account with trips in several lists

- **WHEN** el usuario tiene viajes completados de dos listas
- **THEN** los ve todos en una sola lista ordenada por fecha de cierre descendente

#### Scenario: No trips yet

- **WHEN** el usuario no ha completado ninguna compra
- **THEN** la pantalla explica que el historial se construye al completar la primera compra, sin mencionar grupos

#### Scenario: History fails to load

- **WHEN** la carga del historial falla
- **THEN** la pantalla comunica el fallo y ofrece reintentar, sin afirmar que no hay historial

### Requirement: History can be filtered by list

La pantalla de historial SHALL ofrecer un filtro por lista que contenga solo las listas con al menos un viaje completado, más la opción de ver todas. El filtro MUST reflejarse en la URL con el parámetro `list` para poder compartirlo o recargarlo, y MUST mostrar los nombres de lista desambiguados como el resto de la interfaz. Un valor de `list` desconocido o ajeno MUST tratarse como "todas" sin error ni información sobre esa lista.

#### Scenario: Filter by a list

- **WHEN** el usuario elige una lista en el filtro
- **THEN** la pantalla muestra solo los viajes de esa lista y la URL contiene `list` con su identificador

#### Scenario: Reload keeps the filter

- **WHEN** el usuario recarga la pantalla con `list` en la URL
- **THEN** el filtro sigue aplicado y muestra la misma lista elegida

#### Scenario: Return to all trips

- **WHEN** el usuario elige "All lists"
- **THEN** vuelve a ver todos los viajes y la URL ya no contiene `list`

#### Scenario: Unknown list value

- **WHEN** la URL contiene un `list` que no corresponde a una lista con viajes del usuario
- **THEN** la pantalla muestra todos los viajes y el filtro indica "All lists"

#### Scenario: List with no trips left in the filter

- **WHEN** la lista elegida no tiene viajes completados
- **THEN** no aparece en el filtro, así que no existe un estado de filtro vacío alcanzable desde la interfaz

#### Scenario: Deleted list

- **WHEN** el usuario elimina una lista, lo que ya elimina también sus sesiones (comportamiento existente que este change no modifica)
- **THEN** sus viajes dejan de aparecer en el historial y la lista deja de figurar en el filtro, sin error

### Requirement: Legacy history links lead to the flat history

El enlace antiguo `/shopping-history/{groupId}` SHALL redirigir a `/shopping-history` sin error, sea cual sea el identificador. El enlace del detalle de sesión que conserva el origen del grupo (`from=history-group&groupId=…`) MUST seguir abriendo la sesión y MUST volver al historial.

#### Scenario: Bookmarked group history

- **WHEN** el usuario abre un enlace guardado al historial de un grupo
- **THEN** llega al historial con todos sus viajes

#### Scenario: Old session link with group origin

- **WHEN** el usuario abre un detalle de sesión con el origen antiguo de grupo
- **THEN** la sesión se muestra y su enlace de vuelta lleva al historial

### Requirement: Session detail returns to where the user came from

El enlace de vuelta del detalle de una sesión SHALL llevar al historial cuando el usuario llegó desde él (conservando el filtro de lista aplicado), y a la pantalla de listas en el resto de los casos. Su etiqueta MUST nombrar ese destino y MUST NOT mencionar grupos. El enlace de vuelta del editor de una lista MUST llevar a la pantalla de listas.

#### Scenario: From a filtered history

- **WHEN** el usuario abre un viaje desde el historial filtrado por una lista y pulsa volver
- **THEN** regresa al historial con el mismo filtro aplicado y la etiqueta "Back to Shopping History"

#### Scenario: From the running trip

- **WHEN** el usuario abre una sesión sin origen de historial y pulsa volver
- **THEN** llega a la pantalla de listas con la etiqueta "Back to Lists"

#### Scenario: From the list editor

- **WHEN** el usuario abre una lista y pulsa volver
- **THEN** llega a la pantalla de listas con la etiqueta "Back to Lists"
