# Deploy Runbook

## Purpose

Procedimiento para desplegar la aplicación Listys en entorno de staging/production.

## Prerequisites

- Credenciales con acceso al proyecto (hosting provider, secrets manager, supabase).
- CI configurado (GitHub Actions / otra) con variables de entorno.

## Steps (manual)

1. Revisar `main` branch: `git fetch && git checkout main && git pull`.
2. Ejecutar tests locales y linter:

```bash
pnpm install
pnpm test
pnpm lint
```

3. Construir aplicación:

```bash
pnpm build
```

4. Publicar artefacto según plataforma (Vercel / self-hosted). Para Vercel: crear un release y activar deploy automático.

5. Verificar migraciones de Supabase: revisar `supabase/migrations` y aplicar en entorno con herramientas de CI o manualmente.

6. Validaciones post-deploy:

- Smoke test: inicio de sesión, crear lista base, subir ticket (flujo happy-path).
- Revisar logs de Edge Functions y cola de OCR.

## Rollback

- En Vercel: revertir a la versión anterior desde el panel.
- Para DB: preparar migraciones de reversión y ejecutar con cuidado.

## Contacts

- Equipo: @dev-team
