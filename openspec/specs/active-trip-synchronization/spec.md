# Active Trip Synchronization Specification

## Purpose

Mantener coherente el trip activo mientras se compra, recuperando checks pendientes y evitando sobrescrituras silenciosas entre dispositivos que editan la misma sesión.

La UI actual del trip no ofrece formularios ni menús de edición/eliminación. Este cambio no los añade ni modifica los formularios de la lista reutilizable.

## Requirements

### Requirement: Active trip views share immediate checked state

Las filas, categorías, progreso, acciones y Estimated total del trip activo SHALL reflejar el mismo estado local inmediatamente al marcar o desmarcar, sin esperar al guardado. Las reglas existentes de estimación y secciones SHALL conservarse.

#### Scenario: Check while the server is slow

- **WHEN** el usuario marca un ítem con precio conocido mientras el servidor tarda en responder
- **THEN** la fila, su agrupación, el progreso y el estimado reflejan el cambio antes de la respuesta
- **AND** los demás ítems siguen siendo interactivos

#### Scenario: Uncheck while saving

- **WHEN** se desmarca un ítem cuyo marcado aún se está guardando
- **THEN** toda la vista refleja el desmarcado y la confirmación anterior no lo revierte

### Requirement: Autosave coalesces checked intentions

Los checks SHALL guardarse tras 700 ms sin cambios y SHALL iniciar un envío a más tardar a los 2 segundos de cambios continuos cuando no haya una petición en curso ni un fallo que impida enviar. Los cambios no enviados de cada ítem SHALL reducirse a su último estado; la espera de red no constituye una garantía de confirmación en 2 segundos.

#### Scenario: Rapid repeated checks

- **WHEN** el usuario marca, desmarca y marca el mismo ítem dentro del período de espera
- **THEN** se envía únicamente el último marcado pendiente

#### Scenario: Continuous interaction

- **WHEN** el usuario sigue marcando ítems durante más de 2 segundos y no existe una petición en curso
- **THEN** se inicia el guardado sin esperar una pausa de 700 ms

### Requirement: Confirmations preserve newer local edits

Cada confirmación SHALL resolver únicamente la intención enviada. Una respuesta o evento antiguo MUST NOT sustituir un estado confirmado más nuevo ni borrar una modificación local posterior. Un cambio posterior al envío SHALL guardarse después de resolver la petición anterior.

#### Scenario: New intention during a request

- **WHEN** se envía un marcado y el usuario desmarca antes de recibir su confirmación
- **THEN** el desmarcado permanece visible y pendiente hasta confirmarse por separado

### Requirement: Pending checks survive reload and stay isolated

Los checks pendientes SHALL persistirse separados por usuario y trip, incluyendo la versión de origen. Tras recarga SHALL reconciliarse con datos actuales antes de enviarse. La recuperación MUST NOT aplicar datos de otra cuenta o sesión; cerrar sesión SHALL detener envíos y retirar de memoria los datos del usuario anterior.

#### Scenario: Reload offline changes

- **WHEN** el usuario recarga después de marcar sin conexión y vuelve a abrir el mismo trip con la misma cuenta
- **THEN** recupera los cambios pendientes y su reconciliación usa las versiones de origen

#### Scenario: Switch account

- **WHEN** otra cuenta inicia sesión en el mismo navegador
- **THEN** no ve ni envía la cola de la cuenta anterior

#### Scenario: Persistence is unavailable

- **WHEN** el navegador rechaza el almacenamiento local
- **THEN** el trip sigue funcionando en memoria e informa que los pendientes no se recuperarán tras recargar

### Requirement: Failed saves keep intentions and expose recovery

Un fallo temporal SHALL conservar los checks visibles y pendientes, mostrar el estado de sincronización y ofrecer reintento. Los reintentos automáticos SHALL espaciarse y pausarse sin conexión. Errores de autenticación, permisos, validación y conflicto MUST NOT provocar reintentos automáticos indefinidos.

#### Scenario: Temporary outage

- **WHEN** una petición falla por red o indisponibilidad temporal
- **THEN** los checks no se revierten y se muestra un estado sin guardar con reintento
- **AND** al recuperar conexión se intenta sincronizar la cola

#### Scenario: No work remains

- **WHEN** no hay cambios pendientes, peticiones ni conflictos sin resolver
- **THEN** la interfaz indica que los cambios están guardados

### Requirement: Item updates require an expected server version

Cada ítem SHALL exponer una versión entera positiva controlada por el servidor. `PATCH /api/v2/shopping-session-items/{itemId}` SHALL exigir `expected_version` y actualizar solamente si coincide con la versión actual. Una mutación efectiva SHALL incrementar la versión en la misma operación atómica; una versión distinta SHALL devolver `409 ITEM_VERSION_CONFLICT` sin escribir.

#### Scenario: Concurrent writers

- **WHEN** dos dispositivos envían cambios diferentes sobre el mismo ítem esperando la versión 5
- **THEN** solo una escritura cambia el ítem a versión 6
- **AND** la otra recibe un conflicto sin sobrescribirla

#### Scenario: Independent items

- **WHEN** dos dispositivos modifican ítems distintos de una misma sesión activa con sus versiones vigentes
- **THEN** ambos cambios pueden confirmarse sin conflicto entre sí

#### Scenario: Missing expected version

- **WHEN** un cliente invoca el PATCH v2 sin `expected_version` o con un valor inválido
- **THEN** recibe `422` sin modificar el ítem

### Requirement: All protected writes honor authorization and version ownership

Las mutaciones SHALL validar sesión y permisos existentes del usuario, y los cambios efectivos de campos editables SHALL incrementar la versión incluso desde procesos de recibos. El cliente MUST NOT asignar versiones ni eludir la comprobación mediante acceso directo o Server Actions antiguos. Un usuario sin acceso MUST NOT recibir el estado actual del ítem.

#### Scenario: Direct update bypass

- **WHEN** un cliente autenticado intenta actualizar la tabla directamente sin la operación autorizada
- **THEN** la escritura es rechazada y el ítem no cambia

#### Scenario: Unauthorized conflict probe

- **WHEN** un usuario sin acceso intenta editar un ítem con cualquier versión esperada
- **THEN** recibe `404` sin conocer su versión ni contenido

### Requirement: Conflicts require reconciliation before overwriting

Ante un conflicto, el cliente SHALL consultar o recibir el estado actual autorizado. Si ya contiene el valor deseado, SHALL resolver esa intención sin otra escritura. Si difiere, SHALL mostrar el estado confirmado y conservar la intención en un aviso con opciones para volver a aplicar o descartar; MUST NOT reenviarla automáticamente usando una versión nueva.

#### Scenario: Lost successful response

- **WHEN** un marcado se guardó pero su respuesta se perdió y el reintento recibe conflicto con el mismo valor deseado
- **THEN** la intención se resuelve con la versión actual sin otra escritura

#### Scenario: Stale offline intention

- **WHEN** un dispositivo reconecta con un cambio pendiente cuya versión ya cambió y el valor actual es diferente
- **THEN** muestra el valor confirmado y ofrece volver a aplicar o descartar la intención antigua
- **AND** volver a aplicar usa explícitamente la versión actual y puede volver a entrar en conflicto

#### Scenario: Item deleted elsewhere

- **WHEN** el ítem de una intención pendiente fue eliminado en otro dispositivo
- **THEN** se informa que ya no existe, no se recrea y no se reintenta indefinidamente

### Requirement: Realtime and reconnection preserve pending work

Las actualizaciones externas SHALL incorporarse sin borrar intenciones locales pendientes ni retroceder versiones confirmadas. Al reconectar o recuperar foco, la vista SHALL reconciliarse con una lectura actual del servidor para recuperar eventos perdidos.

#### Scenario: External update without a local edit

- **WHEN** llega una actualización externa de un ítem sin cambios locales
- **THEN** su fila y los valores derivados reflejan el estado confirmado

#### Scenario: External update with a pending edit

- **WHEN** llega una versión nueva de un ítem con cambios locales pendientes
- **THEN** no se borra ni se cambia automáticamente la versión de origen de la intención
- **AND** se aplica la reconciliación de conflictos antes de sobrescribir el servidor

### Requirement: Legacy item editors must upgrade

El PATCH v1 de ítems SHALL dejar de escribir y responder `410 CLIENT_UPDATE_REQUIRED` con indicación de recargar. Los checks actuales SHALL usar v2 y los helpers/Server Actions de edición SHALL exigir una versión esperada. Las intenciones de check SHALL conservar su versión y valor deseado ante conflicto para reaplicación o descarte explícitos.

#### Scenario: Previously opened tab saves a check

- **WHEN** una pestaña antigua intenta guardar mediante el PATCH v1
- **THEN** recibe el error de actualización requerida y la base de datos no cambia

#### Scenario: Legacy helper omits the expected version

- **WHEN** un consumidor invoca una Server Action de edición de ítems sin versión esperada
- **THEN** recibe un error de actualización requerida sin modificar el ítem
