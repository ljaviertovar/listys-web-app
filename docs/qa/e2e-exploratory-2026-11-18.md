# QA exploratorio móvil de Listys

**Fecha:** 18 de noviembre de 2026 · **Rama:** `feat/empty-states` · **Commit:** `efae9b3`

**Entorno:** servidor local en el navegador integrado, Supabase remoto compartido, cuenta de prueba, viewport de 390 × 844 px. Las anotaciones posteriores del dashboard se documentaron a partir de las capturas del usuario a 522 × 883 px. OCR previsto con Gemini.

## Resumen

Verificación manual únicamente en móvil. Se confirmó un problema alto de integridad de datos, seis problemas medios de validación y siete bajos de interacción, presentación, copy o manejo de errores. El gasto mensual incluyó $273.00 producidos al leer una imagen completamente blanca.

| Severidad | Total | Hallazgos |
| --- | ---: | --- |
| Crítica | 0 | |
| Alta | 1 | QA-005 · recibos y gasto |
| Media | 6 | QA-001 y QA-007/008 · listas/compras, QA-004, QA-009 y QA-010 · recibos/compras |
| Baja | 7 | QA-002 y QA-003 · compras, QA-006 · tiendas, QA-011 · navegación, QA-012 a QA-014 · dashboard |

## Cobertura

| Bloque | Estado | Comprobado | Casos pendientes o bloqueados |
| --- | --- | --- | --- |
| A · Cuenta vacía y onboarding | Parcial | Dashboard inicial en 0 de 3, una sola acción y estados vacíos de listas, compras y recibos. `Set up Pantry` creó la lista Default. Las tiendas ya tenían datos. Tras el borrado autorizado no se recreó sola; Set up Pantry adoptó la lista existente pAnTrY sin duplicarla. | La sesión ya había abierto el dashboard, por lo que no se pudo reconstruir el primer ingreso de una cuenta nueva. |
| B · Listas e ítems | Parcial | Nombre de 100/101, duplicado por capitalización, % y _, nota 500, doble toque, edición con mismo nombre y cambio de mayúsculas. Edición de nota de 300 (QA-001). Cantidades 0.1/99/99.1/0/−1/0.15, emoji y árabe, etiquetas HTML inocuas mostradas como texto. Categorías, filtro persistido con `?store=`, asignación de tienda y Undo que devuelve **Set Usual Store**. Estado de precios vacío y precios aprendidos visibles en la compra. Límite de nombre de ítem 200/201, notas 500 y Undo del borrado. Borrar QA Cascada eliminó su compra y conservó el recibo como independiente; la confirmación avisa que elimina las compras. | Undo con enlaces recordados, límite de categorías, chips +N, selector de precios con datos y límite de 250. La prueba de 250 y la comparación de unidad con la API requieren solicitudes autenticadas con cuerpo. |
| C · Compras | Parcial | Inicio global y por tienda, estimación $276.31 para 36 de 37 ítems, marcado alternado y estado Saved. CAS en dos pestañas, ambas opciones visibles y **Discard** conserva el valor del servidor. Edición posterior al cierre rechazada con `This trip has ended`. Finalización total y parcial, estado con y sin recibo y Save and Upload (QA-009). No se ofrece iniciar una lista vacía. Dos listas activas, Resume abre la compra y el menú de la lista deja de ofrecer Delete. | Aplicar el conflicto, recarga con cambios pendientes, offline/Retry, borrado desde pestaña desactualizada y cancelación. El selector ofreció **Whole list** y tiendas conocidas, sin acción para crear una tienda desde ahí. |
| D · Recibos y OCR | Parcial | OCR independiente con una y tres fotos, límite de cinco al seleccionar seis, rechazo de HEIC y 11 MB, resultado para JPEG ilegibles y JPEG blanco (QA-004/005). Visor con zoom, rotación, cambio de foto por botón y tecla, y Compare. Confirmar/cambiar tienda y guardar dos tiendas nuevas. **Include All**, coincidencias, búsqueda manual, diálogo para lista existente o nueva, revisión y guardado real de 35 ítems nuevos y uno actualizado. | Cinco fotos en un envío, arrastrar y soltar, WebP/GIF, nombre de tienda de 101 en el API, resultados de nueva lista, casos de borrado y relectura de un recibo completado o vinculado. El intento de relectura del recibo fallido dio un error genérico de conexión; su causa no quedó confirmada. |
| E · Adjuntar recibo a una compra | Parcial | Carga y OCR desde compra activa y completada. Adjuntar a una compra completada y a una activa sin cerrarla. Se comprobaron las dos opciones de adjuntar, búsqueda de líneas, exclusión y total −1/0/84.50; el negativo bloquea el envío y cero habilita la acción. Compra guardada en $84.50 y segunda en $88.93 tras adjuntar. La URL del recibo vinculado redirige a la compra. Dos recibos adicionales quedaron pendientes y falló su revisión (QA-010). | **Attach and Complete Trip** sin ejecutar, repetición de adjunto por API, tags «No name», restricciones de fusión por API y validación línea por línea de los precios aprendidos. |
| F · Tiendas | Parcial | Lista, detalle, estadísticas y nombres en recibos. Renombrado con 100/101 y `#123`, duplicado ofrece fusionar, solo símbolos (QA-006). Fusión entre dos tiendas sintéticas y Undo que restaura la tienda de origen. | La salida durante Undo y eliminación de alias no se ejecutaron. |
| G · Dashboard con datos | Parcial | Avance de onboarding y desaparición de Get Started tras tres recibos, **Up Next**, **Last Trip by Store**, **Likely Needed** vacío, **Top Categories**, selector mes/histórico y gasto medio. Con los dos primeros importes: $281.45 + $84.50 = $365.95, media redondeada $182.98. Luego el gasto incluyó un falso positivo de OCR (QA-005). Las capturas anotadas documentan el orden de las tarjetas y los dos estados vacíos de gasto (QA-012 a QA-014). | Likely Needed con recomendaciones y contraste contra un mes anterior con datos. |
| H · Navegación, ajustes y autenticación | Parcial | Tab bar móvil, destino de sus pestañas y botón elevado de carga. Perfil y cuenta. Alias `/profile`, `/account`, `/shopping-history` y `/shopping-lists/x/lists`. La ruta global inexistente muestra **Page not found**. Enlaces inválidos/inexistentes a compras y recibos redirigen al dashboard/recibos. `/auth/signin` autenticado mostró **Welcome back**. | Estado final de lista/tienda inexistentes y anclas de la portada. La protección tras cerrar sesión y el aislamiento de lectura se comprobaron. La respuesta visual para recursos de otra cuenta difiere entre rutas (QA-011). Sign Out y la apertura de `/dashboard` sin sesión llevaron a Sign In. La portada pública cargó en móvil. |
| I · Contrato de API | Parcial | `GET /api/v1/spending` con >92 días, fechas iguales y `scope=all` con fechas devolvió `VALIDATION_ERROR` con mensaje específico. `GET /api/v1/tickets/{id}/status` respondió `completed` para el recibo de tres fotos y `NOT_FOUND` sin estado OCR al consultar desde la segunda cuenta un recibo de la primera. | El navegador integrado expone lectura del DOM y consola registrada, sin envío de solicitudes autenticadas con método/cuerpo arbitrarios por su API de inspección. Los casos de mantenimiento se bloquearon por el proyecto remoto compartido. No se inspeccionaron códigos HTTP o encabezados en una traza. Las rutas de mantenimiento se revisaron en el código sin invocarlas. |

Se comprobaron alertas y estados accesibles en recorridos representativos. El dashboard, las listas vacías, la lista con nombre largo, una compra activa, la revisión del adjunto y el detalle de tienda no tenían desborde horizontal donde se midió: ancho del documento de 390 px. Capturas en el chat para QA-001, QA-002/003, QA-004, QA-005, QA-008 y QA-010.

### Aislamiento de lectura entre cuentas

Con la segunda cuenta autenticada, se abrieron a 390 px cuatro URLs de registros creados por la primera cuenta. Ninguna mostró los datos del registro solicitado.

| Recurso | Ruta probada | Resultado |
| --- | --- | --- |
| Lista | `/base-lists/{id}/edit` | Bloqueada. La página mostró un error interno genérico (QA-011). |
| Compra | `/shopping/{id}` | Redirigió a `/dashboard`. |
| Recibo | `/tickets/{id}` | Redirigió a `/tickets`. La consulta de estado por API devolvió `NOT_FOUND`, sin `ocr_status`. |
| Tienda | `/stores/{id}` | Mostró **Page not found**. |

Para estos casos, el comportamiento esperado del frontend es mostrar la página global **Not Found**, tanto para recursos ajenos como para recursos inexistentes, sin revelar a qué cuenta pertenece el recurso ni mostrar detalles internos. La comprobación cubrió lectura directa. Las operaciones de escritura entre cuentas quedaron fuera de esta comprobación.

## Hallazgos

### QA-005 · Una foto en blanco se convierte en un recibo de $273.00 y altera el gasto

**Severidad:** Alta · **Tipo:** OCR/datos · **Viewport:** 390 × 844 · **URL:** `/tickets/{id}` y `/dashboard`

1. Crear un JPG totalmente blanco de 1000 × 1250 px y subirlo desde **Upload Receipt**.
2. Esperar el resultado y abrir el visor de la foto para comprobar su contenido.
3. Sin confirmar la tienda ni copiar ítems a una lista, abrir **Spend This Month** en el dashboard.

**Esperado:** el recibo queda sin ítems o como no legible y no contribuye al gasto. **Observado en una ejecución:** el JPG blanco se mostró como `Walmart Supercentre Receipt`, con una línea por $13.00 y un total de $273.00. El visor mostraba solo blanco. La página avisó del descuadre, pero el dashboard registró $835.21 en 7 recibos. Los otros seis sumaban $562.21. El falso positivo añadió íntegramente los $273.00 sin confirmación. Captura del visor móvil en el chat.

**Código probable:** procesamiento OCR en `src/lib/server/services/tickets.service.ts` y cálculo usado por `src/app/api/v1/spending/route.ts`.

### QA-001 · La lista no se puede guardar con una nota válida de 300 caracteres

**Severidad:** Media · **Tipo:** Validación/UI · **Viewport:** 390 × 844 · **URL:** `/shopping-lists`

1. Crear una lista con una nota de 300 caracteres.
2. Volver a Lists y abrir **More options → Edit List**.
3. Pulsar **Save** sin cambiar la nota.

**Esperado:** aceptar la nota que ya fue admitida al crear la lista. **Observado:** el formulario permanece abierto y enfoca Notes, con la alerta `Notes cannot exceed 200 characters`. El DOM confirmó que el campo aún tenía 300 caracteres. Captura móvil en el chat.

**Código probable:** `src/components/features/base-lists/base-list-card.tsx` (`secondMax={200}`). La creación declara 500 en `create-base-list-dialog.tsx` y el contrato en `src/lib/validations/base-list.ts` admite 500 tanto al crear como al editar.

### QA-004 · El cargador permite enviar archivos que no son imágenes legibles

**Severidad:** Media · **Tipo:** Validación/UI · **Viewport:** 390 × 844 · **URL:** diálogo Upload Receipt desde `/dashboard`

1. Seleccionar simultáneamente un JPG de 0 bytes, un texto renombrado a JPG y un JPG truncado. Añadir un HEIC simulado y un JPG de 11 MB como controles.
2. Revisar los estados antes de enviar y pulsar **Upload 3 Photos**.
3. Abrir el recibo resultante y revisar su estado.

**Esperado:** marcar las fotos ilegibles como inválidas antes de enviarlas. **Observado:** los tres JPG ilegibles dicen `Ready`, con miniatura rota. HEIC y 11 MB sí se rechazan. Tras enviarlos apareció `Receipt uploaded`, se creó un recibo y la pantalla terminó en `Failed` con `We couldn’t read this receipt`. Captura móvil en el chat.

**Código probable:** `src/components/features/tickets/upload/helpers/classify-photo.ts` y la validación de archivos del servicio de recibos.

### QA-007 · Una lista con nombre válido de 100 caracteres no permite iniciar la compra

**Severidad:** Media · **Tipo:** Lógica/validación · **Viewport:** 390 × 844 · **URL:** `/base-lists/{id}/edit`

1. Crear una lista de 100 caracteres y añadir un ítem.
2. Pulsar **Start Shopping** y confirmar para toda la lista.
3. Renombrar la misma lista a **QA Cascada** y repetir como control.

**Esperado:** iniciar la compra desde cualquier lista con nombre válido. **Observado:** con 100 caracteres, el diálogo queda abierto y aparece `Too big: expected string to have <=100 characters`. Con un nombre corto se inició la compra de la misma lista. El nombre de compra se genera con el sufijo ` trip`.

**Código probable:** `src/components/features/base-lists/start-shopping-dialog.tsx` y `src/lib/validations/shopping-session.ts`.

### QA-008 · Un nombre largo recorta el diálogo y el botón de inicio en móvil

**Severidad:** Media · **Tipo:** UI responsive · **Viewport:** 390 × 844 · **URL:** `/base-lists/{id}/edit`

1. Crear una lista con 100 caracteres que incluyan una palabra larga sin espacios.
2. Añadir un ítem y abrir **Start Shopping?**.

**Esperado:** el título, el texto y los controles caben en el diálogo y el botón principal se puede leer y tocar. **Observado:** el nombre y el texto sobre el alcance se cortan a la derecha, y el botón principal queda parcial, sin su etiqueta visible. La captura del diálogo a 390 px está en el chat. El botón se pudo activar con teclado para comprobar QA-007.

**Código probable:** contenedores de texto, resumen y acciones en `src/components/features/base-lists/start-shopping-dialog.tsx`.

### QA-009 · Save and Upload Receipt guarda la compra sin abrir el cargador

**Severidad:** Media · **Tipo:** Navegación · **Viewport:** 390 × 844 · **URL:** `/shopping/{id}?saved=1&receipt=add`

1. Iniciar una compra de un solo ítem y marcarlo para abrir **Trip Complete**.
2. Pulsar **Save and Upload Receipt**.

**Esperado:** guardar la compra y abrir la carga del recibo. **Observado:** la URL incluye `receipt=add` y aparece **Trip saved**, pero el diálogo de carga no se abrió tras más de 17 s. Pulsar **Attach Receipt** manualmente sí lo abrió.

**Código probable:** `src/components/features/shopping-sessions/complete-session-sheet.tsx` y la vista de compra guardada.

### QA-010 · La revisión de recibos adicionales falla en una compra que ya tiene uno

**Severidad:** Media · **Tipo:** Recibos/compras · **Viewport:** 390 × 844 · **URL:** `/shopping/{id}`

1. Adjuntar un recibo a una compra y guardar la compra.
2. Subir dos recibos adicionales. En la prueba se usaron los archivos 2 y 1 del repositorio, leídos con 36 ítems/$281.45 y 18 ítems/$84.50 respectivamente.
3. Pulsar **Review Receipt** en cada uno. Probar **Retry**.

**Esperado:** permitir revisar el recibo adicional o explicar el conflicto de tienda cuando corresponda. **Observado:** ambos quedaron en **Attach pending**. En ambos la revisión mostró `Couldn’t load the review`. **Retry** no recuperó la revisión del primer recibo adicional. La causa común y el conflicto específico de tienda no se confirmaron a nivel HTTP. Captura móvil en el chat.

**Código probable:** `src/components/features/tickets/attach/attach-to-session-dialog.tsx` y `src/components/features/tickets/attach/hooks/use-trip-review.ts`.

### QA-002 · El aviso Trip Complete vuelve a abrirse en la misma compra

**Severidad:** Baja · **Tipo:** Interacción · **Viewport:** 390 × 844 · **URL:** `/shopping/{id}`

1. Iniciar una compra con un ítem y marcarlo. Se abre **Trip Complete**.
2. Pulsar **Keep Shopping**.
3. Desmarcar y volver a marcar el mismo ítem.

**Esperado según el plan:** la apertura automática ocurre una sola vez durante esa compra. **Observado:** al volver a marcar, el DOM vuelve a exponer `alertdialog "Trip Complete"` visible. Captura móvil en el chat.

**Código probable:** flujo de compra activa bajo `src/components/features/shopping-sessions/`.

### QA-003 · El aviso de finalización llama Pantry a una lista con otro nombre

**Severidad:** Baja · **Tipo:** Copy · **Viewport:** 390 × 844 · **URL:** `/shopping/{id}`

1. Crear una lista común con un ítem e iniciar su compra.
2. Marcar el único ítem y leer el aviso **Trip Complete**.

**Esperado:** identificar la lista de la compra en el mensaje. **Observado:** en la compra de **QA Mobile %_**, el aviso dice `Pantry learns from this trip`. Al guardar, la pantalla siguiente sí dice `1 item updated in QA Mobile %_.` Captura móvil compartida con QA-002.

**Código probable:** `src/components/features/shopping-sessions/complete-session-sheet.tsx`.

### QA-006 · Un nombre de tienda de solo símbolos devuelve un error genérico

**Severidad:** Baja · **Tipo:** Validación/copy · **Viewport:** 390 × 844 · **URL:** `/stores`

1. En My Stores, abrir **More options → Rename** para una tienda de prueba.
2. Introducir `###` y pulsar **Save Name**.

**Esperado:** explicar qué caracteres necesita un nombre válido. **Observado:** `We couldn’t rename this store. Try again.` El campo conserva `###`. Un nombre de 101 caracteres sí devuelve `Store name is too long`, y un nombre válido con sufijo `#123` se guarda.

**Código probable:** edición de tiendas bajo `src/components/features/stores/` y validación de nombre en el servicio de tiendas.

### QA-011 · La UI de recursos ajenos debe mostrar la página global Not Found

**Severidad:** Baja · **Tipo:** Navegación/manejo de errores · **Viewport:** 390 × 844 · **URLs:** rutas de detalle de listas, compras, recibos y tiendas.

1. Desde la primera cuenta de prueba, guardar las URLs de los cuatro recursos registrados en la tabla de aislamiento.
2. Entrar con la segunda cuenta de prueba y abrir cada URL de detalle directamente.

**Esperado:** mostrar la página global **Not Found** de la app en la ruta solicitada. Aplicar la misma respuesta visual a recursos ajenos e inexistentes, con un mensaje público que omita detalles internos. **Observado en la ronda:** la lista mostró `Cannot coerce the result to a single JSON object`; la compra redirigió a `/dashboard`; el recibo redirigió a `/tickets`. La tienda sí mostró **Page not found**. Ninguna ruta mostró los datos del recurso. La consulta de estado del recibo por API devolvió `NOT_FOUND`; el resultado de esa API es independiente de la pantalla de detalle.

**Observación adicional del usuario:** al consultar recibos de la otra cuenta vio un mensaje de error genérico o potencialmente informativo. El texto exacto de ese mensaje no se capturó en la ronda. La redirección de recibos sí quedó verificada y también difiere de la página global esperada.

**Código probable:** las páginas de detalle bajo `src/app/(authenticated)/base-lists/`, `shopping/` y `tickets/`. Página global de referencia en `src/app/not-found.tsx`.

### QA-012 · Get Started debe abrir el dashboard y Up Next quedar al final

**Severidad:** Baja · **Tipo:** Jerarquía visual · **Viewport:** 522 × 883 · **URL:** `/dashboard`

1. Abrir el dashboard en una cuenta con **Get Started** visible y un recibo pendiente en **Up Next**.
2. Revisar el orden de las tarjetas después del saludo.

**Esperado:** mostrar **Get Started** en primera posición entre las tarjetas y dejar **Up Next**, incluida la tarjeta del recibo pendiente, al final del contenido. **Observado:** **Up Next** aparece antes de **Get Started** y de la tarjeta de gasto. Evidencia aportada por el usuario en las capturas anotadas 2 y 3.

**Código probable:** orden de renderizado en `src/components/features/dashboard/dashboard-view.tsx`.

### QA-013 · El gasto histórico vacío necesita un aviso azul y un CTA de carga

**Severidad:** Baja · **Tipo:** Estado vacío/acción · **Viewport:** 522 × 883 · **URL:** `/dashboard`

1. Abrir el dashboard de una cuenta sin gasto contabilizado.
2. Elegir **Spend All Time** y revisar el estado vacío.

**Esperado:** usar un aviso informativo azul y añadir debajo del mensaje un CTA **Upload Receipt** que abra el flujo de carga del primer recibo. **Observado:** se muestra `No receipt spending recorded yet. Upload a receipt to see your spending here.` con un icono, sin un aviso azul ni un botón de carga dentro de ese estado. Evidencia aportada por el usuario en las capturas anotadas 1 y 4.

**Código probable:** rama de gasto histórico vacío en `src/components/features/dashboard/month-spending-card.tsx` y flujo de carga ya disponible en el dashboard.

### QA-014 · El estado de mes sin recibos necesita un aviso azul

**Severidad:** Baja · **Tipo:** Estado vacío/UI · **Viewport:** 522 × 883 · **URL:** `/dashboard`

1. Abrir el dashboard de una cuenta con algún recibo de un mes anterior y ninguno en el mes actual.
2. Elegir **Spend This Month** y revisar el estado vacío.

**Esperado:** presentar el mensaje con el mismo aviso informativo azul que en el estado histórico y conservar la fecha del último recibo y la acción **See All Time**. **Observado:** el mensaje `No receipts in November yet`, la fecha del último recibo y **See All Time** se muestran en un estado vacío sin el aviso azul solicitado. Evidencia aportada por el usuario en la captura anotada 5.

**Código probable:** rama de mes sin recibos en `src/components/features/dashboard/month-spending-card.tsx`.

## Backlog de implementación

| Cambio | Hallazgos | Dependencia |
| --- | --- | --- |
| Verificar que el OCR reconoce un recibo con evidencia suficiente antes de contabilizar su total. | QA-005 | Acordar el criterio de un recibo contabilizable y el tratamiento de los recibos pendientes de confirmar. |
| Validar bytes y decodificación de la foto antes de crear el recibo, con mensajes específicos por archivo. | QA-004 | Coordinar la validación de la interfaz con la del servidor. |
| Unificar el límite de notas entre la creación, la edición y el esquema. | QA-001 | Reutilizar el límite de 500 ya aceptado por la API. |
| Corregir la generación del nombre de compra y el recorte con nombres válidos largos. | QA-007, QA-008 | Validar a 390 px con nombres sin espacios. |
| Recuperar la apertura de carga tras guardar y la revisión de recibos adicionales. | QA-009, QA-010 | Reproducir el fallo de revisión y distinguir el rechazo por tienda de un error de carga. |
| Ajustar la apertura automática y el texto de finalización según la lista de la compra. | QA-002, QA-003 | Conservar la apertura manual y definir si la apertura automática se recuerda tras recargar. |
| Mostrar la regla de nombres de tienda en el error del campo. | QA-006 | Compartir la regla efectiva de normalización con la UI. |
| Unificar el estado de detalle de recursos ajenos e inexistentes en la página global Not Found. | QA-011 | Verificar las cuatro rutas con las dos cuentas y conservar el error estructurado de la API. |
| Reordenar las tarjetas del dashboard con Get Started al principio y Up Next al final. | QA-012 | Verificar con onboarding y revisión de recibo pendientes en la misma cuenta. |
| Unificar los estados de gasto vacío con el Alert informativo azul y añadir el CTA de carga al histórico. | QA-013, QA-014 | Reutilizar el flujo de carga y conservar See All Time en el estado mensual. |

## Datos de prueba creados

- `pAnTrY` marcada Default y con el ítem QA Segunda Compra, y `QA Mobile %_` con ítems manuales y de recibos. Quedó una compra activa por lista. La Pantry original y la lista desechable QA Cascada se borraron con autorización.
- Dos compras guardadas de `QA Mobile %_`, una con $84.50 vinculado y otra en Fortinos con $88.93 vinculado.
- Recibos de prueba para los dos adjuntos, Fortinos independiente incorporado a la lista, un recibo de tres fotos, un recibo fallido con archivos inválidos, dos recibos de mercados sintéticos y el falso positivo de la foto blanca por $273.00. Además, los dos recibos pendientes de revisión de la compra completada y el recibo sintético QA Lark que quedó independiente tras la cascada.

## Correcciones implementadas y verificación

| Hallazgos | Corrección aplicada | Verificación posterior |
| --- | --- | --- |
| QA-001 | La edición de listas admite el mismo máximo de 500 caracteres que creación y API. | Prueba dirigida de listas; TypeScript. |
| QA-002/003 | La apertura automática de **Trip Complete** se recuerda por compra en `localStorage`, incluso al recargar; el aviso usa el nombre de la lista. | TypeScript y revisión del flujo en código. No se volvió a crear una compra remota solo para repetir el caso. |
| QA-004 | El selector decodifica cada imagen antes de aceptarla; el servidor comprueba tamaño, firma JPEG/PNG y MIME antes de almacenar. Los archivos vacíos, renombrados y no legibles se rechazan. | Pruebas de firma/tamaño y clasificadores; TypeScript. |
| QA-005 | El gasto por recibos solo cuenta OCR completado con líneas a precio y total compatibles dentro de una tolerancia de 10 unidades monetarias o 15% del total. La tienda confirmada no es requisito. Esto excluye el caso de $273 respaldado por solo $13 en líneas. | Pruebas del criterio, incluyendo el caso de $273/$13; TypeScript. |
| QA-006 | La validación del nombre de tienda informa que se requiere al menos una letra o número, según la normalización compartida con la búsqueda. | Pruebas de esquema; TypeScript. |
| QA-007/008 | El sufijo ` trip` cabe en el límite de 100 caracteres y los nombres largos pueden partirse dentro del diálogo móvil. | TypeScript; regla de nombre existente y cambio responsive revisados. |
| QA-009 | La tarjeta de compra recién guardada recibe el indicador para abrir automáticamente el cargador al llegar con `receipt=add`. | TypeScript; el CTA independiente del dashboard abrió el diálogo en navegador. No se generó otra compra remota. |
| QA-010 | Las lecturas de recibo, coincidencias e ítems ya no esperan a que se vacíe la cola de sincronización de una compra terminada; la barrera se conserva para guardar. | Pruebas dirigidas del flujo y TypeScript. La cuenta abierta no tenía compras disponibles para reproducir el caso completo. |
| QA-011 | Lista, compra y recibo ajenos o inexistentes llaman `notFound()`; la vista móvil muestra la página global sin texto interno. | Navegador móvil: rutas inexistentes de lista, compra y recibo mostraron **Page not found**. La tienda ya usaba esta vista. |
| QA-012 | **Get Started** aparece antes de las demás secciones y **Up Next** al final. | Navegador móvil a 390 × 844 px: orden visible y coherente con la captura. |
| QA-013/014 | Los estados de gasto vacío usan el Alert informativo azul; **Spend All Time** añade **Upload Receipt**, que abre el diálogo. El estado mensual conserva fecha y **See All Time**. | Navegador móvil a 390 × 844 px: se comprobaron el estado mensual, el histórico, el CTA y el diálogo abierto. |

**Verificación de código:** `tsc --noEmit` pasó; 67 pruebas dirigidas pasaron en 9 archivos y el guard de props nativas pasó con 8 pruebas. ESLint pasó sin errores ni advertencias; `git diff --check` pasó al reconocer los finales CRLF del repositorio.

**Design System gate:** no ejecutado; `$appds-gate` no está disponible como herramienta en esta sesión. El Alert azul usa la variante informativa existente, pero no se presenta el gate como aprobado.
- Las tiendas sintéticas `QA Cedar Market #123` y `QA Lark Market` quedaron separadas tras Undo.
