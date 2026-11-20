## Why

La lista "Pantry" por defecto solo se aprovisiona para cuentas sin ninguna lista (`ensure_default_pantry` sale en cuanto el
usuario tiene una). Las cuentas creadas antes de ese flujo nunca la recibieron, la migración `20261101000000` solo marcó la
Pantry que ya estaba en el grupo por defecto, y quien borra su Pantry no tiene forma de recuperarla. Esas cuentas se quedan
sin el chip "Default" y sin el punto de partida que el producto promete a una cuenta nueva.

## What Changes

- **Acción manual "Set up Pantry"**: una cuenta sin lista marcada como por defecto la ve en el dashboard y en la pantalla de
  listas. Al pulsarla ocurre una de tres cosas: ya hay lista por defecto (no se hace nada), existe una lista propia llamada
  "Pantry" (solo se marca como por defecto, sin duplicar) o se crea una "Pantry" vacía marcada, en el grupo por defecto
  implícito.
- **Nada automático** para cuentas existentes: la provisión automática del primer acceso no cambia y una Pantry borrada sigue
  sin recrearse sola; el usuario puede crearla a mano.
- **Base de datos (solo aditivo)**: función `create_default_pantry`, idempotente y a prueba de concurrencia (bloqueo por usuario
  más el índice único parcial `uq_base_lists_one_default_per_user`). Sin columnas nuevas, sin borrados.
- **API v1**: `POST /api/v1/base-lists/default-pantry`, sin cuerpo; `201` si crea y `200` si ya existía o se adoptó.
- **UI**: un aviso compartido con la acción, en `/shopping-lists` y en la tarjeta de listas del dashboard. Desaparece al tener
  lista por defecto.

Fuera de alcance: crear la Pantry automáticamente para cuentas antiguas, elegir otra lista como por defecto, renombrar o
reasignar la lista por defecto, y cambiar `ensure_default_pantry`.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `default-pantry-list`: una cuenta existente puede configurar su Pantry a demanda; la regla de que una Pantry borrada no se
  recrea se limita a la provisión automática.

## Impact

- DB: migración aditiva `20261118160000_create_default_pantry` (revisión de no destructividad en el encabezado, verificación
  con rollback en `supabase/verification/`). Solo se aplica al proyecto de desarrollo aprobado.
- Servicio y API: `default-pantry.service.ts`, ruta `api/v1/base-lists/default-pantry`, endpoint de cliente en
  `src/lib/api/endpoints/base-lists.ts`, tipos en `database.types.ts`.
- UI: aviso nuevo en `components/features/base-lists/`, `BaseListsList`, `ListsSectionCard`, `buildDashboardModel`
  (`hasDefaultList`).
- Docs: `docs/reference/api-v1.md`, `docs/reference/implementation-status.md`, `CHANGELOG.md`.
