# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Application Overview

**Wardrobe Builder** is a full-stack web application for designing, visualizing, and comparing custom built-in wardrobes. The app combines:

- **Static Build Viewer**: Browse 11 pre-designed wardrobe builds with detailed cost breakdowns
- **Interactive Wizard**: Create custom wardrobe configurations with a 5-step builder
- **AI Image Generation**: Generate photorealistic wardrobe visualizations using AI
- **Material Management**: Database-backed material pricing and options
- **Export Capabilities**: Export builds to CSV/JSON for comparison

**Tech Stack**:
- **Frontend**: React 18 + Vite + Tailwind CSS v4 + Zustand
- **Backend**: Express + Node.js
- **Database**: PostgreSQL 16
- **AI**: OpenRouter API (Gemini/GPT models)
- **Deployment**: Docker Compose (dev environment)

## Development Commands

```bash
# Docker Development (Recommended)
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

# Image regeneration
node scripts/regeneratePromptsAndImages.js  # Regenerate AI prompts and images for all builds

# Product scraping (Python)
source venv/bin/activate          # Activate Python virtual environment
npm run scrape                    # Scrape product data from external site
npm run scrape:quick              # Quick scrape (2 pages max)
npm run scrape:headless           # Scrape without browser UI

# Production
npm run build                     # Build for production
npm run preview                   # Preview production build
npm run lint                      # Run ESLint
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
   - Interactive 5-step wizard for creating custom wardrobes
   - PostgreSQL database for persistent storage
   - Express API at `http://localhost:3001` (or `http://localhost:3002` in Docker)
   - Material pricing from `materials` and `material_options` tables
   - AI-powered prompt and image generation via OpenRouter

### Technology Stack Details

**Frontend**:
- **React 18**: Functional components with hooks
- **Vite**: Build tool with HMR (Hot Module Replacement)
- **Tailwind CSS v4**: Utility-first styling (uses `@import "tailwindcss"` syntax)
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

The `WardrobeBuilder` component implements a 5-step wizard:

1. **DimensionsStep**: Set overall width, height, depth
2. **CarcassLayoutStep**: Define vertical sections and carcass heights with material selection
3. **InteriorDesignStep**: Configure interior (rails, shelves, drawers) for each carcass
4. **DoorsDrawersStep**: Add door zones and external drawer configurations
5. **ReviewStep**: Summary and save to database

Each step updates the shared `configuration` object via `updateConfiguration()`.

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
- Fields: `id`, `name`, `character`, `image`, `costs_json`, `materials_json`, `extras_json`, `generated_image`, `generated_prompt`, `image_gallery`
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
GET  /api/builds/:id              # Get specific build
POST /api/builds                  # Create new build
PUT  /api/builds/:id              # Update build
DELETE /api/builds/:id            # Delete build
POST /api/generate-prompt         # Generate image prompt via AI (OpenRouter)
POST /api/generate-image          # Generate wardrobe image (OpenRouter)
POST /api/upload-image            # Upload image to gallery
```

### AI Image Generation

**Workflow**:
1. User edits a build in EditPanel
2. Click "Generate Design Prompt" → POST `/api/generate-prompt`
   - Sends build materials, hardware, dimensions to AI
   - AI generates detailed architectural visualization prompt
3. User can edit the prompt
4. Click "Generate Image" → POST `/api/generate-image`
   - Sends prompt to OpenRouter (Gemini 2.5 Flash Image model)
   - Receives base64-encoded image
   - Saves to `public/generated-images/{buildId}_{timestamp}.png`
   - Updates build record with `generated_image` and `generated_prompt`
5. Image displays in gallery carousel

**Models Used**:
- Prompt generation: `google/gemini-2.0-flash-exp:free`
- Image generation: `google/gemini-2.5-flash-image-preview`

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

### Cost Calculation (BuildModel)

The `BuildModel` class in `src/models/BuildModel.js` calculates:
1. **Material costs**: Sheets × price per sheet (from `pricing-data.json`)
2. **Professional doors/drawers**: From `base-config.json`
3. **Hardware**: Hinges, handles, rails (from `base-config.json`)
4. **Extras**: Build-specific additions
5. **Grand total**: Sum of all costs
6. **Savings**: Comparison vs £5,000 budget

The BuildModel uses an **inheritance pattern**: base-config.json provides defaults, individual builds override/extend.

## File Organization

**Critical directories**:
- `server/`: Express API, database logic, image generation
  - `server/db.js`: PostgreSQL queries and connection
  - `server/imageGeneration.js`: OpenRouter integration
  - `server/index.js`: Express routes and middleware
  - `server/init.sql`: Database schema
  - `server/importMaterials.js`: Material data seeding
- `src/components/builder/`: Wizard steps for creating wardrobes
- `src/components/editor/`: EditPanel for editing builds and generating images
- `src/components/`: BuildImageCarousel and other shared components
- `src/models/`: BuildModel business logic
- `public/data/`: JSON configuration files (base-config, pricing-data, builds)
- `public/generated-images/`: AI-generated wardrobe visualizations
- `scripts/`: Utilities for scraping, build generation, image regeneration

**Environment setup**:
- Create `.env` file with:
  - `DATABASE_URL=postgresql://wardrobe_user:wardrobe_password@localhost:5432/wardrobe_builder`
  - `OPENROUTER_API_KEY=sk-or-v1-...`
  - `VITE_API_URL=http://localhost:3001` (or `http://localhost:3002` for Docker)

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
- **Responsive**: Mobile-first design with breakpoint-specific utilities

### Data Handling
- **Gallery data**: Always parse defensively - API may return JSON string or array
- **Material thickness**: Account for panel thickness in dimension calculations (internal = external - thickness × 2)
- **Database naming**: PostgreSQL returns snake_case; API layer converts to camelCase for React
- **Door zones**: Doors span multiple carcasses via `startCarcass` and `endCarcass` indices
- **External drawers**: Marked with `isExternal: true` in interior sections; appear as drawer fronts instead of door panels

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

## Recent Updates

**Latest Changes**:
- ✅ Fixed EditPanel crash by checking `editedBuild.costs` exists
- ✅ BuildImageCarousel handles both string and array formats for `image_gallery`
- ✅ Improved edit drawer UX with lighter backdrop (20% opacity) and narrower width
- ✅ Enhanced button visibility with strong colors and borders
- ✅ Migrated from Tailwind v3 to v4 syntax
- ✅ Fixed Docker port exposure for frontend (5173)
- ✅ AI image generation fully integrated with gallery support
