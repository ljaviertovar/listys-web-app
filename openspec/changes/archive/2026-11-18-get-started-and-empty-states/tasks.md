# Tasks

## 1. Modelo: pasos de Get Started y visibilidad

- [x] 1.1 En `build-dashboard-model.ts` añadir `getStarted` (pasos `list`, `trip`, `receipts`, `completed`, `current`, `null` si los tres están cumplidos) con las reglas de la decisión 1, y `hasReceipts` derivado de `tickets`. Verificar con pruebas en `tests/build-dashboard-model.test.ts`: cuenta vacía (0 de 3, actual `list`), pasos cumplidos fuera de orden, tres cumplidos (`null`), `receipts` con 2 y con 3 recibos, y borrar la única lista devuelve el paso 1 a pendiente.
- [x] 1.2 Reflejar la visibilidad en `dashboard-view.tsx`: con `getStarted` no se renderiza `NoSessionBanner`; `ListsSectionCard`, `MonthSpendingCard` y `LikelyNeededCard` solo con datos (decisión 3); compra activa y `UpNextList` sin cambios. Verificar con pruebas de render en `tests/dashboard-cards.test.ts` o una nueva `tests/dashboard-view.test.ts`: cuenta nueva (solo "Get Started"), tras la primera lista (aparece Lists), tras el primer recibo (aparece This Month), con compra activa y pasos pendientes (banner arriba, "Get Started" debajo) y cuenta completa (sin "Get Started", igual que hoy).

## 2. Tarjeta Get Started

- [x] 2.1 Extraer `SetUpPantryAction` de `set-up-pantry-callout.tsx` (misma lógica, `data-testid` derivado), exportarlo desde el barrel de `base-lists` y hacer que el aviso lo use. Verificar que `tests` existentes del aviso y de `base-lists` siguen en verde sin cambios.
- [x] 2.2 Crear `components/features/dashboard/get-started-card.tsx` (decisión 5) con `data-testid` (`dashboard-get-started`, `-step-list`, `-step-trip`, `-step-receipts`), exportarla desde `index.ts` y acciones por paso (decisión 4: `SetUpPantryAction`, `StartShoppingDialog` / "Add Items" / "Open Your Lists", `UploadTicketDialog`). Verificar con una prueba de comportamiento: solo el paso actual muestra acción, los cumplidos llevan marca, `aria-current='step'` en el actual, "N of 3" correcto, sin botón de descartar, y la acción del paso 2 cambia entre las tres variantes.
- [x] 2.3 Montar `GetStartedCard` en `dashboard-view.tsx` en el lugar del héroe, y comprobar en el navegador (390 px y escritorio, claro y oscuro) los tres estados del tablero: 0 de 3, tras la Pantry y tras el primer recibo. Verificar con una captura de cada uno y sin errores de consola.

## 3. Mes vacío con historial y vacíos en fila

- [x] 3.1 Añadir `last_receipt_at` a `SpendingSummaryDto` y a su construcción en `spending.service.ts` (consulta de una fila, tolerante a error), al tipo de `lib/api/endpoints/spending.ts` y a `docs/reference/api-v1.md`. Verificar en `spending-route.test.ts`: devuelve el valor, `null` sin recibos y `null` si la lectura falla sin romper el resumen.
- [x] 3.2 Reemplazar `DashboardEmptyState` por la anatomía de fila (decisión 8: `RowIcon md`, título, línea, acción `sm` opcional) y usarla en `likely-needed-card.tsx`; eliminar el `Alert` de 0–2 recibos y su prueba. Verificar que `dashboard-cards.test.ts` conserva "Nothing looks due yet." y ya no menciona "0 of 3 receipts".
- [x] 3.3 En `month-spending-card.tsx` mostrar la fila de "mes vacío con historial" (decisión 7: anillo gris sin importe, "No receipts in <month> yet", "Your last receipt was on <date>", "See All Time" que cambia el periodo) y mantener el texto vigente sin `last_receipt_at`. Verificar con pruebas: con `last_receipt_at` aparece el texto y el botón, sin él no, el botón pone `scope='all'` y el combobox lo refleja, y no se renderiza "$0".

## 4. Cierre

- [x] 4.1 Actualizar `CHANGELOG.md` (incluida la mención de que las cuentas con menos de tres recibos ven "Get Started") y `docs/reference/implementation-status.md`. Verificar que ambos describen el comportamiento final.
- [x] 4.2 Ejecutar `tsc --noEmit`, ESLint de los archivos tocados, `vitest` de `features/dashboard`, `features/base-lists`, `app/api/v1/spending` y `pnpm check:native-props` (los tres fallos previos no cuentan), y `openspec validate get-started-and-empty-states --strict`. Verificar con la salida de cada comando; la puerta del sistema de diseño (`/appds:gate`) se ejecuta al terminar.
