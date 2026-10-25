# Spec Delta

## Purpose

Permitir que el usuario gestione todas sus listas base en una sola pantalla, sin elegir, ver ni nombrar grupos, y que cada lista se distinga por su nombre, sin perder ni mover los datos creados cuando los grupos eran visibles.

## ADDED Requirements

### Requirement: All lists appear on one screen

La pantalla de listas SHALL mostrar todas las listas base del usuario, de cualquiera de sus grupos, con su nombre, notas y número de ítems, en un orden determinista (por nombre, y por fecha de creación cuando coincidan). La lista que tiene una compra activa MUST seguir fuera de la cuadrícula, como hoy. La pantalla MUST NOT mostrar grupos, contadores de grupos ni controles para crearlos o gestionarlos.

#### Scenario: Account with lists in several groups

- **WHEN** un usuario cuyas listas están repartidas en varios grupos abre la pantalla de listas
- **THEN** ve todas sus listas en una sola cuadrícula, sin encabezados ni nombres de grupo
- **AND** puede abrir, renombrar y eliminar cada una igual que antes

#### Scenario: Account with only the Pantry

- **WHEN** un usuario nuevo abre la pantalla de listas
- **THEN** ve su lista "Pantry" y la acción de crear otra lista, sin pedirle crear nada antes

#### Scenario: No lists left

- **WHEN** el usuario no tiene ninguna lista
- **THEN** la pantalla explica qué es una lista base y ofrece crear una, sin mencionar grupos

#### Scenario: Lists fail to load

- **WHEN** la carga de listas falla
- **THEN** la pantalla comunica el fallo y ofrece reintentar, sin afirmar que el usuario no tiene listas

### Requirement: Creating a list never asks for a group

Crear una lista desde la pantalla de listas, crear una lista desde un recibo y fusionar un recibo SHALL pedir como máximo el nombre y, al fusionar, la lista destino. La lista nueva MUST quedar dentro del grupo predeterminado implícito del usuario. Una petición de la API que incluya un grupo propio MUST seguir respetándolo.

#### Scenario: Create a list from the lists screen

- **WHEN** el usuario crea una lista indicando solo el nombre
- **THEN** la lista existe, aparece en la pantalla de listas y se abre para añadir ítems
- **AND** no se le pidió un grupo en ningún momento

#### Scenario: Create a list from a receipt

- **WHEN** el usuario elige "Create new list" al añadir ítems de un recibo e indica solo el nombre
- **THEN** la lista se crea con los ítems seleccionados y el recibo queda asociado a ella
- **AND** el diálogo no ofrece ni exige un grupo

#### Scenario: Merge a receipt into an existing list

- **WHEN** el usuario fusiona un recibo y elige entre sus listas
- **THEN** ve todas sus listas en un único selector, sin un selector de grupo previo

#### Scenario: Merge dialog without lists

- **WHEN** el usuario no tiene listas al abrir el diálogo de añadir ítems de un recibo
- **THEN** el diálogo ofrece directamente crear una lista nueva, sin enviarle a crear un grupo

#### Scenario: API request with an explicit own group

- **WHEN** un cliente de la API envía un `group_id` que pertenece al usuario
- **THEN** la lista se crea en ese grupo

### Requirement: Group ownership is verified when a group is supplied

Cuando una petición de la API indica un `group_id`, el sistema SHALL comprobar que el grupo pertenece al usuario autenticado antes de crear la lista. Si no pertenece o no existe, MUST responder `404` sin crear nada y sin revelar si el grupo es de otro usuario.

#### Scenario: Group of another user

- **WHEN** un cliente envía el `group_id` de un grupo ajeno
- **THEN** la respuesta es `404`, no se crea ninguna lista y el mensaje no distingue entre ajeno e inexistente

### Requirement: List names are unique per user

El nombre de una lista SHALL ser único, sin distinguir mayúsculas ni minúsculas, entre todas las listas del usuario al crearla, renombrarla o crearla desde un recibo. El conflicto MUST responder `409` con un mensaje accionable que no mencione grupos. Renombrar una lista a su mismo nombre, o cambiando solo mayúsculas, MUST ser válido. El nombre MUST compararse literalmente: los caracteres `%` y `_` no actúan como comodines.

#### Scenario: Duplicate name

- **WHEN** el usuario crea o renombra una lista con el nombre de otra suya, en cualquier mayúscula o minúscula
- **THEN** la operación se rechaza con un mensaje que pide elegir otro nombre y no se guarda nada

#### Scenario: Same name as a list that used to be in another group

- **WHEN** el usuario crea una lista con el nombre de una lista suya que antes estaba en otro grupo
- **THEN** se rechaza igual, porque la unicidad es por usuario

#### Scenario: Rename keeping the same name

- **WHEN** el usuario guarda una lista sin cambiar su nombre o cambiando solo mayúsculas del suyo
- **THEN** la operación se acepta

#### Scenario: Wildcard characters in the name

- **WHEN** el usuario crea una lista llamada "50% off" y ya existe otra llamada "50 items"
- **THEN** no hay conflicto, porque `%` no coincide con otros caracteres

### Requirement: Same-named legacy lists stay distinguishable

Cuando varias listas de un usuario tengan el mismo nombre (posible solo en datos creados cuando el nombre era único por grupo), la interfaz SHALL mostrarlas con un sufijo numérico estable ("Weekly", "Weekly (2)") en todos los lugares donde se elige o se lista una lista. La primera, por fecha de creación, MUST conservar su nombre sin sufijo. Los nombres almacenados MUST NOT modificarse.

#### Scenario: Two lists with the same name

- **WHEN** el usuario tiene dos listas "Weekly" creadas en grupos distintos
- **THEN** la pantalla de listas, el dashboard, el selector de fusionar un recibo y el filtro del historial las muestran como "Weekly" (la más antigua) y "Weekly (2)"
- **AND** el nombre guardado de ambas sigue siendo "Weekly"

#### Scenario: Names are not rewritten

- **WHEN** el usuario abre el editor de la segunda lista
- **THEN** el campo de nombre contiene "Weekly" y no el sufijo de pantalla

#### Scenario: Stable across reloads

- **WHEN** el usuario recarga la pantalla o añade otra lista con un nombre distinto
- **THEN** cada lista duplicada conserva el mismo sufijo

### Requirement: Legacy group links lead to the flat screens

Los enlaces antiguos a la lista de un grupo (`/shopping-lists/{groupId}/lists`) y a su historial (`/shopping-history/{groupId}`) SHALL redirigir a la pantalla de listas y a la pantalla de historial respectivamente, sin error, sea cual sea el identificador. Las pantallas de destino MUST NOT revelar si el grupo existe.

#### Scenario: Bookmarked group lists link

- **WHEN** el usuario abre un enlace guardado a las listas de un grupo
- **THEN** llega a la pantalla de listas con todas sus listas

#### Scenario: Unknown or foreign group identifier

- **WHEN** alguien abre ese enlace con un identificador inexistente o de otro usuario
- **THEN** recibe la misma redirección, sin mensaje de error ni información sobre el grupo

### Requirement: No group wording or group metrics in the interface

Ninguna pantalla, diálogo, notificación, etiqueta accesible, contador de navegación ni la página de marketing SHALL usar "group" o "grupo" para referirse a un contenedor de listas. El menú lateral MUST contar listas, no grupos. El dashboard MUST NOT mostrar un contador ni una tarjeta de grupos.

#### Scenario: Navigation count

- **WHEN** el usuario tiene tres listas
- **THEN** la entrada de listas del menú muestra un contador de 3 con la etiqueta accesible "3 lists"

#### Scenario: Dashboard lists card

- **WHEN** el usuario abre el dashboard
- **THEN** la tarjeta de listas se titula "Shopping Lists" y muestra filas de listas con su número de ítems y la acción de empezar
- **AND** ninguna fila ni banner antepone el nombre de un grupo

#### Scenario: Receipt waiting hint

- **WHEN** hay un recibo leído que aún no está en una lista
- **THEN** el aviso del dashboard indica que se puede añadir a una de sus listas, sin mencionar grupos

#### Scenario: Marketing page

- **WHEN** un visitante lee la página pública
- **THEN** no se le promete organizar listas en grupos

### Requirement: No existing data is removed by hiding groups

Ocultar los grupos SHALL NOT borrar, mover ni renombrar grupos, listas, ítems, sesiones ni recibos. Las listas de un usuario con grupos propios MUST seguir en el grupo donde estaban, el historial de compras MUST conservar todas sus sesiones y los endpoints `/groups*` MUST seguir respondiendo como antes.

#### Scenario: Multi-group account after the change

- **WHEN** un usuario con tres grupos y cinco listas entra después del cambio
- **THEN** conserva tres grupos y cinco listas sin modificar y ve las cinco en la pantalla plana

#### Scenario: Existing API clients

- **WHEN** un cliente existente usa `GET /api/v1/groups` o crea una lista con `group_id`
- **THEN** obtiene los mismos resultados que antes del cambio
