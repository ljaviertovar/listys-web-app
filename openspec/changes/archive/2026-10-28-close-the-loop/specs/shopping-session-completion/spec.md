# Spec Delta

## MODIFIED Requirements

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
