# Spec Delta

## ADDED Requirements

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
