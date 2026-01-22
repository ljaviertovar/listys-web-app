# Listys - Smart Shopping List Manager

A modern SaaS application for managing grocery shopping lists with intelligent OCR-powered receipt processing.

## 📋 Table of Contents

- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Business Logic & Limits](#business-logic--limits)
- [Security & Validation](#security--validation)
- [Development](#development)
- [Deployment](#deployment)

## Features

### Core Functionality

- 📋 **Base Lists** - Create reusable shopping list templates organized by groups
- 🛒 **Shopping Runs** - Interactive checklist sessions with real-time progress tracking
- 📸 **OCR Processing** - Extract items from receipt photos using AI (OpenAI GPT-4 Vision)
- 📊 **History Tracking** - View past shopping sessions with totals and details
- 🔄 **Smart Sync** - Optionally sync shopping run changes back to base lists
- 🏪 **Multi-Store Support** - Organize lists by store or category groups

### Quality & Reliability

- ✅ **Error Boundaries** - Graceful error handling at root and authenticated layouts
- 🔄 **OCR Retry System** - Manual retry for failed OCR with automatic failure detection (15min timeout)
- 🗑️ **Storage Cleanup** - Automatic deletion of orphaned images via database triggers
- 🔒 **Duplicate Prevention** - Case-insensitive validation prevents duplicate group/list names
- 📊 **Loading States** - Visual feedback on all mutations to prevent double-submit
- 🛡️ **DoS Protection** - Array limits and validation to prevent abuse
- 🎯 **User Limits** - Configurable limits (10 groups max, 60 items per list)

## System Architecture

### User Flow & Features

```mermaid
flowchart TD
    Start([User Login/Signup]) --> Dashboard{Dashboard}

    Dashboard --> Groups[🏪 Groups Management]
    Dashboard --> BaseLists[📋 Base Lists]
    Dashboard --> Shopping[🛒 Shopping Runs]
    Dashboard --> Tickets[📸 Tickets/OCR]
    Dashboard --> History[📊 History]

    Groups --> CreateGroup[Create Group<br/>Max 10 per user]
    Groups --> EditGroup[Edit/Delete Group]
    CreateGroup --> BaseLists

    BaseLists --> CreateList[Create Base List<br/>within Group]
    BaseLists --> EditList[Edit Base List]
    BaseLists --> ManageItems[Add/Edit Items<br/>Max 60 per list]
    ManageItems --> StartRun{Start Shopping Run?}

    StartRun -->|Yes| Shopping
    StartRun -->|No| BaseLists

    Shopping --> ActiveRun[Active Shopping Session]
    ActiveRun --> CheckItems[Check Items as Purchased]
    ActiveRun --> AddNotes[Add Notes/Total Amount]
    ActiveRun --> CompleteRun{Complete Run?}

    CompleteRun -->|Yes + Sync| SyncBack[Sync Changes to Base List]
    CompleteRun -->|Yes| History
    CompleteRun -->|No| ActiveRun
    SyncBack --> History

    Tickets --> UploadReceipt[📸 Upload Receipt Photo]
    UploadReceipt --> OCRProcess[⚙️ OCR Processing<br/>15min timeout]
    OCRProcess --> OCRStatus{OCR Status?}

    OCRStatus -->|Success| ViewItems[View Extracted Items]
    OCRStatus -->|Failed| RetryOCR[Retry OCR]
    OCRStatus -->|Processing| Wait[⏳ Wait/Auto-refresh]

    RetryOCR --> OCRProcess
    Wait --> OCRStatus

    ViewItems --> MergeTicket{Merge to Base List?}
    MergeTicket -->|Yes| SelectItems[Select Items<br/>Max 200 items]
    MergeTicket -->|Create New| CreateFromTicket[Create New Base List]
    MergeTicket -->|No| Tickets

    SelectItems --> ValidateMerge{Within 60 item limit?}
    ValidateMerge -->|Yes| UpdateList[Update/Add Items]
    ValidateMerge -->|No| ErrorLimit[❌ Show Error]

    UpdateList --> BaseLists
    CreateFromTicket --> BaseLists
    ErrorLimit --> SelectItems

    History --> ViewPastRuns[View Past Shopping Runs]
    ViewPastRuns --> ViewDetails[View Items & Totals]
    ViewDetails --> History

    style Start fill:#4caf50,stroke:#2e7d32,color:#fff
    style Dashboard fill:#2196f3,stroke:#1565c0,color:#fff
    style Groups fill:#ff9800,stroke:#e65100
    style BaseLists fill:#9c27b0,stroke:#6a1b9a
    style Shopping fill:#00bcd4,stroke:#006064
    style Tickets fill:#f44336,stroke:#b71c1c
    style History fill:#607d8b,stroke:#37474f
    style ErrorLimit fill:#f44336,stroke:#b71c1c,color:#fff
    style OCRProcess fill:#ffc107,stroke:#f57f17
    style SyncBack fill:#4caf50,stroke:#2e7d32
```

### Technical Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        UI[Next.js UI<br/>React Server Components]
        Forms[Forms<br/>React Hook Form + Zod]
    end

    subgraph "Server Layer"
        Actions[Server Actions<br/>TypeScript]
        API[API Routes<br/>/api/upload-ticket]
        Middleware[Middleware<br/>Auth Check]
    end

    subgraph "Supabase Platform"
        Auth[Supabase Auth<br/>Email/OAuth]
        DB[(PostgreSQL<br/>+ RLS)]
        Storage[Storage<br/>Ticket Images]
        EdgeFn[Edge Function<br/>process-ticket-ocr]
    end

    subgraph "External Services"
        OpenAI[OpenAI API<br/>GPT-4 Vision]
    end

    subgraph "Database Tables"
        Groups[groups]
        BaseLists[base_lists]
        BaseItems[base_list_items]
        Runs[shopping_runs]
        RunItems[shopping_run_items]
        Tickets[tickets]
        TicketItems[ticket_items]
    end

    UI --> Forms
    Forms --> Actions
    UI --> API
    Actions --> Auth
    API --> Auth
    Middleware --> Auth

    Actions --> DB
    API --> Storage
    API --> EdgeFn

    EdgeFn --> OpenAI
    EdgeFn --> DB

    DB --> Groups
    DB --> BaseLists
    DB --> BaseItems
    DB --> Runs
    DB --> RunItems
    DB --> Tickets
    DB --> TicketItems

    Storage -.->|Trigger| DB
    DB -.->|Cascade Delete| Storage

    classDef client fill:#e1f5ff,stroke:#01579b
    classDef server fill:#fff9c4,stroke:#f57f17
    classDef supabase fill:#d1f4d1,stroke:#2e7d32
    classDef external fill:#ffe0b2,stroke:#e65100
    classDef tables fill:#f3e5f5,stroke:#6a1b9a

    class UI,Forms client
    class Actions,API,Middleware server
    class Auth,DB,Storage,EdgeFn supabase
    class OpenAI external
    class Groups,BaseLists,BaseItems,Runs,RunItems,Tickets,TicketItems tables
```

### Data Flow Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Next.js UI
    participant SA as Server Actions
    participant DB as Supabase DB
    participant S3 as Storage
    participant EF as Edge Function
    participant AI as OpenAI API

    Note over U,AI: Shopping Run Flow
    U->>UI: Create Shopping Run
    UI->>SA: createShoppingRun(baseListId)
    SA->>DB: Copy items from base_list
    DB-->>SA: Shopping run created
    SA-->>UI: Success
    UI-->>U: Show active run

    Note over U,AI: Ticket Upload & OCR Flow
    U->>UI: Upload receipt photo
    UI->>SA: uploadTicket(image)
    SA->>S3: Store image
    S3-->>SA: image_path
    SA->>DB: Create ticket (pending)
    SA->>EF: Trigger OCR processing
    EF->>AI: Extract items (GPT-4 Vision)
    AI-->>EF: Structured items
    EF->>DB: Save ticket_items + update status
    DB-->>UI: Auto-refresh (every 3s)
    UI-->>U: Show extracted items

    Note over U,AI: Merge to Base List Flow
    U->>UI: Select items + Merge
    UI->>SA: mergeTicketItemsToBaseList()
    SA->>DB: Check duplicate names
    SA->>DB: Update quantities or insert new
    SA->>DB: Mark ticket as merged
    DB-->>UI: Success
    UI-->>U: Items added to list

    Note over U,AI: Complete Shopping Run Flow
    U->>UI: Complete run + Sync
    UI->>SA: completeShoppingRun()
    SA->>DB: Update run status
    SA->>DB: Sync changes to base_list
    DB-->>UI: Success
    UI-->>U: Redirect to history
```

### Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ GROUPS : creates
    USERS ||--o{ BASE_LISTS : creates
    USERS ||--o{ SHOPPING_RUNS : creates
    USERS ||--o{ TICKETS : uploads

    GROUPS ||--o{ BASE_LISTS : contains
    BASE_LISTS ||--o{ BASE_LIST_ITEMS : has
    BASE_LISTS ||--o{ SHOPPING_RUNS : spawns
    BASE_LISTS ||--o{ TICKETS : "merges to"

    SHOPPING_RUNS ||--o{ SHOPPING_RUN_ITEMS : contains

    TICKETS ||--o{ TICKET_ITEMS : extracts
    TICKETS }o--|| GROUPS : "belongs to (nullable)"
    TICKETS }o--|| BASE_LISTS : "merged to (nullable)"

    GROUPS {
        uuid id PK
        uuid user_id FK
        string name "unique per user"
        string description
        timestamp created_at
    }

    BASE_LISTS {
        uuid id PK
        uuid user_id FK
        uuid group_id FK
        string name "unique per group"
        timestamp created_at
    }

    BASE_LIST_ITEMS {
        uuid id PK
        uuid base_list_id FK "ON DELETE CASCADE"
        string name
        decimal quantity
        string unit
        string category
        string notes
        int sort_order
    }

    SHOPPING_RUNS {
        uuid id PK
        uuid user_id FK
        uuid base_list_id FK
        string name
        enum status "active|completed"
        decimal total_amount
        string general_notes
        timestamp created_at
        timestamp completed_at
    }

    SHOPPING_RUN_ITEMS {
        uuid id PK
        uuid shopping_run_id FK "ON DELETE CASCADE"
        string name
        decimal quantity
        string unit
        string category
        boolean checked
        string notes
        int sort_order
    }

    TICKETS {
        uuid id PK
        uuid user_id FK
        uuid group_id FK "ON DELETE SET NULL"
        uuid base_list_id FK "ON DELETE SET NULL"
        string image_path
        string store_name
        enum ocr_status "pending|processing|completed|failed"
        int total_items
        timestamp processed_at
        timestamp created_at
    }

    TICKET_ITEMS {
        uuid id PK
        uuid ticket_id FK "ON DELETE CASCADE"
        string name
        decimal quantity
        string unit
        string category
        int sort_order
    }
```

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

```bash
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
- `base_list_items` - Items in base lists (max 250 per list)
- `shopping_runs` - Individual shopping sessions
- `shopping_run_items` - Items in shopping runs
- `tickets` - Uploaded receipt metadata with OCR status
- `ticket_items` - OCR-extracted items from receipts

### Key Constraints

- **Groups**: Max 10 per user, unique names (case-insensitive)
- **Base Lists**: Max 250 items per list, unique names within group
- **Tickets**: ON DELETE SET NULL for group_id and base_list_id
- **Items**: CASCADE delete when parent is deleted
- **Storage**: Automatic cleanup trigger on ticket deletion

## Business Logic & Limits

All limits are centralized in [src/lib/config/limits.ts](src/lib/config/limits.ts) for easy modification.

### Configurable Limits

```typescript
MAX_GROUPS_PER_USER = 10 // Maximum groups per user
MAX_ITEMS_PER_BASE_LIST = 250 // Maximum items per list (any method)
MAX_TICKET_ITEMS_MERGE = 200 // Maximum items to merge from ticket
MAX_SYNC_ITEMS = 250 // Maximum items to sync (matches base list limit)
```

**Why 250 for base lists and sync?**

- Prevents inconsistent states (e.g., syncing a 250-item run to a 250-item list works)
- Supports large shopping trips (Costco, Sam's Club, bulk purchases)
- PostgreSQL handles 250 rows efficiently
- Future: UI pagination for lists >50 items

### Data Flow

1. **Base Lists** serve as templates (max 250 items each)
2. **Shopping Runs** are created by copying Base Lists
3. **Tickets** are processed via Edge Function → OpenAI API
4. **OCR Results** can merge into Base Lists (max 200 items, validates 250 limit)
5. **Completed Runs** optionally sync changes back to Base Lists (max 250 items)
6. **Storage Cleanup** happens automatically on ticket deletion

### Migrations Applied

- `20260109000000_initial_schema.sql` - Core schema
- `20260109000001_storage_setup.sql` - Storage buckets and policies
- `20260121000000_handle_orphaned_tickets.sql` - Orphaned tickets index and function
- `20260121000001_fix_merged_tickets_group_id.sql` - Fix historical merged tickets
- `20260121000002_auto_fail_stuck_ocr_tickets.sql` - Auto-fail stuck OCR (15min)
- `20260121000003_cleanup_orphaned_storage_images.sql` - Storage cleanup trigger

### Key Functions

- `get_orphaned_tickets_count()` - Count tickets with NULL group_id
- `mark_stuck_tickets_as_failed()` - Auto-fail tickets in processing > 15 minutes
- `delete_ticket_storage_image()` - Trigger to cleanup storage on ticket delete
- `get_orphaned_storage_images()` - List images without tickets
- `cleanup_orphaned_storage_images()` - Delete orphaned image
  MAX_ITEMS_PER_BASE_LIST = 60 // Maximum items per list
  MAX_TICKET_ITEMS_MERGE = 200 // Maximum items to merge from ticket
  MAX_SYNC_ITEMS = 500 // Maximum items to sync (backstop)

### Validation Rules

- **Groups**:
  - Max 10 per user
  - Unique names (case-insensitive)
  - Name: 1-100 characters
  - Description: 0-500 characters

- **Base Lists**:
  - Max 250 items per list (via any method: manual, merge, sync)
  - Unique names within group (case-insensitive)
  - Name: 1-100 characters
  - Validation on create, update, merge, and sync

- **Tickets**:
  - Max 200 items per merge operation
  - Can create new base lists from tickets (validates 250 limit)
  - Image validation before OCR retry
  - Auto-fail if stuck in processing > 15 minutes
  - Storage cleanup on delete

- **Shopping Runs**:
  - Max 250 items when syncing back to base lists
  - Matches base list limit for consistency
  - Prevents impossible states (e.g., list too large to sync)

- **String Limits**:
  - Item names: 200 characters
  - Store names: 100 characters
  - Units: 20 characters
  - Categories: 50 characters
  - Notes: 500 characters

### OCR Processing

- **Statuses**: `pending` → `processing` → `completed` | `failed`
- **Auto-fail**: Tickets stuck > 15 minutes
- **Retry**: Manual retry with image validation
- **Storage**: Automatic cleanup on ticket deletion

## Security & Validation

### Row Level Security (RLS)

All tables have RLS policies ensuring:

- Users can only access their own data
- All queries filtered by `user_id`
- No cross-user data leakage

### Server-Side Validation

- **Zod Schemas**: All inputs validated with TypeScript types
- **Server Actions**: All mutations happen server-side
- **Unknown Types**: Force explicit validation (never trust client)
- **Array Limits**: Prevent DoS attacks via oversized arrays
- **Duplicate Prevention**: Case-insensitive name checks

### Error Handling

- **Error Boundaries**: Root and authenticated layouts
- **Loading States**: All forms show loading spinners
- **Dialog Protection**: Cannot close during submission
- **Toast Notifications**: User feedback on all operations
- **Graceful Degradation**: Clear error messages

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
