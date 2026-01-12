# Listys - Smart Shopping List Manager

A modern SaaS application for managing grocery shopping lists with intelligent OCR-powered receipt processing.

## Features

- 📋 **Base Lists** - Create reusable shopping list templates organized by groups
- 🛒 **Shopping Runs** - Interactive checklist sessions with real-time progress tracking
- 📸 **OCR Processing** - Extract items from receipt photos using AI (OpenAI GPT-4 Vision)
- 📊 **History Tracking** - View past shopping sessions with totals and details
- 🔄 **Smart Sync** - Optionally sync shopping run changes back to base lists
- 🏪 **Multi-Store Support** - Organize lists by store or category groups

## Tech Stack

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Database**: Supabase (PostgreSQL + Row Level Security)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage (receipt images)
- **AI**: OpenAI API (GPT-4 Vision for OCR)
- **UI**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **Testing**: Jest + Playwright

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Supabase account
- OpenAI API key

### Installation

```bash
# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Initialize Supabase (if using local dev)
npx supabase init
npx supabase start

# Run database migrations
npx supabase db push

# Install shadcn/ui components
npx shadcn@latest init
npx shadcn@latest add button dialog dropdown-menu checkbox badge input label card form

# Start development server
pnpm dev
```

### Environment Variables

See [.env.example](.env.example) for required environment variables.

## Project Structure

```
src/
├── actions/          # Server Actions (mutations)
├── app/              # Next.js App Router pages
├── components/       # React components
├── data/             # Constants and static data
├── features/         # Feature-specific types
├── hooks/            # Custom React hooks
├── lib/              # Utilities and clients
├── providers/        # React context providers
└── utils/            # Helper functions
```

## Database Schema

See [supabase/migrations](supabase/migrations) for the complete schema.

### Main Tables

- `groups` - Organization units (e.g., "Walmart", "Costco")
- `base_lists` - Reusable shopping list templates
- `base_list_items` - Items in base lists
- `shopping_runs` - Individual shopping sessions
- `shopping_run_items` - Items in shopping runs
- `tickets` - Uploaded receipt metadata
- `ticket_items` - OCR-extracted items from receipts

## Architecture

### Security

- All data access protected by RLS policies
- Authentication required for all app routes
- Sensitive operations handled via Server Actions
- API keys stored server-side only

### Data Flow

1. **Base Lists** serve as templates
2. **Shopping Runs** are created by copying Base Lists
3. **Tickets** are processed via Edge Function → OpenAI API
4. **OCR Results** can merge into Base Lists
5. **Completed Runs** optionally sync changes back to Base Lists

## Development

```bash
# Run dev server
pnpm dev

# Run type checking
pnpm type-check

# Run linter
pnpm lint

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e
```

## Deployment

Designed for deployment on Vercel with Supabase.

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## License

MIT
