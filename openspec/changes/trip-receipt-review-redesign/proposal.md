# Proposal

## Why

La revisión de un recibo contra un viaje (`AttachToSessionDialog`) deja **fuera por defecto** toda línea sin coincidencia
y obliga a marcar `Add as Purchased` línea a línea, además de ofrecer un `Link…` aparte. El lienzo v3 (F7, pantallas 9 y
10) invierte el valor por defecto: cada viaje enseña a la lista (principio 4 del PRD v3), así que lo que el recibo trae y
el viaje no tenía se **añade por defecto** y el usuario solo decide qué dejar fuera. Eso contradice el requisito vigente
"Unmatched lines are added only when the user chooses", por lo que necesita su propio cambio de especificación antes de
tocar el código. De paso, el lienzo reordena la pantalla (una línea de resultado y un único `Change` por fila, secciones
por destino, tres contadores) y pide etiquetas (`Remembered`, `Linked by you`) y un resultado ("usual quantity 2 → 3")
que hoy el modelo de la revisión no conserva.

## What Changes

- **BREAKING** (comportamiento): una línea del recibo sin coincidencia con el viaje y con nombre legible se **añade por
  defecto** como ítem nuevo del viaje y de la lista; el usuario la deja fuera con `Change`. Una línea cuyo nombre no se
  pudo leer sigue fuera y no puede añadirse. El contrato HTTP no cambia: el cliente sigue enviando `added_item_ids`, solo
  que ahora lo rellena por defecto.
- Cada línea muestra nombre, precio, caja de cantidad, una etiqueta opcional (`Remembered`, `Linked by you`, `No price`,
  `No name`), **una** línea de resultado en gris y un único botón `Change`. Desaparecen el checkbox `Add as Purchased` y
  el botón `Link…`.
- Las líneas se agrupan en secciones plegables, en este orden: `New to <list>`, `Will be checked off`, `Already checked`,
  `Left out`, `Checked, not on the receipt` y `Not checked, not on the receipt` (plegada), cada una con una línea de
  ayuda de 12px.
- El resumen pasa a tres contadores: `Matched`, `New to <list>`, `Left out` (sustituyen a `Matched`, `Only on receipt`,
  `Not on receipt`).
- Nueva hoja **Change Line** con tres filas de elección (radio): `Add as a new item`, `Match a trip item` (con buscador
  de ítems del viaje) y `Leave out`, más `Save` y `Cancel`. Sustituye al `LinkItemDialog` en este flujo.
- La revisión conserva el origen de la coincidencia (`name` / `alias` / vínculo del usuario) y la cantidad anterior del
  ítem del viaje para producir las etiquetas y "usual quantity 2 → 3". Se calcula en el cliente con datos que la
  revisión ya carga; no cambian ni la API ni la base de datos.
- Copy: la etiqueta de estado del recibo (`Reading` / `Processed` del lienzo frente a `Reading Receipt` / `Ready to
  Review` del spec) **no se cambia aquí**; queda como decisión separada (ver `design.md`, D9). Sí se añade un requisito
  de copy para lo que anuncia la revisión (qué se añade y qué se deja fuera).
- `docs/design/DESIGN.md`: se actualiza el hueco 3g de 11.4 (queda construido el review del viaje) y se registran las
  piezas nuevas.
- `docs/design/listys-design-system.html`: por la regla de AGENTS.md ("si el código o DESIGN.md discrepan del HTML, manda el
  HTML") y porque hoy dibuja los chips antiguos y no tiene ejemplo de la revisión del viaje, se actualiza para mostrar los
  tres niveles de chip (estado con punto, etiqueta en caja con icono, entidad sin caja) y la revisión del viaje con sus
  secciones, contadores y hoja Change Line.
- **Fuera de alcance, decidido con el usuario el 2026-11-04** (cada punto queda registrado como hueco o decisión pendiente,
  no se pierde):
  - Vocabulario del estado del recibo (`Reading` / `Processed` frente a `Reading Receipt` / `Ready to Review`): change
    aparte (D9). La contradicción interna de `DESIGN.md` 7.3 (`Ready` frente a `Processed`) se deja como está hasta ese change.
  - Las etiquetas de las filas del recibo fuera del viaje (`No price`, `No name`, `In list`, `New`, `Confirm match`) y la
    revisión de añadir a una lista no pasan a la forma `tag`; solo la revisión del viaje la usa.
  - Menú ⋯ en las tarjetas de recibo, viaje y tienda, y la fecha y hora del recibo con cifras en mono (hoy llega como una
    sola cadena ya formateada): change aparte, registrado en 11.4 · 3g.
  - El chip `Default` (7.3 lo llama etiqueta, la revisión v3 chip amarillo) y el test `item-note-trailing.test.ts` que
    comprueba su color: sin decisión; ver Open Questions de `design.md`.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `receipt-session-reconciliation`: el requisito "Unmatched lines are added only when the user chooses" se renombra y
  cambia (añadidas por defecto, se dejan fuera con `Change`); "The attach review summarises what matches" pasa a los tres
  contadores y a las nuevas secciones; se añaden los requisitos de la fila de línea, la hoja Change Line y el origen de la
  coincidencia/cantidad previa.
- `product-copy-clarity`: se añade el requisito de copy de la revisión del viaje (qué se añade por defecto, qué se deja
  fuera y por qué una línea no puede añadirse), sin tocar los estados del recibo.

## Impact

- UI: `src/components/features/tickets/attach/` (`attach-to-session-dialog.tsx`, `hooks/use-trip-review.ts`,
  `helpers/build-attach-review.ts`, `helpers/read-ticket-for-review.ts`, nuevos componentes de fila, secciones, contadores
  y hoja `Change Line`), `use-attach-to-session.ts` (mapeo de líneas del recibo) y piezas compartidas:
  `commons/category-section` (icono/tono por sección de estado), un `StatTile` en `commons/`, y `Badge` `tag` /
  `tag-attention` ya existentes (sin editar `badge.tsx`).
- Sin cambios de API ni de esquema: `GET .../session-matches` ya devuelve `match: 'name' | 'alias' | 'none'`;
  `POST .../attach-to-session` ya acepta `links` (incluido `shopping_session_item_id: null`) y `added_item_ids`. Sin
  migraciones.
- Tests: `tickets/attach/tests/` (nuevo helper de decisiones y de resultado), `e2e/ui/receipt-attach.e2e.spec.ts` (usa
  `attach-review-will-be-checked` y `attach-review-not-in-this-trip`).
- Documentación: `docs/design/DESIGN.md` (7.6 y 11.4 · 3g), `docs/design/listys-design-system.html` (referencia visual
  canónica) y `docs/reference/implementation-status.md` si menciona el flujo.
- Dependencia: parte del estado de `receipt-session-reconciliation` después de `trips-and-receipt-attach` (revisión
  abierta desde el viaje, cantidad comprada que reemplaza la habitual). Ese change debe archivarse antes que este. No
  modifica ningún requisito que `trips-and-receipt-attach` ya modifica.
