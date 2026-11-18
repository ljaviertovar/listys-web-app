## 1. Base de datos

- [x] 1.1 Migración `20261118160000_create_default_pantry`: función `create_default_pantry(p_group_name, p_list_name)` con bloqueo por usuario, resultado `existing | adopted | created` y encabezado de revisión de no destructividad. Verificación: la revisión del encabezado confirma que solo hay `CREATE OR REPLACE FUNCTION` y que la función no tiene `DELETE`.
- [x] 1.2 `supabase/verification/create-default-pantry.sql` con rollback: cuenta con listas sin Pantry → `created`; con "pantry" → `adopted` sin duplicar; con lista por defecto → `existing`; llamada repetida → `existing`; segunda marca → `unique_violation`. Verificación: el script termina sin errores y los recuentos de grupos, listas e ítems antes y después coinciden salvo lo esperado.
- [x] 1.3 Aplicar al proyecto de desarrollo aprobado tras mostrar la revisión al usuario, y añadir la función a `src/types/database.types.ts`. Verificación: `pnpm typecheck` pasa y el script de 1.2 corre contra el proyecto.

## 2. Servicio y API v1

Cargar la skill `nextjs-saas-rest-api` antes de empezar este grupo.

- [x] 2.1 `setUpDefaultPantry()` en `src/lib/server/services/default-pantry.service.ts`: llama a la RPC con las constantes de `src/lib/config/default-pantry.ts`, valida la respuesta con Zod y lanza un error 500 genérico registrando solo el código. Verificación: pruebas en `tests/default-pantry.service.test.ts` para `created`, `adopted`, `existing` y error de RPC sin filtrar el mensaje de la base de datos.
- [x] 2.2 Ruta `src/app/api/v1/base-lists/default-pantry/route.ts` (`POST`, sin cuerpo, `201` al crear y `200` en los demás casos, DTO `{ id, outcome }`) y `setUpDefaultPantry()` en `src/lib/api/endpoints/base-lists.ts`. Verificación: prueba de ruta para `201`, `200` y `401` sin sesión.
- [x] 2.3 Documentar el endpoint en `docs/reference/api-v1.md`. Verificación: la entrada coincide con la respuesta real de las pruebas de 2.2.

## 3. Interfaz

Leer `docs/contributing/design-system-workflow.md` antes de empezar este grupo.

- [x] 3.1 Aviso `set-up-pantry-callout` en `components/features/base-lists/` (con `testId`, sobre `StatusCard`, estado de carga, sin doble envío, toast distinto para `created` y `adopted`, `router.refresh()`), exportado en el barrel. Verificación: prueba de `requestPantrySetup` (mensaje por resultado y error genérico fijo si falla); que el botón queda deshabilitado mientras corre se comprueba en el navegador en 3.4, porque el entorno de pruebas es `node` y no tiene DOM.
- [x] 3.2 Pantalla de listas: `showPantrySetup` (sin `is_default` y sin error en la consulta) hacia `BaseListsList`, que lo muestra sobre la cuadrícula y también en el estado vacío. Verificación: prueba de `shouldOfferPantrySetup` (sin lista por defecto sí; con lista por defecto o con la consulta fallida no).
- [x] 3.3 Dashboard: `hasDefaultList` en `buildDashboardModel` y aviso compacto en `ListsSectionCard`. Verificación: casos nuevos en `build-dashboard-model.test.ts` (con y sin lista por defecto, sin listas).
- [x] 3.4 Comprobación visual a 390 px y escritorio con Chrome DevTools y puerta del sistema de diseño (`/appds:gate`) sobre los archivos de UI. Verificación: capturas sin discrepancias y la puerta sin incidencias. Hecho con una ruta temporal de datos de ejemplo (390 px y 1280 px; ya eliminada), porque la ventana autenticada no se pudo capturar.

## 4. Cierre

- [x] 4.1 Actualizar `docs/reference/implementation-status.md` y `CHANGELOG.md`. Verificación: los enlaces de evidencia resuelven.
- [ ] 4.2 Ejecutar `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm check:native-props`. Verificación: todo en verde.
- [ ] 4.3 Recorrido manual con una cuenta sin lista por defecto: pulsar la acción en `/shopping-lists` y en el dashboard; el chip "Default" aparece y el aviso desaparece. Verificación: capturas del antes y el después.
