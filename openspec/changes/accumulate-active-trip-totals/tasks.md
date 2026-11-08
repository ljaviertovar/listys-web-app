# Tasks

## 1. Acumulado estimado del trip activo

- [x] 1.1 Derivar subtotal y cobertura de ítems marcados reutilizando el mapa completo de precios, en un helper de shopping-sessions con su prueba en `tests/`; verificar con Vitest marcar/desmarcar, precio desconocido, cero marcados y ausencia de multiplicación por cantidad.
- [x] 1.2 Conectar el subtotal a la tarjeta activa en `shopping/[runId]/page.tsx`, conservando el mapa completo para las filas y el cálculo de completados; extender y ejecutar `shopping-run-page.test.ts` con un ítem pendiente que sí tenga precio para demostrar que no suma y conserva su precio visible.
- [x] 1.3 Ajustar la API de `SessionSummaryCard` para mostrar cero acumulado cuando existen precios en el trip, aunque ningún marcado tenga precio; añadir y ejecutar pruebas del comportamiento cero/sin datos y verificar que progreso y cobertura usan los denominadores correctos. Conservar los identificadores semánticos e inspeccionar el root de cualquier componente nuevo.
- [x] 1.4 Verificar la independencia de lista base y Start Shopping con sus pruebas existentes y un caso de integración de marcado; mantener sus cálculos sin filtros del trip y comprobar que el estimado completo permanece igual con los mismos datos de precios.
- [x] 1.5 Actualizar las reglas afectadas en `docs/design/DESIGN.md` y el requisito de memoria de precios de `docs/prd/PRD-v3.md`; registrar en sección 11.4 el borde cero/cobertura si no lo cubre el HTML. Verificar que los textos diferencian lista base, acumulado activo y pagado, y conservan el diseño v2.

## 2. Pagado de los recibos adjuntos

- [x] 2.1 Ampliar `summarize-trip-receipts.test.ts` con dos adjuntos, pendientes mixtos, total cero, desconocidos, adjuntar uno pendiente y retirar un adjunto; ejecutar Vitest y corregir el helper solo si las pruebas revelan un incumplimiento de la suma exclusiva de adjuntos.
- [x] 2.2 Añadir pruebas parametrizadas de `TripReceiptSummary` para activo/completado con los mismos importes, total desconocido adjunto y pendiente sin total; ejecutar `trip-receipt-summary.test.tsx` verificando el importe dentro del resumen semántico, sin confundirlo con las filas.
- [x] 2.3 Extender las pruebas de integración de página para la proyección confirmada de recibos, con total corregido diferente del leído y del total guardado del trip; ejecutar las pruebas correspondientes de shopping-sessions y la página y verificar que ambos modos muestran solo la suma confirmada, sin modificar contratos ni mutaciones.
- [x] 2.4 Precisar en `docs/design/DESIGN.md` que el total conocido es el confirmado al adjuntar, incluida su corrección, conservando la política de importes desconocidos; revisar que la documentación coincide con las pruebas de ambos modos.

## 3. Integración y verificación

- [x] 3.1 Reconciliar el delta de `item-price-memory` con el renombrado pendiente de `trip-receipt-review-redesign` según `design.md`, manteniendo todos sus escenarios de completados; verificar el nombre vigente con `openspec show item-price-memory --type spec` y validar este cambio con `openspec validate accumulate-active-trip-totals --strict`, sin archivar el otro cambio como efecto secundario.
- [x] 3.2 Ejecutar `pnpm lint`, `pnpm typecheck`, `pnpm check:native-props` y las pruebas Vitest de todas las features modificadas, incluidas las regresiones de estimación y recibos; resolver fallos introducidos y registrar cualquier fallo previo verificado. No ejecutar migraciones destructivas en ninguna prueba.
- [x] 3.3 Iniciar la app y validar visualmente con Chrome DevTools a 375 px y 1280 px, capturando screenshots e inspeccionando DOM, estilos calculados y dimensiones frente al canvas de trips del HTML v2: cero inicial, cobertura parcial, importe largo y ambos resúmenes con recibos. Corregir discrepancias y guardar evidencia.
- [x] 3.4 Verificar con Playwright CLI el flujo marcar/desmarcar/reabrir y adjuntar/completar con los mismos recibos; usar fixtures aislados y credenciales locales `E2E_SUPABASE_*` si interviene Supabase, sin mockearlo ni ejecutar migraciones destructivas. Confirmar acumulado, estimado base independiente y pagado idéntico antes/después de completar.
