## Why

El tablero V3 F2 dibuja la tarjeta de lista con su chip "Default", la fecha del último viaje, con quién se comparte, "View
Items" y un menú con "Share", y un borrado que se puede deshacer. La tarjeta mostraba solo nombre, notas, recuento y
"Start Shopping", y borrar era definitivo al instante.

## What Changes

- **Tarjeta de lista:** línea "Last trip <fecha>" o "No trips yet" y " · Shared with N people" si se comparte; chip "Default" en
  la lista por defecto; pie "View Items" (con un viaje activo conserva "Resume Shopping"); menú con Edit List, Share y Delete List.
  Start Shopping queda en la pantalla de la lista y en el dashboard.
- **Borrar con deshacer:** la tarjeta se oculta, un aviso ofrece "Undo" durante 6 segundos y el borrado real corre al cerrarse
  el aviso o al salir de la página; si falla, se muestra el error y la tarjeta vuelve. La utilidad (`startUndoable`,
  `useUndoableAction`) la reutiliza la fusión de tiendas.
- **Lista por defecto:** `base_lists.is_default` (migración aditiva `20261101000000_default_list_marker`): una por usuario, la
  Pantry existente se marca y la de una cuenta nueva nace marcada. La consulta del chip tolera que la columna no exista.
- API v1: sin cambios. Base de datos: solo la columna, el índice único parcial y `ensure_default_pantry`.

Fuera de alcance: nombres de colaboradores (no están disponibles; se dice "N people"), un borrado recuperable en base de datos
(soft delete) y los selectores E2E de Start Shopping, que dependen de la suite bloqueada.

## Capabilities

### New Capabilities

- `list-cards`: lo que dice y ofrece la tarjeta de una lista.

### Modified Capabilities

- `default-pantry-list`: la lista por defecto queda marcada en la base de datos.

## Impact

- DB: columna, índice y función (revisión de no destructividad en el encabezado de la migración); verificación con rollback
  `supabase/verification/default-list-marker.sql`.
- UI: `base-list-card`, `entity-card` (`badge`, `meta`), `share-list-dialog` (abierto desde fuera), `base-lists-list`,
  página de listas.
- Nuevos: `src/utils/undoable-action.ts`, `src/hooks/use-undoable-action.ts`, `list-card-meta.ts`.
- Aplicada al proyecto de desarrollo aprobado el 2026-11-01: recuentos idénticos antes y después, 6 comprobaciones superadas.