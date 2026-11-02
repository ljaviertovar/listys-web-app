## Why

El tablero V3 F6 dibuja el dashboard con "Spend This Month" desglosado por tienda y un "Up Next" que avisa de listas por agotarse y
de un viaje de otra persona. El dashboard mostraba solo el total del mes y tres tipos de aviso.

## What Changes

- **Spend This Month:** el título cambia, y bajo el total se listan hasta cinco tiendas con lo gastado (viajes completados más
  recibos no adjuntos a un viaje, de mayor a menor); "Other" recoge lo que el total tiene y esas tiendas no.
- **Up Next:** "<lista> is running low" (la lista con más ítems cuyo intervalo habitual ya pasó) y "Someone is shopping
  “<lista>”" con "Join the trip" cuando otra persona tiene un viaje activo en una lista compartida; hasta cuatro entradas.
- **API v1, solo ampliaciones:** `stores` y `other_total` en `GET /spending`; si el desglose no se puede leer, el total sigue y
  esos campos quedan vacíos o en cero.
- Base de datos: sin cambios.

Fuera de alcance: un aviso de recibo con líneas que "necesitan revisión" (falta definirlo y contarlo por recibo) y el nombre del
colaborador (no está disponible; se dice "Someone").

## Capabilities

### Modified Capabilities

- `dashboard-overview`: gasto por tienda y nuevos avisos de Up Next.

## Impact

- Servicio de gasto (`spending.service`), `endpoints/spending`, `month-spending-card`, `build-dashboard-model`, `up-next-list` y
  `dashboard-content`.
- Pruebas: modelo del dashboard y ruta de gasto.
- Sin migración.