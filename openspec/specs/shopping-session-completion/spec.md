# Shopping Session Completion Specification

## Purpose

Garantizar que cada viaje de compra completado enseñe a la lista base sin que el usuario deba recordar ninguna opción, y que terminar el viaje sea una operación única, atómica y repetible sin efectos duplicados.

## Requirements

### Requirement: Completion always applies purchases to the base list

Completar una sesión activa SHALL aplicar a su lista base todos los ítems marcados: los ítems existentes actualizan `purchase_count` y `last_purchased_at`, y los marcados que no existen en la lista se añaden con sus campos de enriquecimiento iniciales. Los ítems sin marcar MUST permanecer en la lista sin cambios. La interfaz y el contrato SHALL NOT ofrecer una forma de omitir este paso.

#### Scenario: Checked items teach the list

- **WHEN** el propietario completa una sesión con ítems marcados y sin marcar
- **THEN** cada ítem marcado de la lista base incrementa su `purchase_count` en 1 y actualiza `last_purchased_at`
- **AND** los ítems sin marcar conservan su `purchase_count` y `last_purchased_at`

#### Scenario: New item added during the trip

- **WHEN** se completa una sesión con un ítem marcado que no existe en la lista base y la lista tiene capacidad
- **THEN** la lista base contiene ese ítem con `purchase_count` 1 y fechas de primera y última compra de ese momento

#### Scenario: Completion sheet has no sync option

- **WHEN** el usuario abre la confirmación de finalizar la compra
- **THEN** no hay casilla ni texto que ofrezca decidir si se actualiza la lista base
- **AND** el texto de la confirmación indica que los ítems marcados se guardan en el historial y en la lista

#### Scenario: Legacy client sends the old flag

- **WHEN** un cliente envía `sync_to_base` con cualquier valor al completar una sesión
- **THEN** la sesión se completa y se sincroniza igualmente
- **AND** el valor recibido no cambia el resultado ni produce un error de validación

### Requirement: Completion has a single entry point

Una sesión SHALL pasar a `completed` únicamente mediante la operación de finalización. Cualquier otra actualización de la sesión que intente fijar `status` en `completed` MUST rechazarse con `422` y un mensaje que indique la operación correcta, sin modificar la sesión, de modo que ninguna ruta complete un viaje sin aprender.

#### Scenario: Status set through a generic update

- **WHEN** un cliente actualiza una sesión activa enviando `status: "completed"` por la operación de edición
- **THEN** la respuesta es `422`, la sesión sigue `active` y la lista base no cambia

#### Scenario: Other fields keep working

- **WHEN** un cliente actualiza el nombre o las notas de una sesión activa por la operación de edición
- **THEN** el cambio se guarda como hasta ahora

### Requirement: Completion and learning are one atomic operation

La finalización SHALL marcar la sesión como completada, guardar total y notas, y aplicar la sincronización dentro de una única transacción. Si cualquier parte falla, la sesión MUST seguir activa y la lista base MUST quedar sin cambios. El error devuelto SHALL ser accionable y MUST NOT exponer mensajes internos de base de datos.

#### Scenario: Synchronization fails

- **WHEN** falla un paso de la sincronización durante la finalización
- **THEN** la sesión permanece `active`, sin `completed_at`, y ningún ítem de la lista base cambia
- **AND** el usuario recibe un error que le permite reintentar

#### Scenario: Successful completion

- **WHEN** la finalización se confirma
- **THEN** la sesión queda `completed` con `completed_at`, `total_amount` y `general_notes` si se enviaron
- **AND** la respuesta incluye el resumen `new_count`, `updated_count`, `skipped_count` y `over_limit_count` de la sincronización

### Requirement: Completing twice never counts a purchase twice

Completar una sesión que ya no está activa SHALL fallar con un conflicto sin modificar la sesión ni la lista base. Reenviar la misma petición de finalización MUST NOT duplicar incrementos de `purchase_count` ni de precios promedio.

#### Scenario: Repeated request

- **WHEN** se envía dos veces la finalización de la misma sesión, de forma secuencial o simultánea
- **THEN** exactamente una finalización se aplica a la lista base
- **AND** la otra recibe un conflicto (`409`) sin efectos

#### Scenario: Session of another user

- **WHEN** un usuario autenticado intenta completar una sesión que no posee
- **THEN** la respuesta es `404` y no se modifica nada

### Requirement: The list limit never blocks finishing a trip

Cuando añadir los ítems nuevos marcados superaría el máximo de ítems por lista, la finalización SHALL completarse igualmente: los ítems existentes se actualizan, los ítems nuevos que caben se añaden por orden de aparición en la sesión y los que no caben se omiten. La interfaz MUST informar cuántos ítems no se guardaron en la lista.

#### Scenario: Full list with new checked items

- **WHEN** una lista con el máximo de ítems se completa con ítems nuevos marcados
- **THEN** la sesión se completa y los ítems existentes marcados se actualizan
- **AND** ningún ítem nuevo se añade, la respuesta los cuenta en `skipped_count` e identifica cuántos lo fueron por el límite en `over_limit_count`, y el usuario ve cuántos no se guardaron

#### Scenario: Partial capacity

- **WHEN** a la lista le caben menos ítems nuevos que los marcados
- **THEN** se añaden los primeros que caben y el resto se omite y se informa

### Requirement: Existing history is preserved

El cambio SHALL NOT modificar, recalcular ni borrar sesiones completadas anteriores ni contadores ya almacenados en la lista base.

#### Scenario: Deploy with prior history

- **WHEN** se aplica el cambio sobre una cuenta con sesiones completadas anteriores
- **THEN** sus estados, totales, fechas y los valores actuales de enriquecimiento permanecen idénticos
