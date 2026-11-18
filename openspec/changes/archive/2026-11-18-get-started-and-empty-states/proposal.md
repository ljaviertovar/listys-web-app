## Why

Una cuenta nueva abre el dashboard y ve cuatro tarjetas pidiendo cosas distintas a la vez (el héroe "Start with a receipt",
"Spend This Month", "Lists" con el aviso de la Pantry y "Likely Needed" con "Add items to a list"), sin orden y con tres
botones primarios. Además, quien ya tiene recibos pero ninguno este mes ve la tarjeta de gasto vacía como si nunca hubiera
subido uno. La propuesta F1 del canvas de diseño (opción A, "Get Started") da a la cuenta nueva un solo camino de tres pasos
y hace que cada sección aparezca cuando ya tiene algo que enseñar.

## What Changes

- **Tarjeta "Get Started"** en el dashboard: tres pasos en orden (crear la lista por defecto, hacer una compra, subir 3
  recibos), con barra de tres segmentos y "N of 3". Solo el paso actual (el primero sin cumplir) se abre y muestra su única
  acción. Los pasos se derivan de los datos de la cuenta: no hay estado guardado ni botón para descartarla; desaparece sola
  al cumplir los tres.
- **Secciones que esperan sus datos**: mientras "Get Started" se muestra, el héroe sin compra activa ("Start with a
  receipt"), "This Month", "Lists" y "Likely Needed" solo aparecen cuando tienen algo que enseñar (una lista, un recibo, tres
  recibos). La compra activa y "Up Next" siguen apareciendo siempre.
- **"This Month" sin gasto este mes pero con recibos de otros meses**: una fila compacta (anillo gris sin importe, "No receipts
  in <month> yet", fecha del último recibo y "See All Time", que cambia el combobox) en lugar de repetir el vacío de cuenta
  nueva.
- **"Likely Needed" sin nada pendiente**: la misma fila compacta de las demás secciones, con el mismo texto ("Nothing looks
  due yet.").
- **API v1**: `GET /api/v1/spending` devuelve además `last_receipt_at` (fecha del recibo más reciente o `null`), en la misma
  línea que `first_receipt_at`. Aditivo.
- **Componentes**: una acción "Set up Pantry" reutilizable (hoy vive dentro del aviso) y la anatomía de fila vacía dentro de
  una tarjeta, que sustituye a `DashboardEmptyState` (icono de 64 px centrado).

Fuera de alcance: las pantallas vacías de Lists, Receipts y Trips del mismo tablero (no se eligieron en esta propuesta); el
estado "Trips filtrado por una lista sin viajes" del tablero, porque la especificación vigente de "Trips" ya garantiza que
ese estado no es alcanzable (el filtro solo ofrece listas con viajes); mostrar el importe y la tienda del último recibo (el
tablero los dibuja, aquí solo se muestra la fecha para no ampliar el contrato de la API); rediseñar las tarjetas con datos.

## Capabilities

### New Capabilities

- `dashboard-get-started`: el camino de tres pasos de una cuenta nueva en el dashboard: qué pasos existen, cuándo se cumple
  cada uno, cuándo se muestra y qué acción ofrece.

### Modified Capabilities

- `dashboard-overview`: las secciones del dashboard dejan de mostrarse vacías mientras "Get Started" está presente, y "This
  Month" distingue "sin gasto este mes" de "sin recibos".

## Impact

- UI: `components/features/dashboard/` (nuevo `get-started-card.tsx`, `dashboard-view.tsx`, `build-dashboard-model.ts`,
  `month-spending-card.tsx`, `likely-needed-card.tsx`, `dashboard-empty-state.tsx`), `components/features/base-lists/`
  (extraer el botón de `set-up-pantry-callout.tsx`), `components/features/dashboard/no-session-banner.tsx` (deja de mostrarse
  junto a "Get Started").
- Servicio y API: `lib/server/services/spending.service.ts`, `lib/api/endpoints/spending.ts`, y `docs/reference/api-v1.md`.
- Pruebas: modelo del dashboard (pasos y visibilidad), tarjetas del dashboard, ruta de gasto (`last_receipt_at`).
- Docs: `CHANGELOG.md`, `docs/reference/implementation-status.md`.
- Dependencia: el cambio `default-pantry-for-existing-accounts` (en curso) aporta la acción "Set up Pantry" y
  `hasDefaultList`; este cambio la reutiliza sin modificarla.
