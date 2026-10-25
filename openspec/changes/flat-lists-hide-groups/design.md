# Design

## Context

Estado observado en el árbol de trabajo (rama `update/new-lists-flow`, tras la Fase 1). Motivación y alcance en
`proposal.md`; requisitos en `specs/`.

- **Modelo.** `groups(id, user_id, name, description, is_default, …)`; `base_lists.group_id NOT NULL → groups ON DELETE
  CASCADE`; `tickets.group_id → groups ON DELETE SET NULL` (la migración `20260121000001` mantiene `tickets.group_id`
  igual al `group_id` de la lista a la que se fusionó). `shopping_sessions.base_list_id → base_lists ON DELETE CASCADE`:
  borrar una lista borra sus sesiones (y hasta hoy borrar un grupo borraba sus listas). La política de inserción de
  `base_lists` solo comprueba `auth.uid() = user_id`, **no** que `group_id` sea del usuario.
- **Unicidad de nombre.** No hay restricción en la base de datos. Se comprueba en la aplicación con
  `.ilike('name', nombre)` por `(user_id, group_id)` en dos implementaciones gemelas:
  `src/lib/server/services/base-lists.service.ts` y `src/actions/base-lists.ts`. `ilike` interpreta `%` y `_` como
  comodines. El cliente web llama a la API (`src/lib/api/endpoints/base-lists.ts` → `/api/v1/base-lists`), no a las
  Server Actions de listas.
- **Grupos en la interfaz.** `/shopping-lists` lista grupos (`GroupsList`, `GroupCard`, `CreateGroupDialog`);
  `/shopping-lists/{groupId}/lists` lista las listas de un grupo (`BaseListsList` recibe `groupId`/`groupName`);
  `/shopping-history` lista grupos con historial (`getGroupsWithHistory`) y `/shopping-history/{groupId}` filtra en
  memoria por `session.base_list.group.id`; el detalle de sesión y el editor de lista calculan su enlace de vuelta con
  el grupo; el menú cuenta grupos (`useNavSummary` → `groups` → `buildNavCounts`); el dashboard pide `getGroups()` y
  construye `GroupPreview` con listas anidadas, `groupName` en banners y `counts.groups`; el diálogo de fusionar recibo
  tiene selector de grupo y lista filtrada por grupo; la página de marketing promete "Group your lists".
- **Código ya sin uso en pantallas:** `AssignTicketToGroupDialog` y `TicketsFilter` (solo exportados por el barril de
  `features/tickets`). `POST /api/v1/tickets/{id}/assign-group` está deprecado y su `Sunset` ya pasó.
- **Fase 1.** `ensure_default_pantry` crea el grupo predeterminado (`is_default`, índice único parcial por usuario) y
  "Pantry" solo si el usuario no tiene listas; las cuentas con listas no tienen grupo predeterminado.
- **Restricciones del repositorio** (`AGENTS.md`): migraciones solo aditivas y revisadas, ninguna ejecución sin
  aprobación; validación Zod en el borde; REST bajo `/api/v1`, adiciones compatibles sin versión nueva; Design system
  v2 como fuente visual; componentes con `data-testid`; pruebas en `tests/` del módulo.

## Goals / Non-Goals

**Goals:**

- Que ningún flujo de usuario pida, muestre o nombre un grupo, y que las cuentas existentes con varios grupos sigan
  completas y usables.
- Una única pieza de base de datos (grupo predeterminado bajo demanda), idempotente y segura ante concurrencia.
- Nombres de lista inequívocos para el usuario sin reescribir datos.
- Mantener compatibles los clientes existentes de la API v1.

**Non-Goals:**

- Eliminar `groups`, `is_default`, `base_lists.group_id` ni los endpoints `/groups*`, ni renombrar o mover listas.
- Una restricción única en la base de datos para el nombre de lista (los datos actuales ya pueden duplicarse entre
  grupos; ver Riesgos).
- Paginar el historial o la pantalla de listas; mostrar listas compartidas de otros propietarios.
- Tiendas, estadísticas por tienda y filtro de historial por tienda (Fases 3–4).

## Decisions

### D1. `ensure_default_group`: función SQL aditiva, sin backfill

Migración nueva `supabase/migrations/20261024000000_ensure_default_group.sql` con una sola función:

```
ensure_default_group(p_group_name TEXT) RETURNS UUID
  LANGUAGE plpgsql SECURITY INVOKER SET search_path = public
```

Comportamiento: exige `auth.uid()`; valida el nombre como `ensure_default_pantry` (1–100 caracteres); hace
`INSERT INTO groups (user_id, name, is_default) VALUES (uid, btrim(nombre), TRUE) ON CONFLICT (user_id) WHERE is_default
DO NOTHING`; después `SELECT id FROM groups WHERE user_id = uid AND is_default` y lo devuelve. Con dos llamadas
simultáneas, la perdedora espera al commit de la ganadora sobre el índice único parcial, no inserta, y su `SELECT`
(sentencia nueva, snapshot nuevo en READ COMMITTED) ve la fila. Nunca hace `UPDATE` ni `DELETE`; no toca filas
existentes; el nombre del grupo viene de la constante `DEFAULT_PANTRY_GROUP_NAME` ("My Lists"), igual que en la Fase 1.

La función convive con `ensure_default_pantry` sin cambios: ambas usan el mismo índice, así que una carrera entre el
aprovisionamiento de "Pantry" y una creación de lista termina con un solo grupo; `ensure_default_pantry` seguirá sin
crear "Pantry" si el usuario ya tiene listas.

*Alternativas descartadas:* (a) **backfill** de un grupo predeterminado para todas las cuentas: escribe filas en
bloque en una migración, contra la preferencia de cambios aditivos sin efecto al aplicar; (b) **reutilizar el primer
grupo existente** del usuario como destino: acopla las listas nuevas a un grupo que el usuario creó con otro sentido y
que podría borrar antes (la UI de grupos desaparece, pero la API no); (c) **upsert de PostgREST**: no admite el
predicado del índice parcial; (d) lógica "leer y luego insertar" en la aplicación: carrera, contra `AGENTS.md`.

### D2. Dónde se resuelve el destino: un servicio `default-group`

`src/lib/server/services/default-group.service.ts` exporta `resolveListGroupId(supabase, userId, groupId?)`:

- Si llega `groupId`: comprueba con el cliente autenticado (RLS de `groups` limita a los propios) que existe y es del
  usuario; si no, `ApiServiceError(404, NOT_FOUND, 'Group not found')` sin distinguir ajeno de inexistente.
- Si no llega: llama a la RPC con `DEFAULT_PANTRY_GROUP_NAME`; ante error, registra solo el código y lanza
  `ApiServiceError(500, INTERNAL_ERROR, mensaje genérico)`; la lista no se crea.

Lo usan `createBaseList` (servicio y acción gemela) y `createBaseListFromTicket`. La acción `src/actions/base-lists.ts`
debe seguir devolviendo `{ error }` en lugar de lanzar. Los dos caminos duplicados se actualizan juntos; consolidarlos
queda fuera de alcance (está en el seguimiento de auditoría).

### D3. Unicidad del nombre: por usuario, comparación literal y sin distinguir mayúsculas

Un helper compartido (`findListByName(supabase, userId, name, { excludeId })`) sustituye a las dos comprobaciones
duplicadas de cada camino. Quita el filtro `group_id`, compara con `ilike` escapando `\`, `%` y `_` en el valor (el
carácter de escape por defecto de `LIKE` en PostgreSQL es `\`, así que el patrón coincide solo con el nombre literal),
y excluye la propia lista al renombrar. El mensaje pasa a *"A list with this name already exists. Please choose a different
name."* (`409 CONFLICT`). `createBaseListFromTicket` hoy no comprueba nombre: pasa a usar el mismo helper.

La comprobación sigue siendo de aplicación (lectura y luego escritura) como hoy. Una restricción en la base de datos
exigiría resolver antes los duplicados existentes entre grupos, lo que implicaría renombrar datos de usuarios; se deja
como pregunta abierta. La ventana de carrera (dos creaciones simultáneas con el mismo nombre) ya existía por grupo y
su impacto es cosmético (dos listas homónimas, desambiguadas por D4).

### D4. Desambiguación solo en pantalla

Helper puro `buildListDisplayNames(lists)` en `src/utils/` (lo usan cuatro dominios: listas, dashboard, recibos e
historial, así que supera el umbral de reutilización de `AGENTS.md`): agrupa por `name.trim().toLowerCase()`, ordena cada
grupo por `created_at` ascendente y luego `id`, deja el nombre original a la primera y añade ` (2)`, ` (3)`… a las
siguientes. Devuelve `Map<id, displayName>`. Se aplica en: pantalla de listas, tarjeta de listas del dashboard (y
`startTarget`, `quickStart`, "Up next", banner de sesión activa cuando llevan el nombre de lista), selector del diálogo
de fusionar recibo y filtro del historial. Los editores y las peticiones usan siempre el nombre almacenado.

*Alternativas descartadas:* anteponer el nombre del grupo (escribe datos o conserva el término "grupo"; ya decidido con
el usuario) y mostrar el grupo como subtítulo (contradice FR-4).

### D5. Rutas: pantalla plana en `/shopping-lists`, redirecciones permanentes

- `src/app/(authenticated)/shopping-lists/page.tsx` pasa a ser la pantalla plana: `PageHeader` "Shopping Lists",
  descripción sin grupos, `BaseListsList` (sin `groupId`/`groupName`) con `getBaseLists()` ampliado, y la lista activa
  excluida como hoy. `loading.tsx` se actualiza.
- `shopping-lists/[groupId]/lists/page.tsx` se sustituye por una página que llama a `permanentRedirect('/shopping-lists')`
  (la carpeta `loading.tsx` de esa ruta se elimina). Igual con `shopping-history/[groupId]/page.tsx` →
  `/shopping-history`. Las redirecciones no leen datos, así que no revelan si el grupo existe.
- Se mantiene la URL `/shopping-lists` (ya es "Lists" en la barra móvil, evita tocar enlaces, `revalidatePath` y
  pruebas) y no se introduce `/lists`.
- Etiquetas: la entrada del menú lateral pasa de "Shopping List Groups" a "Shopping Lists"; la pestaña móvil sigue
  "Lists". El contador del menú cuenta `base_lists` del usuario (`listsCount`) con etiqueta accesible "N lists".

### D6. Contrato de la API v1: adiciones compatibles, sin versión nueva

| Cambio | Clasificación (`AGENTS.md`) |
| --- | --- |
| `group_id` opcional en `POST /base-lists` y `POST /tickets/{id}/create-base-list` | Compatible: entrada que deja de ser obligatoria |
| `GET /base-lists` añade `notes`, `created_at` | Compatible: campos nuevos de respuesta |
| `404` si `group_id` no es del usuario | Endurecimiento de autorización; antes la creación tenía éxito por falta de comprobación. Se documenta como corrección de seguridad, no como cambio de significado de un campo |
| `409` por nombre duplicado ahora es por usuario, no por grupo | Cambio de comportamiento de un conflicto ya existente; se documenta en la migración de la API. No elimina ni cambia campos |
| `/groups*` y `PATCH /tickets/{id}` con `group_id` | Sin cambios; la web deja de usarlos |

No se cambian rutas ni se añaden cabeceras de deprecación. `GET /tickets` sigue devolviendo `group:groups(name)` (quitarlo
sería romper campos de respuesta); la interfaz no lo muestra. El `409` más estricto es la única diferencia que un
cliente podría notar; es la consecuencia directa de FR-4 y se documenta en `docs/reference/api-v1.md` y `CHANGELOG.md`.
Pruebas de contrato: éxito sin `group_id`, con `group_id` propio, `404` con ajeno, `409` por nombre en otro grupo,
`422` por cuerpo inválido, `401`.

### D7. Pantalla de listas, dashboard y navegación

- **Pantalla de listas:** `BaseListsList` recibe `baseLists`, `activeBaseListId` y un mapa de nombres para mostrar; el
  estado vacío usa el título "No lists yet". `CreateBaseListDialog` deja de recibir `groupId` y envía solo nombre y
  notas.
- **Dashboard:** `buildDashboardModel` deja de recibir `groups`; se elimina `counts.groups`, `GroupPreview`,
  `groupName` (banner de sesión activa, `QuickStartList`, detalle de "Up next") y `TripPreview.href` apunta a
  `/shopping-history`. `GroupsSectionCard` se sustituye por `ListsSectionCard` con filas planas (icono de lista, nombre
  y "N items", acción "Start", como las filas anidadas de hoy, hasta 5 listas y "+ N more" que enlaza a
  `/shopping-lists`). `DashboardContent` deja de pedir `getGroups()` (una consulta menos). Copia: "Add them to a list in
  one of your groups" → "Add them to one of your lists".
- **Patrón visual:** el HTML del Design system v2 solo dibuja "grupo + listas anidadas". La tarjeta plana se deriva del
  mismo patrón sin el nivel de grupo (misma fila de lista con su icono 24px y botón Start 32px); la implementación debe
  leer las secciones de `docs/design/DESIGN.md` (§6.5 y §7.7) y las muestras correspondientes del HTML, indicar el
  patrón usado y registrar la desviación en §11.4.
- **Navegación:** `useNavSummary` consulta el recuento de `base_lists`; `buildNavCounts` y `NavSummary` renombran
  `groupsCount` → `listsCount`.

### D8. Diálogo de fusionar un recibo sin grupos

`loadMergeListTargets` solo devuelve listas (`getBaseLists`); `useMergeToBaseList` pierde `groups`, `selectedGroupId` y
sus setters; el diálogo elimina el selector de grupo y el estado "No groups found". El modo inicial es `existing` si hay
listas y `new` si no hay ninguna. `submitTicketItemsToList` envía `{ ticket_id, name, item_ids }` sin `group_id`. El
selector de lista usa los nombres desambiguados de D4. `AssignTicketToGroupDialog` y `TicketsFilter` se eliminan junto
con sus exportaciones. El servicio `createBaseListFromTicket` sigue guardando `tickets.group_id` con el grupo
resuelto, para mantener la invariante de la migración `20260121000001`.

### D9. Historial plano con filtro y enlaces de vuelta

- `/shopping-history` obtiene `getShoppingHistory()` (sin cambios en el servicio ni en su respuesta: ya devuelve
  `base_list_id`, `base_list.name` y `base_list.group` anidado, que la web deja de leer) y muestra `HistorySessionCard`
  por viaje, de la más reciente a la más antigua. El filtro es un componente de cliente con el `Select` de shadcn
  (patrón de `TicketsFilter`: `router.push` con `URLSearchParams`), parámetro `list`, opciones = listas con al menos un
  viaje + "All lists". Un `list` que no coincide con ninguna opción se ignora.
- `getGroupsWithHistory`, `GET /api/v1/groups/history` y su envoltorio del cliente quedan sin uso en la web; el
  endpoint se conserva.
- `shopping/[runId]/page.tsx` sustituye `?from=history-group&groupId=` por `?from=history&list=<id>`; el valor antiguo
  `history-group` se interpreta como `history` sin lista. Destinos: historial (con `list` si venía) con la etiqueta
  "Back to Shopping History", y pantalla de listas con "Back to Lists" en el resto. El editor de lista vuelve a
  `/shopping-lists` ("Back to Lists"). Se eliminan las consultas a `groups` de esas dos páginas.
- La tarjeta del historial hoy dice "A completed session in a group's history" en su comentario; se corrige.

### D10. Código que queda sin uso

Se eliminan, tras comprobarlo con búsquedas: `GroupCard`, `GroupsList`/`GroupsSkeleton`, `CreateGroupDialog`
(`features/shopping-lists/` queda vacío salvo lo que el dashboard importe), `AssignTicketToGroupDialog`, `TicketsFilter`,
`GroupsSectionCard`, los Server Actions de grupos en `src/actions/shopping-lists.ts` si ya nada los importa, los
envoltorios cliente `createGroup/updateGroup/deleteGroup/getGroups/getGroup/getGroupsWithHistory/getBaseListsByGroup`
sin uso, y sus pruebas. Se conservan `groups.service.ts`, las rutas `/groups*` y `MAX_GROUPS_PER_USER`. Cada eliminación
verifica que no queda importador (`AGENTS.md`: borrar lo que no se referencia).

### D11. Mapa de copia

| Antes | Después |
| --- | --- |
| Shopping List Groups (menú, dashboard, cabecera) | Shopping Lists |
| "Organize your shopping lists into groups or stores…" | "All your lists in one place. Start with the things you always buy." |
| "New Group", "Create Group", "No groups yet" | (se eliminan) |
| "Back to {group}", "Back to Group Lists/History" | "Back to Lists", "Back to Shopping History" |
| "View your past shopping sessions by group" | "Every trip you have completed, newest first" |
| "No lists in {group} yet" | "No lists yet" |
| Selector "Group" y "No groups found" del diálogo de recibo | (se eliminan) |
| "Group your lists / Your groups / 3 groups" (marketing) | texto de listas reutilizables sin grupos; fragmento "Your lists / 3 lists" |
| "Add them to a list in one of your groups" | "Add them to one of your lists" |
| Contador del menú "N groups" | "N lists" |

Los textos finales se revisan al implementar; deben ser frases completas en inglés (el spec `product-copy-clarity`).

## Risks / Trade-offs

- **Nombres duplicados heredados y carrera de creación** → desambiguación en pantalla (D4) y comprobación en la
  aplicación; sin restricción de base de datos hasta que el producto decida qué hacer con los duplicados.
- **Listas del usuario ya no agrupadas visualmente** (quien usaba grupos como tiendas pierde esa señal hasta la Fase 3)
  → es el objetivo del PRD; las listas conservan su grupo en la base de datos, así que nada se pierde y las Fases 3–4
  podrán aprovecharlo si procede.
- **`409` más estricto para clientes de la API** → documentado; el efecto es rechazar un nombre que ya existe en otro
  grupo.
- **Cierre de una brecha de autorización** (insertar listas en grupos ajenos) → cambia una respuesta `201` por `404` solo
  en un caso que no debería ocurrir; se prueba.
- **Borrar una lista borra sus sesiones** (existente) → la confirmación actual no lo dice; no se cambia aquí, pero se
  registra en `implementation-status.md` como candidato de copia honesta, porque ahora el historial no se agrupa por
  contenedor y borrar una lista elimina viajes visibles en él.
- **Historial y pantalla de listas sin paginar** → la pantalla plana junta lo que antes se repartía por grupo; con el
  uso actual es aceptable; se registra como límite conocido.
- **Listas compartidas** → la lectura de listas sigue filtrada por propietario (comportamiento experimental existente);
  los invitados no verán listas ajenas en la pantalla plana, igual que antes en la de grupos.
- **Dos implementaciones de creación** (servicio y acción) → ambas se actualizan y prueban; la consolidación es
  trabajo de auditoría ya registrado.
- **E2E sin Supabase local validado** → los specs se actualizan pero no se ejecutan; la verificación de base de datos
  usa un script de solo lectura/rollback como en la Fase 1.

## Migration Plan

1. Revisar y escribir la migración (una función) con el bloque de revisión no destructiva al inicio.
2. Preguntar al usuario dónde aplicarla (Supabase local u otro destino aprobado); no aplicar al proyecto remoto de
   `.env.local` sin permiso explícito. En la Fase 1 el historial remoto divergente impidió `supabase db push`; si
   vuelve a ocurrir, el usuario decide si usar `supabase db query --linked -f` y registrar solo su versión.
3. Una vez aplicada, desplegar la aplicación. Orden seguro: la función debe existir antes de que el código nuevo cree
   listas sin `group_id`; el código viejo no usa la función, así que aplicar primero la migración es inocuo.
4. Rollback: revertir el despliegue de la aplicación; la función puede quedarse (no afecta al código viejo). No hay datos
   que restaurar porque el change no modifica filas existentes; los grupos predeterminados creados bajo demanda son
   filas nuevas e inofensivas.

## Open Questions

- ¿Se añade más adelante una restricción única `(user_id, lower(name))` en `base_lists`? Requiere que el producto decida
  cómo resolver los duplicados entre grupos antes de aplicarla; no cambia specs ni tareas de este change.
- ¿La confirmación de eliminar una lista debe avisar de que se borra su historial de viajes? Es una mejora de copia
  independiente de este change.
