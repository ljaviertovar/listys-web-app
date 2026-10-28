# Proposal

## Why

[PRD‑v3](../../../../docs/prd/PRD-v3.md) Fase 1 ("Quick wins") elimina tres fricciones del bucle central que ya se
observaron usando el producto: el aprendizaje depende de un interruptor que el usuario debe recordar (`sync_to_base`),
un usuario nuevo empieza sin ninguna lista y debe crear un grupo antes de una lista, y el precio promedio se calcula
pero nunca se muestra. Son cambios aditivos, independientes de las fases de grupos y tiendas, y desbloquean que la
sesión de compra mejore la lista en cada viaje.

## What Changes

- **FR‑1 — Sincronización siempre activa.** Completar una sesión aplica siempre los ítems marcados a la lista base
  (enriquecimiento e ítems nuevos). Se elimina el interruptor "Update the Base List" de la hoja de finalización.
  La finalización y la sincronización pasan a ejecutarse en una sola transacción de base de datos (hoy la sesión se
  marca `completed` antes de sincronizar y un fallo deja una sesión completada sin aprendizaje) y completar una sesión
  ya completada no vuelve a contar compras. El tope de 250 ítems por lista deja de impedir terminar el viaje: los ítems
  nuevos que no caben se omiten y se informan.
- **FR‑2 — Lista "Pantry" por defecto.** El usuario sin listas recibe, de forma idempotente, un grupo
  predeterminado interno y una lista base "Pantry". Se garantiza al entrar al dashboard (destino de todos los inicios de
  sesión). Los usuarios que ya tienen listas no cambian.
- **FR‑3 — Precio promedio visible.** Los ítems de la lista base muestran su `average_price` cuando existe; la sesión
  activa muestra un total estimado etiquetado como estimación, con cuántos ítems tienen precio conocido. Sin dato no se
  muestra nada (nunca "$0").
- La edición genérica de una sesión (`PATCH /api/v1/shopping-sessions/{id}`) deja de aceptar `status: "completed"`
  (`422`): la única vía para completar es `/complete`, de modo que ningún camino omita el aprendizaje. La interfaz no
  usa ese camino.
- **BREAKING (contrato v1, solo el campo):** `sync_to_base` en `POST /api/v1/shopping-sessions/{id}/complete` pasa a
  ignorarse (se acepta por compatibilidad, siempre se sincroniza). Se documenta como deprecado en la referencia de la
  API. Ver la decisión en `design.md`.
- Migración **solo aditiva**: columna `groups.is_default`, índice único parcial por usuario y dos funciones SQL
  (`ensure_default_pantry`, `complete_shopping_session`). No borra ni reescribe filas.
- Documentación del mismo change (PRD‑v3 §13): `PRODUCT.md`, `docs/README.md`, `docs/reference/limits.md`,
  `docs/reference/api-v1.md`, `docs/reference/implementation-status.md`, y traer `PRD-v3.md` a esta rama.

Fuera de alcance (fases posteriores del PRD‑v3): ocultar grupos de la interfaz (Fase 2), tiendas y estadísticas por
tienda (Fases 3–4), recibo que completa la sesión y comparación de precios por tienda (Fase 5), tablero rediseñado
(Fase 6), columna de conteo de compras con precio (ver riesgos en `design.md`) y localización (no hay i18n; la
interfaz es solo inglés).

## Capabilities

### New Capabilities

- `shopping-session-completion`: completar una sesión aplica siempre sus ítems marcados a la lista base, de forma
  atómica e idempotente, sin opción de omitirlo ni fallos por el tope de ítems.
- `default-pantry-list`: provisión idempotente de la lista "Pantry" y su grupo predeterminado interno para usuarios sin
  listas, sin afectar a usuarios con listas.
- `item-price-memory`: visualización del precio promedio por ítem de la lista base y del total estimado de una sesión
  activa, solo con datos reales y etiquetado como estimación.

### Modified Capabilities

- `product-copy-clarity`: en "Consequences and scope are explicit", el escenario "Update the base list" se reescribe
  porque la finalización ya no ofrece esa opción (y se añade el aviso de ítems que no caben); el requisito "Totals and
  account information describe what is known" incorpora la estimación de la sesión y el precio promedio.

## Impact

- **Base de datos:** nueva migración en `supabase/migrations/` (aditiva, con revisión explícita de no pérdida de datos
  según `AGENTS.md`); regenerar `src/types/database.types.ts`.
- **Servicios y validación:** `src/lib/server/services/shopping-sessions.service.ts` y su gemelo
  `src/actions/shopping-sessions.ts` (ambos implementan la finalización), `src/lib/validations/shopping-session.ts`,
  nuevo servicio de provisión de Pantry, `src/lib/api/endpoints/`.
- **UI:** `complete-session-sheet.tsx`, `base-list-item-row.tsx`, `shopping-session-item-row.tsx`, página
  `shopping/[runId]`, `dashboard/page.tsx`; nuevos componentes y helpers de estimación con `data-testid`.
- **Pruebas:** actualizar `src/actions/tests/shopping-sessions.test.ts`,
  `shopping-sessions/tests/session-confirmations.test.ts` y `e2e/specs/shopping-session.spec.ts` (el caso
  `sync_to_base = false` deja de ser válido); nuevas pruebas de Pantry, estimación y finalización atómica.
- **Interacción con el change en curso `stabilize-test-foundation`:** los usuarios de prueba que inicien sesión por la
  interfaz recibirán una lista "Pantry"; las fixtures E2E no deben asumir cuentas sin listas.
- **Contrato público:** `sync_to_base` deprecado en v1; respuesta de finalización con `sync` adicional (compatible).
