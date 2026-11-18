## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Existing users are not affected

La provisión automática SHALL NOT crear, renombrar, mover ni borrar nada para un usuario que ya tiene al menos una lista base propia. Si el usuario eliminó su lista "Pantry" y conserva el grupo predeterminado, MUST NOT recrearse automáticamente; solo puede volver a crearse con la acción explícita de configurar la Pantry.

#### Scenario: User with lists

- **WHEN** un usuario con una o más listas llega al dashboard
- **THEN** no se crea ningún grupo ni lista y los datos permanecen idénticos

#### Scenario: User deleted the Pantry

- **WHEN** un usuario aprovisionado elimina "Pantry" y vuelve al dashboard
- **THEN** no aparece una nueva lista "Pantry" por sí sola
- **AND** puede crearla de nuevo con la acción explícita de configurar la Pantry
