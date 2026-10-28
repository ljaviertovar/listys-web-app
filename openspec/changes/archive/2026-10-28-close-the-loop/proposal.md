# Proposal

## Why

[PRD‑v3](../../../docs/prd/PRD-v3.md) Fase 5 ("Close the loop") une los dos flujos que hoy viven separados: el viaje de
compra y el recibo que lo termina. Ahora mismo, después de completar una sesión, añadir su recibo a la lista cuenta el
mismo viaje dos veces (riesgo aceptado en la Fase 4), el total de la sesión casi nunca se rellena (la hoja de
finalización no lo pide y el OCR no lee el total impreso), y los precios por tienda que la Fase 4 empieza a guardar
(`base_list_item_store_stats.last_price`) no se muestran en ningún sitio. Esta fase depende de
`store-tags-and-scoped-sessions` (Fase 4): necesita `shopping_sessions.store_id`, las estadísticas por tienda y el
límite de una sesión activa por lista.

## What Changes

- **FR‑13 — El recibo completa la sesión.**
  - El OCR lee también el **total impreso** del recibo en la última foto, dentro de la misma petición al proveedor;
    nuevo `tickets.total_amount` (nullable). Un total ilegible nunca hace fallar el recibo.
  - En la pantalla del recibo leído, si el recibo aún no se añadió a ninguna lista ni se adjuntó, y el propietario
    tiene una sesión **activa** o una sesión **completada en las 48 horas** anteriores a la subida (o después) sin
    recibo, se ofrece **"Attach to Trip"**. Nunca se adjunta sin confirmación.
  - La revisión de adjuntar muestra, por línea del recibo: coincide con un ítem marcado, coincide con un ítem sin marcar
    (se marcará comprado) o no coincide (se puede **añadir como comprado** o vincular a un ítem de la sesión; el
    vínculo se recuerda como alias, como en la Fase 3). Muestra el total leído (editable) y la tienda resultante.
  - Al confirmar, una sola transacción: el recibo queda adjunto (`tickets.shopping_session_id`, único: un recibo por
    sesión y una sesión por recibo); si la sesión estaba activa **se completa** con lo marcado más lo que el recibo
    prueba; la sesión recibe total, precios reales por ítem y tienda; los precios del recibo pasan al precio promedio y
    al último precio por tienda **sin contar otra compra** por los artículos que la sesión ya contó.
  - Repetir la misma petición no tiene efectos (respuesta idempotente); un recibo adjunto ya no se puede añadir a una
    lista ni crear una lista con él, y un recibo ya añadido a una lista no se puede adjuntar (evita la doble cuenta).
  - Tienda: si la sesión no tenía tienda toma la del recibo (y registra entonces las compras de ese viaje en esa
    tienda); si una sesión activa tenía otra tienda, gana la del recibo; si una sesión **completada** tenía otra
    tienda, se rechaza con un conflicto explicado.
- **FR‑14 — Precios por tienda.** El menú de cada artículo ofrece al propietario **"Prices by Store"** cuando hay algún
  precio de recibo registrado: último precio en cada tienda, con su fecha y la cantidad/unidad de la línea, destacando
  la tienda más barata cuando hay al menos dos precios comparables (misma unidad, precio por unidad). Solo precios
  registrados desde recibos; nunca inferidos. Se añaden `last_quantity` y `last_unit` a las estadísticas por tienda.
- **Contrato v1 (compatible):** nuevos `GET /api/v1/tickets/{ticketId}/session-candidates`,
  `GET /api/v1/tickets/{ticketId}/session-matches?shopping_session_id=` y
  `POST /api/v1/tickets/{ticketId}/attach-to-session`; `merge-to-base-list` y `create-base-list` responden `409` para un
  recibo adjunto; las lecturas de recibo, sesión y lista añaden `total_amount`, `shopping_session`, `receipt` y
  `store_prices`. Sin versión nueva.
- **Migración solo aditiva:** columnas nullable, índice único, FK compuesta, trigger de guarda y funciones nuevas o
  reemplazadas con la misma firma. No borra ni reescribe filas.
- Documentación en el mismo change: `PRODUCT.md`, `docs/README.md`, `docs/architecture/architecture.md`,
  `docs/design/DESIGN.md`, `docs/reference/api-v1.md`, `docs/reference/limits.md`,
  `docs/reference/implementation-status.md` y `CHANGELOG.md`.

Fuera de alcance: adjuntar un recibo a la sesión de otro usuario o a una sesión de colaborador; varios recibos por
sesión; desadjuntar un recibo; corregir hacia atrás la doble cuenta de recibos ya añadidos a listas antes de este
cambio; mover compras ya registradas cuando cambia la tienda de una sesión completada; leer la fecha impresa del
recibo; comparar precios en la sesión o avisar de "más barato en…"; normalizar unidades (kg ↔ lb); precios externos;
revisión ligera de recibos (Fase 6).

## Capabilities

### New Capabilities

- `receipt-session-reconciliation`: cuándo se ofrece adjuntar un recibo a una sesión, la revisión por línea, la
  reconciliación atómica e idempotente (completar, precios, total, tienda, líneas añadidas), la exclusión con "añadir a
  lista" y cómo se ve el vínculo en el recibo y en la sesión.
- `receipt-total-extraction`: lectura del total impreso por OCR sin peticiones extra, limpieza y tolerancia a fallos.
- `store-price-comparison`: qué precios por tienda se muestran, con qué fecha y contexto, cuándo se destaca la tienda
  más barata y quién lo ve.

### Modified Capabilities

- `shopping-session-completion`: adjuntar un recibo a una sesión activa pasa a ser la segunda forma permitida de
  completarla, con la misma atomicidad y sin doble cuenta.
- `item-store-statistics` (creada por la Fase 4): el último precio por tienda guarda cantidad y unidad de la línea, y
  adjuntar un recibo registra precios (y compras cuando la sesión no tenía tienda) sin contar dos veces.
- `item-price-memory`: los precios mostrados pueden venir también del último precio por tienda; los precios de un
  recibo adjunto actualizan el precio promedio una sola vez.
- `product-copy-clarity`: la promesa de organización deja de excluir la comparación de precios entre tiendas, y los
  textos de importes distinguen el total impreso del recibo de la suma de líneas.

## Impact

- **Base de datos:** una migración nueva en `supabase/migrations/` posterior a la de la Fase 4 (aditiva, con la
  revisión de no pérdida de datos de `AGENTS.md`); funciones nuevas `ticket_session_candidates`,
  `ticket_session_matches`, `attach_receipt_to_session`; se reemplazan sin cambiar firma `complete_shopping_session`
  (extrae su núcleo a una función interna compartida) y `merge_ticket_items_to_base_list` (cantidad/unidad del precio y
  rechazo de recibos adjuntos); tipos de `src/types/database.types.ts`. Se pedirá al usuario dónde aplicarla.
- **OCR:** `supabase/functions/_shared/receipt-store.ts` (instrucciones y parseo del total) y las funciones
  `process-ticket-ocr-gemini` y `process-ticket-ocr-openai`; requieren redespliegue de Edge Functions, que se pedirá.
- **Servicios y validaciones:** `tickets.service.ts`, `src/actions/tickets.ts` (bloqueo en `createBaseListFromTicket`),
  `rpc-errors.ts`, `src/lib/validations/ticket.ts` y `api/common`, `shopping-sessions.service.ts`,
  `base-lists.service.ts`, `src/lib/api/endpoints/tickets.ts`.
- **UI:** pantalla del recibo (tarjeta "Attach to Trip", diálogo de adjuntar con revisión, resumen con total impreso,
  estado "Attached to …"), detalle de sesión e historial (total del recibo y enlace al recibo), menú del artículo y
  hoja "Prices by Store".
- **Pruebas:** helpers puros (comparación de precios, revisión de adjuntar, parseo del total), contratos de las rutas,
  verificación SQL en transacción con `ROLLBACK`; E2E escritas, no ejecutadas sin un Supabase validado.
- **Dependencia y orden:** implementar y archivar después de `store-tags-and-scoped-sessions`; no toca el arnés E2E de
  `stabilize-test-foundation`.
