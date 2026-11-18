# Design

## Context

Fuente visual: tablero F1 "Empty states for a new account" del canvas de diseño (opción A, "Get Started", sus reglas y
"Empty for now · returning users"). Estado actual observado en el código:

- `DashboardContent` (servidor) lee listas, recibos, historial de compras completadas, artículos probables, tiendas y sesiones
  activas, y `buildDashboardModel` los convierte en el modelo. Ya existen `model.lists.hasDefaultList`,
  `model.likelyNeeded.receiptsCount` (el mismo recuento que usa "Likely Needed") y `model.startTarget` / `addItemsTarget`.
- `DashboardView` decide hoy qué se muestra: héroe (`ActiveSessionBanner` o `NoSessionBanner`), `UpNextList`, y la rejilla
  `ListsSectionCard` + `StoreVisitsCard` + `LikelyNeededCard`. `MonthSpendingCard` se muestra siempre y carga su gasto en el
  cliente (`useSpendingSummary`), así que el servidor no sabe si ese mes tiene gasto.
- El aviso "Set up your Pantry" (`SetUpPantryCallout`) lleva dentro la lógica de la acción (`requestPantrySetup`, toast,
  `router.refresh`). Pertenece al cambio en curso `default-pantry-for-existing-accounts`.
- `DashboardEmptyState` pinta un vacío centrado con `RowIcon size='empty'` (64 px); la especificación de `trips` ya garantiza
  que el estado "Trips filtrado sin viajes" no es alcanzable.

## Goals / Non-Goals

**Goals:**

- Una cuenta nueva ve una sola tarjeta con un solo siguiente paso, sin tarjetas vacías ni héroe duplicado.
- Cada sección vuelve en cuanto tiene datos; el estado de los pasos se deriva siempre de los datos (sin tabla ni flag).
- Un mes sin gasto en una cuenta con historial no se parece al vacío de una cuenta nueva.
- Una sola anatomía de vacío dentro de una tarjeta, reutilizable por las secciones del dashboard.

**Non-Goals:**

- Las pantallas vacías de Lists, Receipts y Trips y el vacío "Trips filtrado" (ver proposal).
- Importe y tienda del último recibo, descartar la tarjeta, recordar que se descartó, onboarding fuera del dashboard.
- Cambiar `ensure_default_pantry` o la acción "Set up Pantry" (solo se extrae su botón).

## Decisions

**1. Los pasos son una función pura del modelo.** `buildDashboardModel` añade
`getStarted: { steps: [{ id: 'list' | 'trip' | 'receipts', done, progress? }], completed, current } | null`, con `null` cuando
los tres están cumplidos. Reglas: `list` = `baseLists.length > 0`; `trip` = alguna compra de `trips` con `completed_at`;
`receipts` = `likelyNeededReceiptCount >= 3` (misma fuente y umbral que "Likely Needed", para que las dos tarjetas no se
contradigan). `current` es el primer paso sin cumplir. Alternativa descartada: guardar el avance o un "dismissed" por usuario;
añade estado, migración y casos de desincronía para un camino que los datos ya describen.

**2. Paso 1 = "tiene una lista", no "tiene la lista por defecto".** El tablero dice "Set up your Pantry", pero una cuenta con
listas propias y sin Pantry (cuentas anteriores) no debe ver "Get Started" pidiéndole configurarla: para ellas el aviso
"Set up Pantry" de la tarjeta Lists (cambio `default-pantry-for-existing-accounts`) sigue siendo la vía. Coste: el texto del
paso habla de la Pantry aunque lo cumpla cualquier lista. Se acepta y se escribe en el spec como "al menos una lista".

**3. Visibilidad de secciones en `DashboardView`, no dentro de cada tarjeta.** Con `model.getStarted !== null`:
`NoSessionBanner` no se renderiza; `ListsSectionCard` solo con `lists.items.length > 0`; `MonthSpendingCard` solo con al menos
un recibo (`tickets.length > 0`, dato del servidor; la tarjeta sigue cargando su gasto en el cliente); `LikelyNeededCard` solo
si tiene artículos o `receiptsCount >= 3` (hoy `shouldShowLikelyNeeded` es `items > 0 || receiptsCount < 3`; con "Get
Started" la segunda rama se invierte, y con 3 o más recibos y sin artículos se muestra "Nothing looks due yet."). Con `getStarted === null` el dashboard se comporta como hoy. La compra activa y `UpNextList` no dependen de
`getStarted`: avisan de trabajo en curso.

**4. La acción de cada paso reutiliza lo existente.** Paso 1: se extrae `SetUpPantryAction` de `SetUpPantryCallout` (misma
lógica y `data-testid` derivado) y ambos lo usan; no se toca el contrato del cambio en curso. Paso 2: `StartShoppingDialog`
con `model.startTarget`; si no hay lista con artículos, un enlace "Add Items" a `model.addItemsTarget`, y si hay varias
listas vacías, "Open Your Lists" a `/shopping-lists` (los mismos tres destinos que `NoSessionBanner`). Paso 3:
`UploadTicketDialog`, con "N of 3" en el título del paso.

**5. Anatomía de la tarjeta.** Nuevo `get-started-card.tsx` dentro de `DashboardSectionCard` (sin "View All"): cabecera
"Get Started" con "N of 3" en mono, barra de tres `Progress` (uno por paso, `aria-hidden`), y `<ol>` de pasos hechos con las partes nativas de `Item` (`ItemMedia`, `ItemContent`, `ItemTitle`, `ItemDescription`) con `aria-current='step'` en el
actual. Punto de 24 px: número (actual y pendiente) o marca de hecho en el verde de trip. Medidas del tablero: padding de
paso 12, separador fino, descripción 13/18 y botón `lg` de ancho completo solo en el paso actual. Colores por tokens
(`entity-trip`, `primary`, `border`), nunca por clases de paleta; sin `className` de estilo en los componentes shadcn, solo de
layout.

**6. `last_receipt_at` en el resumen de gasto, no el importe ni la tienda.** El servicio añade `last_receipt_at` junto a
`first_receipt_at` con el mismo patrón tolerante (consulta de una fila ordenada descendente, `null` ante error o sin
recibos). Aditivo en el DTO y en la ruta. Alternativas: tomarlo de `model.storeVisits` (mezcla compras y recibos, y solo hay
tiendas confirmadas) o ampliar a `{ at, total, store }` como dibuja el tablero (más superficie de API y de privacidad para una
frase de apoyo). Se elige la fecha sola.

**7. Mes vacío con historial en `MonthSpendingCard`.** Si `scope === 'month'`, no hay gasto y `last_receipt_at` existe, la
tarjeta muestra la fila de vacío (anillo gris sin importe, "No receipts in <month> yet", "Your last receipt was on <date>",
botón `sm` outline "See All Time" que hace `setScope('all')`). El tablero dibuja "$0" dentro del anillo; se omite porque la
especificación de "This Month" prohíbe mostrar "$0" sin gasto conocido. Sin `last_receipt_at` se conserva el texto vigente.
El mes se nombra con el helper de etiqueta de mes ya existente (zona horaria del visitante).

**8. Una sola anatomía de vacío en tarjeta.** `DashboardEmptyState` pasa a la fila del tablero, hecha con las partes de `Item` (`RowIcon size='md'` como media, título, línea de ayuda y como máximo una acción `lg` secundaria) y se usa en "Likely Needed" ("Nothing looks
due yet.") y en el vacío del mes. Se retira el uso de `size='empty'` en el dashboard; `EmptyStateCard` de las páginas no se
toca. El aviso de 0–2 recibos de "Likely Needed" (`Alert` con barra) deja de ser alcanzable: con menos de tres recibos
"Get Started" siempre se muestra (decisión 1) y la tarjeta se oculta sin artículos (decisión 3). Se elimina junto con su
prueba, y su mensaje vive ahora en el paso 3.

## Risks / Trade-offs

- **Cuentas existentes con historial pero menos de tres recibos** verán "Get Started" con el paso 3 abierto, y se les ocultan
  "Spend" y "Likely Needed" hasta que tengan recibo o tres recibos. Es coherente con lo que ya les mostraba "Likely Needed"
  (pedir tres recibos), pero es un cambio visible: se menciona en el CHANGELOG.
- **Paso 1 se cumple con cualquier lista** (decisión 2): el texto "Set up your Pantry" puede parecer ya hecho para quien tiene
  listas propias. Aceptado; la alternativa regresa el problema de las cuentas antiguas.
- **El gasto se carga en el cliente**, así que la tarjeta "This Month" puede aparecer y mostrar su estado de carga antes de
  saber si el mes tiene gasto. Ya ocurre hoy.
- **Una lectura más en la ruta de gasto** (`first_receipt_at` ya existe; `last_receipt_at` añade una consulta de una fila
  por petición, en paralelo con las demás). Impacto despreciable; se prueba que un fallo no rompe el resumen.
- **Dependencia del cambio en curso**: si `default-pantry-for-existing-accounts` cambia el contrato de `SetUpPantryCallout`
  antes de archivarse, la extracción de `SetUpPantryAction` debe rebasarse sobre él. Ninguna tarea toca su migración ni su API.
