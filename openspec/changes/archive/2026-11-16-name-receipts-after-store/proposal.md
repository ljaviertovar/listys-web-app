# Proposal

## Why

Un mismo recibo hoy tiene dos títulos distintos: la lista de recibos lo llama "Receipt · 12 Nov" y pone la tienda en una
etiqueta aparte, mientras su pantalla de detalle lo titula "Metro" (o "Review receipt" mientras se revisa). El usuario no
reconoce que son el mismo recibo, y la spec vigente de `user-stores` ya dice que la lista, la pantalla y el dashboard
usan el nombre de la tienda: el código se desvió de ella. Además, cuando la lectura no encuentra la tienda, la pantalla
solo deja elegir una tienda existente, aunque la spec promete poder crear una escribiendo su nombre.

## What Changes

- El nombre de un recibo pasa a ser el de su tienda más el sufijo visual "Receipt": "Walmart Receipt", "Metro Receipt".
  El sufijo es solo presentación; no se guarda ni se filtra por él.
- La tienda sale, por orden, de la tienda confirmada, del nombre leído del recibo (limpio, sin número de sucursal) y, si
  no hay ninguno, el recibo se llama "Unnamed Receipt".
- La tarjeta de la lista y el encabezado de la pantalla de detalle muestran exactamente ese mismo nombre, en todos los
  estados del recibo (también durante la revisión; "Review receipt" deja de ser el título).
- La fecha de subida deja de ser parte del título y queda como metadato. Como varios recibos de una tienda comparten
  título, la línea de datos de la tarjeta pasa de "Uploaded 10:42" a "Uploaded 12 Nov · 10:42" para distinguirlos; el
  encabezado de detalle ya muestra la fecha.
- La tarjeta de la lista deja de mostrar la etiqueta de tienda, porque el nombre ya la dice. Se conserva el aviso "no
  store" de un recibo leído sin tienda confirmada.
- El filtro "Show receipts from store" no cambia: sigue filtrando por tienda.
- Cuando la lectura no encuentra la tienda, la tarjeta de tienda de la pantalla de detalle ofrece un campo para escribir
  su nombre (guardarla como tienda nueva), además de elegir una existente.
- El resto de superficies que hoy rotulan un recibo (dashboard, hoja de detalle del recibo de un viaje) usan el mismo
  nombre para no reintroducir dos títulos.

## Capabilities

### New Capabilities

<!-- Ninguna: el cambio ajusta comportamiento de capacidades existentes. -->

### Modified Capabilities

- `user-stores`: "Receipt surfaces show the store name" pasa a "<tienda> Receipt" con el respaldo "Unnamed Receipt" en la
  lista, la pantalla y el dashboard, sin etiqueta de tienda duplicada en la tarjeta; "Receipt review proposes the matching
  store" permite escribir el nombre cuando la lectura no encontró tienda.
- `store-extraction`: "Store extraction never fails a receipt" cambia lo que se ve cuando el recibo queda sin nombre
  (de "Store not recognized" a "Unnamed Receipt" con la opción de escribir la tienda).

## Impact

- Código (solo UI y helpers, sin API ni base de datos nuevas):
  - `src/utils/receipt-store-label.ts`: nombre del recibo compartido por todas las superficies.
  - `src/components/features/tickets/list/helpers/build-ticket-list-item.ts` y `tickets-list.tsx`: título de la tarjeta y
    retirada de la etiqueta de tienda.
  - `src/app/(authenticated)/tickets/[ticketId]/page.tsx`: título del encabezado.
  - `src/components/features/tickets/receipt/ticket-store-card.tsx` y `ticket-store-sheet.tsx`: campo de nombre cuando no
    hay nombre leído.
  - `src/components/features/dashboard/helpers/build-dashboard-model.ts` y
    `src/components/features/shopping-sessions/trip-receipt-details-sheet.tsx`: mismo nombre.
- El listado de recibos ya devuelve el nombre crudo (`store_name`, columna de `tickets`) pero hoy no lo usa; solo hay que
  leerlo. Sin cambios de API ni migración.
- Pruebas: helpers del nombre y de `buildTicketListItem`, y el flujo de escribir la tienda; textos de pruebas existentes
  que usan "Receipt · 10 Nov" como dato de ejemplo no dependen de este cambio.
- Fuera de alcance: renombrar el recibo a mano, cambiar el filtro por tienda, la lectura OCR de la tienda y el esquema de
  base de datos.
