# Proposal

## Why

[PRD‑v3](../../../docs/prd/PRD-v3.md) Fase 4 ("Store tags and store-scoped sessions") hace útil el dato que la Fase 3
empezó a guardar. Hoy cada recibo puede tener una tienda confirmada (`tickets.store_id`), pero ese dato no llega a los
artículos: la despensa no sabe dónde se compra cada cosa, una sesión siempre recorre la lista entera y una compra sin
recibo no deja ningún rastro de tienda. Además, la regla de una sola sesión activa por usuario bloquea tener dos listas en
curso. Con tiendas normalizadas y alias de artículos ya en producción (los dos requisitos previos del PRD §11), es el
momento de aprender la tienda por artículo.

## What Changes

- **FR‑10 — Estadísticas artículo × tienda.** Nueva tabla `base_list_item_store_stats` con, por artículo y tienda,
  número de compras, fecha de la última compra y último precio de recibo con su fecha. Se actualiza en la misma
  transacción que ya aprende: al **añadir artículos de un recibo** con tienda confirmada a una lista y al **completar
  una sesión** con tienda. Cada artículo cuenta una compra por recibo o por sesión. El precio solo se registra desde
  recibos. Sin backfill: los recibos ya fusionados no generan estadísticas.
- **FR‑11 — Tienda habitual (auto / manual).** `base_list_items.usual_store_id` y `usual_store_source`. La etiqueta
  `auto` se recalcula con cada cambio de estadísticas: gana la tienda con más compras del artículo entre las que se
  compraron en los 180 días previos a su última compra, con un **mínimo de 3 compras** en esa tienda; empate → la más
  reciente. Sin evidencia suficiente no hay etiqueta. El propietario puede fijar una tienda (`manual`, nunca la pisa el
  aprendizaje) o quitarla (vuelve a `auto`). La fila del artículo muestra la tienda habitual y "Also at …" con las demás
  tiendas donde se compró.
- **FR‑12 — Sesión por tienda y límite por lista.** Al empezar una compra se puede elegir una tienda (opcional). La
  sesión guarda `shopping_sessions.store_id`; sus artículos de esa tienda (habitual o comprados allí) van primero y el
  resto queda en una sección plegada. Completar una sesión con tienda alimenta las estadísticas aunque no haya recibo.
  El límite pasa de **una sesión activa por usuario** a **una por lista**, garantizado por un índice único parcial; el
  propietario puede tener en curso listas distintas a la vez. Solo el propietario inicia y completa sesiones (sin
  cambios para colaboradores). Empezar una sesión pasa a ser una operación atómica en la base de datos.
- **Fusión de tiendas:** fusionar dos tiendas combina también sus estadísticas y re-apunta las etiquetas de tienda
  habitual.
- **Contrato v1 (compatible):** `POST /api/v1/shopping-sessions` acepta `store_id` opcional y su `409` pasa a referirse
  a la lista (mismo código y mismo `activeSessionId`); `PATCH /api/v1/base-list-items/{itemId}` acepta
  `usual_store_id: uuid | null`; las lecturas de lista y de sesión añaden `usual_store`, `other_stores`, `store` y la
  sección de cada artículo de sesión. Sin versión nueva (ver `design.md`).
- **Migración solo aditiva:** tabla nueva, columnas nullable o con valor constante, índices, triggers de integridad y
  funciones nuevas o reemplazadas con la misma firma. No borra ni reescribe filas existentes.
- Documentación en el mismo change: `PRODUCT.md`, `docs/README.md`, `docs/architecture/architecture.md`,
  `docs/design/DESIGN.md`, `docs/reference/api-v1.md`, `docs/reference/implementation-status.md` y `CHANGELOG.md`.

Fuera de alcance: comparación de precios por tienda y adjuntar el recibo a la sesión (Fase 5); colaboradores que inician
o completan sesiones; ver las etiquetas de tienda siendo colaborador (las tiendas siguen siendo privadas del
propietario); cambiar la tienda de una sesión ya iniciada; mostrar la tienda habitual en las filas de la sesión;
recalcular estadísticas cuando se cambia la tienda de un recibo ya fusionado; orden de pasillo por tienda; filtrar el
historial por tienda; localización.

## Capabilities

### New Capabilities

- `item-store-statistics`: qué cuenta como compra de un artículo en una tienda, cuándo se registra (recibo fusionado,
  sesión completada), qué precio se guarda y la atomicidad con el aprendizaje existente.
- `usual-store-tags`: regla de la etiqueta automática, etiqueta manual que se congela, quitar la etiqueta, "Also at …"
  y su presentación en la lista base.
- `store-scoped-sessions`: elección opcional de tienda al empezar, orden y sección plegada de la sesión, y registro de la
  tienda en la sesión.
- `active-session-limit`: una sesión activa por lista, garantizada en la base de datos, y cómo la interfaz lleva a la
  sesión en curso de cada lista.

### Modified Capabilities

- `user-stores`: la fusión de tiendas también combina estadísticas por artículo y re-apunta las tiendas habituales.
- `product-copy-clarity`: la promesa de organización deja de excluir las etiquetas de tienda por artículo (ya existen),
  y los textos de inicio de compra dejan de decir que solo puede haber una sesión activa.

## Impact

- **Base de datos:** una migración nueva en `supabase/migrations/` (aditiva, con la revisión de no pérdida de datos que
  exige `AGENTS.md`, y una comprobación previa de que ninguna lista tiene dos sesiones activas); se amplían
  `merge_ticket_items_to_base_list`, `complete_shopping_session` y `merge_stores` sin cambiar sus firmas; funciones nuevas
  `start_shopping_session` y `set_item_usual_store`; tipos de `src/types/database.types.ts`. Se pedirá al usuario dónde
  aplicarla antes de ejecutar nada.
- **Servicios y validaciones:** `shopping-sessions.service.ts` (inicio por RPC, sin la comprobación por usuario),
  `base-lists.service.ts` (lectura con tiendas, tienda habitual), `src/lib/validations/shopping-session.ts` y
  `base-list.ts`, Server Actions gemelas en `src/actions/shopping-sessions.ts`, `src/lib/api/endpoints/`.
- **UI:** fila del artículo de la lista base (tienda habitual, "Also at …", menú "Set Usual Store…"/"Use Automatic
  Store"), hoja "Start Shopping" (tienda opcional con el `StorePickerDialog` existente), sesión (sección de la tienda y
  sección plegada), y todas las superficies que suponían una única sesión activa: `active-session-provider`, barra de
  sesión, sidebar, dashboard, pantalla de listas y pantalla de la lista.
- **Pruebas:** regla de la etiqueta y "Also at …", contratos de las rutas, helpers de secciones, verificación SQL en
  transacción con `ROLLBACK`; E2E escritas, no ejecutadas sin un Supabase validado.
- **Contrato público:** adiciones compatibles en v1, entrada en `CHANGELOG.md` y en la referencia de la API.
- **Interacción con `stabilize-test-foundation`:** no se toca el arnés E2E que ese change rediseña.
