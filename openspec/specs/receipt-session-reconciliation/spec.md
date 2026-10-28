# Receipt Session Reconciliation Specification

## Purpose

Cerrar el ciclo entre el viaje de compra y su recibo: el recibo que termina un viaje se adjunta a esa sesión, la
completa si seguía activa y le aporta total, precios reales y tienda, sin que el mismo viaje enseñe dos veces a la lista.

## Requirements

### Requirement: A read receipt offers to attach to a recent trip

En la pantalla de un recibo leído, sin adjuntar y no añadido a ninguna lista, SHALL ofrecerse adjuntarlo cuando el
propietario tiene sesiones candidatas: sus sesiones activas y sus sesiones completadas como mucho 48 horas antes de la
subida del recibo o después de ella, sin recibo adjunto. Sin candidatas MUST NOT mostrarse la oferta.

#### Scenario: Active trip

- **WHEN** el propietario tiene una sesión activa de "Pantry" y abre un recibo recién leído
- **THEN** la pantalla ofrece adjuntar el recibo a la compra de "Pantry"

#### Scenario: Trip completed an hour before the upload

- **WHEN** el propietario completó una sesión una hora antes de subir el recibo
- **THEN** la pantalla del recibo ofrece adjuntarlo a esa sesión

#### Scenario: Trip completed after the upload

- **WHEN** el propietario sube el recibo durante el viaje y completa la sesión antes de revisarlo
- **THEN** la pantalla del recibo ofrece adjuntarlo a esa sesión completada

#### Scenario: Old trip

- **WHEN** la única sesión completada del propietario terminó tres días antes de subir el recibo
- **THEN** la pantalla no ofrece adjuntar el recibo

#### Scenario: Receipt already added to a list

- **WHEN** el propietario abre un recibo cuyas líneas ya añadió a una lista
- **THEN** la pantalla no ofrece adjuntarlo

#### Scenario: Receipt not read yet

- **WHEN** el recibo está pendiente de lectura o su lectura falló
- **THEN** la pantalla no ofrece adjuntarlo

### Requirement: Several candidates are chosen explicitly

Cuando hay más de una sesión candidata, el usuario SHALL elegir una antes de revisar, viendo de cada una el nombre de
la lista, si está en curso o cuándo se completó, su tienda si la tiene y cuántos ítems lleva marcados. Las sesiones en
curso SHALL aparecer primero y después las completadas, de la más reciente a la más antigua.

#### Scenario: Two lists in progress and one recent trip

- **WHEN** el propietario tiene sesiones activas en "Pantry" y "Office" y una completada hace 5 horas
- **THEN** la elección muestra primero las dos activas por inicio más reciente y después la completada, y no preselecciona ninguna

#### Scenario: Single candidate

- **WHEN** solo hay una sesión candidata
- **THEN** la revisión se abre con esa sesión elegida y el usuario puede cancelar

### Requirement: Attaching is reviewed line by line before it is applied

Antes de confirmar, la revisión SHALL mostrar cada línea del recibo como coincidente con un ítem ya marcado, coincidente
con un ítem sin marcar que se marcará comprado, o sin coincidencia. También SHALL mostrar el total que se guardará y la
tienda resultante. Nada MUST cambiar hasta que el usuario confirme.

#### Scenario: Mixed receipt

- **WHEN** un recibo con "Milk", "Eggs" y "Batteries" se revisa contra una sesión con "Milk" marcado y "Eggs" sin marcar
- **THEN** "Milk" aparece como ya marcado, "Eggs" como que se marcará comprado y "Batteries" como sin coincidencia

#### Scenario: Remembered match

- **WHEN** una línea "2% MILK 4L" coincide con el ítem "Milk" de la sesión por un vínculo recordado en esa lista
- **THEN** la revisión la muestra como coincidente con "Milk", identificada como recordada y modificable

#### Scenario: Cancel

- **WHEN** el usuario cierra la revisión sin confirmar
- **THEN** el recibo, la sesión y la lista no cambian

#### Scenario: Preview cannot load

- **WHEN** falla la carga de las coincidencias
- **THEN** la revisión explica que no pudo comprobar la sesión, ofrece reintentar y no adjunta nada

### Requirement: Unmatched lines are added only when the user chooses

Cada línea sin coincidencia SHALL poder dejarse fuera, añadirse como comprada o vincularse a un ítem de la sesión
mediante un buscador por nombre. Por defecto MUST quedar fuera. Una línea vinculada SHALL tratarse como coincidente y su
nombre SHALL recordarse como vínculo del artículo correspondiente en la lista de la sesión.

#### Scenario: Add a line as purchased

- **WHEN** el usuario elige añadir "Batteries" como comprada y confirma
- **THEN** la sesión incluye "Batteries" marcado con su precio y la lista lo aprende como cualquier ítem marcado

#### Scenario: Leave a line out

- **WHEN** el usuario no hace nada con la línea "BAG FEE" y confirma
- **THEN** "BAG FEE" no aparece en la sesión ni en la lista

#### Scenario: Link a line to a session item

- **WHEN** el usuario vincula "LECHE 2% 4L" al ítem "Milk" de la sesión y confirma
- **THEN** "Milk" recibe el precio de esa línea y el siguiente recibo con "Leche 2% 4L" coincide con "Milk" en esa lista

### Requirement: Attaching to an active session completes it

Confirmar con una sesión activa SHALL completarla en la misma operación: quedan comprados los ítems ya marcados, los que
coinciden con líneas del recibo y las líneas añadidas, y la lista aprende como en cualquier finalización. Los ítems sin
marcar que el recibo no menciona MUST quedar sin comprar. La confirmación MUST decir que la compra se completará.

#### Scenario: Receipt finishes the trip

- **WHEN** el usuario adjunta un recibo con "Milk" y "Eggs" a una sesión activa con "Milk" marcado, "Eggs" y "Bread" sin marcar
- **THEN** la sesión queda completada con "Milk" y "Eggs" comprados, "Bread" sin comprar, y cada uno suma una sola compra en la lista

#### Scenario: Confirmation copy

- **WHEN** el usuario va a confirmar contra una sesión activa
- **THEN** el texto indica que la compra se completará y que los ítems del recibo se marcarán comprados

### Requirement: Receipt prices and total fill the session without counting twice

El recibo SHALL aportar a cada ítem coincidente su precio pagado (suma de sus líneas) y a la sesión su total. Si la
sesión ya estaba completada, los artículos que ya contó MUST NOT sumar otra compra; solo reciben el precio. Las líneas
añadidas SHALL contar como una compra nueva.

#### Scenario: Recently completed trip

- **WHEN** el usuario adjunta un recibo con "Milk" a 5.49 a una sesión completada en la que "Milk" ya sumó su compra
- **THEN** "Milk" no suma otra compra, la sesión muestra 5.49 para "Milk" y el precio promedio de "Milk" incorpora 5.49 una sola vez

#### Scenario: Two lines for one item

- **WHEN** el recibo trae dos líneas de "Milk" a 5.49 que coinciden con el mismo ítem
- **THEN** el ítem queda con 10.98 pagados y una sola compra

#### Scenario: Total read from the receipt

- **WHEN** el recibo tiene un total impreso leído de 84.12 y el usuario no lo cambia
- **THEN** la sesión queda con un total de 84.12

#### Scenario: Corrected total

- **WHEN** el usuario cambia en la revisión el total leído a 82.50
- **THEN** la sesión queda con un total de 82.50 y el total leído del recibo no cambia

#### Scenario: No total read

- **WHEN** el recibo no tiene total leído y el usuario no escribe ninguno
- **THEN** la sesión conserva el total que tuviera, sin sustituirlo por la suma de las líneas

### Requirement: The receipt's store reconciles with the session's store

Si la sesión no tenía tienda y el recibo tiene una confirmada, la sesión SHALL tomarla. Si una sesión activa tenía otra
tienda, SHALL prevalecer la del recibo. Si una sesión completada tenía otra tienda, adjuntar MUST rechazarse con un
conflicto explicado. Si el recibo no tiene tienda y la sesión sí, el recibo SHALL quedar con la de la sesión.

#### Scenario: Whole-list trip and a receipt from No Frills

- **WHEN** el usuario adjunta un recibo confirmado en "No Frills" a una sesión sin tienda
- **THEN** la sesión queda registrada en "No Frills"

#### Scenario: Active trip at the wrong store

- **WHEN** una sesión activa se inició en "Costco" y el usuario adjunta un recibo confirmado en "Metro"
- **THEN** la sesión se completa registrada en "Metro"

#### Scenario: Completed trip at another store

- **WHEN** una sesión completada en "Costco" recibe un recibo confirmado en "Metro"
- **THEN** la petición se rechaza con un conflicto, nada cambia y la interfaz explica que las tiendas no coinciden

#### Scenario: Receipt without a store

- **WHEN** el usuario adjunta un recibo sin tienda a una sesión iniciada en "No Frills"
- **THEN** el recibo queda en "No Frills", y el nombre leído del recibo no se aprende como alias de esa tienda

### Requirement: A receipt and a session are attached at most once

Un recibo SHALL adjuntarse a lo sumo a una sesión y una sesión SHALL tener a lo sumo un recibo, garantizado por la base
de datos. Reenviar la misma petición MUST responder con éxito sin ningún efecto nuevo. Adjuntar a otra sesión un recibo
ya adjunto, o a una sesión que ya tiene recibo, MUST rechazarse con un conflicto sin cambios.

#### Scenario: Repeated request

- **WHEN** se envía dos veces, de forma secuencial o simultánea, la misma petición de adjuntar
- **THEN** la sesión, la lista y las estadísticas cambian una sola vez y ambas respuestas son correctas

#### Scenario: Receipt attached elsewhere

- **WHEN** se pide adjuntar a "Office" un recibo ya adjunto a la sesión de "Pantry"
- **THEN** la respuesta es un conflicto y el recibo sigue adjunto a "Pantry"

#### Scenario: Session already has a receipt

- **WHEN** se pide adjuntar un segundo recibo a una sesión que ya tiene uno
- **THEN** la respuesta es un conflicto y nada cambia

### Requirement: Attaching is atomic and limited to the owner

Adjuntar SHALL ejecutarse en una sola transacción: recibo, sesión, ítems, lista, vínculos y estadísticas cambian todos o
ninguno. Solo el propietario del recibo y de la sesión SHALL poder adjuntar; recibos o sesiones ajenos, y sesiones fuera
de la ventana, MUST rechazarse sin revelar si existen.

#### Scenario: Failure while reconciling

- **WHEN** falla un paso de la reconciliación con una sesión activa
- **THEN** la sesión sigue activa, el recibo sigue sin adjuntar y ni la lista ni las estadísticas cambian

#### Scenario: Another user's session

- **WHEN** una petición intenta adjuntar un recibo propio a la sesión de otro usuario
- **THEN** recibe `404` y nada cambia

#### Scenario: Collaborator

- **WHEN** un colaborador de una lista compartida intenta adjuntar un recibo a la sesión de esa lista
- **THEN** la petición se rechaza con `404` y nada cambia

#### Scenario: Session outside the window

- **WHEN** una petición intenta adjuntar a una sesión completada más de 48 horas antes de la subida del recibo
- **THEN** la petición se rechaza con un conflicto y nada cambia

### Requirement: An attached receipt is not added to a list again

Las líneas de un recibo adjunto ya llegan a la lista a través de la sesión, así que añadirlo a una lista o crear una
lista con él MUST rechazarse con un conflicto. Un recibo cuyas líneas ya se añadieron a una lista MUST NOT poder
adjuntarse.

#### Scenario: Add an attached receipt to a list

- **WHEN** se pide añadir a una lista las líneas de un recibo adjunto
- **THEN** la respuesta es un conflicto y la lista no cambia

#### Scenario: Attach a receipt already added

- **WHEN** se pide adjuntar un recibo cuyas líneas ya se añadieron a "Pantry"
- **THEN** la respuesta es un conflicto y nada cambia

### Requirement: Receipt and session show their link

Un recibo adjunto SHALL mostrar a qué compra pertenece con un enlace a ella, en lugar de ofrecer añadirlo a una lista.
La sesión con recibo SHALL mostrar su total como pagado según el recibo y un enlace al recibo; el historial SHALL indicar
qué viajes tienen recibo. Si el recibo se elimina, la sesión SHALL conservar total y precios.

#### Scenario: Attached receipt screen

- **WHEN** el propietario abre un recibo adjunto a la compra de "Pantry"
- **THEN** ve "Attached to" la compra de "Pantry" con un enlace y no ve las acciones de añadir a una lista

#### Scenario: Session with a receipt

- **WHEN** el propietario abre una sesión completada con recibo adjunto
- **THEN** ve el total como pagado según el recibo, el precio de cada ítem con precio y un enlace al recibo

#### Scenario: Deleted receipt

- **WHEN** el propietario elimina un recibo adjunto
- **THEN** la sesión conserva su total y precios y deja de mostrar el enlace al recibo
