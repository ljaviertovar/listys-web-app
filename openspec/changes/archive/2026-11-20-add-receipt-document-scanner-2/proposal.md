# Proposal

## Why

La carga actual de recibos depende de que el usuario tome o elija una imagen donde el papel quede legible. Un escáner de cámara que detecte los bordes del recibo y corrija la perspectiva puede mejorar la imagen antes de enviarla al OCR y hacer de la captura una forma directa de iniciar la carga.

## What Changes

- Añadir un escáner de recibos con cámara como opción principal en el formulario compartido de carga.
- Mantener la elección y el arrastre de fotos del dispositivo como opciones alternativas.
- Detectar el contorno del papel en la vista de cámara y permitir capturar, revisar el recorte, repetir o conservar la foto original.
- Enviar las imágenes aceptadas por el flujo actual de carga y OCR, conservando sus límites y su asociación opcional con un viaje.
- Usar `ScanTextIcon` para identificar la acción de escanear.

## Capabilities

### New Capabilities
- `receipt-scanning`: Captura, detección de papel, corrección de perspectiva y revisión de imágenes de recibos.

### Modified Capabilities
- `product-copy-clarity`: La hoja de carga ofrece escanear como acción principal y mantiene la carga de fotos como alternativa.

## Impact

- UI compartida de carga de recibos, picker de fotos y dependencias de cámara y procesamiento de imágenes en el navegador.
- Los contratos del endpoint de carga, el OCR y la persistencia no cambian.
- PRD de recibos: actualizar la descripción de la experiencia de carga.
