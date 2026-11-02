## Why

Las pruebas manuales contra los tableros V3 F1–F6 ("Listys - System Design") encontraron un error de hidratación en móvil y
varias diferencias pequeñas de texto y estructura que no cambian el comportamiento de fondo: la hoja de subida, el título de
Lists, el borrado de una lista, la lista vacía, Start Shopping, el aviso de tienda habitual, la pantalla del recibo, el selector
de viaje y los avisos que un cambio propio provocaba.

## What Changes

- **Hidratación:** el botón "Install App" ya no lee el user-agent durante el render; en un teléfono el HTML del servidor y el
  primer render del cliente coinciden.
- **Subida de recibo:** la hoja dice qué se lee ("We read the store, date and total from the receipt. You confirm them before
  anything is saved."), el botón dice "Upload" ("Upload N Photos" con varias fotos), el progreso "Keep this open until it
  finishes." y los rechazos usan el texto del tablero para fotos de más de 10 MB y HEIC. Los dos controles de 10 MB del
  servidor usan `MAX_TICKET_IMAGE_MB`.
- **Lists:** la pantalla se llama "Lists" (también en el menú, el breadcrumb y la tarjeta del dashboard) y ya no tiene
  "Back to Dashboard".
- **Borrar lista:** "The N items in this list are deleted with it. People it is shared with lose access. This can’t be undone."
- **Lista vacía:** ofrece "Add Item" y "Upload Receipt"; su "Start Shopping" abre la hoja que explica por qué no puede empezar.
- **Start Shopping:** la hoja muestra "Estimated total — From N of M items ≈ $X" y "One trip at a time per list.".
- **Tienda habitual:** el aviso dice "Usual store set to <tienda>. It won’t change on its own." con "Undo".
- **Fila de artículo:** el precio medio va a la derecha.
- **Recibo:** el título es "Review receipt" con fecha · ítems · total; la tarjeta de tienda va sobre los ítems con "Read as
  “<texto>”" y "Change Store"; un aviso señala que los ítems leídos suman menos del 90 % del total impreso.
- **Selector de viaje:** cada fila muestra fecha, hora y tienda, y los viajes de la tienda del recibo (o sin tienda) van primero.
- **Avisos propios:** un cambio que hace esta pestaña no produce el aviso "List updated" de su propio eco en tiempo real.
- Contratos v1 y base de datos: sin cambios.

Fuera de alcance: categoría al editar un ítem (el formulario la excluye a propósito), la etiqueta "Added by hand" (no hay un
dato que distinga ítems manuales) y el estimado en la tarjeta de `/shopping-lists` (cargaría ítems por lista).

## Capabilities

### Modified Capabilities

- `product-copy-clarity`: subida, rechazos, Lists, borrado, lista vacía, recibo, avisos propios e "Install App".
- `receipt-total-extraction`: aviso cuando los ítems leídos no alcanzan el total impreso.
- `receipt-session-reconciliation`: el selector de viaje distingue viajes y ordena por tienda.
- `usual-store-tags`: aviso con "Undo" al fijar la tienda habitual.
- `item-price-memory`: precio medio a la derecha y total estimado al empezar una compra.

## Impact

- UI: subida (`tickets/upload`), Lists, `base-list-card`, `base-list-items`, `start-shopping-dialog`, `base-list-item-row`,
  recibo (`ticket-review`, `ticket-store-card`, `ticket-summary-card`), `attach-to-session-dialog`, `install-app-button`,
  `src/lib/api/client.ts` y los listeners de tiempo real.
- Nuevos: `src/utils/local-activity.ts`, `attach/helpers/attach-candidates.ts`.
- Pruebas actualizadas y nuevas; `e2e/ui/tickets.e2e.spec.ts` espera "Review receipt".
- Sin migración.