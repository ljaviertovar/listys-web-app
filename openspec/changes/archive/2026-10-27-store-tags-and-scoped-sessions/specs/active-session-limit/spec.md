# Spec Delta

## Purpose

Definir cuántas sesiones de compra pueden estar en curso a la vez y cómo se llega a ellas, de modo que nunca compitan dos
sesiones sobre la misma lista y que tener una lista en curso no bloquee las demás.

## ADDED Requirements

### Requirement: One active session per base list

Cada lista base SHALL tener como máximo una sesión activa, garantizado por la base de datos también ante peticiones
simultáneas. Empezar una sesión en una lista que ya tiene una activa SHALL responder `409` con el identificador de esa
sesión y sin crear otra. Solo el propietario de la lista SHALL poder empezar una sesión en ella.

#### Scenario: Second start on the same list

- **WHEN** "Pantry" tiene una sesión activa y el propietario pide empezar otra en "Pantry"
- **THEN** recibe `409` con el identificador de la sesión activa y no se crea ninguna sesión

#### Scenario: Simultaneous starts

- **WHEN** llegan a la vez dos peticiones para empezar una sesión en la misma lista
- **THEN** exactamente una crea la sesión y la otra recibe `409` con el identificador de la creada

#### Scenario: Shared list

- **WHEN** el propietario de una lista compartida tiene una sesión activa en ella
- **THEN** un colaborador de esa lista ve esa misma sesión como la sesión en curso de la lista y nunca existe una segunda

#### Scenario: Collaborator tries to start

- **WHEN** un colaborador pide empezar una sesión en una lista compartida
- **THEN** la petición se rechaza con `404` y no se crea ninguna sesión

### Requirement: Different lists can be shopped at the same time

Una sesión activa en una lista MUST NOT impedir empezar una sesión en otra lista del mismo propietario. Cada lista con
sesión activa SHALL seguir bloqueada para editar sus artículos hasta que su sesión termine; las demás listas MUST
seguir editables.

#### Scenario: Two lists in progress

- **WHEN** el propietario tiene una sesión activa en "Pantry" y empieza una compra de "Office"
- **THEN** se crea la sesión de "Office" y ambas quedan activas

#### Scenario: Editing another list

- **WHEN** "Pantry" tiene una sesión activa y el propietario abre "Office" sin sesión
- **THEN** puede editar los artículos de "Office" y empezar una compra en ella

### Requirement: Starting a session is all or nothing

Empezar una sesión SHALL crear la sesión y copiar todos los artículos de la lista en una sola operación. Si cualquier
parte falla, MUST NOT quedar ninguna sesión activa ni parcial en la lista. Una lista sin artículos SHALL rechazarse con
`409` como hasta ahora.

#### Scenario: Copy fails

- **WHEN** falla la copia de los artículos al empezar una sesión
- **THEN** no queda ninguna sesión nueva y la lista se puede volver a empezar

#### Scenario: Empty list

- **WHEN** el propietario pide empezar una sesión en una lista sin artículos
- **THEN** recibe `409` y no se crea ninguna sesión

### Requirement: The interface leads to each list's session in progress

Cada lista con sesión activa SHALL ofrecer volver a esa sesión en lugar de empezar otra, y las listas sin sesión activa
SHALL ofrecer empezar una. La barra y el resumen de sesión en curso SHALL llevar a la sesión activa más reciente e
indicar cuántas más hay en curso. Ningún texto MUST decir que solo puede haber una sesión activa en total.

#### Scenario: Lists screen with one list in progress

- **WHEN** el propietario abre la pantalla de listas con "Pantry" en curso y "Office" sin sesión
- **THEN** "Pantry" ofrece volver a su compra y "Office" ofrece empezar una

#### Scenario: Two sessions in progress

- **WHEN** el propietario tiene sesiones activas en "Pantry" y "Office" y "Office" empezó después
- **THEN** la barra de sesión lleva a "Office" e indica que hay una compra más en curso

#### Scenario: Start rejected because the list is in progress

- **WHEN** el usuario confirma empezar una compra en una lista que ya tiene una sesión activa
- **THEN** la aplicación abre esa sesión en lugar de mostrar un error

#### Scenario: Start sheet copy

- **WHEN** el usuario abre la confirmación de empezar una compra
- **THEN** el texto no dice que solo puede haber una sesión activa a la vez
