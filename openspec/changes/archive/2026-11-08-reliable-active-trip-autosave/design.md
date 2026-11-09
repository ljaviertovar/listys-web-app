# Design

## Context

Ver [proposal.md](proposal.md) para la motivación. La implementación actual mantiene `checked` en cada `useSessionItemActions`, revierte el check en errores y ejecuta `router.refresh()` por guardado. El resumen y el estimado se calculan en el Server Component de shopping. El listener Realtime refresca la ruta en INSERT/UPDATE/DELETE; la barra activa consulta su progreso aparte.

El PATCH v1 y las Server Actions de ítems actualizan la tabla directamente sin versión ni comprobación transaccional del estado activo. `useActiveSessionStore` almacena el catálogo de sesiones, no sus ítems. La finalización ya usa `complete_shopping_session`; la migración `20261105000000_trip_receipts_per_store.sql` contiene bloqueo de sesión en finalización y adjuntos, y mutaciones de ítems al adjuntar. Estas son las bases que se amplían, sin reemplazar las reglas de aprendizaje o recibos.

## Goals / Non-Goals

**Goals:** un único estado visible, cola durable de checks, confirmaciones ordenadas, conflictos explícitos y exclusión mutua en BD entre guardado y finalización.

**Non-Goals:** historial de versiones, CRDT, sincronizar formularios completos offline, garantizar entrega al cerrar el navegador, guardar por lotes, añadir infraestructura de colas o nuevas dependencias. Los cambios offline de otro celular no forman parte de `flush()`.

## Decisions

### 1. Store del contenido y estado derivado

Crear un store Zustand separado, con entradas por usuario y trip. Los consumidores de la sesión abierta y la barra activa comparten selectores; el catálogo existente de sesiones conserva su responsabilidad. Mantener el coordinador de cada trip durante navegación dentro del área autenticada; desmontar una fila no cancela la cola. Cerrar sesión invalida su generación y detiene envíos. Una respuesta de una cuenta/sesión anterior no modifica otra entrada.

Cada entrada contiene base confirmada por ID, intenciones de check, conflictos y metadatos de sincronización. La intención guarda `itemId`, `checked`, `expectedVersion` y una secuencia local; la petición captura una copia de esa intención. La secuencia local identifica acciones de esta interfaz y no sustituye la versión del servidor. La vista superpone únicamente intenciones activas; un conflicto muestra el servidor y conserva aparte lo que quiso el usuario.

Filas, secciones, contadores, acciones y estimado derivan de esa vista. Reutilizar los cálculos de precios actuales: solo ítems marcados, precio por línea sin multiplicar por cantidad, cobertura y ausencia de datos sin cambios. No guardar contadores ni totales derivados en paralelo. Alternativa descartada: estados por fila con refrescos, porque mantiene varias fuentes visibles.

### 2. Coordinador de outbox con una petición por trip

Implementar el coordinador en un hook local del dominio con transiciones puras comprobables. Debounce de 700 ms desde la última interacción y plazo de 2 s desde el primer pendiente de la ventana; un cambio continuo no reinicia ese plazo. Recorrer los ítems pendientes en orden estable del primer cambio; coalescer el valor por ítem. Una sola petición en curso por trip mantiene orden y acota peticiones, sin bloquear los checks.

En una confirmación, actualizar la base solo si la versión no retrocede. Eliminar la intención únicamente si su secuencia coincide con la enviada. Si hay otra posterior, mantenerla y avanzar su versión de origen solo cuando la confirmación pertenece a nuestra petición y no hay una versión externa superior. Si existe una versión superior externa, reconciliar; no rebasar automáticamente sobre ella. Mantener el objetivo de un cambio posterior incluso cuando coincide con la base anterior mientras haya una petición en vuelo que pueda alterarla.

Usar estados `saved`, `pending`, `saving`, `error`, y conflictos por ítem. Guardado significa cola vacía, ninguna petición y ningún conflicto; programar un temporizador no equivale a guardar. La configuración de tiempos vive en el dominio y se comparte con sus pruebas. Alternativa descartada: petición por click o paralelismo ilimitado.

### 3. Persistencia mínima y recuperación

Usar `persist`/`createJSONStorage` con persistencia selectiva, clave versionada por usuario y trip. Guardar IDs, valores deseados, versiones de origen, secuencias e intenciones en conflicto; nunca tokens, nombres, precios, recibos ni flags de petición en curso. La intención enviada permanece durable hasta confirmarse: una respuesta perdida no vacía la cola.

Validar el sobre al hidratar con Zod, rechazar formatos corruptos/desconocidos con aviso y no sobrescribir almacenamiento con una cola vacía antes de terminar la hidratación. Cargar primero el estado autorizado actual y reconciliar después: un valor ya satisfecho resuelve el pendiente; una versión distinta con valor diferente crea conflicto; sin ítem o acceso, suspender ese cambio e informar. Un fallo de storage conserva el trabajo en memoria y avisa de la falta de recuperación tras recarga. No confiar en `beforeunload` o `sendBeacon` para garantizar entrega.

Reintentar red/5xx con esperas base 1, 2, 4, 8, 16 y 30 s, variación aleatoria de ±20 % y límite final de 30 s; reiniciar tras éxito y pausar offline. Reintento manual y reconexión solicitan un intento inmediato sin duplicar una petición en curso. 401 pausa hasta autenticación; 404 detiene el ítem o sesión; 409 reconcilia; 410 pide recarga; 422 requiere corregir datos. Añadir al resultado del cliente REST el estado HTTP necesario, de forma compatible con sus consumidores actuales.

### 4. Versión entera y escritura condicional

Añadir `version INTEGER NOT NULL DEFAULT 1` y restricción positiva, sin índice de versión ni tabla histórica. Un trigger BEFORE UPDATE compara los campos editables persistidos (nombre/normalización, cantidad, unidad, check, notas, categoría, orden y precio), calcula `OLD.version + 1` si cambian y conserva la versión en un no-op. Excluir timestamps y la propia versión de la comparación; ordenar el trigger para comparar después de normalizar campos. Impedir asignar versiones arbitrarias en inserciones/actualizaciones públicas. El desbordamiento falla de forma segura, sin reiniciar el contador.

Crear una RPC de edición condicional compartida por Route Handler y Server Actions: obtener identidad con `auth.uid()`, comprobar acceso de propietario o colaborador según las funciones y RLS existentes, bloquear primero la sesión y luego el ítem, verificar `active`, comparar versión y aplicar solo campos permitidos. Un cuerpo vacío de cambios es inválido; un no-op con versión vigente devuelve el DTO actual sin incrementar. La autorización precede a cualquier dato de conflicto. Los clientes no envían `user_id`, sesión destino ni la versión final.

La RPC se expone solo a authenticated, sin acceso anónimo; si requiere SECURITY DEFINER para cerrar UPDATE directo, usar search_path seguro, nombres cualificados y comprobaciones explícitas de identidad y acceso, sin asumir que RLS se aplica bajo el propietario. Revocar UPDATE directo de los roles de cliente, incluidos grants por columna, preservando lecturas por RLS y escrituras internas autorizadas. Los triggers de versión por sí solos no evitan sobrescrituras: todos los editores manuales deben pasar por la RPC condicional. Las Server Actions antiguas sin versión rechazan con actualización requerida; no conservar una vía alternativa insegura.

Crear y eliminar ítems siguen siendo operaciones explícitas online de los contratos existentes. Coordinar sus escrituras manuales con la sesión activa para no modificar un trip cerrado; no añadir cola offline ni exigir versión al DELETE en este cambio. La UI actual del trip solo permite checks y no tiene formularios ni menús de edición/eliminación; la edición de la lista reutilizable queda fuera de este cambio. Los checks capturan su versión al crear la intención y la conservan ante conflicto. Los helpers y Server Actions de edición exigen versión; no se añade un editor de trip. Un futuro editor deberá resolver checks pendientes antes de editar/eliminar, capturar la versión al abrirse y conservar los valores ante conflicto.

Alternativas descartadas: hora del celular, `updated_at` como token y última petición gana; no garantizan que una intención offline sea actual.

### 5. Contrato v2 y retirada explícita de la escritura v1

| Operación | Contrato |
| --- | --- |
| PATCH `/api/v2/shopping-session-items/{itemId}` | ID UUID; cuerpo estricto con `expected_version` entero positivo y al menos un campo de edición admitido actualmente |
| Éxito | `200 { data: ItemDto }`; ID, ID de sesión, campos editables/presentables actuales, marcas temporales y `version`, enumerados explícitamente |
| Versión antigua | `409`, código `ITEM_VERSION_CONFLICT`, `details.current_item` con el mismo DTO autorizado |
| Trip completado | `409 SESSION_NOT_ACTIVE`; no se interpreta como éxito aunque el check coincida |
| Sin sesión autenticada / sin acceso o eliminado | `401 UNAUTHORIZED` / `404 NOT_FOUND`; sin datos actuales del ítem |
| Entrada inválida | `422 VALIDATION_ERROR`; cero efectos |
| PATCH v1 retirado | `410 CLIENT_UPDATE_REQUIRED`, mensaje de recarga y enlace successor a v2; no escribir |

Reutilizar `{ error: { code, message, details?, request_id } }` y ampliar sus códigos. Sanitizar fallos de estas operaciones; no devolver SQL ni mensajes internos del proveedor. Añadir `version` a DTOs de lectura/creación y tipos generados sin cambiar la versión de las lecturas existentes. No se requiere ETag/If-Match adicional: el token de concurrencia acordado viaja en `expected_version` y el cambio de entrada obligatoria se publica en v2.

El usuario aceptó retirar inmediatamente el PATCH v1 en vez de permitir pestañas antiguas sin protección. No añadir un período de convivencia con escrituras sin versión. El resto de v1, incluido DELETE, conserva su URL. Actualizar todos los consumidores de PATCH y las firmas de Server Actions, con error explícito para bundles anteriores.

### 6. Realtime y reconciliación

Reutilizar Supabase Realtime para actualizar la base confirmada de ítems, con validación de payload y comparación de versiones. Escuchar también terminación de la sesión o realizar una lectura de estado cuando el evento requiera confirmar acceso. Ignorar duplicados/retrocesos. Para DELETE, cuya entrega puede ser incompleta bajo RLS, confirmar mediante lectura autorizada; revalidar además al volver online, recuperar foco o restablecer la suscripción.

Una lectura iniciada antes de un evento no puede bajar versiones ya aplicadas ni eliminar ítems creados después de su inicio; usar una generación de lectura/eventos y repetir la reconciliación si quedó obsoleta. Las lecturas y refrescos nunca reinicializan el store ni borran su outbox. Mantener los refrescos de datos de recibos/precios que aún sean necesarios, sin usarlos como transporte de cada check ni generar un toast por cada eco propio.

Si un conflicto contiene el valor deseado, resolver únicamente esa intención. Si difiere, mostrar el valor del servidor y aviso contextual con aplicar de nuevo/descartar. Reaplicar crea una intención nueva con versión actual; no es un retry automático. Conservar la intención de check para comparar y reaplicar; no hay formularios de edición de ítems en la UI actual del trip.

### 7. Barrera de sincronización y transacciones de cierre

`flush()` se une al envío en curso y drena los cambios posteriores; falla si hay errores terminales o conflictos, sin esperar indefinidamente a reintentos. La UI detiene temporalmente nuevas ediciones al completar o preparar la revisión y previene dobles envíos. Ante fallo, reabre la interacción y ofrece reintento; confirmar un adjunto vuelve a comprobar la barrera. Cancelar/eliminar el trip mantiene su confirmación explícita existente y detiene su coordinador cuando se confirma la eliminación.

Finalización, edición manual y adjuntos usan el bloqueo existente de la misma fila de `shopping_sessions` antes de escribir ítems. Reutilizar las RPC actuales de finalización y adjuntos y mantener su orden de bloqueos compatible; no adquirir un ítem primero y después la sesión. Si el guardado confirma antes, el cierre lo incluye; si el cierre gana, el guardado falla por estado. El adjunto a un trip completado sigue permitido y sus mutaciones incrementan versiones; esto no habilita edición manual después del cierre. No cambiar las decisiones de líneas de la revisión ni duplicar aprendizaje.

Una terminación externa suspende la cola, mantiene las intenciones no aplicadas para informar al usuario y ofrece descartarlas; nunca intenta recrear sesión/ítems. El servidor no puede vaciar colas que otro dispositivo mantiene offline y la interfaz no debe prometerlo.

### 8. UI y verificación

Reutilizar el patrón de feedback inline/estado tonal del Design system v2 para guardado y conflicto; componentes y tamaños de la capa compartida, sin estilos de apariencia dispersos. El texto del producto conserva el idioma inglés actual; los nombres españoles del plan describen la semántica. Exponer estado accesible y reintento por teclado, sin avisos repetitivos por cada check; componentes nuevos con `data-testid` semántico y `testId` contextual cuando corresponda.

Pruebas con temporizadores falsos y promesas controladas para el coordinador; integración PostgreSQL real para CAS, permisos y carreras; Playwright con dos contextos del mismo usuario y Supabase real local. Simular desconexión/latencia sin mockear Supabase en E2E. Reemplazar expectativas actuales de rollback de checks por conservación de pendientes, manteniendo pruebas de operaciones explícitas. Verificación visual móvil y escritorio con DOM, estilos computados y capturas contra la referencia HTML; no añadir pruebas de apariencia.

## Risks / Trade-offs

- Mayor complejidad del cliente → transiciones puras y separación entre versión servidor y secuencia local, con pruebas de respuestas/eventos desordenados.
- Serializar envíos aumenta el tiempo de vaciado en listas grandes → coalescer cambios; medir antes de introducir lotes.
- Revocar UPDATE directo puede afectar consumidores existentes → migrar Route Handlers y Server Actions y verificar RPC de recibos bajo los permisos finales antes de activar.
- LocalStorage no es almacenamiento garantizado → payload mínimo validado, aviso de fallo y recuperación sin depender del cierre del navegador.
- Una versión por ítem produce conflicto incluso si otro dispositivo editó otro campo del mismo ítem → resolución explícita; no introducir versiones por campo en esta fase.
- Las specs principales aún reflejan comportamientos anteriores de recibos → añadir requisitos independientes y sincronizar primero los cambios completos de rediseño y totales.

## Migration Plan

1. Revisar una migración aditiva: sin DELETE/TRUNCATE, drops de datos, cascadas nuevas ni recálculo de historia. Añadir versión, trigger y RPC nueva; conservar valores existentes. No aplicar migraciones destructivas tampoco en tests.
2. Verificar en Supabase local/provisionado la autenticación real, RLS, triggers, CAS, rutas internas y carreras. Credenciales de E2E solo en `E2E_SUPABASE_*`, sin valores por defecto en código.
3. Desplegar la expansión de esquema antes de los consumidores nuevos. Coordinar activación de permisos finales, rechazo v1 y servidor/cliente v2 en una ventana controlada; no declarar garantías multidispositivo mientras siga habilitada una vía de UPDATE sin condición.
4. Mantener lecturas y adjuntos compatibles; mostrar actualización requerida a bundles antiguos. Actualizar referencia API v1 con retirada, documentar v2 y enlazar desde el índice, arquitectura/implementación, PRD afectado, diseño/gaps y runbook de despliegue en la implementación.
5. Registrar código de resultado, latencia y conflictos mediante la instrumentación existente, sin cuerpos de ítems, credenciales ni recibos. Validar lint, typecheck, pruebas del dominio y guard de props nativas.
6. Rollback: deshabilitar la nueva UI y suspender escrituras manuales si es necesario, conservando columna, versiones y colas. No volver a habilitar escrituras antiguas incondicionales como rollback; corregir hacia adelante y no ejecutar una migración destructiva inversa.
