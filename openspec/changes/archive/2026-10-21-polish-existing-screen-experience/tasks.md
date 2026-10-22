## 1. Baseline y referencia visual

- [x] 1.1 Reproducir H01–H07 en el build local que se vaya a modificar, preservando los cambios previos del usuario y registrando commit/origen/viewport; verificar que la matriz distingue resultados locales de Vercel y que no se exportan sesiones ni datos privados.
- [x] 1.2 Consultar las secciones v2 aplicables de `docs/design/DESIGN.md` y los boards cuando estén accesibles; registrar las excepciones de área táctil/foco y cualquier diferencia real en 11.4/11.5; verificar que ninguna discrepancia se resuelve mediante una escala visual paralela.

## 2. Primitivas, semántica y formularios

- [x] 2.1 Resolver H01/H02 con tamaños/variantes compartidos de Button/links/cierre y actualizar sus consumidores relevantes; `primary`, `link-action` y el CTA compacto `ButtonLink size='sm'` miden 40px en móvil y 44px desde `md` por decisión de producto. Verificar las dimensiones y áreas restantes a 320/390 px, sin solapamientos ni overrides de apariencia en call sites, y mantener pruebas que protejan las alturas responsivas.
- [x] 2.2 Corregir el foco inicial/retorno de `SheetDialog`, merge y compare (H03), usando foco en contenedor/título para evitar teclado móvil automático; verificar abrir, Tab, Shift+Tab, Escape y cierre con Playwright y una prueba del comportamiento propio del wrapper.
- [x] 2.3 Conectar las consecuencias con la descripción de confirmaciones (H04), sin duplicar el título ni enfocar la acción destructiva; verificar nombre/descripción accesibles calculados y retorno al trigger de completar/cancelar/delete.
- [x] 2.4 Normalizar labels, requerido, instrucciones y errores en merge/subida/selectores y formularios afectados (H05); verificar relaciones únicas en DOM, validación vacía sin envío y pruebas de las asociaciones accesibles propias.
- [x] 2.5 Resolver la composición Button/Link del fallback de auth y el contrato enriquecido de `PageHeader.desc` (H09/H10); verificar ausencia de interactivos anidados y párrafos estructurales inválidos en las ramas afectadas.
- [x] 2.6 Añadir destino y enlace de salto al main y unificar foco visible en botones/enlaces tocados (H08/H11); verificar navegación de teclado desde el inicio, ring/offset calculados y que el header no oculta el foco.
- [x] 2.7 Revisar test ids de cada componente propio tocado, incluidos branches de error, merge y headers (H19); verificar raíz semántica, `testId` contextual donde varíe el significado y ausencia de wrappers artificiales para no-DOM.

## 3. Shell, dashboard y capas móviles

- [x] 3.1 Corregir el contrato compartido de offsets/reservas para tab bar, FAB, sesión, selección y acciones (H06); verificar rectángulos sin intersección en 320/390/430 px y acceso al último control con y sin sesión/selección.
- [x] 3.2 Revisar header, tabs y menú de cuenta después del cambio compartido; verificar estado activo, foco al abrir/cerrar, targets y acceso a Profile/Account en móvil, y navegación de escritorio al cruzar el breakpoint.
- [x] 3.3 Pulir jerarquía del dashboard y enlaces de sección conservando la guía grupo→lista y los estados nuevos/sin items/activos; verificar nombres largos, texto ampliado, View All accesible y ausencia de overflow en 320/390/430 px (H01/H12).
- [x] 3.4 Revisar notificaciones de éxito/undo/error respecto a las barras y anuncios ya presentes; verificar que un mensaje no tapa la acción principal ni se anuncia repetidamente y que cualquier Undo mostrado corresponde a una operación disponible, sin implementar restore nuevo.

## 4. Compra activa y edición de artículos

- [x] 4.1 Mantener el botón móvil “Actions” con opciones diferenciadas “Complete Shopping” y “Cancel Shopping”, conservando permisos y handlers (H07, C18/C19); verificar abrir/cerrar ambas confirmaciones y compatibilidad de escritorio sin ejecutar la operación en el despliegue.
- [x] 4.2 Pulir las confirmaciones con pendientes, todos recogidos y sync (C19–C22); verificar cantidad/plural, consecuencia asociada, rechazo inequívoco, carga y valor por defecto actual de sync sin modificar lógica de negocio.
- [x] 4.3 Mejorar legibilidad y acceso a nombres/notas completos de filas (H12/H13), manteniendo los labels táctiles existentes; verificar contraste calculado, selección por teclado y wrapping con nombres largos sin desplazar menús.
- [x] 4.4 Incorporar confirmación antes del delete irreversible de un artículo de sesión (H26), reutilizando el patrón compartido; verificar que rechazar no llama al handler y confirmar lo llama una vez, con prueba de comportamiento propio y fixture aislado si se verifica persistencia.
- [x] 4.5 Pulir edición inline, formulario de añadir y aviso de lista bloqueada (C17/C33/C34); verificar validaciones, foco de retorno, borrador conservado en error y semántica de Cancel/Done sin cambiar artículos ya guardados.
- [x] 4.6 Mostrar feedback seguro en el catch existente de toggle fallido (F05, alcance UI); verificar que el estado revertido y el mensaje son comprensibles sin añadir retries, colas ni cambiar sincronización.

## 5. Recibos, revisión y fotografías

- [x] 5.1 Aplicar C04–C09/C24 en subida, estados de recibo y retry (H20/H25); verificar coherencia Upload/Processing/Ready to Review, evitar “Completed” antes de que el usuario revise los artículos y mostrar un éxito coherente con la navegación real, sin exponer errores crudos.
- [x] 5.2 Pulir la subida a 320 px y altura reducida: título, label, picker, previews, rechazos, carga y pie; verificar foco dentro de la hoja, mensajes enlazados al campo, targets de 44×44 y cierre accesible. La prueba de teclado virtual en un dispositivo físico se descarta por decisión del usuario.
- [x] 5.3 Pulir selección y añadir a lista con C10–C12 (H20); verificar singular/plural, Clear Selection, modo existing/new, labels asociados a grupo/lista, cierre de 44×44, foco inicial y de retorno, destinos y estados vacíos/de error mediante interacción local y pruebas pertinentes, conservando contratos.
- [x] 5.4 Aplicar C13 al resumen de importes y C09 a la salida de extracción vacía; verificar precio ausente/cero/cobertura parcial con datos sintéticos y que los cálculos/moneda y tipo de subida no cambian.
- [x] 5.5 Pulir visor y compare: foco, cierre, controles y separador por teclado y jerarquía en viewport corto; verificar botones de zoom/rotación/fit, navegación multiimagen y alternativas teclado. Las pruebas de gestos touch en un dispositivo físico se descartan por decisión del usuario.
- [x] 5.6 Consolidar anuncios de selección/procesamiento y progreso determinado/indeterminado; verificar valores ARIA cuando existen y ausencia de porcentajes o progreso por foto ficticios.
- [x] 5.7 Recorrer con Playwright CLI el flujo existente de subida→procesamiento→revisión OCR→hoja para añadir selección a una lista usando `e2e/data-test/test-receipt.jpg` a 320/390/430 px; verificar estado, copy, foco y reflujo. Antes de enviar, comprobar que el backend es de pruebas y obtener autorización explícita; no conservar la imagen ni datos extraídos en evidencia compartida. La comprobación táctil en dispositivo físico queda fuera de alcance.

## 6. Grupos, listas, historial y compartir

- [x] 6.1 Aplicar C14–C16 a grupos/listas y mejorar títulos/notas/nombres accesibles de tarjetas (H12); verificar identificación de destinos repetidos por lector de pantalla y reflujo a 320 px sin hacer toda la tarjeta un control anidado.
- [x] 6.2 Revisar variantes create/edit/delete de grupo/lista, con foco, mensajes y consecuencias actuales; verificar cierres y validaciones en el backend local aislado con fixtures temporales que se eliminaron al terminar, y cubrir handlers propios solo con fixtures seguros.
- [x] 6.3 Corregir “shopping/shoppings”, formato visual de fecha/importe/cero y nombres del historial (H17, C23); verificar cero frente a desconocido sin cambiar moneda, cálculo, filtros o qué artículos se almacenan.
- [x] 6.4 Pulir compartir y sus estados de carga/owner/guest/revocar/remover con C29; verificar explicación de alcance por lista, acceso de teclado y confirmaciones sin generar ni revocar enlaces reales.
- [x] 6.5 Separar error conocido de vacío definitivo en las pantallas con ambos branches (H18, C24); verificar con respuestas controladas que no se muestran mensajes contradictorios, dejando F02 registrado sin alterar query/DTO/RLS para ocultarlo.

## 7. Autenticación, perfil, cuenta y público

- [x] 7.1 Ajustar copy de auth C01–C03/C31 y presentar fallos visibles de Google usando los errores actuales; verificar estados de formulario, password toggle, autofill y feedback sin modificar OAuth/callback ni añadir recuperación nueva.
- [x] 7.2 Retirar affordances de recuperación/destinos placeholders o conectar únicamente páginas existentes y aprobadas (H21, C02/C26); verificar cada href y mantener explícita F13 como dependencia de contenido, sin inventar textos legales.
- [x] 7.3 Alinear Profile/Account con PageHeader y tarjetas v2 y aplicar C25 (H16/H22); verificar pares label/valor a 320/390 con emails/nombres sintéticos largos, sin tecnicismos de proveedor ni promesas de gestión inexistentes.
- [x] 7.4 Aplicar C27–C31 al marketing visible y revisar constantes/metadatos relacionados (H23/H24); verificar que las afirmaciones describen selección/revisión/lista compartida y no prometen edición OCR, no-persistencia, precisión medida o compatibilidad universal ausentes.
- [x] 7.5 Resolver el overflow de landing a 320 px y pulir FAQ/footer/anclas y acceso público con teclado manteniendo composición e identidad existentes (H29); verificar encabezados, foco visible, labels y destinos desde móvil y escritorio sin añadir nuevas secciones o funciones.
- [x] 7.6 Alinear el fallback offline y copy de instalación con C32 (H27); verificar documento estático autónomo, reflujo a 320 px y pasos de instalación solo en plataformas disponibles, sin introducir garantías offline nuevas.

## 8. Movimiento, temas y consistencia

- [x] 8.1 Sustituir scan decorativo infinito por una transformación finita (H15), con estado final inmediato bajo movimiento reducido; verificar animaciones activas después del final y no alterar indicadores reales de OCR.
- [x] 8.2 Limitar propiedades de transición y completar movimiento reducido en Progress/dialogs/loaders afectados (H14); verificar estado final, foco y feedback en modo normal/reducido sin regla global que suprima información.
- [x] 8.3 Restringir brillo primario a los roles aprobados y resolver tokens/variantes pendientes que afecten este diff (H28); verificar consumidores móviles, contrastes expuestos y actualizar `DESIGN.md` sin inventar un nuevo sistema oscuro.

## 9. Aceptación integrada y entrega

- [x] 9.1 Ejecutar la matriz móvil de `verification.md` en el mismo build modificado y contrastarla con v2 usando Playwright CLI y Chrome DevTools; verificar DOM, clases, estilos, medidas y capturas antes/después para cada flujo afectado, con información privada enmascarada. Evidencia consolidada y limitaciones anotadas en `verification.md`; F02 permanece registrado como discrepancia sin resolver.
- [x] 9.2 Completar teclado y las comprobaciones de safe area que admita la emulación documentada del navegador; registrar como fuera de alcance, por decisión del usuario, las validaciones que requieren dispositivo físico (teclado virtual, touch/gestos y VoiceOver/TalkBack móvil). No tratar un resize como prueba de dispositivo real.
- [x] 9.3 Realizar la comprobación de compatibilidad 768/1280 después de cerrar móvil; verificar acciones y navegación al cruzar breakpoints sin rediseñar escritorio fuera del alcance.
- [x] 9.4 Revisar scripts y ejecutar lint, typecheck y pruebas unitarias/de componente apropiadas sin migraciones ni limpieza destructiva; verificar guard de props, estructura/barrels e identificadores, registrando cualquier fallo previo sin debilitar pruebas.
- [x] 9.5 Ejecutar el recorrido manual del recibo de 5.7 solo después de verificar el backend de pruebas y autorizar su escritura; registrar si el frontend es local o desplegado y no equiparar evidencia de Vercel con el build local.
- [x] 9.6 Ejecutar la suite E2E persistente solo si `stabilize-test-foundation` ya garantiza entorno local/fixtures aislados; en caso contrario mantenerla pendiente y documentar el bloqueo sin ejecutar el harness inseguro.
- [x] 9.7 Actualizar el registro Hxx/Cxx con resultados, diferencias con v2 y dependencias Fxx; verificar que ningún bloqueo funcional se presenta como solucionado y que no se declara toda la app lista para producción a partir de evidencia visual parcial.
