# Hallazgos para la segunda iteración

Registro de dependencias funcionales; no son tareas de implementación de esta propuesta. Priorizar y reproducir en una instancia local aislada antes de decidir la corrección. **C** = código; **B** = navegador; **hipótesis** = causa sin confirmar.

| ID | Evidencia y síntoma | Investigación posterior | Límite de la primera pasada |
| --- | --- | --- | --- |
| F01 | B: login desde el servidor local termina en Vercel tras Google. | Revisar redirect URLs de Supabase/Google y callbacks por entorno. No se afirma una causa concreta. | Usar sesión autorizada de solo lectura, identificar su origen y no exportarla ni cambiar OAuth. |
| F02 | B: dashboard muestra una lista en un grupo y acceso directo a la lista funciona, pero la pantalla de listas del grupo aparece vacía. | Reproducir con el mismo usuario/build; inspeccionar contrato, shape DTO, llamadas servidor/API, cache y permisos. | El estado de error conocido puede presentarse honestamente; no inventar datos ni ajustar filtros de negocio para esconder la inconsistencia. |
| F03 | C: la ruta de password reset no existe y el callback/email signup redirige al dashboard. | Implementar recuperación real y revisar confirmación por email, destino `next` y feedback de callback. | Retirar enlace falso y corregir mensajes existentes; no crear un nuevo flujo de auth. |
| F04 | C: completar actualiza estado antes de invocar la RPC de sincronización, que puede fallar después. | Atomicidad, respuesta parcial, idempotencia y recuperación de sesión/base list. | No prometer éxito atómico en el copy ni cambiar la transacción desde esta tarea visual. |
| F05 | C: toggle optimista revierte en catch y solo escribe en consola. | Revisar resultados de red, reintentos y sincronización. | Se permite mostrar un error seguro usando el catch actual; no añadir colas/reintentos o persistencia offline. |
| F06 | C: Undo de item de base list recrea la fila con nuevo id; session remove no ofrece restauración. | Definir restore/soft-delete y consistencia de identidad si el producto requiere Undo fiable. | Confirmación antes del delete existente cuando no hay undo fiable; no construir nueva restauración. |
| F07 | C: sesión realtime/estado local pueden divergir; carga del progreso requiere peticiones adicionales. | Estado derivado, refresh, realtime, concurrencia y conteos entre pantallas. | Pulir feedback existente sin alterar el motor de sincronización. |
| F08 | C: `invite/[token]` acepta la invitación al renderizar y luego redirige; error puede mostrar el mensaje recibido. | Consentimiento explícito, efectos al render, seguridad, expiración y retorno tras login. | Auditar copy/error por código; no abrir un token real ni aceptar una invitación durante esta revisión. |
| F09 | C: importes usan USD por defecto, fechas manuales y algunos totales dependen de truthiness. | Definir moneda/localización y contratos de cantidad/precio antes de cambiar interpretación o cálculo. | Unificar presentación con formatters existentes y mostrar cero distinto de desconocido; no cambiar moneda ni significado de price. |
| F10 | C: frontend de OCR no ofrece edición completa de líneas aunque marketing lo promete. | Priorizar edición OCR como funcionalidad independiente si se desea. | Corregir la promesa y describir comparación/selección actuales. |
| F11 | C: subir foto más clara crea otro recibo; no hay reemplazo en ese diálogo. | Decidir si el producto necesita reemplazo/reprocesamiento con nuevas imágenes. | Explicar que es una nueva subida; no cambiar endpoint ni reasignar fotos. |
| F12 | C: setup/teardown E2E incluyen borrado global y credenciales ordinarias. | Completar `stabilize-test-foundation` y probar aislamiento local antes de volver a ejecutar suites persistentes. | No ejecutar `npx playwright test` con el harness actual, helpers de reset ni migraciones destructivas. |
| F13 | C: faltan destinos legales reales en el inventario. | Obtener textos aprobados y definir sus páginas públicas y acceso sin autenticación. | Identificar dependencia de lanzamiento; no inventar términos/política ni afirmar que retirar enlaces resuelve el requisito legal. |

## Dependencias de entorno

El arranque adicional en WSL encontró permisos al adquirir `.next/dev/lock`; el servidor del usuario sí fue accesible desde el host Windows. Es una limitación de ejecución del checkout, no un diagnóstico de fallo de producto. Un servidor auxiliar temporal se preparó con caché en `/tmp`, sin editar configuración del proyecto; no se usa como evidencia de equivalencia del despliegue.

Las pantallas afectadas por una dependencia funcional no se marcarán listas para producción solo porque su presentación mejore. La aceptación de esta iteración es de UI/UX y deja visibles esos bloqueos.
