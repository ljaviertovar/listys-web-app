# trip-receipts Specification

## Purpose
Que un viaje completado pida y recuerde sus recibos: el recibo cierra el viaje con los precios y el total reales.

## Requirements

### Requirement: Completing a trip asks for its receipts

Al completar un viaje, la app SHALL abrir su página con "Trip saved", el número de ítems actualizados y la lista, e invitar
a añadir su recibo ("Upload a Receipt", "Choose Uploaded Receipt" cuando hay recibos disponibles) o a dejarlo aparte
("Keep It Separate"). MUST NOT mencionar un plazo para adjuntarlo.

#### Scenario: Complete a trip

- **WHEN** el usuario completa un viaje con 3 ítems marcados
- **THEN** ve "Trip saved", "3 items updated in <lista>", "Upload a Receipt" y "Keep It Separate", sin ningún aviso de 48 horas

#### Scenario: Uploaded receipts available

- **WHEN** el usuario completa un viaje y tiene un recibo leído sin adjuntar ni añadir a una lista
- **THEN** también ve "Choose Uploaded Receipt"

### Requirement: A completed trip without a receipt says so

El detalle de un viaje completado SHALL mostrar el estado del viaje ("Completed") y, por separado, el estado de su recibo.
Sin recibo, una visita posterior SHALL mostrar "No receipt" y destacar "Add Receipt", sin "Keep It Separate". Un viaje con
recibo adjunto MUST NOT mostrar esa tarjeta, y un viaje en curso tampoco.

#### Scenario: Later visit

- **WHEN** el usuario abre desde "Trips" un viaje completado sin recibo
- **THEN** ve el badge "Completed", la tarjeta "No receipt" y "Add Receipt", sin "Keep It Separate"

#### Scenario: Opened from Add Receipt in Trips

- **WHEN** el usuario llega al viaje pulsando "Add Receipt" en su tarjeta de "Trips"
- **THEN** el detalle muestra ya abiertas las opciones de subir un recibo nuevo o elegir uno ya subido

#### Scenario: Trip of a shared list

- **WHEN** un colaborador abre un viaje completado que no hizo él
- **THEN** ve que el viaje no tiene recibo pero no se le ofrece "Add Receipt"

### Requirement: A receipt uploaded from a trip remembers that trip

Subir un recibo con "Upload a Receipt" o "Add Receipt" desde la página de un viaje SHALL guardar ese viaje como origen
del recibo y dejar al usuario en el viaje. Una subida desde cualquier otro punto de la app MUST NOT tener origen. La subida
SHALL rechazarse sin guardar nada si el viaje indicado no existe o no es del usuario, sin revelar cuál de las dos cosas
ocurre.

#### Scenario: Upload from the trip page

- **WHEN** el usuario completa un viaje y sube un recibo con "Upload a Receipt"
- **THEN** el recibo queda asociado a ese viaje como origen y el usuario sigue en el viaje, que muestra que el recibo se está leyendo

#### Scenario: Upload from elsewhere

- **WHEN** el usuario sube un recibo desde la pantalla de recibos o desde el botón de subir de la barra inferior
- **THEN** el recibo no tiene viaje de origen y la app abre la pantalla del recibo como hasta ahora

#### Scenario: Another user's trip

- **WHEN** una petición de subida indica la sesión de otro usuario
- **THEN** recibe `404`, no se guarda ninguna foto ni recibo

#### Scenario: Deleted origin trip

- **WHEN** el usuario elimina el viaje desde el que subió un recibo
- **THEN** el recibo se conserva y deja de tener viaje de origen

### Requirement: Add Receipt offers a new or an uploaded receipt

"Add Receipt" en el detalle de un viaje SHALL ofrecer dos caminos: subir un recibo nuevo o elegir uno ya subido. Elegir uno
ya subido SHALL abrir la revisión del viaje con ese recibo; nada cambia hasta confirmarla.

#### Scenario: Choose the path

- **WHEN** el usuario pulsa "Add Receipt" en un viaje sin recibo
- **THEN** ve "Upload New Receipt" y "Choose Uploaded Receipt"

#### Scenario: Pick an uploaded receipt

- **WHEN** el usuario elige un recibo ya subido en la lista de disponibles
- **THEN** se abre la revisión de cómo ese recibo actualizará el viaje, y ni el viaje ni el recibo cambian todavía

### Requirement: Only available receipts can be chosen for a trip

La lista para elegir SHALL contener solo recibos del usuario leídos, sin adjuntar a ningún viaje, no añadidos a una lista
y sin viaje de origen o con este viaje como origen, del más reciente al más antiguo, con tienda, fecha, total y número de
líneas. Un recibo confirmado en otra tienda que la del viaje completado SHALL aparecer sin poder elegirse, con el motivo.

#### Scenario: Receipts in several states

- **WHEN** el usuario tiene un recibo leído suelto, uno pendiente de lectura, uno ya adjunto a otro viaje y uno añadido a "Pantry"
- **THEN** la lista solo muestra el recibo leído suelto

#### Scenario: Receipt uploaded from another trip

- **WHEN** un recibo leído se subió desde otro viaje y sigue sin adjuntar
- **THEN** no aparece en la lista de este viaje

#### Scenario: Different store

- **WHEN** el viaje se completó en "Costco" y un recibo disponible está confirmado en "Metro"
- **THEN** el recibo aparece deshabilitado con el motivo de que es de otra tienda

#### Scenario: Nothing available

- **WHEN** el usuario no tiene recibos disponibles
- **THEN** la lista dice que no hay recibos subidos disponibles y ofrece subir uno nuevo

### Requirement: The trip follows the reading of a receipt uploaded from it

Mientras el recibo más reciente subido desde un viaje, sin adjuntar ni añadir a una lista, se lee, el viaje SHALL decir que
lo está leyendo y actualizarse solo cuando termine. Leído, SHALL ofrecer revisarlo ("Review Receipt"). Si la lectura falla,
SHALL explicarlo y ofrecer abrir el recibo para reintentar o añadir otro.

#### Scenario: Receipt being read

- **WHEN** el usuario sube un recibo desde el viaje
- **THEN** el viaje muestra que el recibo se está leyendo, sin la revisión ni el texto "Review how this receipt will update the trip"

#### Scenario: Reading finishes

- **WHEN** la lectura del recibo termina mientras el usuario está en el viaje
- **THEN** la tarjeta pasa a ofrecer "Review Receipt" sin recargar la página a mano

#### Scenario: Come back later

- **WHEN** el usuario sale del viaje durante la lectura y vuelve con el recibo ya leído
- **THEN** el viaje ofrece "Review Receipt" para ese recibo

#### Scenario: Reading fails

- **WHEN** la lectura del recibo falla
- **THEN** el viaje dice que no pudo leerlo y ofrece abrir el recibo y añadir otro

### Requirement: The trip review appears only with a receipt ready

La revisión de cómo un recibo actualizará el viaje, con el texto "Review how this receipt will update the trip", SHALL
mostrarse solo después de elegir un recibo ya leído o de que termine la lectura de uno subido. MUST NOT mostrarse ni
anunciarse durante la subida, la lectura o la carga de la revisión.

#### Scenario: Loading the review

- **WHEN** el usuario abre la revisión y las coincidencias aún cargan
- **THEN** ve un estado de carga del viaje sin el texto "Review how this receipt will update the trip"

#### Scenario: Review ready

- **WHEN** las coincidencias del recibo con el viaje terminan de cargar
- **THEN** la revisión muestra "Review how this receipt will update the trip" con sus grupos de líneas
