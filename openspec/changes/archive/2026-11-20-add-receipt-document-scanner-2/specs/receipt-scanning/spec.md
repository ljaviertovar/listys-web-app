# Spec Delta

## Purpose

Permite capturar recibos con la cámara y mejorar su legibilidad al detectar el papel y corregir la perspectiva antes de procesarlo.

## ADDED Requirements

### Requirement: Receipt upload offers camera scanning first
La hoja compartida para cargar recibos SHALL presentar en un teléfono la acción de escanear con cámara como única acción principal y la elección de fotos del dispositivo como alternativa. La acción de escanear SHALL identificarse con `ScanTextIcon`. Mientras no haya fotos, la hoja SHALL omitir el contador de fotos y los botones Upload y Cancel. En pantallas desde `sm`, la zona para arrastrar fotos SHALL ir primero y Scan with Camera SHALL ser la alternativa.

#### Scenario: Open receipt upload
- **WHEN** el usuario abre la hoja en un teléfono para cargar un recibo sin fotos seleccionadas
- **THEN** ve la acción principal Scan Receipt con `ScanTextIcon` y la acción alternativa Choose Photos, sin contador ni botones Upload y Cancel

#### Scenario: Open receipt upload on a computer
- **WHEN** el usuario abre el diálogo desde `sm` sin fotos seleccionadas
- **THEN** ve la zona para arrastrar o elegir fotos y la acción alternativa Scan with Camera

#### Scenario: Keep dropped receipt photos
- **WHEN** el usuario abre la hoja tras arrastrar fotos a una zona de carga existente
- **THEN** esas fotos permanecen seleccionadas en el formulario de carga

### Requirement: The scanner detects and corrects receipt perspective
El escáner SHALL ocupar la pantalla completa, sobre la hoja, con el estilo oscuro del visor de fotos del recibo, y SHALL mostrar la vista de cámara con un indicador visual de los bordes del papel detectado y permitir que el usuario dispare la captura. La foto seleccionada SHALL aplicar el recorte y la corrección de perspectiva si se detecta un contorno válido.

#### Scenario: Detect receipt in camera preview
- **WHEN** el usuario apunta la cámara hacia un recibo cuyos bordes se distinguen del fondo
- **THEN** la vista marca su contorno y el usuario puede capturar la toma

#### Scenario: Receipt edges are not detected
- **WHEN** no se detecta un contorno válido al capturar
- **THEN** el escáner conserva la toma original para que el usuario la revise, la repita, la acepte sin recorte o coloque las esquinas con Adjust

### Requirement: The scanner finds the receipt reliably and keeps its outline steady
El escáner SHALL buscar el recibo con varios criterios de detección, ajustar cada lado del contorno al borde real de la imagen y elegir el contorno cuyos cuatro lados muestren el borde más claro. El contorno en vivo SHALL suavizarse entre cuadros y no desaparecer por un solo cuadro sin detección. Si la detección de la toma no encuentra bordes, el escáner SHALL usar el contorno que se veía al disparar, si es reciente. La cámara SHALL pedirse con hasta 1920 por 1080 píxeles.

#### Scenario: Outline stays steady
- **WHEN** la cámara apunta a un recibo y la detección pierde un cuadro
- **THEN** el contorno no parpadea y se actualiza con el siguiente cuadro

#### Scenario: Use the outline seen at the shutter
- **WHEN** el usuario dispara con el contorno visible y la detección de la toma no encuentra bordes
- **THEN** la foto se recorta con el contorno que se veía

### Requirement: A scanned photo can be reviewed before upload
Cada captura SHALL poder revisarse antes de agregarse a la carga. La revisión SHALL ofrecer una elección entre Straightened, Full Photo y Adjust, seleccionando Straightened cuando hubo recorte, y dos acciones: Use Photo y Retake. El usuario SHALL poder cerrar la revisión sin agregar la captura.

#### Scenario: Accept perspective-corrected photo
- **WHEN** el usuario revisa un recorte con Straightened seleccionado y elige Use Photo
- **THEN** la foto corregida se agrega a las fotos del recibo que se cargarán

#### Scenario: Retake photo
- **WHEN** el usuario revisa una captura y elige Retake
- **THEN** vuelve a la cámara para tomar otra foto sin agregar la captura anterior

#### Scenario: Use original photo
- **WHEN** el usuario elige Full Photo, o el recorte falla y Full Photo queda fijado con un aviso, y elige Use Photo
- **THEN** la toma original se agrega a las fotos del recibo que se cargarán

### Requirement: The corners of a scan can be adjusted
La opción Adjust de la revisión SHALL mostrar la foto completa con sus cuatro esquinas como puntos que se arrastran, con una lupa sobre la esquina que se mueve y con pasos de flecha para teclado. El escáner SHALL impedir que el contorno deje de ser un cuadrilátero convexo. Use Photo en Adjust SHALL recortar con las esquinas colocadas. Si no se detectaron bordes, Adjust SHALL empezar con un rectángulo a 10% de cada borde y Straightened SHALL estar deshabilitado.

#### Scenario: Move a corner
- **WHEN** el usuario arrastra una esquina en Adjust
- **THEN** el contorno la sigue y la lupa muestra los píxeles bajo la esquina

#### Scenario: Place the corners by hand
- **WHEN** no se detectaron bordes y el usuario elige Adjust
- **THEN** ve un rectángulo inicial con cuatro esquinas que puede mover y usar para recortar

### Requirement: A long receipt can be scanned in parts
Tras aceptar una foto, el escáner SHALL volver a la cámara con el número de fotos tomadas, para escanear la siguiente parte del mismo recibo, hasta el máximo de cinco. El escáner SHALL ofrecer Done para volver a la hoja y Photos para elegir fotos del dispositivo.

#### Scenario: Scan the next part
- **WHEN** el usuario acepta una foto y quedan lugares
- **THEN** la cámara se abre de nuevo, titulada Scan Next Part y con el contador actualizado

#### Scenario: Reach the photo limit
- **WHEN** el usuario acepta la quinta foto
- **THEN** el escáner se cierra y la hoja muestra las cinco fotos sin acciones para agregar más

#### Scenario: Cancel camera capture
- **WHEN** el usuario cierra el escáner antes de aceptar una captura
- **THEN** la captura no se agrega a las fotos del recibo

### Requirement: Scanned photos use the existing receipt upload flow
Las fotos escaneadas SHALL agregarse al mismo conjunto de fotos del formulario, cumplir sus límites y validaciones actuales y enviarse al flujo de carga y OCR existente. Una carga iniciada desde un viaje SHALL conservar la asociación con ese viaje.

#### Scenario: Mix scanned and device photos
- **WHEN** el usuario combina escaneos y fotos del dispositivo
- **THEN** el formulario aplica el máximo actual de cinco fotos y carga las fotos válidas juntas

#### Scenario: Upload from a shopping trip
- **WHEN** el usuario escanea y carga un recibo desde un viaje
- **THEN** el recibo conserva la asociación con ese viaje mediante el flujo de carga existente

### Requirement: Camera resources are released when scanning ends
El escáner SHALL detener la transmisión de la cámara al cerrar, cancelar o abandonar la captura, volver al formulario de archivos o pasar a revisar una foto.

#### Scenario: Leave the camera scanner
- **WHEN** el usuario cierra el escáner o vuelve a elegir archivos
- **THEN** la cámara deja de transmitir

#### Scenario: Review a captured photo
- **WHEN** el usuario toma una foto y entra en su vista de revisión
- **THEN** la cámara deja de transmitir mientras revisa la imagen

### Requirement: Camera failures leave device photo upload available
Si el navegador carece de cámara, el usuario deniega el permiso o el escáner no puede iniciarse, la hoja SHALL explicar que el escáner no está disponible y mantener accesible la elección de fotos del dispositivo.

#### Scenario: Camera permission denied
- **WHEN** el usuario deniega el permiso para usar la cámara
- **THEN** la aplicación vuelve al formulario de fotos con un aviso que explica que no pudo iniciar el escáner, Choose Photos pasa a ser la acción principal, la cámara queda como la alternativa Try the Camera Again y la hoja se puede cerrar

#### Scenario: Camera unavailable
- **WHEN** el dispositivo o el navegador no proporciona una cámara utilizable
- **THEN** la aplicación conserva la elección de fotos como una forma operativa de cargar el recibo

#### Scenario: Camera access fails
- **WHEN** el navegador rechaza el acceso a la cámara o no se puede iniciar la vista previa
- **THEN** la vista del escáner se cierra, el aviso de error aparece en el formulario de fotos y la hoja permanece interactiva y cerrable

#### Scenario: Camera permission request remains pending
- **WHEN** el navegador deja pendiente la solicitud de acceso a la cámara
- **THEN** tras 15 segundos el escáner vuelve al formulario de fotos con un aviso, la hoja se puede cerrar y cualquier transmisión que llegue tarde se detiene
