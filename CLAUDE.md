# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Application Overview

**Wardrobe Builder** is a full-stack web application for designing, visualizing, and comparing custom built-in furniture (wardrobes and desks). The app combines:

- **Static Build Viewer**: Browse pre-designed wardrobe and desk builds with detailed cost breakdowns
- **Interactive Wizard**: Create custom furniture configurations with type-specific wizards (5 steps for wardrobes, 5 steps for desks)
- **Furniture Type Support**: Full support for wardrobes and home office desks with separate configuration paths
- **AI Image Generation**: Generate photorealistic furniture visualizations using AI
- **Material Management**: Database-backed material pricing and options
- **Export Capabilities**: Export builds to CSV/JSON for comparison

**Tech Stack**:
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS v4 + Zustand
- **UI Components**: Custom component library with CVA (class-variance-authority) + Headless UI
- **Backend**: Express + Node.js
- **Database**: PostgreSQL 16
- **AI**: OpenRouter API (Gemini/GPT models)
- **Deployment**: Docker Compose (dev), Vercel (production)

## Repository

- **GitHub**: [github.com/scotthooker/wardrobebuilder](https://github.com/scotthooker/wardrobebuilder)
- **Branch**: main
- **Production**: Deployable to Vercel with serverless functions

## Development Commands

```bash
# Docker Development (Recommended for local dev)
docker-compose up -d              # Start all services (frontend, API, database)
docker-compose logs -f app        # View frontend logs
docker-compose logs -f api        # View backend logs
docker-compose down               # Stop all services
docker-compose restart app        # Restart frontend after changes

# Frontend development (React + Vite)
npm run dev                       # Start Vite dev server on http://localhost:5173

# Backend development (Express API + PostgreSQL)
npm run server                    # Start Express API on http://localhost:3001

# Database
docker-compose up -d db           # Start PostgreSQL container only
docker-compose exec db psql -U wardrobe_user -d wardrobe_builder

# Material data import
node server/importMaterials.js    # Import materials from JSON to PostgreSQL

# Build generation
node scripts/generateBuilds.js    # Generate all 11 build JSON files
node scripts/createExampleDesks.js # Create example desk builds in database

# Image regeneration
node scripts/regeneratePromptsAndImages.js  # Regenerate AI prompts and images for all builds

# Product scraping (Python)
source venv/bin/activate          # Activate Python virtual environment
npm run scrape                    # Scrape product data from external site
npm run scrape:quick              # Quick scrape (2 pages max)
npm run scrape:headless           # Scrape without browser UI

# Production
npm run build                     # Build for production (Vite)
npm run vercel-build              # Build for Vercel deployment
npm run preview                   # Preview production build
npm run lint                      # Run ESLint

# Git
git push                          # Push to GitHub
git status                        # Check git status
```

## Architecture Overview

### Dual-Mode Application

This application operates in **two distinct modes**:

1. **Build Viewer Mode** (Static JSON-based)
   - Uses pre-generated build JSON files from `public/data/builds/`
   - Data loaded via `useBuilds` hook
   - No database required for viewing builds
   - Exports to CSV/JSON for comparison
   - Displays AI-generated images from `public/generated-images/`

2. **Build Creator Mode** (Database-backed)
   - Interactive wizard for creating custom furniture (wardrobes: 5 steps, desks: 5 steps)
   - Unified FurnitureBuilder with type-specific step configurations
   - PostgreSQL database for persistent storage with furniture_type column
   - Express API at `http://localhost:3001` (or `http://localhost:3002` in Docker)
   - Material pricing from `materials` and `material_options` tables
   - AI-powered prompt and image generation via OpenRouter

### Technology Stack Details

**Frontend**:
- **React 18**: Functional components with hooks, fully typed with TypeScript
- **TypeScript**: Strict mode enabled with comprehensive type safety
- **Vite**: Build tool with HMR (Hot Module Replacement)
- **Tailwind CSS v4**: Utility-first styling (uses `@import "tailwindcss"` syntax)
- **Component Library**: 16 custom UI components built with CVA for variant management
  - Atomic: Button, Input, Select, Badge, Card, Checkbox, Radio, Spinner, FormField
  - Molecule: ButtonGroup
  - Advanced: Modal, Drawer, Dropdown, ProgressStepper, Carousel
- **Headless UI**: Accessible Dialog and Menu primitives
- **CVA**: class-variance-authority for type-safe component variants
- **Zustand**: Lightweight state management
- **React Router**: Client-side routing
- **Lucide React**: Icon library

**Backend**:
- **Express**: RESTful API server
- **PostgreSQL 16**: Relational database
- **node-postgres (pg)**: Database driver
- **OpenRouter API**: AI prompt generation and image synthesis
- **Multer**: File upload handling

**Development Environment**:
- **Docker Compose**: Orchestrates 3 services (app, api, db)
- **Nodemon**: Auto-restart on backend changes
- **Vite HMR**: Instant frontend updates

### Data Architecture

**Build Viewer (JSON Inheritance Model)**:
```
base-config.json (shared defaults)
    ↓
build-01.json ... build-11.json (individual builds)
    ↓
BuildModel class (merges, calculates costs)
    ↓
React components
```

**Build Creator (Database Model)**:
```
PostgreSQL Tables:
- builds (stores user-created wardrobes + AI images)
- materials (carcass materials: MDF, plywood, melamine)
- material_options (pricing by thickness: 12mm, 15mm, 18mm)

Configuration Structure:
{
  width: 2400,
  height: 2400,
  depth: 600,
  sections: [
    {
      id: 0,
      width: 800,
      carcasses: [
        {
          id: 0,
          height: 1200,
          width: 800,
          material: {
            material: "Moisture Resistant MDF",
            thickness: "18mm",
            thicknessNum: 18,
            price: 50.80,
            sku: "3901289006312"
          },
          interiorSections: [
            { id: 0, type: 'rail', height: 1200 },
            { id: 1, type: 'drawers', height: 600, drawers: 3, isExternal: true }
          ]
        }
      ]
    }
  ],
  doors: {
    style: 'hinged',  // or 'sliding', 'none'
    sectionConfigs: {
      "0": {
        zones: [
          { id: 0, startCarcass: 0, endCarcass: 0, doorCount: 1 }
        ]
      }
    }
  }
}
```

### State Management

- **Zustand store** (`src/store/buildsStore.js`): Global state for build selection, editing
- **React hooks** (`src/hooks/`): Data fetching and local component state
- **Configuration state**: Managed in `WardrobeBuilder` component, passed down via props

### Wizard Steps

The `FurnitureBuilder` component implements a unified wizard with type-specific steps:

**Furniture Type Selection (Step 0)**:
- **FurnitureTypeStep**: Choose between Wardrobe or Desk
- Sets `furnitureType` in configuration
- Determines which wizard steps to display

**Wardrobe Wizard (5 steps)**:
1. **DimensionsStep**: Set overall width, height, depth
2. **CarcassLayoutStep**: Define vertical sections and carcass heights with material selection
3. **InteriorDesignStep**: Configure interior (rails, shelves, drawers) for each carcass
4. **DoorsDrawersStep**: Add door zones and external drawer configurations
5. **ReviewStep**: Summary and save to database

**Desk Wizard (5 steps)**:
1. **DeskDimensionsStep**: Select desk shape (Straight/L-Shaped/U-Shaped) and dimensions
2. **DeskLayoutStep**: Configure base type (Pedestals/Panel Sides/Legs/Trestle) and pedestal widths
3. **DeskStorageStep**: Configure overhead storage (Hutch/Open Shelving/Closed Cabinets/Wall-Mounted)
4. **DeskAccessoriesStep**: Select accessories (Keyboard Tray, Cable Management, Monitor Arm, etc.)
5. **DeskReviewStep**: Summary and save to database

Each step updates the shared `configuration` object via `updateConfiguration()`.

## Component Library Architecture

The application uses a custom-built component library with **full TypeScript support** and **CVA (class-variance-authority)** for type-safe variant management.

### Component Library Structure

**Location**: `src/components/ui/`

**16 Components Total**:

**Atomic Components** (9):
- **Button**: 8 variants (primary, secondary, success, outline, ghost, icon, wizard, premium), 4 sizes, loading state, left/right icons
- **Input**: Text, number, email types with error states and icons
- **Select**: Dropdown with grouped options, native select fallback
- **Badge**: 6 variants (default, primary, secondary, success, warning, danger), 3 sizes
- **Card**: 5 variants (default, elevated, premium, glass, outline), sub-components (CardHeader, CardTitle, etc.)
- **Checkbox**: Styled checkbox with label support
- **Radio**: Styled radio button with label support
- **Spinner**: 3 sizes (sm, md, lg) with customizable colors
- **FormField**: Wrapper for inputs with label, error, and helper text

**Molecule Components** (1):
- **ButtonGroup**: Multi-select or single-select button group with active states

**Advanced Components** (5):
- **Modal**: Headless UI Dialog with 5 sizes, backdrop blur, animations
- **Drawer**: Side panel (left/right) with backdrop, header, content, footer
- **Dropdown**: Headless UI Menu with positioning and animations
- **ProgressStepper**: Horizontal stepper for wizard navigation
- **Carousel**: Image carousel with navigation, keyboard support, auto-play

### Component Patterns

**CVA Variant Pattern**:
```typescript
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 text-white border-2 border-primary-700',
        secondary: 'bg-secondary-600 text-white',
        // ... more variants
      },
      size: { sm: 'px-3 py-1.5', md: 'px-4 py-2', lg: 'px-6 py-3' },
    },
  }
)

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, loading, children, ...props }, ref) => {
    return (
      <button ref={ref} className={cn(buttonVariants({ variant, size }))} {...props}>
        {loading && <Spinner />}
        {children}
      </button>
    )
  }
)
```

**forwardRef Pattern**: All components support ref forwarding for flexibility

**Composition Pattern**: Complex components have sub-components (Card → CardHeader, CardContent, etc.)

### Theme System

**Location**: `src/theme/`

**tokens.ts**: Centralized design tokens
- 8 color palettes (primary, secondary, success, danger, warning, info, neutral, gray)
- Typography scale (fontSize, fontWeight, lineHeight, letterSpacing)
- Spacing scale (4px base grid)
- Border radius, shadows, transitions

**animations.ts**: Reusable animation presets
- fadeIn, fadeOut, slideIn (up/down/left/right), scaleIn, scaleOut, spin, bounce, pulse

### Utility Functions

**Location**: `src/lib/utils.ts`

**cn() function**: Merges Tailwind classes using clsx + tailwind-merge
```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**10+ utility functions**: formatCurrency, formatDate, formatNumber, debounce, throttle, etc.

### TypeScript Configuration

**Full TypeScript Migration**: All files converted from .js/.jsx to .ts/.tsx

**tsconfig.json highlights**:
- Strict mode enabled
- Path aliases: `@/*` → `./src/*`, `@/components/*` → `./src/components/*`, etc.
- Target: ES2020
- Module: ESNext with Vite bundler resolution

**Type Safety**:
- Comprehensive interfaces for all data structures (Build, Material, Configuration, etc.)
- No `@ts-ignore` comments - all types properly defined
- Strict null checks and proper handling of undefined/null values
- Type-safe component props with discriminated unions where appropriate

## Key Implementation Details

### Material Selection & Thickness Calculations

When adding a carcass, users select from database materials with different thicknesses:
- **External dimensions**: What the user sets (includes panel thickness)
- **Internal dimensions**: External - (thickness × 2) for top/bottom panels
- Default material: Moisture Resistant MDF 18mm
- Material data structure includes: `material`, `thickness`, `thicknessNum`, `price`, `sku`

### Carcass Data Structure

Each carcass stores:
```javascript
{
  id: 0,
  height: 1200,        // External height in mm
  width: 800,          // Width from section division
  material: {          // Complete material info for calculations
    material: "Material Name",
    thickness: "18mm",
    thicknessNum: 18,  // For math calculations
    price: 50.80,
    sku: "SKU123"
  },
  interiorSections: [
    { type: 'rail', height: 1200 },
    { type: 'shelves', height: 600, shelfCount: 3 },
    { type: 'drawers', height: 600, drawers: 3, isExternal: true },
    { type: 'double_rail', height: 2400 }
  ]
}
```

### Database Schema

**builds table**:
- Stores user-created configurations as JSONB
- Fields: `id`, `name`, `character`, `image`, `furniture_type`, `costs_json`, `materials_json`, `extras_json`, `generated_image`, `generated_prompt`, `image_gallery`
- `furniture_type`: TEXT column with default 'wardrobe' (values: 'wardrobe', 'desk')
- `image_gallery`: JSONB array of image objects `[{url: "/generated-images/...", prompt: "..."}]`

**materials table**:
- Carcass sheet goods (type = 'CARCASS')
- Fields: `id`, `name`, `category`, `type`, `recommended`, `description`, `usage`, `image`

**material_options table**:
- Pricing and specs for each thickness
- Fields: `id`, `material_id`, `thickness`, `thickness_num`, `size`, `price`, `sku`, `price_per_sqm`
- Note: Database uses snake_case, API converts to camelCase for frontend

### API Endpoints

```
GET  /api/health                  # Health check
GET  /api/materials/sheet-goods   # Get carcass materials with pricing
GET  /api/builds                  # Get all builds from database
GET  /api/builds/type/:type       # Get builds by furniture type (wardrobe/desk)
GET  /api/builds/:id              # Get specific build
POST /api/builds                  # Create new build (requires furniture_type field)
PUT  /api/builds/:id              # Update build
DELETE /api/builds/:id            # Delete build
POST /api/generate-prompt         # Generate image prompt via AI (OpenRouter)
POST /api/generate-image          # Generate furniture image (OpenRouter)
POST /api/upload-image            # Upload image to gallery
```

### AI Image Generation

**Supports both wardrobes and desks** with furniture-type-specific prompt templates.

**Workflow**:
1. User edits a build in EditPanel
2. Click "Generate Design Prompt" → POST `/api/generate-prompt`
   - Sends build materials, hardware, dimensions, **furniture type**, and **configuration** to AI
   - AI generates detailed architectural visualization prompt specific to furniture type:
     - **Wardrobes**: Architectural visualization with hinged/sliding doors, interior organization, material finishes
     - **Desks**: Home office photography with desk shape, base type, overhead storage, workspace accessories
3. User can edit the prompt
4. Click "Generate Image" → POST `/api/generate-image`
   - Sends prompt to OpenRouter (Gemini 2.5 Flash Image model)
   - Receives base64-encoded image
   - Saves to `public/generated-images/{buildId}_{timestamp}.png`
   - Updates build record with `generated_image` and `generated_prompt`
5. Image displays in gallery carousel

**Models Used**:
- Prompt generation: `anthropic/claude-3.5-sonnet` (via OpenRouter)
- Image generation: `google/gemini-2.5-flash-image-preview`

**Implementation Files**:
- `server/imageGeneration.js`: AI prompt generation with furniture type detection
- `server/promptTemplate.js`: Furniture-type-specific prompt templates
  - `generateWardrobePrompt()`: Wardrobe-specific prompts with materials, doors, interior features
  - `generateDeskPrompt()`: Desk-specific prompts with shape, base type, overhead storage, accessories
- `src/components/editor/EditPanel.tsx`: Frontend UI for prompt generation and image creation (TypeScript)

### Image Gallery

**BuildImageCarousel Component**:
- Handles both string and array formats for `image_gallery` data
- Parses JSON strings defensively with try-catch
- Falls back to empty array for invalid data
- Displays carousel with navigation arrows and dot indicators
- Shows image counter (e.g., "2 / 5")

**Data Format**:
```javascript
// API may return either format:
image_gallery: "[{\"url\":\"/generated-images/1.png\"}]"  // JSON string
image_gallery: [{url: "/generated-images/1.png"}]         // Array
```

### Cost Calculation

**BuildModel (Wardrobes)** - `src/models/BuildModel.ts`:
1. **Material costs**: Sheets × price per sheet (from `pricing-data.json`)
2. **Professional doors/drawers**: From `base-config.json`
3. **Hardware**: Hinges, handles, rails (from `base-config.json`)
4. **Extras**: Build-specific additions
5. **Grand total**: Sum of all costs
6. **Savings**: Comparison vs £5,000 budget
- Uses **inheritance pattern**: base-config.json provides defaults, individual builds override/extend
- **Fully typed** with TypeScript interfaces for all data structures

**DeskModel (Desks)** - `src/models/DeskModel.ts`:
1. **Desktop material**: Calculated based on area (width × depth) and shape multiplier
   - Straight desk: 1.0× area
   - L-shaped desk: 1.5× area
   - U-shaped desk: 2.0× area
2. **Base material**: Pedestal/panel carcasses (if pedestals or panel_sides selected)
3. **Overhead material**: Hutch/cabinet/shelving materials (if overhead enabled)
4. **Hardware**: Drawer slides, hinges, legs, etc. based on configuration
5. **Accessories**: Selected accessories with pricing (keyboard tray, monitor arm, etc.)
6. **Grand total**: Sum of all costs
7. **Savings**: Comparison vs £5,000 budget

## File Organization

**Critical directories**:
- `api/`: Vercel serverless functions (production deployment)
  - `api/index.js`: Serverless function wrapper for Express routes
- `server/`: Express API, database logic, image generation (local dev)
  - `server/db.js`: PostgreSQL queries and connection
  - `server/imageGeneration.js`: OpenRouter integration
  - `server/index.js`: Express routes and middleware
  - `server/init.sql`: Database schema
  - `server/importMaterials.js`: Material data seeding
- `src/components/ui/`: Custom component library (16 components)
  - All components built with TypeScript + CVA
  - `index.ts`: Central export point for all UI components
- `src/components/builder/`: Wizard steps and unified FurnitureBuilder
  - `FurnitureBuilder.tsx`: Unified furniture wizard with type-specific routing (TypeScript)
  - `WardrobeBuilder.tsx`: Wardrobe-specific wizard orchestrator (TypeScript)
  - `steps/`: Wardrobe wizard steps (all TypeScript)
    - `DimensionsStep.tsx`, `CarcassLayoutStep.tsx`, `InteriorDesignStep.tsx`, etc.
  - `steps/desk/`: Desk wizard steps (all TypeScript)
    - `DeskDimensionsStep.tsx`, `DeskLayoutStep.tsx`, `DeskStorageStep.tsx`, etc.
  - `steps/FurnitureTypeStep.tsx`: Furniture type selection (Step 0, TypeScript)
- `src/components/editor/`: EditPanel for editing builds and generating images
  - `EditPanel.tsx`: Complex editor with AI image generation (TypeScript)
  - `ImageGallery.tsx`: Image gallery management (TypeScript)
- `src/components/builds/`: Build display components
  - `BuildCard.tsx`: Build card with furniture type badges (TypeScript)
- `src/components/shared/`: Shared components
  - `ExportButton.tsx`: CSV/JSON export functionality (TypeScript)
- `src/components/layout/`: Layout components
  - `Header.tsx`, `Footer.tsx`: Navigation and footer (TypeScript)
- `src/pages/`: Page components (all TypeScript)
  - `BuildListPage.tsx`: Home page with filtering
  - `BuildDetailPage.tsx`: Individual build details
  - `BuilderPage.tsx`: Wizard page
  - `ComparePage.tsx`: Build comparison
- `src/constants/`: Configuration constants (all TypeScript)
  - `furnitureTypes.ts`: Furniture type definitions (WARDROBE, DESK)
  - `deskSectionTypes.ts`: Desk shapes, base types, storage, accessories
- `src/models/`: Business logic for cost calculations (all TypeScript)
  - `BuildModel.ts`: Wardrobe cost calculations with full type safety
  - `DeskModel.ts`: Desk cost calculations with full type safety
- `src/hooks/`: Custom React hooks (all TypeScript)
  - `useBuilds.ts`, `useMaterials.ts`, `useDoorsDrawers.ts`, etc.
- `src/store/`: Zustand state management
  - `buildsStore.ts`: Global state with TypeScript types
- `src/utils/`: Utility functions (all TypeScript)
  - `configurationConverter.ts`: Configuration to Build conversion
  - `exportCSV.ts`: CSV export logic
  - `formatters.ts`: Formatting utilities
  - `pricingCalculator.ts`: Pricing calculations
- `src/theme/`: Theme system
  - `tokens.ts`: Design tokens (colors, typography, spacing)
  - `animations.ts`: Animation presets
- `src/lib/`: Utility libraries
  - `utils.ts`: cn() function and other utilities
- `public/data/`: JSON configuration files (materials metadata)
- `public/generated-images/`: AI-generated wardrobe visualizations
- `scripts/`: Utilities for scraping, build generation, image regeneration
- `archive/`: Archived development files (dist builds, old docs)

**Environment setup**:
- Copy `.env.example` to `.env`
- Local development:
  - `DATABASE_URL=postgresql://wardrobe_user:wardrobe_password@localhost:5432/wardrobe_builder`
  - `OPENROUTER_API_KEY=sk-or-v1-...`
  - `VITE_API_URL=http://localhost:3001` (or `http://localhost:3002` for Docker)
- Production (Vercel):
  - `DATABASE_URL=postgresql://...@neon.tech/...` (Neon PostgreSQL)
  - `OPENROUTER_API_KEY=sk-or-v1-...`
  - `VITE_API_URL=/api`
  - `NODE_ENV=production`

**Archived files** (outside repository):
- `/Users/scotthooker/hardwoods/csv-archive/`: 65 legacy files
  - 53 CSV files (build data, materials, comparisons)
  - 12 HTML files (static build previews)
  - All data migrated to PostgreSQL database

## Data Flow Patterns

### Creating a New Build (Wizard)

```
User completes wizard
    ↓
WardrobeBuilder.handleComplete(configuration)
    ↓
POST /api/builds with configuration object
    ↓
Database stores as JSONB in builds table
    ↓
Returns saved build with ID
```

### Viewing Builds (Static)

```
useBuilds() hook
    ↓
Fetches build-01.json through build-11.json
    ↓
Loads base-config.json and pricing-data.json
    ↓
Creates BuildModel instances
    ↓
Zustand store manages selection state
    ↓
BuildCard/BuildDetail components render
    ↓
BuildImageCarousel displays gallery images
```

### Material Selection Flow

```
useMaterials() hook
    ↓
GET /api/materials/sheet-goods
    ↓
getCarcassMaterials() from database
    ↓
Converts snake_case to camelCase
    ↓
Returns materials with options array
    ↓
SetCarcassHeightView displays material selector
    ↓
User selects material + thickness
    ↓
Material object saved in carcass.material
```

### AI Image Generation Flow

```
EditPanel component
    ↓
User clicks "Generate Design Prompt"
    ↓
POST /api/generate-prompt with build data
    ↓
OpenRouter AI generates detailed prompt
    ↓
User reviews/edits prompt
    ↓
User clicks "Generate Image"
    ↓
POST /api/generate-image with prompt
    ↓
OpenRouter generates image (base64)
    ↓
Server saves to public/generated-images/
    ↓
PUT /api/builds/:id updates image_gallery
    ↓
BuildImageCarousel displays new image
```

## Docker Development Environment

The app runs in Docker with 3 services:

**Services**:
1. **app** (Frontend - Vite dev server)
   - Port: 5173 (host) → 5173 (container)
   - Auto-reloads on file changes via HMR
   - Mounts: `./src`, `./public`, config files

2. **api** (Backend - Express server)
   - Port: 3002 (host) → 3001 (container)
   - Auto-restarts on file changes via nodemon
   - Mounts: `./server`, `./scripts`, `./public/generated-images`

3. **db** (PostgreSQL 16)
   - Port: 5432 (host) → 5432 (container)
   - Volume: `postgres_data` (persists between restarts)
   - Health check: `pg_isready`

**Hot Reload**:
- Frontend: Instant HMR updates in browser
- Backend: Nodemon restarts server (< 2 seconds)
- No need to rebuild containers for code changes

**Commands**:
```bash
docker-compose up -d              # Start all services
docker-compose logs -f app        # View frontend logs
docker-compose restart api        # Restart backend
docker-compose exec db psql -U wardrobe_user -d wardrobe_builder
```

## Important Notes

### CSS and Styling
- **Tailwind v4**: Uses `@import "tailwindcss"` instead of `@tailwind` directives
- **No @apply**: Tailwind v4 doesn't support `@apply` - use plain CSS or inline classes
- **Custom classes**: Defined in `src/index.css` using plain CSS properties
- **Glass effects**: `.glass-effect` class for backdrop blur and transparency

### UI/UX Patterns
- **Edit drawer**: Right-side panel with 20% opacity backdrop, max 700px width
- **Buttons**: Strong colors with borders for visibility (blue primary, green export, white with dark border)
- **Carousel**: BuildImageCarousel handles both string and array data formats
- **Furniture type filtering**: BuildListPage has filter buttons (All/Wardrobes/Desks) with counts
- **Furniture type badges**: BuildCard displays color-coded badges (blue for wardrobes, green for desks) with emoji icons
- **Responsive**: Mobile-first design with breakpoint-specific utilities

### Data Handling
- **Gallery data**: Always parse defensively - API may return JSON string or array
- **Material thickness**: Account for panel thickness in dimension calculations (internal = external - thickness × 2)
- **Database naming**: PostgreSQL returns snake_case; API layer converts to camelCase for React
- **Furniture types**: Always default to 'wardrobe' if furnitureType is missing; database column has default 'wardrobe'
- **Door zones**: Doors span multiple carcasses via `startCarcass` and `endCarcass` indices (wardrobes only)
- **External drawers**: Marked with `isExternal: true` in interior sections; appear as drawer fronts instead of door panels (wardrobes only)
- **Desk configurations**: Store desk shape, base type, overhead storage, and accessories in configuration object

### Development Patterns
- **No difficulty/ranking references**: All difficulty ratings and complexity scores have been removed from the codebase
- **Functional components**: Use hooks instead of class components
- **Named exports**: Prefer named exports over default exports
- **Error boundaries**: EditPanel checks for `editedBuild.costs` before rendering
- **Type safety**: Use defensive checks (`Array.isArray()`, `typeof`, null coalescing)

### Performance
- **Code splitting**: Vendor chunks separated in `vite.config.js`
- **Image optimization**: Generated images saved to public folder
- **State management**: Zustand for minimal re-renders
- **Lazy loading**: Consider for future features

## Troubleshooting

### Port conflicts
```bash
# Kill process using port
lsof -ti:5173 | xargs kill -9    # Frontend
lsof -ti:3002 | xargs kill -9    # Backend
lsof -ti:5432 | xargs kill -9    # Database
```

### Docker issues
```bash
# Restart containers
docker-compose restart app

# Rebuild containers
docker-compose down
docker-compose up --build

# Clear volumes and start fresh
docker-compose down -v
docker-compose up -d
```

### Database issues
```bash
# Reset database
docker-compose down
docker volume rm wardrobe-builder_postgres_data
docker-compose up -d db
node server/importMaterials.js
```

### Tailwind CSS errors
- Ensure using v4 syntax: `@import "tailwindcss"`
- No `@apply` directives - use plain CSS
- Check `postcss.config.js` for proper Tailwind plugin

### HMR not working
- Check Vite logs: `docker-compose logs -f app`
- Verify file changes are detected
- Restart container: `docker-compose restart app`

## Deployment

### Local Development (Docker)

```bash
docker-compose up -d
# Access at: http://localhost:5173
```

**Services**:
- Frontend: http://localhost:5173
- API: http://localhost:3002 (maps to container port 3001)
- Database: localhost:5432

### Production (Vercel)

1. **Prerequisites**:
   - PostgreSQL database (Neon.tech recommended)
   - OpenRouter API key

2. **Deploy**:
   - Connected to GitHub: `scotthooker/wardrobebuilder`
   - Auto-deploys on push to `main` branch
   - Configure environment variables in Vercel dashboard

3. **Configuration files**:
   - `vercel.json`: Serverless routing configuration
   - `api/index.js`: Serverless function entry point
   - See `VERCEL_DEPLOYMENT.md` for full guide

### Database Migration

Database now contains both wardrobe and desk builds in PostgreSQL:

```sql
SELECT COUNT(*), furniture_type FROM builds GROUP BY furniture_type;
-- wardrobes: 11 pre-designed builds
-- desks: 7 example builds (Executive Office, Home Office Compact, Creative Workspace, etc.)
```

**Migration Script**:
```sql
-- Add furniture_type column (required for desk support)
ALTER TABLE builds ADD COLUMN IF NOT EXISTS furniture_type TEXT NOT NULL DEFAULT 'wardrobe';
CREATE INDEX IF NOT EXISTS idx_builds_furniture_type ON builds(furniture_type);
```

**Legacy files archived** (outside git):
- Location: `/Users/scotthooker/hardwoods/csv-archive/`
- 53 CSV files (materials, order lists, considerations, tools)
- 12 HTML files (static build previews)
- All data now in PostgreSQL, legacy files can be deleted

## Recent Updates

**Full TypeScript Migration + Component Library (Latest - November 2025)**:
- ✅ **Complete TypeScript migration**: All 65 source files converted from .js/.jsx to .ts/.tsx
- ✅ **Zero JavaScript files remaining**: Entire frontend codebase is now TypeScript
- ✅ **Strict mode enabled**: Full type safety with no @ts-ignore comments
- ✅ **Custom component library built**: 16 UI components with CVA variant management
  - Atomic: Button (8 variants), Input, Select, Badge, Card, Checkbox, Radio, Spinner, FormField
  - Molecule: ButtonGroup
  - Advanced: Modal, Drawer, Dropdown, ProgressStepper, Carousel
- ✅ **All components migrated**: 23 components updated to use new UI library
  - 11 wizard steps (wardrobe + desk)
  - 4 display components (BuildCard, BuildImageCarousel, Header, Footer)
  - 4 page components (BuildListPage, BuildDetailPage, BuilderPage, ComparePage)
  - 3 complex components (EditPanel, FurnitureBuilder, WardrobeBuilder)
  - 1 shared component (ExportButton)
- ✅ **All hooks converted**: useBuilds, useMaterials, useDoorsDrawers, useHardware, useSuppliers (all TypeScript)
- ✅ **All utilities converted**: configurationConverter, exportCSV, formatters, pricingCalculator (all TypeScript)
- ✅ **Store and models typed**: buildsStore, BuildModel, DeskModel with comprehensive interfaces
- ✅ **Theme system**: Centralized design tokens and animations in src/theme/
- ✅ **Path aliases configured**: @/, @/components, @/theme, @/lib for clean imports
- ✅ **Production build successful**: TypeScript compilation passes with zero errors
- ✅ **Dev server running**: Full HMR support maintained

**TypeScript Migration Details**:
- Converted files by category:
  - Main entry: main.tsx, App.tsx
  - Components: All .jsx → .tsx (23 components)
  - Hooks: All .js → .ts (6 hooks)
  - Utilities: All .js → .ts (4 utilities)
  - Models: All .js → .ts (2 models)
  - Store: buildsStore.js → buildsStore.ts
  - Constants: All .js → .ts (2 files)
- Type coverage: 100% (all files typed)
- Type assertions: Minimal use of `any`, only where structurally necessary
- Interface exports: Shared interfaces exported for cross-file usage

**AI Image Generation for All Furniture Types**:
- ✅ Enabled AI image generation for both wardrobes and desks
- ✅ Created furniture-type-specific prompt templates in `server/promptTemplate.js`:
  - `generateWardrobePrompt()`: Architectural visualization with doors, interior features, materials
  - `generateDeskPrompt()`: Home office photography with desk shape, base, storage, accessories
- ✅ Updated `imageGeneration.js` to detect furniture type and use appropriate templates
- ✅ Updated API endpoints (`/api/generate-prompt`) to accept `furnitureType` and `configuration`
- ✅ Updated EditPanel to send furniture type and configuration when generating prompts
- ✅ Added fallback prompt generation for both furniture types when AI fails
- ✅ Tested prompt generation with both desk and wardrobe builds successfully

**Desk Functionality**:
- ✅ Added full desk builder support with 5-step wizard
- ✅ Created unified FurnitureBuilder with furniture type selection (Step 0)
- ✅ Implemented desk-specific wizard steps (Dimensions, Layout, Storage, Accessories, Review)
- ✅ Created DeskModel class for desk cost calculations
- ✅ Added furniture_type column to builds table with 'wardrobe' default
- ✅ Implemented furniture type filtering on home page (All/Wardrobes/Desks)
- ✅ Added color-coded furniture type badges (blue for wardrobes, green for desks)
- ✅ Created configurationToDeskBuild converter for desk configurations
- ✅ Added desk constants (shapes, base types, storage, accessories) in deskSectionTypes.js
- ✅ Created 7 example desk builds (Executive Office, Home Office Compact, Creative Workspace, etc.)
- ✅ Added GET /api/builds/type/:type endpoint for filtering by furniture type
- ✅ Full Playwright test coverage for desk save flow

**Previous Updates**:
- ✅ Committed to GitHub: `github.com/scotthooker/wardrobebuilder`
- ✅ Added Vercel deployment configuration (serverless functions)
- ✅ Archived 65 legacy CSV/HTML files (all data migrated to PostgreSQL)
- ✅ Fixed EditPanel crash by checking `editedBuild.costs` exists
- ✅ BuildImageCarousel handles both string and array formats for `image_gallery`
- ✅ Improved edit drawer UX with lighter backdrop (20% opacity) and narrower width
- ✅ Enhanced button visibility with strong colors and borders
- ✅ Migrated from Tailwind v3 to v4 syntax
- ✅ Fixed Docker port exposure for frontend (5173)
- ✅ AI image generation fully integrated with gallery support
