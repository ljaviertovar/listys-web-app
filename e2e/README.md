# E2E Integration Tests

Tests de integración End-to-End usando Playwright para validar flujos críticos de la aplicación con Supabase real.

## Estructura

```
e2e/
├── fixtures/
│   ├── auth.setup.ts          # Fixture para páginas autenticadas
│   └── images/                # Imágenes de prueba para tickets
├── helpers/
│   ├── index.ts               # Barrel export
│   ├── supabase-client.ts     # Clientes Supabase para tests
│   ├── db-reset.ts            # Limpieza de DB entre tests
│   └── seed-data.ts           # Helpers para crear data de prueba
└── specs/
    ├── rls-security.spec.ts   # 🔴 P1: Tests de seguridad RLS
    ├── ticket-ocr.spec.ts     # 🔴 P1: Pipeline OCR completo
    ├── shopping-session.spec.ts # 🔴 P1: Ciclo de vida de sesiones
    └── concurrency.spec.ts    # 🔴 P1: Race conditions y constraints
```

## Tests Críticos Implementados (Prioridad 1)

### 🔴 RLS Security (`rls-security.spec.ts`)

**Por qué es crítico:** Previene data leakage entre usuarios, valida que Row Level Security funciona correctamente.

**Cobertura:**

- ✅ Usuario B no puede leer grupos de Usuario A
- ✅ Usuario B no puede actualizar listas de Usuario A
- ✅ Usuario B no puede insertar items en listas de Usuario A
- ✅ Usuario B no puede eliminar grupos de Usuario A
- ✅ Usuario B no puede leer sesiones/tickets de Usuario A
- ✅ RPC merge valida ownership correctamente
- ✅ Cliente no autenticado no puede acceder a ningún dato

### 🔴 OCR Pipeline (`ticket-ocr.spec.ts`)

**Por qué es crítico:** Valida el flujo completo de upload → Storage → Edge Function → OCR → DB. Es el core feature de la app.

**Cobertura:**

- ✅ Upload de imagen → OCR → items extraídos
- ✅ Multi-image upload crea un solo ticket
- ✅ Merge de items a base list actualiza enrichment fields
- ✅ Re-merge incrementa `purchase_count`
- ✅ Fallos de OCR setean estado `failed` con error message

### 🔴 Shopping Session (`shopping-session.spec.ts`)

**Por qué es crítico:** Valida el flujo principal de compra, ordering dinámico, y sync transaccional.

**Cobertura:**

- ✅ Sesión creada con ordering por `purchase_count` + `last_purchased_at`
- ✅ Completar sesión con sync actualiza base list (quantities, enrichment)
- ✅ Sesión sin sync no modifica base list
- ✅ Cancelar sesión permite crear nueva activa
- ✅ Categories y custom fields se preservan

### 🔴 Concurrent Operations (`concurrency.spec.ts`)

**Por qué es crítico:** Previene race conditions, data corruption, y valida constraints DB.

**Cobertura:**

- ✅ Solo 1 sesión activa por usuario (constraint enforcement)
- ✅ Merge concurrente no crea duplicados (unique constraint)
- ✅ Creación concurrente de grupos con mismo nombre falla
- ✅ Updates concurrentes mantienen consistencia (documentado)
- ✅ Merge respeta `MAX_ITEMS_PER_BASE_LIST` bajo concurrencia
- ✅ Unique constraint previene nombres duplicados en mismo grupo

## Setup

### Prerequisitos

1. **Supabase Project**: Proyecto activo con credenciales configuradas
2. **Environment Variables**: Archivo `.env.test.local` con:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Para test helpers
   E2E_ALLOW_DB_RESET=true  # Required to allow destructive test cleanup
   E2E_TEST_PROJECT_REF=your-test-project-ref  # Must match NEXT_PUBLIC_SUPABASE_URL ref
   ```

⚠️ **Safety guard:** E2E cleanup will fail intentionally unless both `E2E_ALLOW_DB_RESET=true`
and `E2E_TEST_PROJECT_REF` are set and match the current Supabase project ref.

3. **Playwright Browsers**:
   ```bash
   npx playwright install chromium
   ```

### Instalación

Ya instalado como parte del proyecto. Si necesitas reinstalar:

```bash
pnpm add -D @playwright/test
npx playwright install
```

## Ejecutar Tests

### Todos los tests E2E

```bash
pnpm test:e2e
```

### UI Mode (debugging interactivo)

```bash
pnpm test:e2e:ui
```

### Headed Mode (ver el browser)

```bash
pnpm test:e2e:headed
```

### Debug Mode (paso a paso)

```bash
pnpm test:e2e:debug
```

### Test específico

```bash
pnpm test:e2e rls-security
pnpm test:e2e ticket-ocr
pnpm test:e2e shopping-session
pnpm test:e2e concurrency
```

### Con filtros

```bash
# Solo tests con "User B" en el nombre
pnpm test:e2e -g "User B"

# Solo test de merge
pnpm test:e2e -g "merge"
```

## Estrategia de Testing

### Local vs Staging

**Opción A: Supabase Local (Recomendado para CI)**

```bash
npx supabase init
npx supabase db reset  # Aplica migrations
npx supabase start     # Inicia Docker containers
```

Pros: Rápido, aislado, sin costos  
Cons: Setup inicial complejo

**Opción B: Staging Project**

- Usar proyecto Supabase dedicado para tests
- Configurar en `.env.test.local`

Pros: Matches prod config  
Cons: Cleanup manual, costos

### Cleanup

Cada test ejecuta:

- `beforeEach`: `resetDatabase()` + `cleanTestUsers()`
- `afterEach`: `resetDatabase()` + `cleanTestUsers()`

Esto garantiza aislamiento entre tests.

**Manual cleanup** (si tests fallan mid-execution):

```typescript
import { fullReset } from './e2e/helpers'
await fullReset()
```

## Debugging

### Ver trace de tests fallidos

```bash
npx playwright show-report
```

### Ver screenshots

Los screenshots de tests fallidos se guardan en `test-results/`

### Logs de Supabase

Habilitar logs verbosos en helpers:

```typescript
const supabase = createTestClient()
supabase.auth.setDebug(true)
```

## CI/CD

### GitHub Actions (ejemplo)

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    env:
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install
      - run: npx playwright install --with-deps chromium
      - run: pnpm test:e2e

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Próximos Pasos (Prioridad 2 y 3)

### 🟡 Prioridad 2: Edge Cases

- [ ] OCR retry logic
- [ ] Limit enforcement exhaustivo
- [ ] Multi-image deduplication
- [ ] Storage cleanup on failure

### 🟢 Prioridad 3: User Flows

- [ ] Auth flow completo (sign up → email → first session)
- [ ] History → reuse flow
- [ ] Delete cascade validation
- [ ] UI smoke tests

## Troubleshooting

### "NEXT_PUBLIC_SUPABASE_URL not configured"

Verifica que `.env.local` existe y contiene las variables.

### Tests timeout en OCR

Edge Functions pueden tardar. Aumentar timeout:

```typescript
test(
	'upload ticket',
	async ({ page }) => {
		// ...
	},
	{ timeout: 60000 },
) // 60 segundos
```

### RLS tests fallan

Verifica que las policies están aplicadas:

```sql
SELECT * FROM pg_policies WHERE tablename = 'groups';
```

### Duplicate key errors

Si cleanup falla, ejecuta manual reset:

```bash
npx tsx -e "import('./e2e/helpers').then(m => m.fullReset())"
```

## Contribuir

Al agregar nuevos tests:

1. Agregar en `e2e/specs/[feature].spec.ts`
2. Usar helpers de `e2e/helpers` para setup
3. Siempre hacer cleanup en `beforeEach`/`afterEach`
4. Documentar por qué el test es crítico
5. Usar emails con prefijo `test-` para facilitar cleanup

## Referencias

- [Playwright Docs](https://playwright.dev)
- [Supabase Testing](https://supabase.com/docs/guides/testing)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
