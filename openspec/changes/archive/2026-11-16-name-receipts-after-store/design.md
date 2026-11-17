# Design

## Context

Hoy cada superficie arma el título del recibo por su cuenta (ver proposal.md, Why):

- Lista (`build-ticket-list-item.ts`): `Receipt · <fecha>` fijo, y la tienda confirmada va aparte en `storeName`, que
  `tickets-list.tsx` pinta como `EntityLabel` y usa para el filtro y la opción "Store not confirmed".
- Detalle (`tickets/[ticketId]/page.tsx`): `Review receipt` mientras se revisa; después la tienda confirmada o
  `Receipt · <fecha>`.
- Dashboard (`build-dashboard-model.ts`) y hoja de recibo de un viaje (`trip-receipt-details-sheet.tsx`): usan
  `getReceiptStoreLabel` o una cadena equivalente propia, con "Store not recognized" / "Store not confirmed" de respaldo.
- `getReceiptStoreLabel` (`src/utils/receipt-store-label.ts`) ya implementa la regla de la spec (tienda confirmada, nombre
  crudo, "Store not recognized") pero solo dos superficies la usan, y devuelve el nombre crudo tal cual (en mayúsculas y
  con número de sucursal).
- `suggestStoreName` (limpia "NO FRILLS #3127" a "No Frills") vive en `components/features/stores`, y la hoja
  `TicketStoreSheet` solo muestra el campo "Save as a new store" cuando el recibo tiene nombre crudo.
- El endpoint del listado ya devuelve `store_name` (usa `select('*')`); la lista no lo lee.

## Goals / Non-Goals

**Goals:**

- Una sola función decide el nombre del recibo y todas las superficies la usan, para que no vuelvan a divergir.
- Que escribir la tienda de un recibo sin nombre use los flujos de crear/asignar tienda que ya existen.

**Non-Goals:**

- Guardar el nombre del recibo o el sufijo "Receipt" en base de datos, o permitir renombrar un recibo a mano.
- Cambiar el filtro por tienda, la lectura OCR, la API o el esquema.
- Rediseñar la tarjeta más allá de retirar la etiqueta de tienda.

## Decisions

**1. El nombre es derivado, no almacenado.** `getReceiptName(receipt)` devuelve `"<tienda> Receipt"`; la tienda es
`store.name`, si no `suggestStoreName(store_name)`, y si ambas faltan el nombre es `"Unnamed Receipt"`. Así renombrar o
quitar la tienda cambia el título sin migrar nada, como ya exige la spec, y "Receipt" es solo presentación.
_Alternativa descartada:_ columna `name` en `tickets`; exigiría migración y sincronizar renombres de tienda.

**2. Se sustituye `getReceiptStoreLabel` por `getReceiptName` en el mismo archivo.** Sus dos usos actuales (detalle y
dashboard) pasan a la nueva función, y la lista y la hoja del viaje, que hoy arman su propio título, también; no queda
una segunda regla. El respaldo
"Store not recognized" desaparece de los títulos; sigue existiendo `UNRECOGNIZED_STORE_LABEL` solo si algo más lo usa
(se comprueba al implementar y, si no, se borra).

**3. `suggestStoreName` se mueve a `src/utils/`.** `utils` no puede depender de `components/features`, y el nombre del
recibo necesita limpiar el nombre crudo. Se mueve el archivo y su prueba, se exporta desde el barrel de `@/utils` y se
actualiza `ticket-store-sheet.tsx`; se elimina su reexport de `stores/index.ts`. Una sola limpieza sirve al título y a la
propuesta de tienda nueva, así que "Walmart Receipt" y la tienda que se crearía al guardar coinciden.
_Alternativa descartada:_ duplicar la limpieza en `utils`.

**4. La lista separa nombre mostrado y tienda del filtro.** En `TicketListItemData`, `title` pasa a ser
`getReceiptName(...)` y `storeName` sigue siendo solo la tienda confirmada (alimenta el filtro y `storeConfirmed`). Se
quita el `EntityLabel` de tienda de `TicketCard`; el aviso `NoStoreBadge` de un recibo leído sin tienda confirmada se
queda, y también las opciones del filtro, que usan `storeName` y por eso no llevan la palabra "Receipt". Varios recibos de una tienda
comparten título, así que lo que los distingue es el dato de subida: hoy `uploadedLabel` solo lleva la hora ("Uploaded
10:42"), por lo que pasa a llevar día y hora con `formatShortDate` (que añade el año solo si no es el actual) y
`formatTime`: "Uploaded 12 Nov · 10:42". El orden de la lista (más reciente primero) no cambia.
_Alternativas descartadas:_ numerar los repetidos ("Metro Receipt (2)"), porque el número cambia al borrar o filtrar y
no dice nada al usuario; y poner la fecha en el título solo cuando hay repetidos, porque la tarjeta y el detalle
dejarían de llamarse igual.

**5. El encabezado del detalle siempre usa el nombre.** `headerTitle = getReceiptName(ticket)` en todos los estados. El
estado de revisión lo siguen comunicando la insignia de estado (`TicketStatusChip`), la tarjeta de tienda y las secciones;
no hace falta otro rótulo. `TicketReview` recibe ese mismo nombre en `title`, de modo que el visor de fotos, la
comparación y el resumen al guardar (`receipt.storeName`) también dicen "Metro Receipt".
_Riesgo asumido:_ se pierde el rótulo "Review receipt" como título; si hiciera falta, puede volver como `desc` del
encabezado sin tocar esta regla.

**6. Escribir la tienda de un recibo sin nombre reutiliza `TicketStoreSheet`.** Hoy la tarjeta "newStoreCard" (campo de
nombre + "Save Store") solo aparece con `rawName`. Se muestra también cuando no hay nombre crudo (estado `unrecognized`),
con el campo vacío y sin propuesta, antes de la lista de tiendas existentes. Guardar llama a `createAndAssignStore`, que
ya crea la tienda o reutiliza una con el mismo nombre normalizado, y el recibo pasa a titularse con ella. `ticket-store-card`
pasa `allowNew` (o equivalente) a la hoja en ese estado y el botón principal sigue siendo "Choose Store".
_Alternativa descartada:_ un `<input>` suelto en la tarjeta de aviso; duplicaría validación, errores y estado de envío de
la hoja.

**7. Dashboard y hoja del viaje usan la misma función.** `ticketTitle` en el dashboard delega en `getReceiptName`, y
`trip-receipt-details-sheet.tsx` deja de armar su propia cadena. Tienen el mismo dato (`store`, `store_name`); la hoja
de un viaje que falló o aún no se lee ("Store not recognized" / "Store not confirmed") muestra "Unnamed Receipt".

## Risks / Trade-offs

- [Nombre crudo ilegible o con ruido ("TST 004 STORE")] → el título lo muestra limpio con `suggestStoreName`; el usuario
  puede confirmar o cambiar la tienda y el título se corrige solo.
- [Frase del dashboard "from “Metro Receipt” are waiting" se lee algo redundante] → se acepta para no tener un segundo
  nombre; si molesta, el dashboard puede quitar el sufijo en su frase sin cambiar la spec de la lista y el detalle.
- [Pruebas existentes que fijan "Receipt · …" o "Store not recognized"] → se actualizan en la misma pasada; los datos de
  ejemplo con "Receipt · 10 Nov" en pruebas de `object-card` y `sheet-dialog` son texto de prueba, no la regla.
- [Mover `suggestStoreName` rompe imports] → solo tiene dos consumidores (`stores/index.ts` y `ticket-store-sheet.tsx`);
  `tsc` lo detecta.

## Migration Plan

Sin migración de datos ni de esquema. Se despliega con el código; revertir es volver el código. No toca Supabase.
