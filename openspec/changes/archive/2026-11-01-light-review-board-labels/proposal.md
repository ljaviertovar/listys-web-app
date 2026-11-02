## Why

El tablero V3 F6 de la revisión ligera nombra las secciones "Needs a look" y "Matched to <list>", ofrece "Accept All N" con
un estado "N accepted" y "Undo", y dice "All N items match" cuando no hay nada que mirar. La pantalla del recibo usa hoy
"Check these", "In <list>" y "Select all N".

## What Changes

- Las secciones se llaman "Needs a look" (antes "Check these"), "New to <list>" (sin cambios) y "Matched to <list>" (antes
  "In <list>"). Orden, conteo, plegado y motivos por línea no cambian.
- "Select all N" pasa a "Accept All N". Aceptar es seleccionar: no añade nada a una lista y la revisión sigue siendo
  obligatoria. Con todas las líneas coincidentes aceptadas, la sección muestra "N accepted" y "Undo", que las deselecciona.
- Con todas las líneas coincidiendo, la pantalla dice "All N items match <list>. Same names as last time. Nothing needs a
  look." sobre la sección desplegada.
- Contratos v1, base de datos y API: sin cambios.

Fuera de alcance: fundir "New to <list>" dentro de "Needs a look" como dibuja el tablero (cambia el reparto de líneas del
PRD v3 FR-15 y los identificadores `receipt-triage-section-*`), y un botón "Review All" que despliegue una sección plegada.

## Capabilities

### Modified Capabilities

- `receipt-review`: títulos de sección, aceptación en bloque con deshacer y aviso de que todo coincide.

## Impact

- UI: `ticket-items-list.tsx`, `use-ticket-selection.ts` (`deselectMany`), `ticket-selection-state.ts`.
- Pruebas: `receipt-triage-state.test.ts`. Los identificadores `data-testid` de las secciones no cambian.
- Sin migración.
