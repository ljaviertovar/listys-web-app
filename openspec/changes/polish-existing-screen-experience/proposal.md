## Why

Las pantallas existentes de Listys necesitan una pasada de preparación visual para producción que compruebe tanto la fidelidad al Design system v2 como la claridad de las acciones, la semántica HTML y la accesibilidad. La revisión del código y la exploración con Playwright CLI identifican fricciones que afectan especialmente al uso con una mano en móvil; cumplir un patrón visual no basta si su interacción resulta confusa o inaccesible.

## What Changes

- Priorizar **mobile first**: diseñar y aceptar primero a 320, 390 y 430 px; verificar alturas reducidas, teclado virtual, áreas seguras y expansión del texto; conservar la compatibilidad de tablet y escritorio.
- Pulir shell, dashboard, grupos, listas base, compra activa, historial, recibos/OCR, visores, compartir, autenticación, perfil, cuenta y fallback offline existentes. Incluir sus formularios, menús, hojas, confirmaciones y estados de carga, vacío, error, bloqueo y solo lectura.
- Corregir nombres accesibles, relaciones de formulario, foco, navegación por teclado, regiones de estado, enlaces y botones, jerarquía de encabezados y objetivos táctiles. Mantener las acciones de compra visibles y libres de las barras fijas.
- Revisar copy con ejemplos antes/después y comprobar cada promesa contra la acción disponible: grupo frente a lista compartida, seleccionar frente a editar, cancelar frente a cerrar, total extraído frente a total pagado, subida frente a lectura.
- Resolver inconsistencias mediante tokens, variantes y composición de los componentes compartidos; conservar identidad, tipografía y superficies v2. Documentar las excepciones cuando el dibujo v2 entre en conflicto con accesibilidad/usabilidad; no resolverlas con overrides dispersos.
- Limitar las animaciones a cambios de estado y detener movimiento decorativo continuo; respetar movimiento reducido sin perder feedback.
- Mantener evidencia y cobertura diferenciadas: observación en navegador, hallazgo de código y comprobación pendiente. Registrar los defectos funcionales para una segunda iteración sin repararlos en esta.
- Completar la validación visual móvil del flujo existente de recibos usando el fixture `e2e/data-test/test-receipt.jpg`: subirlo, observar procesamiento y revisión OCR, y comprobar la hoja existente para añadir artículos a una lista. Cualquier envío persistente requiere un backend de pruebas identificado y autorización explícita; no se asume que un dominio Vercel sea seguro por sí solo.

## Capabilities

### New Capabilities

- `mobile-ui-usability`: comportamiento de presentación accesible y mobile first de las pantallas existentes, navegación, formularios, overlays, feedback, responsive y movimiento.
- `product-copy-clarity`: lenguaje coherente y veraz para acciones, estados, límites, consecuencias y mensajes de las pantallas existentes.

### Modified Capabilities

Ninguna: `openspec/specs/` no contiene capacidades publicadas que haya que modificar. Las nuevas especificaciones fijan requisitos observables de interfaz; no introducen nuevas funciones de negocio.

## Impact

- Capa compartida: `src/app/globals.css`, shells públicos/autenticados, `src/components/ui/`, `components/app/`, `components/commons/` y consumidores en `components/features/` y `components/marketing/`.
- Pantallas actuales en `src/app/`, textos de marketing y metadatos, y `public/offline.html`. Cambios documentales en `docs/design/DESIGN.md` solo durante la aplicación cuando se resuelva una discrepancia con v2; este paquete de propuesta no modifica esos archivos.
- Verificación: pruebas de comportamiento UI pertinentes, inspección con Playwright CLI y Chrome DevTools, capturas móviles y comprobación de escritorio. La suite E2E actual queda bloqueada por su limpieza global hasta completar el cambio separado `stabilize-test-foundation`; esta propuesta no habilita ni ejecuta ese harness.
- El fixture no se modificará ni se incluirá en capturas compartidas. En esta revisión se envió después de confirmar con el usuario que el proyecto Supabase remoto era de pruebas y verificar que la app desplegada usaba el mismo proyecto configurado localmente. El frontend ejecutado fue Vercel; por tanto, la evidencia no certifica el árbol local sin cambios ni autoriza futuras escrituras a producción.
- Sin cambios de APIs, esquemas, RLS, OAuth, persistencia, sincronización, OCR o reglas de negocio; sin migraciones, resets, despliegues ni nuevas dependencias por defecto. Los problemas que requieran esos cambios se derivan a la segunda iteración.
- La sesión facilitada aterrizó en Vercel después de Google OAuth. La evidencia autenticada corresponde a ese despliegue; la revisión estática corresponde al árbol local con cambios previos. No se presume igualdad de versiones ni se certifica producción antes de aplicar y validar los ajustes sobre el mismo build.
- Entrega actual: propuesta, diseño, delta specs, tareas y anexos de auditoría/copy/verificación. La implementación queda para una solicitud posterior.
