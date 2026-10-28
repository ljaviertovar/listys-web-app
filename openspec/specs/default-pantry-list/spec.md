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

La provisión SHALL NOT crear, renombrar, mover ni borrar nada para un usuario que ya tiene al menos una lista base propia. Si el usuario eliminó su lista "Pantry" y conserva el grupo predeterminado, MUST NOT recrearse automáticamente.

#### Scenario: User with lists

- **WHEN** un usuario con una o más listas llega al dashboard
- **THEN** no se crea ningún grupo ni lista y los datos permanecen idénticos

#### Scenario: User deleted the Pantry

- **WHEN** un usuario aprovisionado elimina "Pantry" y vuelve al dashboard
- **THEN** no aparece una nueva lista "Pantry"

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
