# needed-items Specification

## Purpose

Que una lista funcione como el cuaderno de la cocina: se marca lo que se va acabando y, al ir a comprar, el viaje lleva
solo eso.

## Requirements

### Requirement: Items stay checked until they are bought

Cada artículo de una lista base SHALL poder marcarse y desmarcarse como necesario para el próximo viaje. La marca SHALL
guardarse en el servidor: sobrevive a salir de la pantalla, cerrar la aplicación o cambiar de dispositivo, y la ven todos
los que tienen acceso a la lista. Quien no puede ver la lista MUST recibir `404`.

#### Scenario: Checked across visits

- **WHEN** el usuario marca "Eggs", cierra la aplicación y vuelve otro día
- **THEN** "Eggs" sigue marcado

#### Scenario: Locked during a trip

- **WHEN** la lista tiene un viaje activo
- **THEN** las marcas se ven pero no se pueden cambiar desde la lista

### Requirement: Checks save in the background

La pantalla SHALL mostrar cada marca al instante, sin esperar al servidor y sin bloquear los controles. Los toques
seguidos SHALL agruparse y enviarse en una sola petición con el último valor de cada artículo, marcados y desmarcados
juntos: al pasar 1,5 s sin toques, o como máximo cada 10 s si no paran. SHALL haber una sola petición en curso por lista;
lo tocado mientras tanto va en la siguiente. Al recargar o cerrar la pestaña, la petición SHALL poder terminar de enviarse.

#### Scenario: Many quick taps

- **WHEN** el usuario marca y desmarca varios artículos con menos de 1,5 s entre toques, durante menos de 10 s
- **THEN** se envía una sola petición con el último valor de cada artículo y la página no se vuelve a leer

#### Scenario: Reload right after a tap

- **WHEN** hay conexión y el usuario recarga justo después de marcar un artículo, sin otra petición en curso
- **THEN** la marca queda guardada

### Requirement: Own saves do not reload the page

Guardar las propias marcas MUST NOT volver a leer la página. Si un dato leído contradice una marca ya guardada, SHALL
pedirse como máximo una lectura más por esa marca; si sigue sin coincidir, gana el servidor.

#### Scenario: Stale data after a save

- **WHEN** la página muestra un dato anterior a una marca ya guardada
- **THEN** se pide una sola lectura más, sin repetirse en bucle

### Requirement: The save state is visible

La pantalla de la lista SHALL mostrar el estado del guardado bajo el encabezado, como en un viaje: "Saving…", "Saved" o
"Not saved" con "Retry". Un guardado propio MUST NOT mostrar un aviso emergente de lista actualizada. Con la lista
bloqueada por un viaje, el estado SHALL mostrarse solo mientras queden marcas por guardar.

#### Scenario: Saving a check

- **WHEN** el usuario marca "Eggs"
- **THEN** el estado muestra "Saving…" y, cuando el servidor lo guarda, "Saved"

### Requirement: A failed save keeps or returns the check

Ante un error de red, un `408`, un `429` o un `5xx`, la marca SHALL seguir en pantalla, mostrarse como no guardada y
reintentarse con espera creciente de hasta 30 s. Ante cualquier otro `4xx`, el envío MUST NOT reintentarse: la pantalla
SHALL avisar y volver al estado del servidor.

Las marcas pendientes viven solo en memoria: no se garantiza el guardado si la pestaña se cierra sin conexión o con
cambios en espera detrás de una petición en curso.

#### Scenario: Temporary failure

- **WHEN** el guardado falla por la red
- **THEN** la marca se conserva, se muestra "Not saved" con "Retry" y se vuelve a intentar

#### Scenario: Refused

- **WHEN** el servidor responde `404` porque el usuario ya no ve la lista
- **THEN** no hay reintento, se avisa y la pantalla se vuelve a leer

### Requirement: Select All covers what is shown

"Select All" SHALL marcar los artículos visibles con el filtro actual, o desmarcarlos si ya están todos marcados, sin
tocar los ocultos. "Clear" SHALL desmarcar todos los de la lista.

#### Scenario: Filtered by store

- **WHEN** "Rice" (Costco) está marcado, el usuario filtra por "No Frills" y pulsa "Select All"
- **THEN** se marcan los artículos de "No Frills" y "Rice" sigue marcado

### Requirement: Pending checks are saved before a trip

Antes de crear el viaje, las marcas pendientes SHALL guardarse. Si no se pueden guardar, el viaje MUST NOT crearse y SHALL
mostrarse el error.

#### Scenario: Starting right after a tap

- **WHEN** el usuario marca "Eggs" y confirma "Start Shopping" antes de que la marca se haya enviado
- **THEN** la marca se guarda primero y el viaje se crea con ella

### Requirement: A trip takes the checked items

Con artículos marcados, el viaje SHALL llevar solo esos; los demás quedan en la lista sin cambios. Sin marcas SHALL
llevar la lista entera. Con una tienda elegida SHALL llevar solo los marcados de esa tienda (habitual o comprado allí);
los demás siguen marcados. Si hay marcas pero ninguna de esa tienda, el viaje SHALL comportarse como sin marcas: lista
entera con la tienda primero. La confirmación SHALL decir antes de empezar qué entra, también desde el panel y las
tarjetas. Si las marcas confirmadas ya no existen, MUST rechazarse con `409` sin crear el viaje.

#### Scenario: Only checked items

- **WHEN** "Eggs" y "Milk" están marcados en una lista de 24 artículos y empieza el viaje
- **THEN** el viaje tiene 2 artículos

#### Scenario: Store with checked items

- **WHEN** "Eggs" (No Frills) y "Rice" (Costco) están marcados y empieza el viaje en "No Frills"
- **THEN** el viaje lleva solo "Eggs", no muestra la sección de otras tiendas, y "Rice" sigue marcado

#### Scenario: Store without checked items

- **WHEN** solo "Rice" (Costco) está marcado y empieza el viaje en "FreshCo"
- **THEN** la confirmación lo advierte y el viaje lleva la lista entera con los artículos de "FreshCo" primero

#### Scenario: Checks changed elsewhere

- **WHEN** la confirmación muestra 2 marcados y otro dispositivo los desmarca antes de confirmar
- **THEN** no se crea ningún viaje y la pantalla se actualiza

### Requirement: Buying clears the check

Completar un viaje, también al adjuntar un recibo y completarlo, SHALL desmarcar los artículos comprados. Los no
comprados SHALL seguir marcados. Cancelar un viaje MUST NOT cambiar ninguna marca.

#### Scenario: Partly bought

- **WHEN** un viaje con "Eggs" y "Rice" se completa habiendo comprado solo "Eggs"
- **THEN** "Eggs" queda sin marcar y "Rice" sigue marcado
