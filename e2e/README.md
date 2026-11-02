# E2E Integration Tests

La infraestructura de Playwright está versionada y usa Supabase real, **solo local**. Este documento describe su estado; la
política de pruebas vive en [AGENTS.md](../AGENTS.md) y la guía de verificación en
[CONTRIBUTING.md](../docs/contributing/CONTRIBUTING.md#playwright-boundary).

## Entorno

Toda entrada E2E lee su destino con `e2e/helpers/e2e-env.ts` (`loadE2EEnv`), desde `.env.test.local`:

| Variable | Uso |
| --- | --- |
| `E2E_SUPABASE_URL` | Origen de la API de Supabase local, con puerto explícito (por ejemplo `http://127.0.0.1:54321`). |
| `E2E_SUPABASE_PUBLISHABLE_KEY` | Clave publicable de ese Supabase local. |
| `E2E_SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio de ese Supabase local (solo para sembrar datos). |
| `E2E_APP_URL` | Opcional; origen de la aplicación bajo prueba (por defecto `http://localhost:3000`). |
| `E2E_ALLOW_DB_RESET` | `true` solo para los specs antiguos que aún vacían tablas completas (ver abajo). |

El cargador solo acepta destinos loopback literales (`localhost`, `127.0.0.1`, `[::1]`), con puerto explícito, sin
credenciales ni ruta, y **nunca** consulta `NEXT_PUBLIC_SUPABASE_*` ni el resto de credenciales de la aplicación: con
`.env.local` apuntando al proyecto alojado, el arranque falla antes de tocar nada. Los errores nombran el campo y no
imprimen valores.

`playwright.config.ts` arranca un servidor propio (`next dev` en el puerto de `E2E_APP_URL`) con
`NEXT_PUBLIC_SUPABASE_*` y `SUPABASE_SERVICE_ROLE_KEY` tomados de las variables `E2E_*` (Next no sobrescribe el entorno del
proceso, así que `.env.local` no puede elegir otro destino), los secretos de proveedores vacíos y el modo demo apagado. No
reutiliza un servidor que ya esté corriendo: ese podría estar conectado al proyecto alojado.

## Comandos

```bash
pnpm test:e2e:helpers   # guardas del arnés (Vitest, sin red ni Supabase)
npx playwright test     # suite de navegador; requiere un Supabase local aprovisionado
node --env-file=.env.test.local e2e/create-test-user.mjs   # cuenta para los specs de interfaz, solo en local
```

`pnpm test:e2e:helpers` ejecuta `e2e/helpers/tests/`; Playwright los ignora (`testIgnore`).

## Estado

- El teardown global **ya no borra nada**: antes llamaba a `fullReset()`, que vaciaba tablas completas.
- `resetDatabase`, `cleanTestUsers` y `fullReset` siguen existiendo para los specs de `e2e/specs/` que aún los usan, pero
  exigen un destino loopback validado y `E2E_ALLOW_DB_RESET=true`. Siguen borrando tablas completas de esa base local.
- `create-test-user.mjs` ya no usa `.env.local` ni una cuenta fija: crea una cuenta con correo y contraseña generados (o los
  de `E2E_USER_EMAIL` y `E2E_USER_PASSWORD`) y solo en un Supabase loopback.
- **Sin verificar:** no hay un Supabase local aprovisionado en esta máquina, así que ningún spec de navegador se ejecutó con
  estos cambios. Lo comprobado es el cargador (14 pruebas puras), que Playwright lista los 74 tests sin los de Vitest y que el
  proyecto compila.

## Inventario

| Ruta | Responsabilidad |
| --- | --- |
| `../playwright.config.ts` | Chromium, servidor propio, setup/teardown y reportes. |
| `global-setup.ts` / `global-teardown.ts` | Valida el entorno local; el teardown no borra datos. |
| `helpers/e2e-env.ts` | Lectura y validación de las entradas `E2E_*`. |
| `helpers/tests/` | Pruebas puras del arnés. |
| `fixtures/auth.setup.ts` | Preparación de autenticación. |
| `helpers/` | Clientes Supabase, creación de datos y limpieza heredada. |
| `specs/rls-security.spec.ts` | Escenarios de acceso entre usuarios y RPCs. |
| `specs/ticket-ocr.spec.ts` | Escenarios OCR, extracción y merge. |
| `specs/shopping-session.spec.ts` | Ciclo de compra, orden y sincronización. |
| `specs/concurrency.spec.ts` | Concurrencia y restricciones. |
| `specs/shared-lists.spec.ts` | Colaboración experimental, fuera del MVP. |
| `ui/` | Flujos de interfaz: auth, listas, compras, recibos y landing. |

La existencia de escenarios no demuestra que hayan pasado ni que todos los requisitos estén implementados. Aunque
`.gitignore` coincide con `e2e/`, los archivos ya versionados siguen en Git; verificar el seguimiento de nuevos archivos
antes de asumir que estarán presentes en un clon limpio.

## Pendiente

Falta lo que describe `openspec/changes/stabilize-test-foundation`: fixtures con identidad propia por intento de prueba,
limpieza por identificadores exactos, migrar cada spec y probar el aislamiento contra un Supabase local con
`npx playwright test e2e/specs/test-isolation.spec.ts --workers=2 --repeat-each=5`. Hasta entonces, no ejecutar la suite
completa contra una base local que contenga datos que importen.

Los reportes, trazas y capturas pueden contener información privada. Usar datos sintéticos y revisar los artefactos antes de
compartirlos. No publicar cookies, tokens, URLs firmadas ni fotos reales de recibos.
