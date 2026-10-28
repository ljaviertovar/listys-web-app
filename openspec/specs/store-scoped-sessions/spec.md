# store-scoped-sessions Specification

## Purpose

Permitir que un viaje de compra se centre en una tienda ("hoy voy a No Frills") sin dividir la lista base: lo que se
compra allí aparece primero, el resto espera plegado, y la tienda elegida queda registrada en la sesión.

## Requirements

### Requirement: Starting a session offers an optional store

La confirmación de empezar una compra SHALL permitir elegir una de las tiendas del propietario o ninguna; sin elección la
sesión recorre la lista entera como hasta ahora. SHALL poder crearse una tienda escribiendo su nombre desde la misma
elección. Una tienda ajena o inexistente MUST rechazarse con `404` sin crear la sesión.

#### Scenario: Start without a store

- **WHEN** el propietario empieza una compra de "Pantry" sin elegir tienda
- **THEN** la sesión se crea sin tienda y contiene todos los artículos de la lista en una sola vista, como hasta ahora

#### Scenario: Start at a store

- **WHEN** el propietario elige "No Frills" al empezar una compra de "Pantry"
- **THEN** la sesión se crea con la tienda "No Frills" registrada

#### Scenario: Store created at start

- **WHEN** el propietario sin tiendas escribe "Costco" en la elección de tienda al empezar una compra
- **THEN** se crea la tienda "Costco" y la sesión empieza con ella

#### Scenario: Another user's store

- **WHEN** una petición para empezar una sesión envía el identificador de una tienda de otro usuario
- **THEN** recibe `404` y no se crea ninguna sesión

### Requirement: A store-scoped session lists that store's items first

Una sesión con tienda SHALL contener todos los artículos de la lista. Los que tienen esa tienda como habitual o se
compraron alguna vez allí SHALL formar una sección propia al principio; el resto, de otras tiendas o sin tienda, SHALL ir
en una sección plegada por defecto que el usuario puede abrir y en la que también puede marcar ítems.

#### Scenario: Mixed list

- **WHEN** "Pantry" tiene "Milk" (habitual "No Frills"), "Eggs" (comprado una vez en "No Frills"), "Rice" (habitual "Costco") y "Foil" (sin tienda), y se empieza una compra en "No Frills"
- **THEN** la sesión muestra primero "Milk" y "Eggs", y "Rice" y "Foil" quedan en la sección plegada de otras tiendas y sin tienda

#### Scenario: Buying something from the folded section

- **WHEN** el usuario abre la sección plegada y marca "Foil"
- **THEN** "Foil" queda marcado y se aplica a la lista al completar igual que cualquier otro ítem

#### Scenario: Store with no known items

- **WHEN** se empieza una compra en una tienda donde no hay ningún artículo de la lista
- **THEN** la confirmación lo advierte antes de empezar y la sesión muestra todos los ítems en la sección de otras tiendas, abierta

#### Scenario: Item added during the trip

- **WHEN** el usuario añade un ítem a una sesión con tienda
- **THEN** el ítem aparece en la sección de la tienda

### Requirement: The session keeps the sections it started with

Las secciones de una sesión con tienda SHALL fijarse al empezarla. Cambios posteriores en las etiquetas o estadísticas de
los artículos MUST NOT mover ítems entre secciones durante el viaje. Dentro de cada sección SHALL mantenerse el orden de
compra existente: lo pendiente arriba y por categoría.

#### Scenario: Tag edited mid-trip

- **WHEN** durante una sesión en "No Frills" otra pantalla cambia la tienda habitual de "Rice" a "No Frills"
- **THEN** "Rice" sigue en la sección de otras tiendas de esa sesión

### Requirement: The session shows the store it is for

Una sesión con tienda SHALL mostrar el nombre de la tienda en su cabecera, en la sección de la tienda y en el historial
de compras. Si quien la ve no puede leer esa tienda, SHALL mostrarse un texto genérico sin nombre de tienda y sin error.
Una sesión sin tienda MUST NOT mostrar ningún texto de tienda.

#### Scenario: Owner views the session

- **WHEN** el propietario abre una sesión iniciada en "No Frills"
- **THEN** la cabecera y la sección de la tienda dicen "No Frills"

#### Scenario: Collaborator joins a scoped session

- **WHEN** un colaborador abre la sesión en curso iniciada en "No Frills" de una lista compartida
- **THEN** ve las mismas secciones con un título genérico para la sección de la tienda y sin el nombre de la tienda

#### Scenario: Completed scoped session in history

- **WHEN** el propietario abre el historial con una sesión completada en "No Frills"
- **THEN** esa sesión muestra "No Frills"

### Requirement: Unchecked items stay for the next trip

Completar una sesión con tienda SHALL aplicar a la lista solo los ítems marcados, de cualquier sección. Los ítems sin
marcar de ambas secciones MUST quedar en la lista base sin cambios para el siguiente viaje.

#### Scenario: Leftovers of another store

- **WHEN** se completa una sesión en "No Frills" con "Rice" (habitual "Costco") sin marcar
- **THEN** "Rice" sigue en la lista con sus contadores y tienda habitual sin cambios
