# Contributing

Gracias por contribuir a Listys. Estas son las guías básicas para colaborar.

## Desarrollo local

1. Clona el repo y instala dependencias:

```bash
pnpm install
```

2. Ejecuta linters y tests antes de abrir PR:

```bash
pnpm lint
pnpm test
```

3. Usar ramas con convención: `feat/`, `fix/`, `chore/`, `hotfix/`.

## Pull Requests

- Título: usar Conventional Commits (ej.: `feat(tickets): add multi-image upload`).
- Incluir descripción del cambio, referencia a issue y pasos para probar.
- Añadir tests cuando aplique.

## Código y calidad

- TypeScript estricto: evitar `any` salvo justificación documentada.
- Validación server-side para todo input nuevo.

## Reporting bugs

- Abrir issue con pasos para reproducir, entorno, y logs si aplica.
