# Proposal

## Why

[PRD‑v3](../../../docs/prd/PRD-v3.md) Fase 2 ("Flat lists") quita el paso que más estorba en el flujo más importante:
para fusionar un recibo o crear una lista hay que elegir antes un grupo, aunque la mayoría de los hogares mantiene **una**
despensa. Los grupos ni siquiera representan al hogar (compartir ya funciona por lista). La Fase 1 dejó el terreno
preparado: todo usuario nuevo tiene una lista "Pantry" dentro de un grupo predeterminado interno. Falta que la interfaz
deje de pedir, mostrar y nombrar grupos, y que las cuentas que ya tenían listas (sin grupo predeterminado) sigan
funcionando sin perder nada.

## What Changes

- **FR‑4 — Grupos fuera de la interfaz.** Todas las listas del usuario, de cualquiera de sus grupos, aparecen en una
  sola pantalla (`/shopping-lists`, que pasa a llamarse "Shopping Lists"). Crear una lista, crear una lista desde un
  recibo y fusionar un recibo ya no piden grupo; la lista nueva va al grupo predeterminado implícito. Desaparecen las
  pantallas, tarjetas, diálogos, filtros y textos de grupos, incluido el contador de grupos del menú y la página de
  marketing. Ningún grupo ni lista se borra ni se renombra.
- **Grupo predeterminado bajo demanda.** Los usuarios que ya tenían listas no tienen grupo predeterminado (decisión
  heredada de la Fase 1). Una función SQL idempotente, `ensure_default_group`, lo crea la primera vez que hace falta un
  destino para una lista nueva. Es la única pieza de base de datos del change y es solo aditiva.
- **Nombres de lista únicos por usuario.** Hoy el nombre solo es único dentro de un grupo; en una vista plana dos listas
  "Weekly" serían indistinguibles. Al crear, renombrar o crear desde un recibo, el nombre debe ser único (sin distinguir
  mayúsculas) entre todas las listas del usuario. Las listas existentes con el mismo nombre en grupos distintos no se
  renombran: la pantalla las desambigua solo al mostrarlas ("Weekly", "Weekly (2)").
- **FR‑5 — Historial por lista.** `/shopping-history` pasa a ser una sola pantalla con todos los viajes completados y un
  filtro por lista (`?list=<id>`). `/shopping-history/{groupId}` y `/shopping-lists/{groupId}/lists` redirigen a las
  pantallas planas para no romper enlaces guardados.
- **FR‑6 — Dashboard sin grupos.** Se elimina la métrica de grupos del modelo del dashboard; la tarjeta "Shopping List
  Groups" pasa a ser una tarjeta plana "Shopping Lists" y desaparece el nombre del grupo de los banners y filas.
- **Contrato v1 (compatible):** `group_id` pasa a ser **opcional** en `POST /api/v1/base-lists` y en
  `POST /api/v1/tickets/{ticketId}/create-base-list`; si falta se usa el grupo predeterminado. Si se envía, debe ser un
  grupo del usuario (`404` si no lo es; antes la base de datos no lo comprobaba). `GET /api/v1/base-lists` añade `notes`
  y `created_at`. Los endpoints `/groups*` siguen funcionando para clientes existentes pero la aplicación web ya no
  los usa. Sin versión nueva: son adiciones y una validación más estricta de propiedad (ver `design.md` D6).
- Migración **solo aditiva**: una función SQL nueva. No cambia tablas, columnas ni filas, no hay backfill.
- Documentación del mismo change: `PRODUCT.md`, `docs/README.md`, `docs/design/DESIGN.md`, `docs/reference/api-v1.md`,
  `docs/reference/limits.md`, `docs/reference/implementation-status.md` y `CHANGELOG.md`.

Fuera de alcance (otras fases del PRD‑v3 o decisiones del producto): tiendas, estadísticas por tienda y filtro de
historial por tienda (Fases 3–4); borrar la tabla `groups`, `is_default` o datos de grupos (PRD §6); retirar o
versionar los endpoints `/groups*`; renombrar las listas existentes o anteponerles el nombre del grupo; paginación del
historial; listas compartidas con colaboradores en la pantalla de listas (las lecturas siguen filtradas por
propietario, ver `docs/reference/implementation-status.md`); localización (la interfaz es solo inglés).

## Capabilities

### New Capabilities

- `flat-lists`: el usuario ve, crea, renombra y elimina todas sus listas base en una sola pantalla sin elegir ni ver
  grupos; los nombres son únicos por usuario y las coincidencias antiguas se desambiguan al mostrarlas; los enlaces
  antiguos de grupos redirigen.
- `shopping-history-by-list`: el historial de compras es una sola pantalla de viajes completados con filtro por lista y
  navegación de vuelta coherente desde el detalle de una sesión.

### Modified Capabilities

- `default-pantry-list`: añade el requisito de que cualquier usuario obtiene un grupo predeterminado implícito cuando
  se crea su primera lista nueva, también las cuentas que ya tenían listas, de forma idempotente y segura ante
  concurrencia.
- `product-copy-clarity`: el vocabulario visible deja de incluir "group" (los términos estables pasan a receipt, base
  list, shopping session e item); el texto de compartir ya no contrapone la lista a un grupo organizativo; y la
  confirmación de eliminación deja de tratar grupos y pasa a tratar listas.

## Impact

- **Base de datos:** una migración nueva en `supabase/migrations/` (aditiva, con la revisión explícita de no pérdida de
  datos que exige `AGENTS.md`); tipos de `src/types/database.types.ts` con la función nueva. Se pedirá al usuario dónde
  aplicarla antes de ejecutar nada.
- **Servicios y acciones:** `base-lists.service.ts` y su gemelo `src/actions/base-lists.ts`, `tickets.service.ts`, un
  servicio de grupo predeterminado, validaciones `base-list.ts` y `ticket.ts`, `src/lib/api/endpoints/`. Se retiran los
  Server Actions y envoltorios de grupos que queden sin uso.
- **UI:** `shopping-lists/` (pantalla plana; redirección de `[groupId]/lists`), `shopping-history/` (pantalla con filtro;
  redirección de `[groupId]`), `shopping/[runId]` y `base-lists/[baseListId]/edit` (enlaces de vuelta), dashboard
  (modelo, tarjeta de listas, banners, "Up next"), diálogo de fusionar recibo y su hook, `CreateBaseListDialog`,
  navegación (etiqueta y contador), página de marketing. Se eliminan `GroupCard`, `GroupsList`, `CreateGroupDialog`,
  `AssignTicketToGroupDialog` y `TicketsFilter` (sin uso en pantallas).
- **Pruebas:** actualizar las de dashboard, listas, tickets, navegación y acciones; nuevas pruebas del helper de
  desambiguación, del servicio de grupo predeterminado, de la unicidad de nombres, de las redirecciones y del filtro
  de historial; actualizar `e2e/ui/*` y `e2e/helpers/seed-data.ts` (escritos pero no ejecutados sin un Supabase local
  validado).
- **Contrato público:** adiciones compatibles en v1 (ver arriba) y entrada en `CHANGELOG.md` y en la referencia de la API.
- **Interacción con el change en curso `stabilize-test-foundation`:** las fixtures E2E que creen un grupo antes de una
  lista dejan de ser válidas; se actualizan aquí sin tocar el arnés que ese change rediseña.
