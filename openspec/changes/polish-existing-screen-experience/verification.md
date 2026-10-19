# Cobertura y plan de aceptación

## Lo revisado en esta propuesta

Inventario completo de rutas y componentes de presentación, inspección de código y recorridos de navegador sin escrituras de negocio. **B** no certifica equivalencia entre código local y despliegue; **C** no significa que una prueba haya pasado. Las capturas de transiciones intermedias no son evidencia de layout estable.

| Pantalla / flujo | Cobertura de esta sesión | Qué falta para aceptar la implementación |
| --- | --- | --- |
| Landing `/` | B pública local a 320/390/1280 y C; footer y scan/movimiento reducido observados; overflow a 320 px (H29) | Contrastar board v2; copy sin claims; FAQ por teclado, foco de anclas, scan finito, texto ampliado. |
| Sign in / sign up | B: pantalla inicial de acceso e inicio manual de Google; C: formulario, etiquetas, errores, destinos y copy. El recorrido público adicional agotó timeout al cargar sign in y el intento acotado de confirmar hidratación tampoco terminó; no se presume ejecutada su validación vacía | Repetir la versión local modificada a 320/390 y escritorio; errores vacíos, autofill, show password y teclado virtual real. |
| Dashboard | B 320/390/430/768/1280; C; capturas móviles y escritorio, medidas de objetivos y barras | Nuevo usuario/sin listas/sin items/sesión compartida/fallo real con fixtures seguros; expansión del texto y final de scroll. |
| Grupos | B 390: navegación, tarjeta y apertura/cierre de crear; C | Repetir captura estable de creación a 320 y probar validaciones sin guardar; errores y nombres largos. |
| Listas del grupo | B 390: vacío y creación; C | F02 impide certificar el listado completo en ese despliegue; reproducir con fixtures del build local. |
| Items de base list | B acceso directo 390; categorías y compartir; C | Bloqueo de lista, editor inline, foco de retorno, delete confirmado y undo fiable con datos sintéticos locales. |
| Compra activa | B 390: navegación, categorías, añadir, menú, completar/cancelar abiertos y cerrados sin confirmar; C | Progreso y reordenamiento tras marcar, último item, propietario/invitado, cero items y fallos con fixtures aislados. |
| Recibos | B 390: listado y navegación; C | Estados pending/processing/failed/empty/retry con datos sintéticos; no provocar OCR real para ilustrar estados. |
| Subida | B: apertura, carga diferida del formulario, 320×568 y movimiento reducido; C | Picker/cámara en dispositivo, archivos válidos/rechazados, quitar foto/foco, teclado real y upload seguro local. |
| Revisión OCR | B 390: seleccionar todos, barra y apertura de merge; C | Importes parciales/cero, nombres largos, cambios de selección por teclado, retorno al recibo. |
| Añadir a lista | B 390/320: modos/controles visibles, primer Tab fuera del diálogo; no se envió | Seleccionar grupo/lista/nuevo nombre y estados de error sin persistir; flujo exitoso solo con fixtures locales seguros. |
| Visor y comparar | B 390: abrir/cerrar, zoom y rotación por botones, abrir compare; C | Touch/pinch y divisor con alternativas teclado en dispositivo/emulación táctil explícita; multiimagen, errores y viewport corto. |
| Historial grupo / sesión completada | B por navegación y posterior carga directa; C | Repetir dimensiones/capturas del build modificado; confirmar cero/importes desconocidos y readonly sin controles aparentes de edición. |
| Compartir | B: apertura, carga y cierre sin generar/revocar enlaces; C | Layout final con datos sintéticos de colaboradores/enlace/revocación; receptor y pérdida de acceso quedan para iteración funcional. |
| Profile / Account | B DOM estable a 320/390, sin overflow con los valores presentes, Back de 20 px; C | Emails/nombres largos, reflujo, estilos calculados y capturas enmascaradas del nuevo build, sin datos privados en artefactos. |
| Menú de cuenta | B: abrir/cerrar, foco interno y destinos; no sign out | Confirmar vuelta de foco y alcance táctil tras cambios. |
| Invitación | C únicamente | No visitar tokens reales: el render acepta. Validar estados de invitación inválida con fixtures aislados en la siguiente fase. |
| Offline/PWA | C; pública estática cuando la carga local sea alcanzable | Fallback y botón de instalación en navegador/dispositivo soportado; no afirmar offline persistente ni sync garantizado. |
| Alias `/profile`, `/account` | C: redirecciones a settings | Smoke de destino; no diseñar pantallas duplicadas. |
| Loading y error boundaries | C; skeletons observados al navegar | Validar los estados expuestos con fixtures seguros y comprobar que error no se combina con vacío definitivo. |

## Matriz móvil obligatoria para la aplicación

| Caso | Criterio observable |
| --- | --- |
| 320×568, 390×844, 430×932 | Sin overflow de página; nombres/avisos y acciones legibles y alcanzables. |
| 390×568 y orientación horizontal | Hoja desplazable; cierre y acción final accesibles; barras sin tapar foco o última fila. |
| Teclado virtual abierto | Campo, hint/error y siguiente acción alcanzables; cierre no descarta por sorpresa datos guardados. Requiere comprobación real, no solo resize. |
| Touch y uso con una mano | Target real 44×44; labels activan checkbox/radio; scroll, pinch, drag y cancelación de gesto con alternativas. El viewport emulado por sí solo no valida gestos. |
| Teclado externo | Skip link; orden lógico; Enter/Space/Escape según semántica; Tab/Shift+Tab dentro de modal; foco al abrir/cerrar/editar/eliminar. |
| Texto 200% y copy +30% | Wrapping/stacking; sin truncar consecuencias; nombre completo accesible. |
| Movimiento reducido | Sin scan infinito ni transforms no esenciales; progreso/estado aún comprensible. |
| Contraste y estados | Medición de texto, foco y límites esenciales; estado no depende solo del color. |
| Screen reader móvil | VoiceOver o TalkBack: título y consecuencias del modal, selectores, campos inválidos, progreso y anuncios sin duplicados. Pendiente en esta propuesta. |
| Safe area / PWA | Nav y overlays libres de notch/home indicator; comprobar en dispositivo o emulación documentada. Pendiente. |
| Tablet / escritorio | Después de móvil: 768×1024 y 1280×900, navegación y acciones sin perderse ni duplicarse por breakpoints. |

## Evidencia de aceptación

Para cada lote conservar: build/commit y origen, viewport/device, pasos, estado inicial, DOM relevante, clases/variantes aplicadas, estilos calculados, dimensiones y capturas antes/después contra v2. Asociar resultados a Hxx/Cxx y marcar pasado/fallido/pendiente. Los artefactos compartidos deben contener solo fixtures sintéticos o información enmascarada.

En esta auditoría se inspeccionaron DOM y medidas con Playwright CLI. La validación visual exigida por `AGENTS.md` mediante Chrome DevTools sobre el build modificado sigue siendo una tarea de aplicación; no se afirma haberla completado por tener capturas.

## Comprobaciones de código para la aplicación

- Ejecutar `pnpm lint`, `pnpm typecheck` y `pnpm test --run` con el runtime soportado después de revisar que los scripts/pruebas pertinentes no invocan migraciones o borrados globales. Registrar fallos previos, sin debilitar assertions para hacerlos pasar.
- Cubrir comportamiento propio modificado: labels/errores asociados, foco del wrapper, estados de confirmación, feedback y nombres accesibles contextuales. No retestear la implementación interna de Radix/shadcn.
- Inspeccionar cada componente propio nuevo o modificado del diff: raíz con `data-testid` semántico, prop `testId` cuando proceda; excepciones solo para no-DOM y primitivas de terceros sin cambio.
- Revisar guard de props nativas y consumidores de variantes; tests en el `tests/` más cercano y barrels públicos actualizados si se crean módulos.
- No ejecutar la suite E2E versionada hasta resolver `stabilize-test-foundation`. Los recorridos persistentes requieren Supabase local, `E2E_SUPABASE_*` y fixtures con limpieza por id; ninguna migración destructiva.
- No se ha ejecutado lint/typecheck/Vitest como prueba de una implementación inexistente. La comprobación ejecutable de esta entrega es la validación estricta de los artefactos OpenSpec.

## Definición de terminado

Todos los P1 de presentación y los P2 aceptados están resueltos y trazados; v2 y sus excepciones están documentados; flujos móviles y checks de escritorio pasan en el mismo build; problemas funcionales y validaciones pendientes están visibles. No declarar toda la aplicación lista para producción mientras queden dependencias funcionales o de contenido que bloqueen ese objetivo.
