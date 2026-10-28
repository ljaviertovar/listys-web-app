# Proposal

## Why

[PRD‑v3](../../../docs/prd/PRD-v3.md) Fase 6 ("Polish") aprovecha lo que las Fases 3–5 enseñan a la aplicación. Hoy la
pantalla de un recibo leído muestra todas las líneas iguales, agrupadas por categoría y sin marcar: el usuario no sabe
cuáles ya están en su lista, cuáles son nuevas ni cuáles conviene mirar en la foto hasta elegir una lista dentro del
diálogo. Y el dashboard dedica dos de sus tres tarjetas a actividad (últimos recibos, últimas compras) mientras la
memoria que ya existe —ritmo de compra por artículo, totales pagados, tienda de cada viaje— no se ve en ningún sitio.
Esta fase depende de `store-tags-and-scoped-sessions` (Fase 4: `shopping_sessions.store_id`, tienda habitual) y de
`close-the-loop` (Fase 5: `tickets.total_amount`, `tickets.shopping_session_id`).

## What Changes

- **FR‑15 — Revisión ligera en la pantalla del recibo.**
  - Un recibo leído y sin adjuntar se compara con una **lista destino**: la lista a la que ya se añadió, si no la última
    lista a la que el usuario añadió un recibo, si no su lista más antigua (Pantry). El usuario puede cambiarla.
  - Cada línea muestra su estado frente a esa lista y las líneas se ordenan en tres secciones: **"Check these"** (líneas
    dudosas, primero), **"New to <list>"** y **"In <list>"** (coincidencia por nombre o por vínculo recordado), esta
    última plegada y con **"Select all N"** como aceptación en bloque.
  - Una línea es **dudosa** por señales deterministas, nunca por una puntuación del modelo: el OCR no leyó su precio, o
    no coincide con ningún artículo pero su nombre se **parece** a uno (similitud de trigramas). La sugerencia nunca se
    aplica sola.
  - La revisión sigue siendo obligatoria: nada se preselecciona y "Add Items to List" mantiene su confirmación. El paso
    Review Matches del diálogo añade la sección **"Possible matches"** con "Link to “<item>”" en un toque; por defecto
    la línea se añade como nueva, como hoy.
  - Si la comparación no carga o el usuario no tiene listas propias, la pantalla vuelve a la vista por categorías.
- **FR‑16 — Dashboard útil.** Se mantienen el hero, "Up Next" y "Shopping Lists". Las tarjetas **Receipts** y
  **Shopping History** se sustituyen por:
  - **"Likely Needed"**: hasta 5 artículos de las listas propias comprados al menos 3 veces cuyo tiempo desde la última
    compra alcanza su intervalo medio ("Usually every 9 days · last bought 12 days ago"), los más atrasados primero; se
    omiten los que llevan más de 4 intervalos (o 120 días) sin comprarse.
  - **"This Month"**: gasto del mes natural en la zona horaria del visitante, sumando solo totales conocidos (total de
    compras completadas y total de recibos no adjuntos), con su composición y cuántas compras no tienen total. Nunca
    suma precios de líneas ni promedios.
  - **"Last Trip by Store"**: por tienda, la visita más reciente (compra con tienda o recibo con tienda), con fecha y
    total cuando se conoce.
  - Recibos e historial siguen accesibles desde la navegación; "Up Next" sigue avisando de recibos pendientes o fallidos.
- **Contrato v1 (compatible):** `GET /api/v1/tickets/{ticketId}/matches` acepta `base_list_id` opcional (sin él elige
  la lista destino), añade `meta.base_list` y `suggestion` por línea; nuevos `GET /api/v1/base-list-items?filter=
  likely_needed&limit=` y `GET /api/v1/spending?from=&to=`; `GET /api/v1/stores` añade `last_visit`. Sin versión nueva.
- **Migración solo aditiva:** extensión `pg_trgm`, funciones nuevas de lectura e índices. Sin tablas ni columnas nuevas;
  no borra ni reescribe filas.
- Documentación en el mismo change: `PRODUCT.md`, `docs/README.md`, `docs/architecture/architecture.md`,
  `docs/design/DESIGN.md`, `docs/reference/api-v1.md`, `docs/reference/limits.md`,
  `docs/reference/implementation-status.md` y `CHANGELOG.md`.

Fuera de alcance: editar nombre, cantidad o precio de una línea; confianza por línea devuelta por el OCR; aceptar
sugerencias sin pasar por el diálogo; alertas o notificaciones de reposición (no‑objetivo del PRD); excluir de "Likely
Needed" lo que ya está en una compra en curso; gasto por categoría, por tienda o de meses anteriores; filtrar el
historial por tienda; deduplicar un recibo añadido a una lista con la compra del mismo viaje no adjuntada (límite
conocido de la Fase 5); presupuestos.

## Capabilities

### New Capabilities

- `receipt-review`: cómo se revisa un recibo leído antes de añadir sus líneas: lista destino, estado de cada línea,
  líneas dudosas y sus motivos, secciones y aceptación en bloque, y la vuelta a la vista por categorías.
- `likely-needed-items`: la regla de ritmo de compra que decide qué artículos probablemente hacen falta y cómo se
  explican.
- `dashboard-overview`: qué muestra el dashboard (tarjetas que se mantienen y que se sustituyen), el gasto del mes y la
  última visita por tienda, con sus vacíos y errores.

### Modified Capabilities

- `receipt-item-matching`: las líneas sin coincidencia pueden traer un artículo **sugerido** por parecido de nombre,
  que se muestra como posible coincidencia y solo se aplica si el usuario lo vincula.
- `product-copy-clarity`: el copy de la revisión describe estados y sugerencias sin presentarlos como detección segura,
  y el gasto del mes se presenta como suma de totales conocidos, con su cobertura.

## Impact

- **Base de datos:** migración `20261029000000_lighter_review_and_dashboard.sql` (después de las de las Fases 4 y 5):
  `pg_trgm`, `receipt_suggestion_threshold()`, `ticket_item_suggestions`, `likely_needed_items`, `spending_summary`,
  `store_last_visits` e índices de lectura; script de verificación con `ROLLBACK`.
- **API/servicios:** `tickets.service.ts` (`getTicketMatches`, lista destino), servicio y ruta nuevos para artículos
  probablemente necesarios y gasto, `stores.service.ts` (`last_visit`), validaciones Zod, `src/lib/api/endpoints/`.
- **UI:** `features/tickets/receipt/` (vista por estado, hook y helper de clasificación, selector de lista, selección en
  bloque), `features/tickets/add-to-list/` (sección "Possible matches", lista preseleccionada), `features/dashboard/`
  (tres tarjetas nuevas, modelo, retirada de las tarjetas de recibos e historial).
- **Pruebas:** helpers puros, contratos de rutas, componentes con reglas; E2E escritas, ejecutadas solo con permiso.
- **Dependencias:** ninguna de npm; `pg_trgm` es una extensión estándar de Supabase.
