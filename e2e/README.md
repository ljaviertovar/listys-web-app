# E2E Integration Tests

La infraestructura de Playwright está versionada y usa Supabase real. Este documento describe su estado; la política
de pruebas vive en [AGENTS.md](../AGENTS.md) y la guía de verificación en
[CONTRIBUTING.md](../docs/contributing/CONTRIBUTING.md#playwright-boundary).

## Bloqueo de ejecución actual

La revisión del 2026-10-17 encontró que `helpers/db-reset.ts` elimina datos de tablas completas y que
`global-teardown.ts` llama a `fullReset()`. Los clientes leen variables ordinarias de la aplicación en vez de los
inputs `E2E_SUPABASE_*` exigidos por AGENTS.md. Las comprobaciones de proyecto dedicado no convierten esos borrados
globales en limpieza de fixtures aislados.

No ejecutar la suite, los helpers de reset ni migraciones destructivas como parte de una verificación rutinaria hasta
corregir esos puntos. No usar producción ni datos compartidos; no introducir credenciales predeterminadas en el código
ni sustituir Supabase por mocks en E2E. Este cambio documental no modifica la infraestructura de pruebas.

## Inventario

| Ruta | Responsabilidad |
| --- | --- |
| `../playwright.config.ts` | Chromium, servidor web en puerto 3000, setup/teardown y reportes. |
| `global-setup.ts` / `global-teardown.ts` | Carga/comprobación del entorno y limpieza global existente. |
| `fixtures/auth.setup.ts` | Preparación de autenticación. |
| `helpers/` | Clientes Supabase, creación de datos y limpieza actual. |
| `specs/rls-security.spec.ts` | Escenarios de acceso entre usuarios y RPCs. |
| `specs/ticket-ocr.spec.ts` | Escenarios OCR, extracción y merge. |
| `specs/shopping-session.spec.ts` | Ciclo de compra, orden y sincronización. |
| `specs/concurrency.spec.ts` | Concurrencia y restricciones. |
| `specs/shared-lists.spec.ts` | Colaboración experimental, fuera del MVP. |
| `ui/` | Flujos de interfaz: auth, listas, compras, recibos y landing. |

La existencia de escenarios no demuestra que hayan pasado ni que todos los requisitos estén implementados.
Aunque `.gitignore` coincide con `e2e/`, los archivos ya versionados siguen en Git; verificar el seguimiento de nuevos
archivos antes de asumir que estarán presentes en un clon limpio.

## Entorno y comandos después de corregir el bloqueo

La configuración actual carga `.env.test.local`, se bloquea si falta y utiliza `PLAYWRIGHT_TEST_BASE_URL` o
`http://localhost:3000`. El servidor configurado arranca con `pnpm dev` en el puerto 3000. No copiar credenciales a
documentación ni habilitar el reset amplio para sortear los bloqueos.

La entrada de ejecución prevista es `npx playwright test`; los scripts `pnpm test:e2e`, `pnpm test:e2e:ui`,
`pnpm test:e2e:headed` y `pnpm test:e2e:debug` están en `package.json`. Su existencia no elimina el bloqueo anterior.
No se encontró una pipeline CI versionada que ejecute estas suites.

## Mantenimiento

Sustituir los resets globales por fixtures identificables y limpieza limitada a los datos creados por cada prueba;
alinear credenciales con `E2E_SUPABASE_*` y validar que ningún test pueda apuntar a producción. Una vez corregido,
actualizar esta guía y ejecutar los flujos relevantes con `npx playwright test`.

Los reportes, trazas y capturas pueden contener información privada. Usar datos sintéticos y revisar los artefactos
antes de compartirlos. No publicar cookies, tokens, URLs firmadas ni fotos reales de recibos.
