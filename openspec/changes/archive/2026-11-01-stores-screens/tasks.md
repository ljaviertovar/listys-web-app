## 1. API

- [x] 1.1 `usual_items_count` en `listStores`.
- [x] 1.2 `getStoreDetail` y `GET /stores/{id}`; `removeStoreAlias` y `DELETE /stores/{id}/aliases/{aliasId}`.

## 2. Interfaz

- [x] 2.1 Tarjetas con última visita, ítems habituales, "New" y "View Store".
- [x] 2.2 `StoreDetailView` y la página `/stores/[storeId]`.
- [x] 2.3 Fusión diferida con "Undo" sobre `useUndoableAction`.

## 3. Pruebas y documentación

- [x] 3.1 Pruebas de rutas, servicio y `buildStoreMeta`.
- [x] 3.2 `CHANGELOG.md`.
- [x] 3.3 Comprobación a 390 px: lista, detalle, quitar un nombre y fusionar con "Undo".
- [ ] 3.4 Ver la insignia "New" (ninguna tienda de prueba tiene un solo recibo).