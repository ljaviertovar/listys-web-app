## Context

Ver [proposal.md](proposal.md) para la motivación y el alcance. Listys usa Next.js App Router, Tailwind v4 y primitivas compartidas shadcn/Radix/Base UI. Las pantallas ya tienen una identidad y patrones reutilizables: `PageHeader`, `PageContainer`, `EntityCard`, `FormField`, `SheetDialog`, `ConfirmSheet`, `CategorySection` y las barras de navegación/sesión. El árbol local contiene cambios previos del usuario que deben conservarse.

Fuentes: `AGENTS.md`, `docs/design/DESIGN.md`, `docs/architecture/project-structure.md`, implementación actual y revisión interactiva mediante Playwright CLI. Se aplican las skills `impeccable`, `ui-ux-pro-max` y `frontend-design` como apoyo de auditoría y acabado visual; cuando una recomendación estética genérica difiera del Design System v2 de Listys, prevalecen el board y sus tokens. El canvas externo de v2 no pudo abrirse desde estas herramientas; el documento derivado es la referencia disponible, no una comparación directa certificada con el board.

La sesión de Google acabó en Vercel incluso al iniciar el OAuth desde la app local. Se comprobó que el frontend desplegado y `.env.local` usan el mismo proyecto Supabase; el usuario confirmó que ese proyecto remoto es de pruebas y autorizó la subida. El recorrido de recibo descrito abajo se ejecutó con el frontend Vercel y el backend de pruebas, mientras que el análisis estático corresponde al workspace. Esta evidencia no certifica que ambos frontends tengan el mismo código. La propuesta se redacta en español y los textos de producto propuestos siguen en inglés.

## Goals / Non-Goals

**Goals:**

- Hacer que las pantallas existentes se puedan entender, recorrer y operar primero con una mano en un teléfono.
- Definir contratos observables de presentación, foco, copy y feedback sin modificar resultados de negocio.
- Resolver problemas compartidos en su capa de origen y luego verificar todos los consumidores afectados.
- Poder rastrear cada tarea hasta un hallazgo o un requisito, y cada afirmación de validación hasta su entorno.

**Non-Goals:**

- Rediseñar la marca, añadir funcionalidades, nueva navegación de negocio, filtros inexistentes, edición OCR nueva, onboarding nuevo, facturación o analítica.
- Cambiar reglas de acceso, sesión, persistencia, procesamiento, cálculo, unidades almacenadas o el valor por defecto de sincronización.
- Aceptar invitaciones reales, completar/cancelar compras, revocar enlaces o borrar recibos durante la auditoría del despliegue.
- Reparar las suites E2E, OAuth o los bugs funcionales; están separados en [functional-follow-up.md](functional-follow-up.md).
- Usar el recibo con un backend cuya condición de prueba no esté confirmada, o conservar datos extraídos en artefactos compartidos. El dominio Vercel por sí solo no identifica el entorno de persistencia.

## Decisions

### 1. Orden mobile first y alcance por flujos

Se acepta primero a 320×568, 390×844 y 430×932. La comprobación de altura reducida usa 390×568; tablet 768×1024 y escritorio 1280×900 son controles de compatibilidad posteriores. Por decisión del usuario, las validaciones que requieren otro dispositivo físico (teclado virtual, cámara, touch/gestos y VoiceOver/TalkBack móvil) quedan fuera de alcance; el resto de viewports y safe areas se verifica en el navegador local cuando su emulación está disponible. El resize no se presenta como validación física.

Orden de aplicación: primitivas y foco → shell/barras → compra activa → recibos → grupos/listas/historial → cuenta/auth → marketing/offline. Cada lote termina con sus casos móviles antes de ampliar a escritorio. Se conserva el layout de escritorio existente salvo ajustes necesarios para evitar regresiones.

Alternativa descartada: pulir escritorio y comprimirlo después; no representa el uso principal en el supermercado.

### 2. Jerarquía visual y excepciones explícitas a v2

Mantener superficies paper/canvas, acción azul, scan cyan solo para lectura/transformación, Jakarta/Inter y mono para datos. Antes de editar, consultar las secciones 6–10 de `DESIGN.md` y el board correspondiente si está disponible. Reutilizar componentes instalados antes de crear otro patrón.

La fidelidad al board no exime contraste, foco ni semántica. El objetivo general de Listys es 44×44 px, con una excepción de producto solicitada por el usuario: los tamaños compartidos `primary` y `link-action` miden 40 px de alto en móvil y 44 px desde `md`. No se les atribuye un hit area expandido de 44 px. Los demás controles táctiles mantienen el objetivo general y no deben solaparse. No afirmar que 32/36 px viola automáticamente WCAG 2.2 AA: el mínimo WCAG y sus excepciones son distintos del requisito de producto de 44 px.

Cambiar mediante variantes/props/tokens de `ui/`, no mediante apariencia en `className` de cada consumidor. Los componentes de app deben seguir exponiendo identificadores semánticos estables; los reutilizables con significado variable aceptan `testId`. La implementación actualizará `DESIGN.md`, incluidas 11.4/11.5, cuando cambie una excepción documentada; este paquete no lo modifica.

Alternativa descartada: mantener cada detalle del dibujo aunque perjudique al usuario, o inventar una segunda escala de CSS local.

### 3. Barras fijas como un único contrato de espacio

Auditar juntas tab bar, FAB de subida, barra de sesión, selección OCR, acciones de compra y toaster. Corregir en `mobile-tab-bar-layout.ts`, variantes compartidas y reservas de los contenedores, en lugar de sumar offsets distintos por pantalla. La barra de sesión no puede cruzarse con el FAB ni la selección ocultar la última fila. El foco desplazado debe quedar dentro de la zona visible entre header y barras.

En compra móvil, conservar el único botón flotante «Actions» y sus opciones separadas «Complete Shopping» y «Cancel Shopping». Las opciones mantienen targets táctiles de 44×44 px y abren sus confirmaciones existentes sin ejecutar la operación al seleccionarlas. Mantener los dos controles actuales junto al título en escritorio; no cambiar handlers ni permisos del propietario.

Alternativa descartada: añadir otra barra permanente sin revisar las ya presentes; aumentaría la congestión en teléfonos de poca altura.

### 4. Foco y overlays sin disparar el teclado móvil

Al abrir una hoja enfocar su título o contenedor accesible de forma programática, sin activar un input de inmediato en móvil. Escape/cerrar devuelve el foco al disparador; al editar una fila y salir, lo devuelve a la misma fila/control. Las confirmaciones enlazan su descripción con las consecuencias reales, y el borrado no recibe foco inicial.

`SheetDialog` actualmente cancela el autoenfoque por defecto. Esa decisión protege del salto del teclado, pero no garantiza que el foco entre en el diálogo: hay que comprobarlo y resolverlo explícitamente. Un `role='alertdialog'` sobre un diálogo no demuestra por sí solo la conducta de una confirmación. Reutilizar las primitivas de diálogo/alerta según el propósito, sin reproducir su accesibilidad con markup propio.

Separar cuerpo desplazable y pie de acciones cuando la altura disponible no permita ver todo. Al abrir el teclado, el campo activo, su error y el siguiente paso siguen alcanzables. Esperar el fin de la transición antes de medir: una captura durante la entrada no demuestra un recorte permanente.

### 5. Semántica primero y formularios conectados

Auditar DOM renderizado, no solo JSX: acciones como botones, destinos como enlaces y `asChild` para links con aspecto de botón; sin controles interactivos anidados. `PageHeader.desc` acepta nodos, por lo que el contenedor no debe asumir que siempre es texto de párrafo. Asegurar un main, encabezados coherentes, skip link y nombres contextuales para enlaces repetidos.

Normalizar relaciones label/id y error/hint/aria-describedby en los formularios actuales, incluidos selectores y la subida. No cambiar Zod ni límites de negocio para acomodar un mensaje. Los asteriscos visuales necesitan estado requerido accesible; los errores se anuncian sin repetir varias regiones para el mismo cambio.

### 6. Copy basado en comportamiento existente

Ver [copy-review.md](copy-review.md). Mantener terminología receipt, base list, shopping session, group e item, sin migrar nombres internos. Conservar Title Case en acciones donde lo prescribe el sistema y frases breves en explicaciones. Diferenciar subida, lectura, selección y guardado en una lista; «Completed» de OCR no debe confundirse con una compra completada.

Revisar especialmente las promesas «edit every name, quantity and price», «nothing is saved», «invite to a group», «works for any store» y el 99%: sustituirlas por una descripción verificable de lo disponible. No añadir controles para cumplir una promesa del marketing. El objetivo 99% no equivale a un benchmark medido; esta pasada propone quitar la cifra del copy público.

Los totales se describen según los datos existentes (por ejemplo, total de líneas extraídas), sin cambiar cálculos, moneda ni redondeos de negocio. Los textos de error explican el siguiente paso sin mostrar mensajes crudos del proveedor. Si requiere distinguir un nuevo resultado de negocio, registrarlo para la segunda iteración.

### 7. Movimiento al servicio de la acción

Usar las duraciones v2 como referencia (160 ms interacción, 240 ms panel/fila, hasta 420 ms por etapa ilustrativa). Detener el scan decorativo infinito al terminar una transformación; no tocar el progreso real asíncrono. Definir propiedades animadas explícitas y variantes de movimiento reducido en primitivas de progreso/diálogos y consumidores pendientes.

Mantener estados finales, foco y texto de carga en movimiento reducido. No usar una regla global que convierta toda animación en una duración casi cero y oculte feedback. No añadir una librería de animación ni un nuevo efecto ornamental.

### 8. Validación por riesgo, sin ampliar backend

Pruebas de componentes para relaciones accesibles, estados y handlers de UI modificados; no snapshots que congelen cada utilidad Tailwind ni tests del comportamiento interno de una primitiva de terceros. Playwright CLI para recorridos, teclado, DOM, medidas, estilos y capturas; DevTools para validación visual durante la aplicación, conforme a `AGENTS.md`.

El harness E2E versionado continúa bloqueado. Tras resolver `stabilize-test-foundation`, los flujos persistentes se ejecutarán con fixtures aislados locales y `E2E_SUPABASE_*`. Hasta entonces, el despliegue es de solo lectura por defecto; solo se permiten envíos después de verificar el backend de pruebas y contar con autorización explícita. Cualquier caso no alcanzable se marca pendiente.

El fixture `e2e/data-test/test-receipt.jpg` se subió con Playwright CLI a 320×568 y se recorrió hasta la hoja de añadir a una lista. El frontend activo fue Vercel; el envío se autorizó después de verificar que apunta al mismo proyecto Supabase remoto configurado en el workspace y de que el usuario confirmara que es de pruebas. El OCR terminó con 18 artículos. Se canceló la hoja de destino y no se añadieron artículos a ninguna lista. La sesión OAuth iniciada en la app local volvió a Vercel, por lo que el flujo no valida el build local autenticado.

En la hoja de subida, el viewport 320×568 no tuvo overflow horizontal y mostró preview y pie; a 390×844 y 430×932 tampoco hubo overflow. En los tres tamaños las acciones Cancel y Upload midieron 36 px de alto; el foco inicial quedó fuera de la hoja. La validación vacía enfocó Store name y marcó `aria-invalid`, pero el error “Store name is required” no estaba enlazado mediante `aria-describedby`. Al acabar el OCR, la insignia visible decía “Completed” aunque la revisión aún no había empezado. En “Add Items to List”, el foco también quedó fuera; cancelar devolvió el foco al `body`, y el diálogo mostró el recuento seleccionado antes de no guardar nada. Las capturas con el recibo se eliminaron tras la inspección.

## Risks / Trade-offs

- [Código local y despliegue distintos] → Reproducir los hallazgos en el build local antes de aplicar cada lote y conservar la etiqueta de procedencia.
- [Board v2 inaccesible en esta sesión] → No inventar coincidencia visual; usar la especificación escrita y comprobar el canvas al validar la implementación.
- [Aumentar área táctil consume espacio] → Priorizar la acción principal, permitir wrapping/stacking y revisar 320 px sin solapamientos.
- [Datos reales en capturas] → Evidencia cruda solo en `/tmp`, identidades y fotos enmascaradas; versionar resúmenes sanitizados, nunca sesiones, tokens o URLs firmadas.
- [El fixture puede contener información identificable] → No guardar la imagen ni datos extraídos en capturas o documentación compartida; conservar solo resultados sanitizados y evitar envíos cuando el backend no esté identificado como de pruebas.
- [Cambios en primitivas afectan muchos consumidores] → Inventariar consumidores con búsqueda, ajustar todos los relevantes y validar cada flujo afectado.
- [UI correcta sobre dependencia fallida] → Mostrar estados honestos y registrar la dependencia funcional; no declarar el flujo listo para producción si sigue bloqueado.
- [Dark mode sin board v2] → Mantener tokens existentes y revisar contrastes de estados expuestos; no inventar una nueva dirección oscura en esta pasada.

## Migration Plan

Aplicación futura en lotes revisables, sin migración de datos: conservar baseline, modificar capa compartida, actualizar consumidores, validar móviles y luego escritorio. Revertir el lote de UI y su documentación si falla el recorrido; no resetear datos ni deshacer cambios previos ajenos. No desplegar como parte de esta propuesta.

La salida de esta fase es un plan implementable, no una certificación de accesibilidad ni una garantía de preparación funcional para producción.
