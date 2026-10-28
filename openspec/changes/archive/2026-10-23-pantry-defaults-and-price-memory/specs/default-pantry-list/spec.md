# Spec Delta

## Purpose

Permitir que un usuario nuevo llegue a una lista utilizable sin crear antes ningún contenedor, aprovisionando una lista base "Pantry" de forma segura ante repeticiones y concurrencia, sin alterar las cuentas que ya tienen listas.

## ADDED Requirements

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
