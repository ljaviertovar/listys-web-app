# Spec Delta

## Purpose

Define a consistent, recoverable confirmation flow for deleting receipts and lists and cancelling active trips, including the pending state, navigation after success, and protection against accidental dismissal or duplicate interaction.

## ADDED Requirements

### Requirement: Pending deletion keeps its confirmation open and blocks the page
Después de confirmar un borrado o la cancelación de un viaje, la confirmación SHALL permanecer abierta y bloquear las interacciones fuera de ella hasta que termine la operación. Mientras está pendiente, MUST NOT poder cerrarse con Escape, clic exterior, botón de cerrar o Cancel, y MUST NOT permitir interacción con el resto de la pantalla.

#### Scenario: User tries to dismiss while deletion is pending
- **WHEN** el usuario intenta cerrar la confirmación o interactuar con el fondo mientras se borra un recibo, una lista o un viaje
- **THEN** la confirmación permanece abierta, el fondo no responde y no se inicia una segunda operación

#### Scenario: Deletion fails
- **WHEN** falla el borrado o la cancelación
- **THEN** la confirmación permanece abierta, muestra un error accionable, termina el bloqueo pendiente y permite reintentar o cancelar

### Requirement: Successful deletion navigates to the relevant destination
Cuando el borrado o cancelación termina correctamente, la interfaz SHALL navegar fuera del detalle a su destino: Receipts para recibos, Lists para listas y Dashboard para viajes cancelados. La confirmación MUST permanecer abierta hasta que empiece la navegación.

#### Scenario: Receipt deleted
- **WHEN** se elimina correctamente un recibo
- **THEN** la interfaz navega a Receipts y la confirmación desaparece como parte de esa navegación

#### Scenario: List deleted
- **WHEN** se elimina correctamente una lista
- **THEN** la interfaz navega a Lists y la confirmación desaparece como parte de esa navegación

#### Scenario: Active trip cancelled
- **WHEN** se cancela correctamente un viaje activo
- **THEN** la interfaz navega a Dashboard y la confirmación desaparece como parte de esa navegación

### Requirement: Deletion notifications do not offer Undo
Los avisos de éxito de borrar recibos, listas o viajes MUST NOT ofrecer la acción "Undo". El borrado de una lista SHALL ejecutarse al confirmar, sin una demora de deshacer.

#### Scenario: Deletion succeeds
- **WHEN** se borra correctamente un recibo, una lista o un viaje
- **THEN** cualquier aviso de éxito carece de la acción "Undo" y el borrado no queda pendiente de un plazo de deshacer
