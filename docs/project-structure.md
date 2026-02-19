```bash
├── public
├── src
│   ├── actions/                  # Server Actions (CRUD by domain) — only if the repo uses them
│   ├── app/
│   │   ├── (authenticated)       # Protected routes
│   │   ├── (marketing)           # Public landing pages
│   │   ├── api/                  # API routes
│   │   ├── auth/
│   │   │   ├── callback/         # OAuth callback
│   │   │   ├── signin/
│   │   │   └── signup/
│   │   ├── error.tsx             # Root error boundary
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── app/                  # App-specific components (header, footer, aside, menus, sidebar, dashboard, etc.)
│   │   ├── features/             # Feature-specific components by domain
│   │   ├── ui/                   # shared UI components (shadcn/ui if present)
│   │   └── commons/              # Shared components (logo, etc.)
│   ├── data/
│   │   └── constants/            # App constants
│   ├── hooks/                    # Custom React hooks
│   ├── lib/
│   │   ├── config/               # Configurable configs and settings (limits, feature flags, etc.)
│   │   ├── supabase/             # Supabase clients (server, client, admin)
│   │   ├── validations/          # Zod schemas by domain
│   │   └── utils.ts              # Utilities (cn, etc.)
│   ├── providers/                # React context providers
│   ├── stores/                   # Zustand stores by domain
│   └── utils/                    # Helper functions (formatters, etc.)
├── supabase/
│   ├── config.toml
│   ├── functions/                # Edge Functions (only if used)
│   └── migrations/               # SQL migrations (timestamped)
└── README.md
```

Structure rules:

- Keep domains cohesive: group code by feature/domain when possible.
- Shared code must be truly shared (avoid dumping feature code in shared folders).
- Prefer adding new code next to related code instead of creating new top-level buckets.

Use that structure unless explicitly instructed otherwise. If the repository already has a different convention,
follow the existing convention and map new code into it.
