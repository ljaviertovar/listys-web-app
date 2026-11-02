## Why

El tablero V3 F3 dibuja Mis tiendas con su última visita y los ítems habituales, una pantalla por tienda con el gasto y los
nombres que imprimen sus recibos, y una fusión que se puede deshacer. "My Stores" solo listaba tiendas con su número de
recibos y fusionar era definitivo al instante.

## What Changes

- **Tarjetas de `/stores`:** "Last <fecha> · N items usually here", insignia "New" con un solo recibo y "View Store".
- **Pantalla `/stores/{id}`:** recibos, ítems habituales y "Spent since Jan <año>" (viajes completados más recibos no adjuntos a
  un viaje, la regla del resumen del mes); "Names on receipts" con "Remove" en cada nombre salvo el propio de la tienda, con
  confirmación ("Receipts that print this name will ask you which store they belong to.").
- **Fusionar con deshacer:** la tienda fusionada se oculta, un aviso ofrece "Undo" durante 6 segundos y la fusión corre al
  cerrarse o al salir de la página; la confirmación ya no dice "can’t be undone".
- **API v1, solo ampliaciones:** `usual_items_count` en las lecturas de tiendas, `GET /stores/{id}` (`spent_since`,
  `spent_total`, `names`) y `DELETE /stores/{id}/aliases/{aliasId}` (`204`; `422` para el nombre propio; `404` si el nombre no es
  de la tienda).
- Base de datos: sin cambios.

Fuera de alcance: mostrar el nombre original de un alias que ningún recibo imprimió (hoy se ve su clave normalizada; exigiría
guardar el nombre en `store_aliases`), renombrar y fusionar desde la pantalla de detalle (siguen en el menú de la lista) y
un unmerge en base de datos.

## Capabilities

### Modified Capabilities

- `user-stores`: tarjetas con más datos, pantalla de tienda, nombres en recibos y fusión con deshacer.

## Impact

- Servicio: `stores.service` (`getStoreDetail`, `removeStoreAlias`, `usual_items_count`), rutas nuevas y `endpoints/stores`.
- UI: `stores-list`, `store-detail` (nuevo), `use-store-actions`, página `/stores/[storeId]`, `store-meta`.
- Pruebas: rutas de tiendas, servicio, `store-meta`; el mock de Supabase de pruebas admite `not`, `is`, `gte` y `lt`.