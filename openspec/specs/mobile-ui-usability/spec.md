# Mobile UI Usability Specification

## Purpose

Establecer el comportamiento de presentación mobile first que permite comprender y operar las pantallas existentes de Listys mediante toque, teclado y tecnologías de asistencia, manteniendo la identidad visual y los resultados de negocio actuales.

## Requirements

### Requirement: Mobile first layout and readable content

Las pantallas existentes SHALL permitir completar sus interacciones de interfaz a partir de 320 CSS px de ancho sin desplazamiento horizontal de la página. Los títulos, campos, mensajes, consecuencias y acciones principales MUST permanecer comprensibles con texto ampliado al 200% y con un 30% de expansión del copy. El visor de una foto ampliada puede desplazarse dentro de su propio panel sin desplazar horizontalmente la página.

#### Scenario: Narrow phone

- **WHEN** el usuario abre dashboard, grupos, listas, compra, recibos, historial, cuenta o autenticación a 320 CSS px
- **THEN** los controles y textos esenciales caben o se redistribuyen verticalmente y ninguna acción requiere desplazamiento horizontal de la página

#### Scenario: Expanded content

- **WHEN** un nombre largo o el texto ampliado ocupa varias líneas
- **THEN** el usuario puede conocer el nombre completo en un destino o mecanismo accesible y las acciones principales y advertencias no quedan truncadas ni solapadas

### Requirement: Touch targets remain operable

Las acciones independientes de compra, subida y navegación SHALL tener un nombre accesible y un área activable de al menos 44×44 CSS px, sin solaparse con controles adyacentes. Excepción aprobada por el usuario: los tamaños compartidos `primary` y `link-action` miden 40px de alto en móvil y no son targets expandidos; los demás controles conservan 44×44 px.

#### Scenario: Compact visual control

- **WHEN** el usuario toca el borde del área de un enlace compacto o un botón de una fila que no usa los tamaños exceptuados `primary` o `link-action`
- **THEN** el área activable alcanza el tamaño mínimo de producto y activa únicamente ese control

#### Scenario: Upload controls on a phone

- **WHEN** el usuario opera cerrar, elegir o quitar una foto, cancelar o subir desde la hoja móvil
- **THEN** cada control independiente ofrece un área activable de al menos 44×44 CSS px sin solaparse con otro control

### Requirement: Fixed controls do not obstruct content or each other

La navegación inferior, subida, sesión activa, selección de recibos, acciones de compra y notificaciones SHALL respetar las áreas seguras y no ocultar entre sí sus zonas interactivas. La última fila y el elemento enfocado MUST poder desplazarse a una zona visible por encima de las barras.

#### Scenario: Receipt selection during an active shopping session

- **WHEN** el usuario selecciona artículos de un recibo mientras existe una sesión activa
- **THEN** la selección, continuación de compra y subida conservan sus acciones activables, y el usuario puede ver y operar la última fila sin que una barra la cubra

#### Scenario: Short viewport

- **WHEN** la altura disponible se reduce, por orientación o teclado virtual
- **THEN** los controles fijos no impiden acceder al campo activo, su error o las acciones del formulario

#### Scenario: Receipt upload on a short phone

- **WHEN** el usuario abre la hoja de subida a 320×568 CSS px, añade una foto y completa los campos requeridos
- **THEN** puede revisar la foto y alcanzar cancelar o subir sin overflow horizontal; si el contenido excede la altura disponible, la hoja desplaza su contenido sin ocultar el pie ni el campo enfocado

#### Scenario: Review a receipt from mobile upload

- **WHEN** el usuario carga el recibo de prueba en un entorno de prueba a 320–430 CSS px y la extracción existente termina
- **THEN** puede reconocer la subida y el procesamiento, revisar los artículos extraídos y alcanzar la acción existente para añadir la selección a una lista, con controles y mensajes accesibles y sin contenido tapado por overlays

### Requirement: Shared primary and link action sizes

Los tamaños compartidos `Button size='primary'` y `Button size='link-action'` SHALL medir 40 CSS px de alto por debajo de `md` y 44 CSS px desde `md`. El CTA compacto de marketing (`ButtonLink size='sm'`) SHALL seguir las mismas alturas. Los enlaces que se presentan como acciones SHALL usar `link-action`; los consumidores MUST conservar las variantes compartidas sin overrides locales de apariencia.

#### Scenario: Responsive primary buttons and action links

- **WHEN** un botón primario, link de acción o CTA compacto se muestra en móvil y después en `md` o más
- **THEN** su altura es 40 CSS px en móvil y 44 CSS px desde `md`, con su semántica de botón o enlace intacta

### Requirement: Shopping actions remain grouped on mobile

La pantalla de compra activa SHALL conservar un único botón móvil “Actions” que abre un menú con las acciones claramente diferenciadas “Complete Shopping” y “Cancel Shopping”. Cada opción MUST conservar las condiciones de disponibilidad y permisos existentes, ofrecer un target de al menos 44×44 CSS px y abrir su confirmación sin ejecutar la operación al seleccionarla. En escritorio SHALL conservar los dos controles inline existentes.

#### Scenario: Shopping owner opens completion

- **WHEN** el propietario activa “Actions” y elige completar
- **THEN** se abre la confirmación con el número de pendientes y la opción actual de actualización de la lista base, sin completar todavía la sesión

#### Scenario: Shopping cancellation

- **WHEN** el usuario abre “Actions”, elige cancelar y después elige seguir comprando
- **THEN** se cierra la confirmación y la sesión conserva su estado

### Requirement: Dialog focus and containment

Las hojas, menús, confirmaciones y visores SHALL tener un nombre accesible y una relación con su descripción cuando exista. Los diálogos modales MUST mover el foco a su interior, contenerlo mientras están abiertos y devolverlo al disparador al cerrarse cuando este siga disponible. La apertura móvil MUST evitar el teclado virtual inesperado cuando no se ha solicitado editar un campo.

#### Scenario: Open a mobile creation sheet

- **WHEN** el usuario abre una hoja de creación
- **THEN** el foco entra en un punto accesible del diálogo sin abrir automáticamente el teclado, y el título, los campos y el cierre son alcanzables

#### Scenario: Close a modal

- **WHEN** el usuario pulsa Escape o el control de cierre permitido
- **THEN** el foco vuelve al control que abrió el modal y no permanece en contenido retirado

#### Scenario: Open receipt upload and add-to-list sheets

- **WHEN** el usuario abre la subida o la hoja para añadir artículos a una lista
- **THEN** el foco entra en un título o control seguro del diálogo y permanece contenido hasta cerrar; el cierre devuelve el foco al disparador sin abrir el teclado virtual inesperadamente

### Requirement: Native semantics and keyboard access

La interfaz SHALL usar semántica de acción, navegación, encabezados, listas y formularios conforme a su función. MUST evitar controles interactivos anidados y párrafos con contenido estructural inválido, ofrecer un destino principal inequívoco y un mecanismo para saltar la navegación repetida. Toda interacción esencial MUST tener alternativa de teclado y foco visible no oculto por overlays.

#### Scenario: Keyboard navigation

- **WHEN** el usuario recorre la pantalla con Tab, Shift+Tab, Enter, Space y Escape según el control
- **THEN** puede alcanzar y activar las acciones existentes en un orden comprensible y reconocer el elemento enfocado

#### Scenario: Repeated card destinations

- **WHEN** un lector de pantalla enumera enlaces de varias tarjetas
- **THEN** los nombres accesibles distinguen el destino sin depender de la posición visual de la tarjeta

### Requirement: Form instructions and errors are associated

Los campos existentes SHALL disponer de etiqueta asociada, indicación accesible de obligatoriedad y relaciones con sus instrucciones y errores. Una validación fallida MUST identificar el campo y permitir corregirlo conservando los valores introducidos. Durante una petición la UI MUST comunicar el estado pendiente y evitar el envío duplicado desde sus controles.

#### Scenario: Invalid submission

- **WHEN** un formulario rechaza un campo vacío o inválido
- **THEN** identifica el campo mediante texto asociado y foco o anuncio apropiado, y no obliga a reconstruir el resto del formulario

#### Scenario: Pending request

- **WHEN** una acción de envío está en curso
- **THEN** su control presenta un estado pendiente comprensible y no permite volver a enviar desde la misma interfaz

#### Scenario: Required receipt field fails validation

- **WHEN** falta el nombre de la tienda al intentar subir una foto
- **THEN** el campo enfocado expone el estado inválido y su mensaje de error mediante una relación accesible, y la petición no se envía

#### Scenario: Add-to-list selectors have programmatic labels

- **WHEN** se abre la hoja para añadir artículos a una lista
- **THEN** cada selector visible de grupo y lista queda asociado a su etiqueta y los errores de selección se relacionan con el control correspondiente

### Requirement: Honest and accessible interface states

Los estados de carga, vacío, fallo, bloqueo y solo lectura SHALL ser visual y semánticamente distinguibles. Un fallo MUST evitar mensajes técnicos sin filtrar y ofrecer un siguiente paso que exista. Los cambios asíncronos relevantes MUST anunciarse sin duplicar repetidamente el mismo evento; el progreso conocido MUST exponer sus valores y el desconocido MUST permanecer indeterminado.

#### Scenario: Loading fails

- **WHEN** una colección no puede cargarse
- **THEN** la UI no presenta el fallo como una colección vacía confirmada y muestra un mensaje seguro con una recuperación disponible

#### Scenario: Read-only purchase history

- **WHEN** el usuario consulta una sesión completada
- **THEN** puede distinguir los artículos comprados y el estado de solo lectura sin controles de edición que aparenten estar disponibles

### Requirement: Accessible visual states and motion

El texto normal SHALL alcanzar contraste de 4.5:1 y el texto grande y los límites visuales esenciales 3:1 conforme a WCAG AA. El estado MUST ser reconocible mediante algo además de color. El movimiento reducido MUST conservar estado final, foco y feedback mientras elimina movimiento espacial no esencial. Las ilustraciones decorativas MUST detener el movimiento continuo al terminar su explicación.

#### Scenario: Reduced motion

- **WHEN** el dispositivo solicita movimiento reducido
- **THEN** las hojas, progreso, marcas de selección y marketing conservan información y controles sin bucles decorativos ni desplazamientos no esenciales

### Requirement: Existing visual identity and larger-screen compatibility

Las mejoras SHALL conservar los roles visuales del Design system v2 de Listys y una jerarquía consistente entre pantallas. Una excepción necesaria para accesibilidad o usabilidad MUST ser coherente entre sus usos. Tras resolver la versión móvil, tablet y escritorio MUST conservar acceso a las acciones actuales sin duplicar ni perder controles por el breakpoint.

#### Scenario: Switch between mobile and desktop

- **WHEN** el viewport cruza el breakpoint de navegación
- **THEN** queda disponible una navegación principal apropiada y las acciones y su estado permanecen comprensibles sin superposición entre variantes
