# Proposal

## Why

Cada fila del trip guarda su check por separado y refresca la página; el progreso y el estimado no comparten su estado optimista. Una respuesta tardía, una recarga o un segundo dispositivo pueden perder o sobrescribir cambios, y el guardado actual no impide modificar ítems de un trip ya completado.

## What Changes

- Unificar el estado visible del trip activo para filas, categorías, progreso y Estimated total, preservando las reglas actuales de precios.
- Autoguardar checks tras 700 ms de pausa, con espera máxima de 2 segundos cuando no haya una petición en curso; agrupar por ítem y conservar modificaciones posteriores a cada envío.
- Persistir una cola pequeña por usuario y trip, recuperar cambios tras recarga y mostrar guardado, error, reintento y conflictos sin deshacer cambios por fallos temporales.
- Añadir versiones enteras por ítem y reconciliar cambios entre dispositivos sin sobrescribir automáticamente una versión antigua.
- **BREAKING:** trasladar las ediciones de ítems a un PATCH v2 con versión esperada obligatoria; retirar la escritura del PATCH v1 con `410 CLIENT_UPDATE_REQUIRED`. El usuario aceptó exigir recarga a pestañas antiguas.
- Vaciar la cola antes de finalizar o revisar/confirmar un recibo; coordinar las escrituras con finalización y adjuntos mediante transacciones y bloqueo de la sesión.
- Incluir en el versionado los cambios de recibos y cerrar vías de actualización que eludan las comprobaciones.

## Capabilities

### New Capabilities

- `active-trip-synchronization`: estado optimista compartido, autoguardado recuperable, versiones por ítem y reconciliación entre dispositivos.

### Modified Capabilities

- `shopping-session-completion`: exigir confirmación de los cambios del dispositivo antes de completar y rechazar escrituras manuales tardías.
- `trip-receipts`: sincronizar checks antes de la revisión y confirmación, e incorporar las mutaciones de recibos al versionado.

## Impact

- Store del contenido del trip, hooks y componentes de shopping-sessions, resumen/progreso de la barra activa, listeners Realtime y orquestación de la página de shopping.
- Cliente REST, Route Handlers, Server Actions de ítems, servicios, DTOs y tipos Supabase; migración aditiva de `shopping_session_items`, funciones de escritura y permisos.
- Vitest, integración PostgreSQL y Playwright con dos contextos; documentación de API, arquitectura, producto, despliegue y diseño cuando se implemente.
- Sin nuevas dependencias ni historial de versiones. La cola offline cubre checks; crear, eliminar y editar otros campos siguen siendo operaciones explícitas de los contratos existentes. La UI actual del trip no ofrece formularios ni menús de edición/eliminación; no se añaden en este cambio ni se modifica la edición de la lista reutilizable. La colaboración experimental conserva sus permisos actuales.
- `trip-receipt-review-redesign` y `accumulate-active-trip-totals` están completos pero sin archivar. Este cambio se construye sobre su comportamiento implementado; sus deltas deben sincronizarse antes de archivar este cambio. No reintroducir selección de recibos ni reglas de estimado anteriores.
