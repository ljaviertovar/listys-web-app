# Spec Delta

## ADDED Requirements

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
