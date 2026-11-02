## ADDED Requirements

### Requirement: The upload sheet says what is read from the receipt

La hoja de subida de recibos SHALL decir que se leen la tienda, la fecha y el total, y que el usuario los confirma antes de
guardar nada. Su botón SHALL decir "Upload", o "Upload N Photos" con más de una foto. El progreso SHALL decir cuántas fotos
suben y pedir mantener la pantalla abierta, sin inventar un porcentaje.

#### Scenario: One photo
- **WHEN** el usuario elige una foto
- **THEN** el botón dice "Upload"

#### Scenario: Several photos
- **WHEN** el usuario elige tres fotos
- **THEN** el botón dice "Upload 3 Photos"

### Requirement: A rejected photo says how to fix it

Una foto de más de 10 MB SHALL rechazarse con "Photos must be under 10 MB. Retake it with the flash off, or lower the camera
quality."; una foto HEIC con "HEIC isn’t supported yet. Export it as JPG or PNG and add it again.". Las fotos rechazadas
se dejan fuera y las demás se suben.

#### Scenario: Oversized photo
- **WHEN** el usuario añade una foto de 14 MB
- **THEN** la foto queda fuera con el mensaje de más de 10 MB y las demás siguen subiéndose

### Requirement: Lists is a flat screen with its own name

La pantalla de listas SHALL llamarse "Lists" en su título, el menú lateral, el breadcrumb y la tarjeta del dashboard, y MUST NOT
ofrecer un enlace "Back to Dashboard".

#### Scenario: Open Lists
- **WHEN** el usuario abre la pantalla de listas
- **THEN** su título es "Lists" y no hay enlace de vuelta al dashboard

### Requirement: Deleting a list says what goes with it

La confirmación de borrar una lista con ítems SHALL decir cuántos se borran con ella, que quienes la comparten pierden el
acceso y que no se puede deshacer; sin ítems, omite el recuento.

#### Scenario: List with items
- **WHEN** el usuario borra una lista de 8 ítems
- **THEN** la confirmación dice "The 8 items in this list are deleted with it. People it is shared with lose access. This can’t be undone."

### Requirement: An empty list offers two ways to fill it

Una lista sin ítems SHALL ofrecer "Add Item" y "Upload Receipt". Su "Start Shopping" SHALL abrir la hoja que explica que hay
que añadir ítems, con el botón de confirmar deshabilitado.

#### Scenario: Empty list
- **WHEN** el usuario abre una lista recién creada
- **THEN** ve "Add Item" y "Upload Receipt", y "Start Shopping" abre la hoja que pide añadir ítems

### Requirement: A read receipt is reviewed under its own title

La pantalla de un recibo leído SHALL titularse "Review receipt" con la fecha, el número de ítems y el total, y SHALL mostrar
su tarjeta de tienda sobre los ítems, con el texto leído ("Read as “<texto>”") y "Change Store".

#### Scenario: Read receipt
- **WHEN** el usuario abre un recibo leído de 15 ítems y $88.93
- **THEN** el título es "Review receipt", el subtítulo "<fecha> · 15 items · $88.93" y la tarjeta de tienda va antes de los ítems

### Requirement: A change the person makes is not announced to them

Un cambio hecho desde esta pestaña MUST NOT producir el aviso "List updated" de su propio eco en tiempo real; la pantalla se
refresca igualmente. Un cambio de otra persona SHALL seguir avisando.

#### Scenario: Own edit
- **WHEN** el usuario edita un ítem y llega el evento en tiempo real de ese cambio
- **THEN** la pantalla se refresca sin el aviso "List updated"

### Requirement: The Install App button renders the same on server and client

El botón "Install App" MUST NOT leer el user-agent ni `window` durante el render, de modo que en un teléfono el HTML del
servidor y el primer render coincidan y no haya error de hidratación.

#### Scenario: Phone
- **WHEN** se carga cualquier pantalla autenticada con un user-agent móvil
- **THEN** la consola no registra "Hydration failed"