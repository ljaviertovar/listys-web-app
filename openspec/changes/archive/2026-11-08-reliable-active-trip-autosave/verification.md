# Verificación local

Fecha: 2026-11-08. Cambio implementado en el árbol de trabajo; no publicado ni archivado.

## Resultado

Ejecución final de la tarea 6.2 (2026-11-08, árbol de trabajo sin publicar):

- Suite Vitest completa (`vitest run --maxWorkers=2`): 132 archivos / 935 pruebas aprobadas (tras añadir las pruebas de reconexión descritas abajo); E2E de `trip-autosave.e2e.spec.ts` repetido: 7/7.
- `pnpm typecheck`: sin errores. `pnpm lint`: 0 errores y 31 advertencias preexistentes. `pnpm check:native-props`: 8 pruebas aprobadas.
- Playwright contra Supabase local real (`127.0.0.1:55431`, credenciales solo desde `E2E_SUPABASE_*`): `trip-item-cas.spec.ts` 5/5 y `trip-autosave.e2e.spec.ts` 7/7 completos, con un worker.
- SQL transaccional `supabase/tests/trip-item-versions.sql`: aprobado y revertido con `ROLLBACK`.
- Límites: no se ejecutó toda la batería E2E del repositorio, solo los dos specs de este cambio; la migración se aplicó después al proyecto alojado de pruebas (ver «Cotejo manual contra la spec»), pero la activación coordinada del runbook para un entorno de producción sigue pendiente.

Resultados de las ejecuciones por grupos durante la implementación:

- 39 archivos / 294 pruebas Vitest dirigidas aprobadas: coordinador, persistencia, contratos, acciones, servicios, compras, recibos y cliente HTTP.
- Nueva ejecución dirigida: 7 archivos / 23 pruebas aprobadas para navegación, barra activa y cliente HTTP después de conectar el contador del menú lateral al mismo estado optimista; incluye cobertura compartida con la ejecución anterior.
- 5 escenarios Playwright de PostgreSQL/Supabase real aprobados: CAS concurrente, carrera con finalización, recibos en trips activos y completados y denegación de acceso ajeno.
- 7 escenarios de navegador verificados mediante ejecuciones dirigidas: checks rápidos con guardado lento; respuesta perdida y finalización con pendientes; dos contextos con ítems independientes y versiones en competencia; conflicto tras dos cambios externos; recuperación al recargar y cierre externo; eliminación externa con aviso; revisión de recibo con guardado fallido, reintento y adjunto; inspección visual. El primer escenario agrupa latencia, respuesta perdida y finalización en una sola prueba.
- SQL transaccional `supabase/tests/trip-item-versions.sql` aprobado y revertido con `ROLLBACK`: versiones, no-op, permisos, colaboradores, escritura directa denegada, edición tardía y límite privado de recibos.
- TypeScript aprobado. `pnpm lint`: cero errores y 31 advertencias existentes. `pnpm check:native-props`: 8 comprobaciones aprobadas.
- OpenSpec: `validate reliable-active-trip-autosave --strict` aprobado.

Las ejecuciones de navegador se hicieron por grupos; las aserciones corregidas se volvieron a ejecutar. No se afirma haber ejecutado toda la batería E2E del repositorio.

## Entorno y comandos

Supabase local en Docker, HTTP `127.0.0.1:55431`; aplicación de verificación en `127.0.0.1:3120`. Las credenciales proceden exclusivamente de `E2E_SUPABASE_*` en el archivo local ignorado. No se simuló Supabase. Los fallos de red afectan al HTTP de la aplicación. Fixtures propias y limpieza acotada, sin resets ni migraciones destructivas.

Comandos empleados:

```text
node node_modules/vitest/vitest.mjs run --maxWorkers=2 <módulos afectados>
pnpm lint
pnpm typecheck
pnpm check:native-props
npx playwright test --config .playwright-cli/database.config.ts e2e/specs/trip-item-cas.spec.ts --workers=1
npx playwright test --config .playwright-cli/autosave.config.ts e2e/ui/trip-autosave.e2e.spec.ts --workers=1
npx playwright test --config .playwright-cli/autosave.config.ts e2e/ui/trip-autosave.e2e.spec.ts --workers=1 --grep <escenario>
Get-Content supabase/tests/trip-item-versions.sql | docker exec -i supabase_db_listys-trip-totals-verification psql -v ON_ERROR_STOP=1 -U postgres -d postgres
npx --offline @fission-ai/openspec validate reliable-active-trip-autosave --strict
```

Los overrides ignorados aíslan puerto, compilación y artefactos de otros procesos del workspace; los specs versionados también funcionan con la configuración E2E normal y un Supabase local provisionado con el esquema vigente.

## Inspección visual y alcance

Se inspeccionaron capturas de guardado, error y conflicto a 390 × 844 y 1440 × 1000, junto con DOM, estilos computados y dimensiones mediante Chrome DevTools Protocol. Referencia: sección 3 / Feedback del HTML v2 servido localmente. Se reutiliza el patrón tonal `StatusCard` y botones compartidos; el estado discreto de autosave y el gap respecto al HTML están documentados en `DESIGN.md`. Capturas locales ignoradas: `.playwright-cli/autosave-results/`; referencia: `.playwright-cli/autosave-reference-feedback.png`.

Los componentes nuevos con DOM exponen identificadores semánticos; el provider no agrega un wrapper. El trip actual no contiene formularios ni menús de edición/eliminación de ítems: se protegieron sus helpers y Server Actions sin crear una UI nueva ni cambiar formularios de listas reutilizables.

La migración fue revisada expresamente para confirmar que no elimina registros ni recalcula historia y se aplicó primero al entorno local y, el 2026-11-08, al proyecto alojado de pruebas con `supabase db push --linked` (dry-run previo; solo se aplicaron `20261106003208_trip_store_attribution` y `20261108041549_reliable_active_trip_autosave`). Su configuración del normalizador resuelve el schema instalado de `unaccent`, sin asumir una ubicación fija. La activación coordinada descrita en el runbook sigue pendiente para cualquier entorno de producción. La barrera vacía únicamente la cola de este dispositivo; no puede incluir cambios que otro celular mantiene offline.

## Cotejo manual contra la spec

Fecha: 2026-11-08. Cotejo escenario por escenario de las tres specs contra pruebas, SQL y código; los escenarios sin cobertura automática se ejercieron en un navegador real contra el proyecto alojado de pruebas (`localhost:3000`) después de aplicar la migración.

Cubiertos por pruebas existentes: 422/409/404/401/410 del contrato v2 y retirada de v1 (`item-route.test.ts`); acceso ajeno solo con `ITEM_NOT_FOUND`, UPDATE directo denegado y trip completado rechazando checks, altas y borrados (`trip-item-versions.sql`); reaplicar tras conflicto, respuesta perdida, recarga, almacenamiento inválido, aislamiento por cuenta y por trip (`session-item-toggle.test.ts`, E2E); eventos Realtime validados y sin retroceso de versión (`trip-sync-registry.ts`).

Huecos sin prueba automática y ejercidos manualmente:

- **Descartar un conflicto:** con una intención de check pendiente y un cambio ajeno efectivo sobre el mismo ítem, al reconectar aparece el aviso con *Apply My Change* y *Discard My Change*; descartar lo cierra, deja *Saved*, no cambia la versión del servidor y no emite escritura.
- **Completar con un conflicto sin resolver:** la acción final no se ejecuta (`flush()` falla con «Resolve the item changes before continuing») y el trip sigue `active`. La hoja se mantiene abierta y aparece de inmediato el aviso «Could not complete shopping — Resolve the item changes before continuing.»; el conflicto sigue visible en la barra de estado.
- **Ítem eliminado en otro dispositivo con check pendiente:** se informa que el cambio no se aplicó, solo se ofrece descartar, la fila no se recrea y no se observan peticiones posteriores a ese ítem.
- **Camino feliz con la migración aplicada:** marcar actualiza contador, resumen y estimado al instante, el guardado termina en ~2 s y la versión sube; desmarcar la vuelve a subir.

Revalidación por `online`/`focus`/`visibilitychange`: el registro de listeners se extrajo a `sync/trip-sync-reconnect.ts` (el provider solo lo invoca) y se prueba en `tests/trip-sync-reconnect.test.ts` (los tres disparadores, página oculta sin efecto y limpieza); `session-item-toggle.test.ts` comprueba que `reconnect()` lee el estado del servidor y recupera un cambio perdido sin escribir. Las pruebas se comprobaron por mutación (quitar la comprobación de página oculta, quitar el listener de `focus` y omitir la lectura al reconectar las hacen fallar). En el navegador real cada uno de los tres eventos dispara exactamente una lectura del trip en ~0,4–0,6 s. Antes de aplicar la migración, el proyecto alojado mostraba «Could not refresh this trip» porque sus ítems no traían `version`: confirma que la expansión de esquema debe desplegarse antes de los consumidores nuevos.
