# Default Pantry List Specification

## Purpose

Permitir que un usuario nuevo llegue a una lista utilizable sin crear antes ningún contenedor, aprovisionando una lista base "Pantry" de forma segura ante repeticiones y concurrencia, sin alterar las cuentas que ya tienen listas.

## Requirements

### Requirement: New users start with a Pantry list

Un usuario autenticado sin listas base propias ni grupo predeterminado SHALL recibir, al entrar al dashboard, un grupo predeterminado interno y una lista base llamada "Pantry" dentro de él. La lista MUST pertenecer al usuario, empezar sin ítems y poder usarse de inmediato para añadir ítems, fusionar un recibo o crear una sesión cuando tenga ítems.

#### Scenario: First sign-in with email and password

- **WHEN** un usuario recién registrado inicia sesión y llega al dashboard
- **THEN** existe exactamente una lista "Pantry" propia, vacía, dentro de un grupo predeterminado
- **AND** el dashboard la muestra como una lista disponible en lugar de pedir crear un grupo primero

#### Scenario: First sign-in with Google

- **WHEN** un usuario nuevo completa el acceso con Google y llega al dashboard
- **THEN** recibe la misma lista "Pantry" que con correo y contraseña

#### Scenario: Account without lists but with groups

- **WHEN** un usuario sin listas, pero con grupos creados antes, llega al dashboard
- **THEN** recibe la lista "Pantry" en un nuevo grupo predeterminado y sus grupos existentes no cambian

### Requirement: Provisioning is idempotent and race-safe

La provisión SHALL producir como máximo un grupo predeterminado por usuario y una lista "Pantry" por provisión, por mucho que se repita el inicio de sesión o se envíen peticiones simultáneas. Esta garantía MUST aplicarse en la base de datos mediante restricciones o transacciones, no solo en la lógica de la aplicación.

#### Scenario: Repeated visits

- **WHEN** el mismo usuario entra al dashboard varias veces
- **THEN** sus grupos y listas no se duplican ni cambian después de la primera provisión

#### Scenario: Concurrent first requests

- **WHEN** dos peticiones simultáneas del mismo usuario nuevo intentan provisionar
- **THEN** el resultado final contiene un solo grupo predeterminado y una sola lista "Pantry"
- **AND** ninguna de las peticiones falla de forma visible para el usuario

### Requirement: Existing users are not affected

La provisión automática SHALL NOT crear, renombrar, mover ni borrar nada para un usuario que ya tiene al menos una lista base propia. Si el usuario eliminó su lista "Pantry" y conserva el grupo predeterminado, MUST NOT recrearse automáticamente; solo puede volver a crearse con la acción explícita de configurar la Pantry.

#### Scenario: User with lists

- **WHEN** un usuario con una o más listas llega al dashboard
- **THEN** no se crea ningún grupo ni lista y los datos permanecen idénticos

#### Scenario: User deleted the Pantry

- **WHEN** un usuario aprovisionado elimina "Pantry" y vuelve al dashboard
- **THEN** no aparece una nueva lista "Pantry"
- **AND** puede crearla de nuevo con la acción explícita de configurar la Pantry

### Requirement: Provisioning failure does not block the product

Si la provisión falla, el dashboard SHALL cargar con el estado que corresponda a los datos existentes y MUST NOT mostrar un error técnico solo por ello. La provisión se reintentará en la siguiente entrada al dashboard. El fallo se registra en el servidor sin datos sensibles.

#### Scenario: Database error during provisioning

- **WHEN** la provisión devuelve un error
- **THEN** el dashboard se renderiza igualmente y la siguiente visita vuelve a intentarlo

### Requirement: Provisioned data respects ownership and limits

La lista y el grupo aprovisionados SHALL estar limitados al usuario mediante RLS y registrar `created_at` y `updated_at`. El grupo predeterminado MUST contar para el máximo de grupos por usuario mientras ese límite exista, y la documentación de límites SHALL decirlo.

#### Scenario: Another user

- **WHEN** otro usuario autenticado consulta grupos o listas
- **THEN** no puede ver ni modificar el grupo ni la lista "Pantry" ajenos

### Requirement: Any user gets the implicit default group when a list needs a home

Cuando se crea una lista sin indicar grupo, el sistema SHALL colocarla en el grupo predeterminado implícito del usuario y crearlo en ese momento si todavía no existe, también para cuentas que ya tenían listas antes de la Fase 1. El grupo MUST ser único por usuario, no ser visible en la interfaz y no cambiar ni mover ningún grupo o lista existente.

#### Scenario: Account with lists and no default group

- **WHEN** un usuario que ya tenía listas en sus propios grupos crea una lista nueva sin indicar grupo
- **THEN** existe un grupo predeterminado del usuario que contiene la lista nueva
- **AND** sus grupos y listas anteriores permanecen idénticos

#### Scenario: Default group already exists

- **WHEN** un usuario que ya tiene grupo predeterminado crea otra lista sin indicar grupo
- **THEN** la lista va a ese mismo grupo y no se crea otro

#### Scenario: Created lists in the same session of use

- **WHEN** el usuario crea varias listas seguidas, de forma manual o desde recibos
- **THEN** todas comparten el mismo grupo predeterminado

### Requirement: Default group creation is idempotent and race-safe

La creación bajo demanda del grupo predeterminado SHALL producir como máximo un grupo predeterminado por usuario por mucho que se repitan o se solapen las peticiones, y ninguna petición MUST fallar de forma visible por perder la carrera. Esta garantía MUST aplicarse en la base de datos mediante restricciones o transacciones.

#### Scenario: Two simultaneous list creations

- **WHEN** un usuario sin grupo predeterminado envía dos creaciones de lista simultáneas
- **THEN** existe un solo grupo predeterminado y ambas listas se crean dentro de él

#### Scenario: Creation racing with first-visit provisioning

- **WHEN** el aprovisionamiento de "Pantry" y la creación de una lista coinciden para un usuario nuevo
- **THEN** existe un solo grupo predeterminado y no se duplican grupos ni se pierde ninguna lista

### Requirement: Default group creation respects ownership and failure isolation

El grupo predeterminado creado bajo demanda SHALL pertenecer solo al usuario autenticado, estar protegido por RLS y registrar `created_at` y `updated_at`. Si no puede crearse, la creación de la lista MUST fallar con un error genérico y accionable, sin crear una lista huérfana y sin exponer detalles de la base de datos.

#### Scenario: Another user

- **WHEN** otro usuario autenticado consulta grupos
- **THEN** no ve ni puede modificar el grupo predeterminado ajeno

#### Scenario: Default group cannot be created

- **WHEN** la base de datos rechaza la creación del grupo predeterminado
- **THEN** la lista no se crea, el usuario recibe un mensaje genérico para reintentar y el detalle técnico queda solo en el registro del servidor

### Requirement: The default list is marked in the database

`base_lists.is_default` SHALL marcar como máximo una lista por usuario, con un índice único parcial. `ensure_default_pantry`
SHALL crear la Pantry de una cuenta nueva ya marcada, y la migración SHALL marcar la Pantry existente de las cuentas que la
tienen (la más antigua del grupo por defecto con ese nombre) sin borrar ni reescribir otra cosa.

#### Scenario: New account
- **WHEN** una cuenta sin listas llama a `ensure_default_pantry`
- **THEN** su lista "Pantry" tiene `is_default` y repetir la llamada no crea otra

#### Scenario: Second default list
- **WHEN** se intenta marcar una segunda lista del mismo usuario
- **THEN** la base de datos lo rechaza con `unique_violation`

### Requirement: Existing accounts can set up their Pantry on demand

Una cuenta autenticada sin ninguna lista marcada como por defecto SHALL poder configurar su Pantry mediante una acción explícita. Si ya existe una lista propia llamada "Pantry" (sin distinguir mayúsculas), el sistema MUST marcarla como por defecto sin crear otra; si no existe, MUST crear una "Pantry" vacía ya marcada, en el grupo predeterminado implícito del usuario.

#### Scenario: Account with lists and no Pantry

- **WHEN** un usuario con listas, pero sin ninguna llamada "Pantry", ejecuta la acción de configurar su Pantry
- **THEN** existe una lista "Pantry" propia, vacía y marcada como por defecto, dentro del grupo predeterminado
- **AND** sus grupos, listas e ítems anteriores permanecen idénticos

#### Scenario: Account that already has a list named Pantry

- **WHEN** un usuario con una lista propia llamada "Pantry" que no está marcada ejecuta la acción
- **THEN** esa lista queda marcada como por defecto y no se crea ninguna lista ni grupo
- **AND** solo cambia su marca de lista por defecto; su nombre, ítems y grupo permanecen idénticos

#### Scenario: Name matched ignoring case

- **WHEN** la lista propia se llama "pantry" o "PANTRY" y el usuario ejecuta la acción
- **THEN** se marca esa lista y no se crea una "Pantry" adicional

#### Scenario: Several lists with the name

- **WHEN** el usuario tiene dos o más listas propias que coinciden con "Pantry" y ninguna marcada
- **THEN** se marca la más antigua y las demás no cambian

#### Scenario: Default list already exists

- **WHEN** el usuario ya tiene una lista marcada como por defecto y ejecuta la acción
- **THEN** no se crea, marca ni modifica nada y la respuesta indica que ya existía

#### Scenario: Deleted Pantry created again by hand

- **WHEN** un usuario que eliminó su Pantry y no tiene lista por defecto ejecuta la acción
- **THEN** se crea una nueva "Pantry" vacía y marcada

### Requirement: Setting up the Pantry is idempotent and race-safe

Configurar la Pantry SHALL dejar como máximo una lista por defecto por usuario y no duplicar la lista "Pantry" por mucho que la acción se repita o se envíe en simultáneo. Esta garantía MUST aplicarse en la base de datos mediante bloqueo, restricciones o transacciones, y ninguna petición MUST fallar de forma visible por perder la carrera.

#### Scenario: Repeated action

- **WHEN** el usuario ejecuta la acción dos veces seguidas
- **THEN** la primera crea o marca la lista y la segunda no cambia nada

#### Scenario: Concurrent requests

- **WHEN** dos peticiones simultáneas del mismo usuario sin Pantry ejecutan la acción
- **THEN** existe una sola lista "Pantry" marcada como por defecto y ambas respuestas son correctas

#### Scenario: Racing with automatic provisioning

- **WHEN** la acción coincide con la provisión automática del dashboard para un usuario sin listas
- **THEN** existe un solo grupo predeterminado y una sola lista por defecto

### Requirement: The setup action is offered only to accounts without a default list

La interfaz SHALL ofrecer la acción de configurar la Pantry en el dashboard y en la pantalla de listas solo cuando la cuenta no tiene lista por defecto, y MUST dejar de ofrecerla en cuanto exista. Si no puede saberse si existe (la consulta falla), la interfaz MUST NOT mostrarla.

#### Scenario: Account without default list

- **WHEN** un usuario sin lista por defecto abre el dashboard o la pantalla de listas
- **THEN** ve la acción "Set up Pantry"

#### Scenario: Account with default list

- **WHEN** un usuario con lista por defecto abre el dashboard o la pantalla de listas
- **THEN** no ve la acción

#### Scenario: Action succeeds

- **WHEN** el usuario pulsa la acción y la respuesta es correcta
- **THEN** la pantalla muestra la lista con el distintivo "Default" y la acción desaparece
- **AND** mientras la petición está en curso, la acción no admite un segundo envío

#### Scenario: Action fails

- **WHEN** la configuración falla
- **THEN** el usuario recibe un mensaje genérico para reintentar, sin detalles de la base de datos, y la acción sigue disponible

#### Scenario: Default state cannot be read

- **WHEN** la consulta de la lista por defecto devuelve un error
- **THEN** la acción no se muestra y el resto de la pantalla se renderiza con normalidad

### Requirement: Setting up the Pantry respects ownership and failure isolation

La acción SHALL requerir un usuario autenticado y actuar solo sobre sus propias listas y grupos, protegida por RLS, y MUST registrar `created_at` y `updated_at` en lo que cree. Un fallo MUST NOT dejar una lista sin grupo ni una marca parcial, y el detalle técnico MUST quedar solo en el registro del servidor.

#### Scenario: Unauthenticated request

- **WHEN** se invoca la acción sin sesión
- **THEN** se rechaza con 401 y no se crea ni modifica nada

#### Scenario: Another user's lists

- **WHEN** otro usuario tiene una lista llamada "Pantry"
- **THEN** la acción de un usuario distinto no la ve, no la marca ni la modifica

#### Scenario: Database rejects the change

- **WHEN** la base de datos rechaza la creación o la marca
- **THEN** no queda una lista huérfana ni una marca parcial y la respuesta es un error genérico accionable

### Requirement: New Pantry lists include the default note

Toda lista nueva llamada "Pantry" SHALL incluir la nota predeterminada "What you usually keep at home. It fills itself from your receipts.". Esta nota se aplica al crear una Pantry, sin cambiar las notas de listas existentes que se adopten.

#### Scenario: Note on a newly provisioned Pantry

- **WHEN** se crea automáticamente la Pantry de una cuenta nueva
- **THEN** la lista incluye la nota predeterminada junto con su nombre y estado por defecto

#### Scenario: Note on a Pantry set up on demand

- **WHEN** se crea la Pantry mediante la acción explícita de una cuenta existente
- **THEN** la lista incluye la nota predeterminada

#### Scenario: Adopted Pantry keeps its note

- **WHEN** la acción adopta una lista existente llamada Pantry
- **THEN** su nota no cambia
