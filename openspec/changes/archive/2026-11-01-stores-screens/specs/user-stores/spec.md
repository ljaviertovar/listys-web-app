## ADDED Requirements

### Requirement: A store card says when it was last visited and what it is the usual store of

La tarjeta de una tienda SHALL mostrar "Last <fecha>" con su última visita (viaje o recibo) y "N items usually here" con los
artículos de los que es la tienda habitual, y SHALL marcar con "New" una tienda con un solo recibo.

#### Scenario: Store with usual items
- **WHEN** "Metro" tiene dos artículos que la tienen como habitual y una visita el 28 Oct 2026
- **THEN** su tarjeta dice "Last 28 Oct 2026 · 2 items usually here"

### Requirement: A store has its own screen

`/stores/{id}` SHALL mostrar los recibos de la tienda, sus ítems habituales y lo gastado desde el 1 de enero (viajes
completados más recibos no adjuntos a un viaje) y los nombres que imprimen sus recibos. Una tienda ajena o inexistente MUST
responder `404`.

#### Scenario: Spend
- **WHEN** una tienda tiene un viaje de $32.50 y un recibo suelto de $10 este año
- **THEN** la pantalla muestra $42.50

### Requirement: A printed name can be removed, except the store's own

El usuario SHALL poder quitar un nombre que imprimen los recibos de una tienda tras confirmar que esos recibos preguntarán a
qué tienda pertenecen. El nombre propio de la tienda MUST NOT poder quitarse (`422`), y un nombre ajeno responde `404`.

#### Scenario: Remove a name
- **WHEN** el usuario confirma quitar "NOFRILLS #3412" de "No Frills"
- **THEN** el nombre deja de resolver a la tienda y desaparece de la lista

#### Scenario: Own name
- **WHEN** se pide quitar el alias del nombre propio de la tienda
- **THEN** la respuesta es `422` y no se borra nada

### Requirement: Merging stores can be undone for a few seconds

Fusionar dos tiendas SHALL ocultar la tienda fusionada y avisar "Merged “<origen>” into “<destino>”" con "Undo" durante 6
segundos; la fusión real SHALL correr al cerrarse el aviso o al salir de la página, nunca después de "Undo", y un fallo
SHALL mostrarse y devolver la tarjeta.

#### Scenario: Undo
- **WHEN** el usuario fusiona una tienda y pulsa "Undo" a tiempo
- **THEN** la tienda vuelve y sigue existiendo