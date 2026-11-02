## Why

El tablero V3 F4 explica la tienda habitual de un artículo (cómo se decide, cuánto costó en cada tienda) y permite ver una lista
por tienda. La hoja de tienda habitual solo mostraba los recibos de cada tienda y no había filtro por tienda en la lista.

## What Changes

- **Hoja de tienda habitual:** abre con el nombre del artículo y dice cómo se decide ("Automatic · <tienda> — Bought there N of M
  times. Follows your receipts.", "Set by you · <tienda> — It stays there until you change it." o cuántas compras hacen falta
  para aprender una), muestra por tienda "Last $X · <fecha>", "N purchases" o "Not bought there yet", y termina con "A store you
  pick stays until you change it. Receipts won’t move it.".
- **Datos:** las lecturas de ítems añaden `usual_store.purchase_count` y `purchase_total`, contando solo tiendas que el lector puede
  ver (un colaborador con tiendas ocultas no aprende conteos).
- **"Show items from":** una lista con ítems con tienda habitual ofrece All Stores, cada tienda con su recuento y No Usual Store;
  la elección vive en `?store=`, solo estrecha la pantalla y un viaje sigue saliendo de la lista completa. Un `?store=` sin
  ítems en esa lista se ignora.
- API v1: solo campos añadidos. Base de datos: sin cambios.

Fuera de alcance: un recuento sobre "las últimas 7 compras" (se usa el total registrado) y preseleccionar la tienda actual en la hoja.

## Capabilities

### Modified Capabilities

- `usual-store-tags`: hoja informativa y filtro por tienda de la lista.

## Impact

- UI: `store-picker-dialog` (`context`, `storeDetails`, `footnote`), `base-list-item-row`, `usual-store-filter` (nuevo),
  página de edición de la lista; helpers `usual-store-picker-info` y `filter-items-by-store`.
- Servicio de ítems: `buildItemStoreSummary` con `purchase_count` y `purchase_total`.
- Pruebas: `usual-store-picker-info`, `filter-items-by-store`, `item-store-summary`, acciones de listas.
- Sin migración.