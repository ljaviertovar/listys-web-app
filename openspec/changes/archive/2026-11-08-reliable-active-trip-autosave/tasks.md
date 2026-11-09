# Tasks

## 1. Versiones y escritura transaccional

- [x] 1.1 Preparar la migración aditiva de versión positiva y trigger de mutaciones efectivas, incluida normalización y cambios de recibos; verificar por revisión explícita que no elimina registros ni recalcula historia, antes de ejecutar nada.
- [x] 1.2 Implementar la RPC condicional con identidad, permisos propietario/colaborador y bloqueos sesión→ítem; verificar con integración PostgreSQL que una versión antigua no escribe, un no-op vigente no incrementa y dos escritores de la misma versión no sobrescriben cambios.
- [x] 1.3 Incorporar los permisos finales que impiden UPDATE directo y asignación de versión por roles cliente, sin romper RPC autorizadas; comprobar con usuarios reales locales acceso propio, colaborador, ajeno y anónimo, además de recibos.
- [x] 1.4 Coordinar creación/eliminación manual de ítems con sesión activa y confirmar compatibilidad con los bloqueos de cierre/adjuntos; verificar carreras guardado→cierre y cierre→guardado, con fixtures aisladas y sin migraciones destructivas.
- [x] 1.5 Regenerar tipos y documentar el nuevo modelo, permisos y orden de bloqueo en arquitectura/implementación; verificar tipos coherentes con la migración y preservar campos y valores históricos salvo la nueva versión.

## 2. Contrato HTTP y consumidores explícitos

- [x] 2.1 Añadir contrato y PATCH v2 con `expected_version`, cuerpo estricto, DTO explícito y códigos de conflicto/estado; verificar tests de handler y servicio para éxito, 401, 404, 409, 422 y errores internos sanitizados con `request_id`.
- [x] 2.2 Añadir versión a lecturas/creaciones y al resultado tipado del cliente, conservando el estado HTTP para clasificar reintentos; verificar contratos y que consumidores existentes de otras rutas siguen funcionando.
- [x] 2.3 Retirar escritura del PATCH v1 con `410 CLIENT_UPDATE_REQUIRED` y successor a v2; migrar helpers y Server Actions de ítems a la misma RPC, rechazando firmas antiguas sin versión; comprobar que no queda un escritor manual incondicional.
- [x] 2.4 Verificar los consumidores actuales de checks y helpers/Server Actions: usar la versión capturada de la intención, conservarla ante conflicto y exigir reaplicación explícita; documentar que el trip no tiene formularios ni menús de edición/eliminación y que la edición de la lista reutilizable queda fuera de este cambio.
- [x] 2.5 Documentar v2, retirada del PATCH v1, errores y recarga de clientes antiguos, enlazando la referencia desde el índice; verificar que ejemplos y contratos coinciden y no contienen credenciales.

## 3. Store compartido y coordinador de checks

- [x] 3.1 Implementar store por usuario/trip con base, secuencias locales, outbox y conflictos, con selectores de vista; comprobar pruebas de reglas para agrupación, progreso y estimado sin duplicar la cobertura de helpers de precios.
- [x] 3.2 Implementar coordinador local del dominio, debounce 700 ms, espera máxima 2 s y una petición por trip; verificar con temporizadores falsos pausa, interacción continua, varios ítems y coalescencia.
- [x] 3.3 Separar snapshots enviados de ediciones posteriores y manejar versiones externas superiores a la respuesta; verificar promesas controladas, check→uncheck en vuelo, ecos Realtime y ausencia de borrado de intenciones nuevas.
- [x] 3.4 Incorporar persistencia mínima validada, hidratación y recuperación de intención en vuelo/conflicto; verificar recarga, formato corrupto, storage rechazado, cambio de cuenta y respuesta perdida sin persistir contenido sensible.
- [x] 3.5 Implementar clasificación de errores, pausa offline y backoff acotado con variación aleatoria; verificar errores temporales, reintento manual, reconexión y detención por 401/404/409/410/422 sin envíos duplicados.
- [x] 3.6 Documentar arquitectura del store, garantías de recuperación y límites de entrega; verificar que los tiempos y la semántica documentados coinciden con las pruebas del coordinador.

## 4. Integración de pantalla y Realtime

- [x] 4.1 Conectar filas, secciones, resumen, acciones y barra activa al mismo estado visible, manteniendo el coordinador durante navegación autenticada; verificar comportamiento inmediato con petición lenta y ausencia de reinicialización por refrescos.
- [x] 4.2 Sustituir refresco por check por reconciliación de eventos validados y lecturas al reconectar/foco; verificar eventos antiguos/duplicados, lectura obsoleta, eliminaciones y cambios ajenos sin perder pendientes.
- [x] 4.3 Añadir estado inline de sincronización y avisos contextuales de conflicto con reaplicar/descartar, usando variantes compartidas de v2; verificar sus interacciones y que una intención satisfecha no emite otra escritura.
- [x] 4.4 Actualizar las pruebas existentes que esperan rollback de checks y añadir solo cobertura de comportamiento nueva; ejecutar los tests del feature y de la barra activa, sin pruebas de clases o primitivas externas.
- [x] 4.5 Inspeccionar HTML, estilos computados y dimensiones en móvil y escritorio, capturar estados de guardado/error/conflicto y compararlos con el HTML v2; corregir discrepancias y documentar el patrón/gap en DESIGN.md cuando corresponda, verificando también `data-testid` de componentes nuevos.

## 5. Finalización y recibos

- [x] 5.1 Implementar `flush()` que se une al envío en curso y drena cambios posteriores, fallando ante conflictos o errores; verificar que no completa prematuramente ni espera indefinidamente a reintentos.
- [x] 5.2 Integrar barrera en completar y en apertura/confirmación de revisión, con bloqueo temporal de nuevas ediciones y dobles envíos; verificar que un fallo conserva pendientes y no ejecuta la acción final.
- [x] 5.3 Suspender colas cuando el trip se complete, desaparezca o se pierda acceso y mostrar intenciones no aplicadas; verificar terminación desde el segundo contexto y cancelación sin recreación ni descarte silencioso.
- [x] 5.4 Verificar en PostgreSQL que los cambios de recibos incrementan versión, siguen permitidos en trips completados y no duplican aprendizaje; ejecutar además las pruebas de finalización y flujos de recibos afectados.
- [x] 5.5 Actualizar documentación canónica del flujo y límites multidispositivo; verificar que distingue cola local de otros celulares offline y conserva las reglas vigentes de recibos y Estimated total.

## 6. Verificación integrada y preparación de despliegue

- [x] 6.1 Añadir/ejecutar Playwright con dos contextos del mismo usuario y Supabase local real: ítems distintos, mismo ítem, conflicto tras cambios intermedios, respuesta perdida, desconexión/recarga y finalización con pendientes; usar solo `E2E_SUPABASE_*` y fixtures aisladas, sin mocks de Supabase.
- [x] 6.2 Ejecutar `pnpm lint`, `pnpm typecheck`, tests correspondientes, `pnpm check:native-props` y E2E dirigido con `npx playwright test`; corregir fallos y registrar resultados y límites de la validación.
- [x] 6.3 Preparar runbook con expansión de esquema, activación coordinada de permisos/v2/retiro v1 y rollback sin volver a escrituras inseguras; verificar el checklist de despliegue y observabilidad de códigos/latencia/conflictos sin contenido de ítems.
- [x] 6.4 Revisar diff final, documentación, componentes nuevos y validación estricta del cambio OpenSpec; comprobar que las garantías y escenarios implementados coinciden con estas specs, sin marcar tareas pendientes como completadas.

## Workflow follow-up

- Antes de sincronizar/archivar este cambio, sincronizar primero `trip-receipt-review-redesign` y después `accumulate-active-trip-totals`; este cambio añade requisitos independientes y no debe sobrescribir sus deltas.
- Despliegue y archivo son pasos posteriores; las tareas anteriores preparan y verifican el cambio sin asumir autorización para publicar.
