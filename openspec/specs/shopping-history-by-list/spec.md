# Shopping History By List Specification

## Purpose

Mostrar el historial de compras como una sola lista de viajes completados que se puede acotar a una lista base, de modo que el usuario recupere un viaje sin saber en qué grupo estaba la lista y sin que ninguna sesión pasada se pierda.

## Requirements

### Requirement: History shows every completed trip on one screen

La pantalla "Trips", en `/trips`, SHALL mostrar todas las sesiones completadas del usuario, de la más reciente a la más antigua, sin agruparlas por grupo ni exigir elegir un contenedor antes. Cada viaje MUST indicar su nombre, su fecha de cierre (día de la semana, día y mes abreviados, como "Thu 19 Feb", y el año solo cuando no es el actual), el importe cuando existe y el número de ítems comprados, y llevar al detalle de la sesión; la hora de cierre aparece en el detalle, no en la tarjeta. El texto de la pantalla MUST NOT mencionar grupos ni llamar "History" a la sección.

#### Scenario: Account with trips in several lists

- **WHEN** el usuario tiene viajes completados de dos listas
- **THEN** los ve todos en "Trips" en una sola lista ordenada por fecha de cierre descendente

#### Scenario: Date of a trip

- **WHEN** un viaje se completó el jueves 19 de febrero del año en curso con un total de $62.40
- **THEN** su tarjeta muestra "Thu 19 Feb · $62.40", sin la hora y sin el texto "Completed on"

#### Scenario: Trip from another year

- **WHEN** un viaje se completó en un año anterior
- **THEN** su fecha incluye el año

#### Scenario: No trips yet

- **WHEN** el usuario no ha completado ninguna compra
- **THEN** la pantalla explica que sus viajes aparecerán al completar la primera compra, sin mencionar grupos

#### Scenario: History fails to load

- **WHEN** la carga de los viajes falla
- **THEN** la pantalla comunica el fallo y ofrece reintentar, sin afirmar que no hay viajes

### Requirement: History can be filtered by list

La pantalla "Trips" SHALL ofrecer un filtro por lista que contenga solo las listas con al menos un viaje completado, más la opción de ver todas. El filtro MUST reflejarse en la URL con el parámetro `list` para poder compartirlo o recargarlo, y MUST mostrar los nombres de lista desambiguados como el resto de la interfaz. Un valor de `list` desconocido o ajeno MUST tratarse como "todas" sin error ni información sobre esa lista.

#### Scenario: Filter by a list

- **WHEN** el usuario elige una lista en el filtro
- **THEN** la pantalla muestra solo los viajes de esa lista y la URL es `/trips` con `list` y su identificador

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
- **THEN** sus viajes dejan de aparecer en "Trips" y la lista deja de figurar en el filtro, sin error

### Requirement: Legacy history links lead to the flat history

Los enlaces antiguos `/shopping-history` y `/shopping-history/{groupId}` SHALL redirigir de forma permanente a `/trips` sin error, sea cual sea el identificador; `/shopping-history` MUST conservar el parámetro `list`. El enlace del detalle de sesión que conserva un origen antiguo (`from=history` o `from=history-group&groupId=…`) MUST seguir abriendo la sesión y MUST volver a "Trips".

#### Scenario: Bookmarked history

- **WHEN** el usuario abre un enlace guardado a `/shopping-history?list=<id>`
- **THEN** llega a `/trips?list=<id>` con el mismo filtro aplicado

#### Scenario: Bookmarked group history

- **WHEN** el usuario abre un enlace guardado al historial de un grupo
- **THEN** llega a "Trips" con todos sus viajes

#### Scenario: Old session link with group origin

- **WHEN** el usuario abre un detalle de sesión con el origen antiguo de grupo
- **THEN** la sesión se muestra y su enlace de vuelta lleva a "Trips"

### Requirement: Session detail returns to where the user came from

El enlace de vuelta del detalle de una sesión SHALL llevar a "Trips" cuando el usuario llegó desde ella (conservando el filtro de lista aplicado), y a la pantalla de listas en el resto de los casos. Su etiqueta MUST nombrar ese destino y MUST NOT mencionar grupos ni "History". El enlace de vuelta del editor de una lista MUST llevar a la pantalla de listas.

#### Scenario: From a filtered history

- **WHEN** el usuario abre un viaje desde "Trips" filtrada por una lista y pulsa volver
- **THEN** regresa a "Trips" con el mismo filtro aplicado y la etiqueta "Back to Trips"

#### Scenario: From the running trip

- **WHEN** el usuario abre una sesión sin origen de "Trips" y pulsa volver
- **THEN** llega a la pantalla de listas con la etiqueta "Back to Lists"

#### Scenario: From the list editor

- **WHEN** el usuario abre una lista y pulsa volver
- **THEN** llega a la pantalla de listas con la etiqueta "Back to Lists"

### Requirement: The navigation calls the section Trips

La navegación lateral, la barra de pestañas del teléfono y los enlaces del dashboard que llevan a los viajes completados SHALL llamar a la sección "Trips" y apuntar a `/trips`. MUST NOT quedar ningún texto visible "History" o "Shopping History" para esta sección.

#### Scenario: Phone tab bar

- **WHEN** el usuario abre la app en un teléfono
- **THEN** la pestaña de viajes dice "Trips" y lleva a `/trips`

#### Scenario: Dashboard link

- **WHEN** el usuario pulsa el enlace de ver todo de "Spend This Month" o un viaje reciente del dashboard
- **THEN** llega a `/trips`

### Requirement: Each trip shows its receipt status apart from its own status

Cada viaje de "Trips" SHALL mostrar su estado de viaje ("Completed") como único pill con punto, a la derecha de su título, y, por separado, el estado de sus recibos como etiqueta con icono en la fila de clasificación bajo el título, tras las tiendas del viaje (la suya primero): "Receipt attached" con uno, "<N> receipts" con varios, o "No receipt" en tono de atención sin ninguno. Bajo la clasificación SHALL ir la línea de datos, con el total pagado (suma de recibos) al final, y al final el número de ítems comprados con "View Details". El icono del viaje SHALL usar el color de los viajes (verde). No tener recibo MUST NOT cambiar ni matizar el estado del viaje.

#### Scenario: Trip with a receipt

- **WHEN** un viaje completado tiene un recibo adjunto
- **THEN** su tarjeta muestra el pill "Completed" junto al título y la etiqueta "Receipt attached" debajo

#### Scenario: Trip without a receipt

- **WHEN** un viaje completado no tiene recibo
- **THEN** su tarjeta muestra "Completed" y la etiqueta "No receipt", sin ningún texto que diga que el viaje está incompleto

#### Scenario: Trip with a store

- **WHEN** un viaje completado tiene la tienda "Costco"
- **THEN** su fila de clasificación muestra "Costco" como entidad antes de la etiqueta del recibo

#### Scenario: Trip with receipts from two stores

- **WHEN** un viaje iniciado en "No Frills" tiene recibos de "No Frills" ($86.40) y "Costco" ($41.12)
- **THEN** su tarjeta muestra "No Frills" y "Costco" como entidades, la etiqueta "2 receipts" y "$127.52" al final de su
  línea de datos

### Requirement: A trip without a receipt highlights Add Receipt

La tarjeta de un viaje sin recibo SHALL ofrecer "Add Receipt" como acción destacada bajo "View Details", que abre el detalle del viaje donde las opciones de subir un recibo nuevo o elegir uno ya subido ya están visibles. Un viaje con recibo MUST NOT ofrecerla.

#### Scenario: Add a receipt from the list

- **WHEN** el usuario pulsa "Add Receipt" en un viaje sin recibo
- **THEN** llega al detalle del viaje, donde ve "Upload New Receipt" sin abrir ninguna hoja

#### Scenario: Trip with a receipt

- **WHEN** un viaje ya tiene recibo
- **THEN** su tarjeta no ofrece "Add Receipt"
