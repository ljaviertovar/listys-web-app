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

Una sesión SHALL pasar a `completed` únicamente mediante la operación de finalización o adjuntándole un recibo mientras está activa, que aplica la misma finalización en la misma transacción. Cualquier otra actualización de la sesión que intente fijar `status` en `completed` MUST rechazarse con `422` y un mensaje que indique la operación correcta, sin modificar la sesión, de modo que ninguna ruta complete un viaje sin aprender.

#### Scenario: Status set through a generic update

- **WHEN** un cliente actualiza una sesión activa enviando `status: "completed"` por la operación de edición
- **THEN** la respuesta es `422`, la sesión sigue `active` y la lista base no cambia

#### Scenario: Other fields keep working

- **WHEN** un cliente actualiza el nombre o las notas de una sesión activa por la operación de edición
- **THEN** el cambio se guarda como hasta ahora

#### Scenario: Completed by attaching a receipt

- **WHEN** el propietario adjunta un recibo a una sesión activa
- **THEN** la sesión queda `completed` con `completed_at` y sus ítems comprados se aplican a la lista base exactamente una vez, como en la operación de finalización

#### Scenario: Completing after a receipt completed the session

- **WHEN** un cliente envía la operación de finalización para una sesión que un recibo adjunto ya completó
- **THEN** recibe un conflicto (`409`) y ni la sesión ni la lista base cambian

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

### Requirement: Completion waits for this device's pending changes

Antes de completar desde la interfaz, la app SHALL detener nuevas ediciones locales y confirmar todos los checks pendientes de ese dispositivo. Un error de guardado o conflicto sin resolver SHALL impedir iniciar la finalización y ofrecer recuperación. Esta garantía MUST NOT presentarse como confirmación de cambios offline de otros dispositivos.

#### Scenario: Complete with unsent checks

- **WHEN** el usuario completa un trip con checks todavía pendientes
- **THEN** se guardan antes de enviar la finalización y el historial incluye sus estados confirmados
- **AND** se previenen nuevas ediciones y dobles envíos durante la transición

#### Scenario: Flush fails

- **WHEN** falla el guardado previo a completar
- **THEN** no se envía la finalización, se conservan los pendientes y se permite reintentar

#### Scenario: An unresolved conflict exists

- **WHEN** el usuario intenta completar con una intención pendiente de resolución
- **THEN** debe volver a aplicarla o descartarla antes de finalizar

### Requirement: Completion and manual item writes serialize safely

Las escrituras manuales de ítems y la finalización SHALL coordinarse atómicamente sobre la misma sesión. Un guardado anterior confirmado SHALL incluirse al completar; un guardado posterior a la finalización SHALL fallar con `409 SESSION_NOT_ACTIVE`, sin modificar historial ni aprendizaje de la lista.

#### Scenario: Save wins the race

- **WHEN** el guardado de un check se confirma antes de que la finalización adquiera acceso exclusivo a la sesión
- **THEN** la finalización utiliza el check confirmado

#### Scenario: Completion wins the race

- **WHEN** la finalización se confirma antes de que un guardado tardío pueda validar y escribir
- **THEN** el guardado recibe `409 SESSION_NOT_ACTIVE` y el ítem no cambia

### Requirement: External termination stops local synchronization

Si el trip se completa o se elimina desde otro dispositivo, el cliente SHALL detener sus guardados, actualizar el estado de la vista e informar qué intenciones locales no se aplicaron. MUST NOT descartar silenciosamente esos cambios ni recrear la sesión eliminada.

#### Scenario: Another phone completes the trip

- **WHEN** un celular conoce que el trip terminó mientras conserva checks pendientes
- **THEN** deja de enviarlos y muestra que no se aplicaron porque el trip terminó

#### Scenario: Cancellation deletes the session

- **WHEN** una lectura autorizada confirma que la sesión pendiente ya no está disponible
- **THEN** se detiene la cola y se informa sin filtrar si se perdió acceso o se eliminó
