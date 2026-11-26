# needed-items Specification

## Purpose

Que una lista funcione como el cuaderno de la cocina: se marca lo que se va acabando y, al ir a comprar, el viaje lleva
solo eso.

## Requirements

### Requirement: Items stay checked until they are bought

Cada artículo de una lista base SHALL poder marcarse y desmarcarse como necesario para el próximo viaje. La marca SHALL
guardarse en el servidor: sobrevive a salir de la pantalla, cerrar la aplicación o cambiar de dispositivo, y la ven todos
los que tienen acceso a la lista. Quien no puede ver la lista MUST recibir `404`. Si no se puede guardar, la pantalla
MUST volver al estado guardado y avisar.

#### Scenario: Checked across visits

- **WHEN** el usuario marca "Eggs", cierra la aplicación y vuelve otro día
- **THEN** "Eggs" sigue marcado

#### Scenario: Locked during a trip

- **WHEN** la lista tiene un viaje activo
- **THEN** las marcas se ven pero no se pueden cambiar desde la lista

### Requirement: Select All covers what is shown

"Select All" SHALL marcar los artículos visibles con el filtro actual, o desmarcarlos si ya están todos marcados, sin
tocar los ocultos. "Clear" SHALL desmarcar todos los de la lista.

#### Scenario: Filtered by store

- **WHEN** "Rice" (Costco) está marcado, el usuario filtra por "No Frills" y pulsa "Select All"
- **THEN** se marcan los artículos de "No Frills" y "Rice" sigue marcado

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
