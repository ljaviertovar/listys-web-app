# Proposal

## Why

[PRD‑v3](../../../docs/prd/PRD-v3.md) Fase 3 ("Stores foundation") prepara el dato que las fases siguientes necesitan
para saber dónde se compra cada cosa. Hoy la tienda se escribe a mano como texto libre obligatorio al subir el recibo
(`tickets.store_name`), nunca se normaliza ("No Frills", "NOFRILLS" y "No Frills #123" son tres cosas distintas) y no se
relaciona con nada. Lo mismo ocurre con los artículos: si un supermercado imprime "2% MILK 4L" y otro "Leche 2% 4L", la
fusión crea dos artículos en la despensa. Antes de etiquetar artículos por tienda (Fase 4) hay que tener tiendas
normalizadas y artículos que no se fragmenten (PRD §11, primer riesgo).

## What Changes

- **FR‑7 — La tienda se extrae del recibo.** Las Edge Functions de OCR configurables (Gemini por defecto y OpenAI)
  leen el nombre de la tienda de la cabecera del recibo en la misma llamada que ya hacen (sin petición extra al
  proveedor) y lo guardan como texto crudo en `tickets.store_name`. El campo "Store or Receipt Name" desaparece del
  formulario de subida. Si la extracción falla o no hay nombre, el recibo se procesa igual y queda sin tienda.
- **FR‑8 — My stores.** Nueva entidad `stores` propiedad del usuario, con nombre, nombre normalizado y alias
  (`store_aliases`). En la pantalla del recibo, la tienda detectada se compara con las del usuario: si coincide se
  confirma con un toque; si no, se guarda como tienda nueva o se elige otra existente. Confirmar es **opcional**: se
  pueden añadir artículos a una lista sin tienda. El recibo pasa a referenciar `tickets.store_id`; `store_name` se
  conserva como texto crudo. Nueva pantalla "My Stores" (`/stores`) para renombrar y fusionar tiendas. Los recibos,
  la lista de recibos y el dashboard muestran el nombre de la tienda confirmada.
- **FR‑9 — Coincidencia de artículos entre tiendas.** Al añadir artículos de un recibo a una lista existente, el
  diálogo muestra qué líneas serán artículos nuevos y permite **vincular manualmente** cada una a un artículo
  existente de la lista (buscador, sin sugerencias automáticas). El vínculo se recuerda como alias del artículo
  (`base_list_item_aliases`) y se aplica solo en los siguientes recibos, siempre visible en la revisión y con opción
  de deshacerlo. Nunca se fusiona nada sin pasar por ese paso.
- **Contrato v1 (compatible):** recursos nuevos `GET/POST /api/v1/stores`, `PATCH /api/v1/stores/{storeId}` y la
  acción `POST /api/v1/stores/{storeId}/merge`; lectura nueva `GET /api/v1/tickets/{ticketId}/matches?base_list_id=`;
  `PATCH /api/v1/tickets/{ticketId}` acepta `store_id`; `POST /api/v1/tickets/{ticketId}/merge-to-base-list` acepta
  `links` opcional; las respuestas de recibos añaden `store_id` y `store`. `store_name` en la subida sigue siendo
  aceptado y opcional. Sin versión nueva (ver `design.md`).
- **Migración solo aditiva:** tablas nuevas, columna nullable `tickets.store_id`, índices únicos nuevos, funciones
  nuevas y la función de fusión ampliada. No borra ni modifica filas existentes; no hay backfill de tiendas (los
  recibos antiguos ofrecen su `store_name` como candidato en la revisión).
- Documentación en el mismo change: `PRODUCT.md`, `docs/README.md`, `docs/design/DESIGN.md` (7.4, 7.5, 7.6 y la
  pantalla nueva), `docs/reference/api-v1.md`, `docs/reference/limits.md`, `docs/reference/implementation-status.md`
  y `CHANGELOG.md`.

Fuera de alcance: estadísticas por artículo y tienda, etiqueta de tienda habitual y sesiones por tienda (Fase 4);
el total del recibo y adjuntar recibo a sesión (Fase 5); sugerencias automáticas o difusas de coincidencia; eliminar
tiendas sin fusionar; filtrar el historial por tienda; la Edge Function heredada `process-ticket-ocr` (no está
configurada); localización.

## Capabilities

### New Capabilities

- `store-extraction`: el nombre de la tienda se obtiene del recibo durante el OCR, sin campo manual ni llamada
  adicional, y su ausencia nunca hace fallar el recibo.
- `user-stores`: tiendas propias normalizadas con alias; confirmación de la tienda de un recibo en la revisión
  (coincidencia, tienda nueva o elección), renombrado y fusión desde "My Stores", y nombre de tienda en las
  superficies de recibos.
- `receipt-item-matching`: vínculo manual de líneas de recibo con artículos existentes durante la fusión, alias
  recordados por lista que se aplican en recibos siguientes y que siempre pasan por la revisión.

### Modified Capabilities

- `product-copy-clarity`: "store" pasa a ser término estable junto a receipt, base list, shopping session e item; la
  promesa de organización deja de excluir las tiendas como registro de dónde se compra, pero sigue sin prometer
  listas ni etiquetas por tienda (Fase 4).

## Impact

- **Base de datos:** una migración nueva en `supabase/migrations/` (aditiva, con la revisión explícita de no pérdida de
  datos que exige `AGENTS.md`); tipos de `src/types/database.types.ts`. Se pedirá al usuario dónde aplicarla y cuándo
  desplegar las Edge Functions antes de ejecutar nada.
- **Edge Functions:** `process-ticket-ocr-gemini` y `process-ticket-ocr-openai` (prompt de la primera imagen, parser
  tolerante a la forma antigua, escritura de `store_name`).
- **Servicios y validaciones:** `tickets.service.ts` (subida, lectura, `updateTicket`, fusión, coincidencias), servicio
  nuevo `stores.service.ts`, `src/lib/validations/ticket.ts` y una validación nueva de tiendas, `src/lib/api/endpoints/`,
  `src/lib/config/limits.ts` (límite de tiendas), Route Handlers nuevos bajo `src/app/api/v1/stores/` y
  `src/app/api/v1/tickets/[ticketId]/matches/`. Las Server Actions gemelas de `src/actions/tickets.ts` (sin uso en
  pantallas) siguen funcionando sin vínculos y no ganan funciones nuevas.
- **UI:** formulario de subida (sin campo de tienda), pantalla del recibo (tarjeta de tienda y título), diálogo de
  añadir a lista (paso de coincidencias con buscador), lista de recibos y dashboard (nombre de tienda), pantalla nueva
  `/stores` y entrada en la navegación.
- **Pruebas:** normalización de nombres, servicios y rutas de tiendas y recibos, RPC de fusión con vínculos y alias,
  helpers del paso de coincidencias, parser del OCR; E2E de subida y revisión actualizadas (escritas, no ejecutadas
  sin un Supabase local validado).
- **Contrato público:** adiciones compatibles en v1 y entrada en `CHANGELOG.md` y en la referencia de la API.
- **Interacción con `stabilize-test-foundation`:** las fixtures E2E que envían `store_name` siguen siendo válidas (el
  campo es opcional); no se toca el arnés que ese change rediseña.
