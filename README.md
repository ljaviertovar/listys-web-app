# Listys Web App

Listys es una aplicación SaaS para organizar compras: permite crear listas base, iniciar sesiones de compra y procesar tickets con OCR para convertir recibos en ítems reutilizables. Este `README.md` es una guía de entrada rápida; la documentación extendida vive en [`docs/README.md`](docs/README.md).

## Stack

- Next.js (App Router) + TypeScript
- Supabase (Auth, Postgres + RLS, Storage, Edge Functions)
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod
- zustand

## Requisitos

- Node.js 20+
- npm 10+
- Proyecto/configuración de Supabase

## Quick Start (5 minutos)

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Crea `.env.local` con variables mínimas:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

   Opcional para OCR por proveedor:

   ```bash
   PROCESS_TICKET_OCR_PROVIDER=gemini
   OPENAI_API_KEY=...
   ```

3. (Si aplica) inicializa y levanta Supabase local:

   ```bash
   npx supabase start
   npx supabase db push
   ```

4. Inicia desarrollo:

   ```bash
   npm run dev
   ```

5. Abre `http://localhost:3000`.

## Comandos mínimos

```bash
npm run dev
npm run build
npm run lint
tsc --noEmit
```

## Demo público

Para habilitar un demo público compartido:

```bash
DEMO_MODE_ENABLED=true
NEXT_PUBLIC_DEMO_MODE_ENABLED=true
DEMO_USER_EMAIL=demo@example.com
DEMO_USER_PASSWORD=...
DEMO_RESET_SECRET=...
```

Luego siembra o resetea el dataset canónico:

```bash
npm run demo:seed
npm run demo:reset
```

La UI expone un botón `Enter Demo` en `/auth/signin`, el backend bloquea OCR y mutaciones de alto riesgo para esa cuenta, y el reset remoto queda disponible en `POST /api/v1/demo/maintenance/reset` con `Authorization: Bearer <DEMO_RESET_SECRET>`.

## Documentation Map

- Documentación principal: [`docs/README.md`](docs/README.md)
- PRD: _Pendiente (añadir cuando exista en `/docs`)_
- Arquitectura: [`docs/README.md#architecture-diagrams`](docs/README.md#architecture-diagrams)
- Runbooks: _Pendiente (añadir cuando exista en `/docs`)_
- Guía para agentes: [`AGENTS.md`](AGENTS.md)
- Contribución: _Pendiente (añadir `CONTRIBUTING.md` cuando exista)_

---

Si necesitas detalle técnico, despliegue, diagramas o procesos operativos, consulta [`/docs`](docs/README.md).
