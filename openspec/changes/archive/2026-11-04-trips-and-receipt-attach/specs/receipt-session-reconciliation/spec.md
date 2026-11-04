# Spec Delta

## MODIFIED Requirements

### Requirement: A read receipt offers to attach to a recent trip

En la pantalla de un recibo leído, sin adjuntar y no añadido a ninguna lista, SHALL ofrecerse adjuntarlo solo al viaje
desde el que se subió, cuando ese viaje sigue siendo candidato: activo, o completado sin recibo adjunto, sin importar
cuánto tiempo pasó desde que se completó. Un recibo subido fuera de un viaje MUST NOT ofrecer adjuntarse a ninguno desde
su pantalla.

#### Scenario: Active trip

- **WHEN** el viaje de origen del recibo es la sesión activa de "Pantry" y el recibo se lee
- **THEN** la pantalla ofrece adjuntar el recibo a la compra de "Pantry"

#### Scenario: Trip completed after the upload

- **WHEN** el viaje de origen del recibo se completó después de la subida y antes de revisarlo
- **THEN** la pantalla del recibo ofrece adjuntarlo a ese viaje completado

#### Scenario: Trip completed an hour before the upload

- **WHEN** el propietario sube un recibo desde la tarjeta de recibos de un viaje completado hace una hora y el recibo se lee
- **THEN** la pantalla del recibo ofrece adjuntarlo a ese viaje

#### Scenario: Standalone receipt with a recent trip

- **WHEN** el propietario completó un viaje hace una hora y sube un recibo desde la pantalla de recibos
- **THEN** la pantalla del recibo no ofrece adjuntarlo a ningún viaje

#### Scenario: Origin trip already has a receipt

- **WHEN** el recibo se subió desde un viaje que ya tiene otro recibo adjunto
- **THEN** la pantalla no ofrece adjuntarlo

#### Scenario: Old trip

- **WHEN** el recibo se subió desde un viaje completado tres días antes y sin recibo
- **THEN** la pantalla ofrece adjuntarlo a ese viaje

#### Scenario: Origin trip deleted

- **WHEN** el propietario eliminó el viaje desde el que subió el recibo
- **THEN** la pantalla no ofrece adjuntarlo y el recibo se revisa como uno independiente

#### Scenario: Receipt already added to a list

- **WHEN** el propietario abre un recibo cuyas líneas ya añadió a una lista
- **THEN** la pantalla no ofrece adjuntarlo

#### Scenario: Receipt not read yet

- **WHEN** el recibo está pendiente de lectura o su lectura falló
- **THEN** la pantalla no ofrece adjuntarlo

### Requirement: Attaching is reviewed line by line before it is applied

Antes de confirmar, la revisión SHALL mostrar cada línea del recibo como coincidente con un ítem ya marcado, coincidente
con un ítem sin marcar que se marcará comprado, o sin coincidencia. También SHALL mostrar el total que se guardará y la
tienda resultante. Nada MUST cambiar hasta que el usuario confirme: cancelar deja el viaje sin cambios y el recibo sin
vincular y disponible para revisarlo después.

#### Scenario: Mixed receipt

- **WHEN** un recibo con "Milk", "Eggs" y "Batteries" se revisa contra una sesión con "Milk" marcado y "Eggs" sin marcar
- **THEN** "Milk" aparece como ya marcado, "Eggs" como que se marcará comprado y "Batteries" como sin coincidencia

#### Scenario: Remembered match

- **WHEN** una línea "2% MILK 4L" coincide con el ítem "Milk" de la sesión por un vínculo recordado en esa lista
- **THEN** la revisión la muestra como coincidente con "Milk", identificada como recordada y modificable

#### Scenario: Cancel

- **WHEN** el usuario cierra la revisión sin confirmar
- **THEN** el recibo, la sesión y la lista no cambian, el recibo no queda vinculado al viaje y el viaje sigue mostrando "No receipt"

#### Scenario: Cancel a receipt uploaded from the trip

- **WHEN** el usuario cancela la revisión de un recibo que acaba de subir desde el viaje
- **THEN** el viaje sigue ofreciendo "Review Receipt" para ese recibo y el recibo sigue disponible para elegirlo

#### Scenario: Preview cannot load

- **WHEN** falla la carga de las coincidencias
- **THEN** la revisión explica que no pudo comprobar la sesión, ofrece reintentar y no adjunta nada

### Requirement: Attaching is atomic and limited to the owner

Adjuntar SHALL ejecutarse en una sola transacción: recibo, sesión, ítems, lista, vínculos y estadísticas cambian todos o
ninguno. Solo el propietario del recibo y de la sesión SHALL poder adjuntar; recibos o sesiones ajenos MUST rechazarse sin
revelar si existen. La antigüedad de una sesión completada MUST NOT impedir adjuntarle un recibo.

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

- **WHEN** una petición adjunta un recibo a una sesión completada más de 48 horas (una semana) antes de subirlo
- **THEN** el recibo se adjunta y la sesión recibe sus precios y total sin sumar otra compra

### Requirement: Attaching is limited to the receipt's origin trip

Adjuntar un recibo SHALL aceptarse con el viaje desde el que se subió o, si el recibo no tiene viaje de origen, con el
viaje desde el que el usuario lo eligió. Una petición que intenta adjuntar a otra sesión un recibo subido desde un viaje
MUST rechazarse con un conflicto sin cambios.

#### Scenario: Another own session

- **WHEN** una petición intenta adjuntar a la sesión de "Office" un recibo subido desde la sesión de "Pantry"
- **THEN** la respuesta es un conflicto y nada cambia

#### Scenario: Standalone receipt

- **WHEN** el usuario elige desde el viaje de "Pantry" un recibo subido desde la pantalla de recibos y confirma la revisión
- **THEN** el recibo queda adjunto al viaje de "Pantry"

### Requirement: Receipt and session show their link

Un recibo adjunto SHALL mostrar a qué compra pertenece con un enlace a ella, en lugar de ofrecer añadirlo a una lista.
La sesión con recibo SHALL mostrar su total como pagado según el recibo y un enlace al recibo; "Trips" SHALL indicar
qué viajes tienen recibo. Si el recibo se elimina, la sesión SHALL conservar total y precios.

#### Scenario: Attached receipt screen

- **WHEN** el propietario abre un recibo adjunto a la compra de "Pantry"
- **THEN** ve "Attached to" la compra de "Pantry" con un enlace y no ve las acciones de añadir a una lista

#### Scenario: Session with a receipt

- **WHEN** el propietario abre una sesión completada con recibo adjunto
- **THEN** ve el total como pagado según el recibo, el precio de cada ítem con precio y un enlace al recibo

#### Scenario: Deleted receipt

- **WHEN** el propietario elimina un recibo adjunto
- **THEN** la sesión conserva su total y precios, deja de mostrar el enlace al recibo y vuelve a mostrar "No receipt"

## ADDED Requirements

### Requirement: The purchased quantity replaces the usual quantity

Al adjuntar, cada ítem del viaje que coincide con líneas del recibo SHALL tomar como cantidad la comprada (la suma de esas
líneas, 1 por línea sin cantidad leída), y el artículo de la lista SHALL quedar con esa cantidad en lugar de la habitual.
MUST NOT sumarse a la cantidad anterior. Con unidades distintas entre esas líneas, ítem y artículo MUST conservar su
cantidad y unidad.

#### Scenario: Bought more than usual

- **WHEN** "Milk" tiene cantidad habitual 2 y el recibo adjunto trae "Milk" con cantidad 3
- **THEN** el ítem del viaje y "Milk" en la lista quedan con cantidad 3, no 5

#### Scenario: Bought less than usual

- **WHEN** "Eggs" tiene cantidad habitual 2 y el recibo trae "Eggs" con cantidad 1
- **THEN** "Eggs" queda con cantidad 1 en el viaje y en la lista

#### Scenario: Two lines for one item

- **WHEN** el recibo trae dos líneas "Milk" de cantidad 1 que coinciden con el mismo ítem y "Milk" tenía cantidad 4
- **THEN** "Milk" queda con cantidad 2

#### Scenario: Active trip completed by the receipt

- **WHEN** el usuario adjunta a una sesión activa un recibo con "Bread" de cantidad 2 y "Bread" se planificó con cantidad 1
- **THEN** la sesión se completa y "Bread" queda con cantidad 2 en el viaje y en la lista

#### Scenario: Checked item not on the receipt

- **WHEN** "Paper towels" estaba marcado en el viaje y ninguna línea lo cubre
- **THEN** su cantidad en el viaje y en la lista no cambia por el recibo

#### Scenario: Mixed units

- **WHEN** dos líneas que coinciden con "Apples" tienen unidades "kg" y "each"
- **THEN** "Apples" conserva su cantidad y unidad en el viaje y en la lista

#### Scenario: Receipt added to a list without a trip

- **WHEN** el usuario añade a una lista un recibo independiente con "Milk" de cantidad 3 y "Milk" tiene cantidad 2
- **THEN** "Milk" sigue con cantidad 2, como hasta ahora
