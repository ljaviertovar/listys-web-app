## Context

`ensure_default_pantry` (migración `20261101000000`) solo actúa si el usuario no tiene ninguna lista; el dashboard la llama en
cada visita y nunca lanza. El grupo predeterminado implícito ya se crea a demanda con `ensure_default_group`
(`default-group.service.ts`), y `base_lists.is_default` está protegido por el índice parcial único
`uq_base_lists_one_default_per_user`. Los nombres de lista son únicos por cuenta sin distinguir mayúsculas
(`findListByName`), así que crear una "Pantry" junto a una "pantry" existente sería un duplicado. La pantalla de listas ya
consulta `is_default` para pintar el chip (`shopping-lists/page.tsx`) y el dashboard ya recibe `is_default` en cada lista.
Motivación y alcance: ver `proposal.md`.

## Goals / Non-Goals

**Goals:**
- Una sola operación, atómica y repetible, que deje a la cuenta con una lista por defecto.
- Reutilizar la lista "Pantry" que el usuario ya tenga en lugar de duplicarla.
- Un único aviso reutilizable en las dos pantallas.

**Non-Goals:**
- Cambiar `ensure_default_pantry` ni la provisión automática.
- Backfill masivo de cuentas existentes ni ninguna marca de "ya provisionado".
- Permitir elegir otra lista como por defecto.

## Decisions

**1. Función nueva `create_default_pantry` en lugar de ampliar `ensure_default_pantry`.**
La existente se llama en cada visita y su contrato es "no tocar cuentas con listas"; ampliarla convertiría la provisión
automática en un backfill implícito. Una función aparte, invocada solo por la acción explícita, mantiene ese contrato y evita
tocar una función ya en producción. Alternativa descartada: un parámetro `p_force` en la existente (mezcla dos intenciones).

**2. Resultado como `{ list_id, outcome }` con `outcome` en `existing | adopted | created`.**
Permite al servidor responder `201` solo al crear y a la interfaz distinguir el aviso ("Pantry created" frente a "Pantry is
now your default list"). Se valida con Zod en el servicio.

**3. Orden de decisión dentro de la función.**
(1) Si hay lista propia con `is_default` → `existing`. (2) Si hay lista propia cuyo nombre coincide con `p_list_name` ignorando
mayúsculas y espacios en los extremos → se marca la más antigua (`created_at`, luego `id`) → `adopted`. (3) Si no, se
resuelve el grupo con el mismo `INSERT ... ON CONFLICT (user_id) WHERE is_default DO NOTHING` + `SELECT` de
`ensure_default_group` y se inserta la lista marcada → `created`. Solo se escribe `is_default` en una lista existente; no hay
`DELETE` ni otro `UPDATE`.

**4. Concurrencia: bloqueo asesor por usuario y el índice parcial como última barrera.**
`pg_advisory_xact_lock(hashtext('default_pantry:' || user_id))` serializa peticiones del mismo usuario, de modo que la segunda
ve el resultado de la primera y devuelve `existing`. Si aun así otra ruta marcara una lista a la vez (otra pestaña, la
provisión automática), el `unique_violation` del índice se captura y se responde `existing`. Alternativa descartada: solo el
índice, que serviría para la marca pero no evita que dos peticiones creen dos listas "Pantry".

**5. `SECURITY INVOKER` con `auth.uid()`, igual que las funciones hermanas.**
Las políticas RLS existentes ya limitan grupos y listas al usuario; no hace falta elevar privilegios ni nuevas políticas.

**6. Endpoint REST propio `POST /api/v1/base-lists/default-pantry`.**
Es una mutación con contrato HTTP público (los clientes de la API v1 también cubren cuentas antiguas), por eso no es una
Server Action. Sin cuerpo; devuelve `{ id, outcome }` (DTO explícito, no la fila). `201` al crear, `200` en los otros casos.
Las rutas `/base-lists/[baseListId]` no chocan: `default-pantry` es un segmento estático que Next resuelve antes.

**7. Visibilidad de la acción derivada de datos que ya se cargan.**
En `/shopping-lists`, `showPantrySetup = defaultListId === null` y la consulta de `is_default` sin error (si falla, se oculta,
como ya hace el chip). En el dashboard, `buildDashboardModel` expone `hasDefaultList` a partir de `is_default` de las listas ya
cargadas. No se añaden consultas.

**8. Un solo componente de aviso en `components/features/base-lists/`.**
Se usa en dos pantallas (umbral de abstracción de AGENTS.md), con `testId` por contexto y el mismo aspecto en ambas. Construido sobre
`StatusCard` (el aviso tonal compartido) y `Button`, sin estilos propios; la lógica de envío
(estado de carga, toast, `router.refresh()`) en un hook local si crece.

## Risks / Trade-offs

- [Dos "Pantry" con distinto caso o espacios en cuentas antiguas] → se adopta la más antigua y las demás no se tocan.
- [Una lista "Pantry" que el usuario usa para otra cosa se marca como por defecto] → es la misma regla que ya aplicó la
  migración `20261101000000`, la marca es reversible (solo un indicador) y la acción es explícita.
- [El grupo predeterminado cuenta para `MAX_GROUPS_PER_USER`] → ya documentado en `docs/reference/limits.md`; el límite lo
  aplica solo el servicio de grupos de la API, no esta función, por lo que no introduce un caso nuevo.
- [El aviso aparece a quien eliminó su Pantry a propósito] → es una invitación, no una creación; no hay opción de descartarla
  en esta fase.

## Migration Plan

1. Revisar el encabezado de no destructividad (solo `CREATE OR REPLACE FUNCTION`; la función nunca se ejecuta al migrar y en
   ejecución solo escribe la marca de una lista existente o inserta filas nuevas).
2. Aplicar solo al proyecto de desarrollo aprobado y ejecutar `supabase/verification/create-default-pantry.sql` (con rollback).
3. Actualizar `database.types.ts` a mano hasta regenerar los tipos.
4. Reversión: `DROP FUNCTION public.create_default_pantry(text, text)`; la función no tiene estado propio ni datos asociados.
