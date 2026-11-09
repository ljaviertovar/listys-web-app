# trip-receipts Specification

## Purpose
Que un viaje completado pida y recuerde sus recibos: el recibo cierra el viaje con los precios y el total reales.

## Requirements

### Requirement: Completing a trip asks for its receipts

Al completar un viaje, la app SHALL abrir su página con una tarjeta centrada con un icono de bolsa verde de 64px, "Trip saved",
el número de ítems actualizados y la lista, y debajo un aviso amarillo "No receipt yet" con "Having no receipt never leaves the
trip incomplete.". SHALL ofrecer "Upload New Receipt" (primario) y "View Trip" (secundario), y cerrar con "You can add a
receipt later from Trips, with no deadline.". MUST NOT mencionar un plazo para adjuntarlo, ofrecer elegir un recibo ya subido
ni ofrecer "Keep It Separate". Un recibo subido desde aquí SHALL seguir los estados de la tarjeta de recibo del viaje
(leyendo, listo, ilegible).

#### Scenario: Complete a trip

- **WHEN** el usuario completa un viaje con 10 ítems marcados
- **THEN** ve el icono de bolsa verde, "Trip saved", "10 items updated in <lista>", el aviso amarillo "No receipt yet",
  "Upload New Receipt", "View Trip" y "You can add a receipt later from Trips, with no deadline.", sin ningún aviso de 48
  horas y sin "Choose Uploaded Receipt" ni "Keep It Separate"

#### Scenario: Uploaded receipts available

- **WHEN** el usuario completa un viaje y tiene un recibo leído sin adjuntar ni añadir a una lista
- **THEN** no ve "Choose Uploaded Receipt": solo "Upload New Receipt" y "View Trip"

#### Scenario: View the trip

- **WHEN** el usuario pulsa "View Trip" en "Trip saved"
- **THEN** se abre el detalle del viaje completado, con la tarjeta "Estimated" y la tarjeta "No receipt" con "Upload New
  Receipt"

#### Scenario: Upload right after saving

- **WHEN** el usuario pulsa "Upload New Receipt" en "Trip saved" y sube un recibo
- **THEN** sigue en el viaje y ve la tarjeta azul "Reading your receipt…"

### Requirement: A completed trip without a receipt says so

El detalle de un viaje completado SHALL mostrar el título del viaje con, a su derecha, su estado ("Completed") como único pill
con punto; bajo el título, una fila de clasificación con la tienda del viaje como entidad (si la hay) y el estado de su recibo
como etiqueta con icono ("Receipt attached", o "No receipt" en tono de atención), y una línea de datos con día de la semana,
día y mes ("Thu 19 Feb"), la hora y el importe, en ese orden y con el importe al final. Sin recibo, una visita posterior
SHALL mostrar la tarjeta "No receipt" con "Add a receipt to save the real total and prices." y SHALL ofrecer directamente
"Upload New Receipt" como único botón, sin elegir un recibo ya subido y sin "Keep It Separate". Encima SHALL mostrar
la tarjeta "Estimated" con el estimado ("≈ $62.40"), los ítems y cuántos tienen precio conocido ("10 items · 9 with known
prices") cuando hay estimación. Un viaje con recibo adjunto
MUST NOT mostrar esa tarjeta, y un viaje en curso tampoco.

#### Scenario: Later visit

- **WHEN** el usuario abre desde "Trips" un viaje completado sin recibo
- **THEN** ve el título con el pill "Completed" a su derecha, la etiqueta "No receipt", la tarjeta "No receipt" y el único
  botón "Upload New Receipt", sin "Choose Uploaded Receipt" ni "Keep It Separate"

#### Scenario: Estimate of a trip without receipts

- **WHEN** un viaje completado sin recibo tiene 10 ítems, 9 con precio conocido, y un estimado de $62.40
- **THEN** ve la tarjeta "Estimated" con "≈ $62.40" y "10 items · 9 with known prices" sobre la tarjeta "No receipt"

#### Scenario: Header hierarchy

- **WHEN** el usuario abre un viaje completado en "No Frills", con recibo adjunto, cerrado el jueves 19 de febrero a las 18:40
  con un total de $62.40
- **THEN** bajo el título ve "No Frills" como entidad y "Receipt attached" como etiqueta, y debajo "Thu 19 Feb · 18:40 · $62.40"
  con las cifras en mono

#### Scenario: Opened from Add Receipt in Trips

- **WHEN** el usuario llega al viaje pulsando "Add Receipt" en su tarjeta de "Trips"
- **THEN** el detalle muestra la tarjeta "No receipt" con "Upload New Receipt" ya visible, sin abrir ninguna hoja intermedia

#### Scenario: Trip of a shared list

- **WHEN** un colaborador abre un viaje completado que no hizo él
- **THEN** ve que el viaje no tiene recibo pero no se le ofrece subir un recibo

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

### Requirement: The trip receipt card offers to upload a receipt

La tarjeta de recibo del detalle de un viaje sin recibo SHALL ofrecer un único camino como botón directo: subir un recibo
nuevo ("Upload New Receipt"), que lleva a leerlo, revisarlo y adjuntarlo al viaje. El detalle MUST NOT ofrecer elegir un
recibo ya subido ni abrir una hoja intermedia "Add Receipt". "Add Receipt" SHALL existir solo como acción de la tarjeta del
viaje en "Trips".

#### Scenario: Choose the path

- **WHEN** el usuario abre un viaje completado sin recibo
- **THEN** ve "Upload New Receipt" en la tarjeta, sin pulsar nada antes y sin ningún botón para elegir un recibo ya subido

#### Scenario: No intermediate sheet

- **WHEN** el usuario pulsa "Upload New Receipt"
- **THEN** empieza la subida del recibo, sin una hoja "Add Receipt" previa

#### Scenario: Pick an uploaded receipt

- **WHEN** el usuario tiene un recibo ya subido y leído, sin adjuntar, abre un viaje completado sin recibo
- **THEN** la tarjeta del viaje no lo lista ni abre ninguna lista de recibos; ese recibo se adjunta desde su propia pantalla
  cuando se subió desde este viaje

#### Scenario: Upload leads to the review

- **WHEN** el usuario sube un recibo desde la tarjeta y termina su lectura
- **THEN** la tarjeta pasa de "Reading your receipt…" a "Your receipt is ready" con "Review Receipt"

### Requirement: The trip follows the reading of a receipt uploaded from it

Mientras el recibo más reciente subido desde un viaje, sin adjuntar ni añadir a una lista, se lee, el viaje SHALL decir que
lo está leyendo y actualizarse solo cuando termine. Su tarjeta de recibo SHALL mostrarse con el tono de su estado y un icono
de 32px: azul, con el icono girando, "Reading your receipt…" y "This takes a few seconds. You can leave this page; we keep
reading.", sin botones ni chip de estado; verde con "Your receipt is ready", "Check it against this trip before anything
changes." y "Review Receipt"; rojo con "We couldn’t read this receipt", "Open it to try again, or upload a different
receipt.", "Open Receipt" y "Upload New Receipt" (primario). El cambio de estado SHALL anunciarse de forma cortés y el estado
MUST NOT depender solo del color. El icono de lectura MUST dejar de girar si el usuario prefiere movimiento reducido.

#### Scenario: Receipt being read

- **WHEN** el usuario sube un recibo desde el viaje
- **THEN** el viaje muestra la tarjeta azul "Reading your receipt…" con el icono girando, sin botones, sin chip de estado, sin
  la revisión y sin el texto "Review how this receipt will update the trip"

#### Scenario: Reading finishes

- **WHEN** la lectura del recibo termina mientras el usuario está en el viaje
- **THEN** la tarjeta pasa a verde con "Review Receipt" sin recargar la página a mano, y el cambio se anuncia

#### Scenario: Come back later

- **WHEN** el usuario sale del viaje durante la lectura y vuelve con el recibo ya leído
- **THEN** el viaje ofrece "Review Receipt" para ese recibo

#### Scenario: Reading fails

- **WHEN** la lectura del recibo falla
- **THEN** la tarjeta roja dice que no pudo leerlo y ofrece "Open Receipt" y "Upload New Receipt"

#### Scenario: Reduced motion

- **WHEN** el usuario prefiere movimiento reducido y el recibo se está leyendo
- **THEN** el icono de lectura no gira y el título sigue diciendo que se está leyendo

#### Scenario: Viewer who did not run the trip

- **WHEN** un colaborador ve un viaje cuyo recibo se está leyendo, está listo o falló
- **THEN** ve la tarjeta con el estado y su texto, sin botones

### Requirement: The trip review appears only with a receipt ready

La revisión SHALL abrir únicamente con artículos legibles. Su título SHALL ser "Review receipt" en una compra activa o
"Attach to <trip>" en un viaje completado. La introducción, tienda, contadores y secciones SHALL aparecer directamente
bajo el título, sin una segunda descripción con fecha, nombre del viaje o "Review how this receipt will update the trip".

#### Scenario: Review ready

- **WHEN** el usuario abre la revisión de un recibo con artículos
- **THEN** ve el título y la introducción una sola vez, seguidos de tienda, contadores y secciones

#### Scenario: Loading the review

- **WHEN** las coincidencias todavía cargan
- **THEN** ve un mensaje de carga accesible y todavía no se ofrecen decisiones ni acciones de adjuntar

### Requirement: A receipt without product lines is unreadable

Gemini y OpenAI SHALL clasificar como failed cualquier lectura que no obtenga artículos, aunque haya una tienda o un total.
Las fotos SHALL evaluarse en conjunto. La app SHALL presentar también como ilegibles los recibos históricos completed con
cero artículos, sin reescribirlos, y MUST NOT permitir revisarlos ni adjuntarlos. La API SHALL rechazarlos con 422 antes de la RPC.

#### Scenario: Empty image or total only

- **WHEN** ninguna foto produce artículos, aunque se reconozca un total
- **THEN** se muestra la tarjeta roja con Open Receipt y Upload New Receipt, nunca Your receipt is ready

#### Scenario: Products on another photo

- **WHEN** una foto no tiene artículos pero otra contiene productos
- **THEN** se conservan los productos y la lectura puede completarse

#### Scenario: Historical empty success

- **WHEN** se abre un recibo histórico completed con cero artículos
- **THEN** se ofrecen las acciones de recuperación sin modificar registros ni permitir adjuntarlo

### Requirement: Trip navigation follows completion

El estado del viaje cargado por la página SHALL seleccionar Lists mientras está activo y Trips cuando está completado,
incluyendo Trip saved y la apertura directa de una URL. MUST NOT requerir una segunda consulta del viaje.

#### Scenario: Direct completed trip

- **WHEN** se abre directamente la URL de un viaje completado
- **THEN** la única pestaña actual es Trips

#### Scenario: Active trip

- **WHEN** se abre un viaje activo
- **THEN** la única pestaña actual es Lists y el pill Shopping es azul, junto al título, sin fecha/importe bajo la cabecera

### Requirement: A trip with receipts lists them and takes another

El detalle de un viaje completado con recibos SHALL mostrar una tarjeta "Paid" con el total pagado (suma de sus recibos),
sus ítems, su número de tiendas y el estimado que tenía, y debajo cada recibo con su tienda, ítems, total y "View
Receipt". SHALL ofrecer "Add Another Receipt", que empieza la subida de un recibo nuevo, sin hoja intermedia ni lista de
recibos ya subidos.

#### Scenario: Trip with two receipts

- **WHEN** el viaje tiene un recibo de "No Frills" de $86.40 con 13 ítems y otro de "Costco" de $41.12 con 4 ítems y el
  estimado era $119.80
- **THEN** ve "Paid $127.52", "17 items · 2 stores", "Estimate was $119.80" y las dos filas con "View Receipt"

#### Scenario: Add another receipt

- **WHEN** el usuario pulsa "Add Another Receipt"
- **THEN** empieza la subida de un recibo nuevo, sin una hoja de opciones y sin la lista de recibos ya subidos

#### Scenario: Header with two stores

- **WHEN** el viaje se inició en "No Frills" y tiene recibos de "No Frills" y "Costco"
- **THEN** su encabezado muestra "No Frills" y "Costco" como entidades, "No Frills" primero, la etiqueta "2 receipts" y el
  total pagado al final de la línea de datos

#### Scenario: Viewer who did not run the trip

- **WHEN** un colaborador abre un viaje con recibos
- **THEN** ve el total pagado y los recibos, sin "Add Another Receipt"

### Requirement: An active trip takes receipts while shopping

Un viaje activo SHALL permitir subir y revisar recibos, mostrar sus estados y sumar únicamente los totales adjuntados. Solo quien hizo el viaje SHALL tener acciones para subir.

#### Scenario: Complete contract for an active trip takes receipts while shopping

- **WHEN** se presenta este flujo al usuario
- **THEN** Mientras un viaje está en curso, el menú "Actions" de la compra SHALL incluir "Upload Receipt", antes de "Complete Shopping" y
  "Cancel Shopping". Un recibo subido desde ahí SHALL leerse sin sacar al usuario de la compra, y el viaje SHALL seguir en
  "Shopping". Cuando el viaje tiene recibos subidos desde él, la pantalla SHALL mostrar una tarjeta con "Paid so far" (la suma de
  los totales de los recibos ya adjuntados), "<N> receipts · <M> to review" y una fila por recibo con su tienda como entidad, sus
  ítems y su total. Un recibo leído y aún sin adjuntar SHALL llevar la etiqueta amarilla "Pending attachment" y el enlace "Review
  Receipt"; uno adjuntado, la etiqueta neutra "Attached to trip" y el enlace "View Receipt". La tarjeta SHALL ofrecer "Add Another
  Receipt", que empieza la subida de un recibo nuevo. Un colaborador que no hizo el viaje MUST NOT ver "Upload Receipt" ni "Add
  Another Receipt".

#### Scenario: Upload from Actions

- **WHEN** el propietario abre "Actions" en una compra en curso
- **THEN** ve "Upload Receipt", "Complete Shopping" y, tras un separador, "Cancel Shopping"

#### Scenario: Window closed before attaching

- **WHEN** el propietario sube el recibo de "No Frills", se lee, cierra su revisión sin adjuntarlo y la compra sigue en curso
- **THEN** la fila de "No Frills" lleva la etiqueta amarilla "Pending attachment" y "Review Receipt", y el viaje sigue en "Shopping"

#### Scenario: One attached and one pending

- **WHEN** la compra tiene el recibo de "Costco" adjuntado ($41.12) y el de "No Frills" ($86.40) sin adjuntar
- **THEN** ve "Paid so far $41.12", "2 receipts · 1 to review", "Pending attachment" en "No Frills" y "Attached to trip" en
  "Costco" con "View Receipt"

#### Scenario: Viewer who did not run the trip

- **WHEN** un colaborador abre la compra en curso
- **THEN** no ve "Upload Receipt" en "Actions" ni "Add Another Receipt"

### Requirement: The items of a trip show what was bought

Las filas del viaje SHALL mostrar cantidad, nombre, nota, tiendas y precio según el estado del viaje; solo los viajes activos SHALL permitir marcar y tachar ítems.

#### Scenario: Complete contract for the items of a trip show what was bought

- **WHEN** se presenta este flujo al usuario
- **THEN** Cada ítem de un viaje, en curso o completado, SHALL mostrarse en una fila con: la cantidad con su unidad en una caja a la
  izquierda del nombre; el nombre; debajo, la nota del ítem (si la hay) con un icono de mensaje; una fila de tienda con la tienda
  donde se compra habitualmente como entidad y, solo si el ítem también se compró en otra, el texto "Also at <tienda>" a su
  derecha; y a la derecha el precio: con "avg" solo en la compra en curso, donde es el promedio de las tiendas en que se compra el ítem;
  sin "avg" en un viaje completado, donde es el precio del recibo; o "No price yet" cuando no hay. La fila MUST NOT llevar el menú ⋯ ni etiquetas de origen como "From
  receipt". En un viaje en curso la fila SHALL llevar un checkbox al inicio y, marcada, el nombre tachado y en gris. En un viaje
  completado el ítem MUST NOT mostrarse tachado ni con checkbox. Los ítems SHALL agruparse por categoría bajo un encabezado
  plegable con su conteo.

#### Scenario: Item with every datum

- **WHEN** "2% Milk 4L" está en una compra en curso con cantidad 1 unit, la nota "Lactose-free if on sale", tienda habitual
  "No Frills", también se compró en "Costco" y su precio promedio es $6.29
- **THEN** su fila muestra la caja "1 unit" a la izquierda del nombre, la nota con el icono de mensaje debajo, "No Frills" como
  entidad seguida de "Also at Costco", y "$6.29 avg" a la derecha

#### Scenario: Item bought only at its usual store

- **WHEN** "Large Eggs 12" solo se compró en "No Frills"
- **THEN** su fila muestra "No Frills" como entidad y ningún texto "Also at"

#### Scenario: Item without a price

- **WHEN** un ítem no tiene precio
- **THEN** su fila muestra "No price yet" a la derecha y su caja de cantidad sigue a la izquierda del nombre

#### Scenario: Price on a completed trip

- **WHEN** el viaje completado tiene un recibo que fijó $4.49 como precio pagado de "Large Eggs 12"
- **THEN** su fila muestra "$4.49" sin "avg"

#### Scenario: Checked item on an active trip

- **WHEN** el usuario marca "PC Grk Strwbry" en la compra en curso
- **THEN** su fila muestra el checkbox marcado, el nombre tachado en gris y la caja de cantidad atenuada

#### Scenario: Item on a completed trip

- **WHEN** el usuario abre un viaje completado donde "PC Grk Strwbry" se marcó durante la compra
- **THEN** su fila no muestra checkbox ni el nombre tachado

### Requirement: Attached receipt totals determine the paid summary in every trip state

La tarjeta de recibos SHALL calcular el pagado como suma de los totales confirmados de sus recibos adjuntos, tanto en trips activos como completados. SHALL usar el importe confirmado al adjuntar, incluida su corrección, y excluir recibos pendientes. MUST NOT sumar precios de ítems ni usar el estimado o un total guardado del trip como sustituto.

#### Scenario: Multiple attached receipts during shopping

- **WHEN** un trip activo tiene recibos adjuntos por 86.40 y 41.12 y otro pendiente por 20.00
- **THEN** `Paid so far` muestra 127.52, sin incluir los 20.00 pendientes

#### Scenario: Same receipts after completion

- **WHEN** se completa el trip anterior sin cambiar sus recibos
- **THEN** `Paid` muestra los mismos 127.52

#### Scenario: Corrected attachment total

- **WHEN** un recibo leído como 86.40 se adjunta con total confirmado 82.50 y otro adjunto tiene total 41.12
- **THEN** la tarjeta muestra 123.62 tanto en modo activo como completado
- **AND** el total leído originalmente se conserva y no se suma en lugar del confirmado

#### Scenario: Receipt becomes attached

- **WHEN** se confirma la revisión de un recibo por 20.00 en un trip con otros adjuntos por 41.12
- **THEN** el pagado pasa a 61.12 sin volver a contar los otros recibos

#### Scenario: An attached receipt is deleted

- **WHEN** se elimina un recibo adjunto por 20.00 y queda otro por 41.12
- **THEN** la tarjeta recalcula el pagado como 41.12 en cualquiera de los dos estados del trip

### Requirement: The paid summary preserves unavailable and pending states

La tarjeta SHALL mostrar el pagado solo si hay recibos adjuntos y todos tienen total confirmado conocido; en caso contrario el importe SHALL ser no disponible. Un trip activo sin recibos adjuntos SHALL conservar las filas de pendientes sin tarjeta de pagado. Un total confirmado de cero SHALL ser un importe conocido válido.

#### Scenario: Attached receipt with an unknown total

- **WHEN** hay recibos adjuntos por 41.12 y por importe desconocido
- **THEN** la tarjeta muestra un guion como importe no disponible en ambos estados del trip, sin presentar 41.12 como total completo

#### Scenario: Pending receipts do not hide known attached totals

- **WHEN** el único adjunto tiene total 41.12 y hay otro pendiente sin total conocido
- **THEN** la tarjeta muestra 41.12

#### Scenario: Zero total is known

- **WHEN** el único recibo adjunto tiene total confirmado 0.00
- **THEN** la tarjeta muestra 0.00 y no lo trata como importe desconocido

#### Scenario: No attached receipts

- **WHEN** el trip activo solo tiene recibos pendientes
- **THEN** muestra sus estados sin tarjeta `Paid so far`
- **AND** después de completar no presenta el estimado ni un total antiguo como pagado de esos recibos

### Requirement: Receipt review waits for local checked intentions

Antes de abrir la revisión de un recibo contra un trip activo, la interfaz SHALL confirmar sus checks locales pendientes y cargar los datos actuales del trip. Antes de confirmar el adjunto SHALL comprobar de nuevo que no quedan pendientes ni conflictos. Si la sincronización falla, SHALL conservar la intención y ofrecer reintento sin adjuntar el recibo.

#### Scenario: Open review while checks are saving

- **WHEN** el usuario abre la revisión con checks pendientes o en vuelo
- **THEN** se espera su confirmación antes de cargar la revisión

#### Scenario: Confirmation encounters an unresolved check

- **WHEN** se intenta confirmar un recibo y existe un check local sin confirmar o un conflicto
- **THEN** el adjunto espera la sincronización y la resolución del conflicto
- **AND** un fallo no modifica el trip ni el recibo por esa acción

### Requirement: Receipt mutations participate in item versioning

Las modificaciones efectivas de campos editables de un ítem causadas por adjuntar un recibo SHALL incrementar su versión del servidor en la misma transacción. Los ítems nuevos SHALL obtener una versión inicial. Un check pendiente basado en datos anteriores al recibo MUST NOT sobrescribir sus cambios sin reconciliación.

#### Scenario: Receipt changes an existing item

- **WHEN** un recibo cambia el check o la cantidad de un ítem existente
- **THEN** el ítem refleja una versión superior al confirmar el adjunto
- **AND** una edición con la versión anterior recibe conflicto o rechazo por sesión completada

#### Scenario: Receipt adds an item

- **WHEN** el adjunto añade un ítem nuevo al trip
- **THEN** ese ítem aparece con una versión válida para futuras lecturas

### Requirement: Receipt attachment coordinates with manual saves

El adjunto de recibos SHALL coordinarse transaccionalmente con los guardados manuales y la finalización de la misma sesión. SHALL conservar la posibilidad existente de adjuntar recibos a trips completados, sin permitir por ello checks manuales tardíos ni duplicar el aprendizaje de la lista.

#### Scenario: Attach after a queued save

- **WHEN** un check se confirma antes de que comience la transacción del adjunto
- **THEN** el adjunto parte del estado confirmado y conserva las reglas existentes de reconciliación

#### Scenario: Attach to completed trip

- **WHEN** el propietario adjunta un recibo válido a un trip completado
- **THEN** se mantienen las reglas actuales de recibos y precios reales
- **AND** el trip no vuelve a aceptar ediciones manuales de checks
