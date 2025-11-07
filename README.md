# Wardrobe Builder - React SPA

A modern, interactive web application for exploring, comparing, and exporting 11 premium custom wardrobe builds. Built with React, Vite, Tailwind CSS, and Zustand.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

## 📦 Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## ✨ Features

### Core Functionality
- **11 Premium Builds** - Browse curated wardrobe designs with detailed specifications
- **Interactive Selection** - Select multiple builds for side-by-side comparison
- **Real-time Pricing** - Dynamic cost calculations using inheritance model
- **Export Options** - Export to CSV or JSON with full cost breakdowns
- **Responsive Design** - Works perfectly on mobile, tablet, and desktop

### Technical Highlights
- **JSON-based Configuration** - Easy to update pricing and builds
- **Inheritance Model** - Base config shared across all builds (DRY principle)
- **BuildModel Class** - Encapsulates all cost calculations and logic
- **Zustand State Management** - Lightweight, performant global state
- **Code Splitting** - Optimized bundle sizes with vendor chunking
- **TypeScript-ready** - JSDoc annotations throughout

## 📁 Project Structure

```
wardrobe-builder/
├── public/
│   ├── data/
│   │   ├── base-config.json          # Shared hardware, doors, defaults
│   │   ├── pricing-data.json         # Material pricing from scraper
│   │   └── builds/
│   │       ├── build-01.json         # Individual build configs
│   │       └── ...
│   └── generated_images/             # AI-generated mockups
│
├── src/
│   ├── components/
│   │   ├── layout/                   # Header, Footer
│   │   ├── builds/                   # BuildCard, BuildDetail
│   │   ├── shared/                   # ExportButton, etc.
│   │   └── ui/                       # Reusable UI components
│   │
│   ├── models/
│   │   └── BuildModel.js             # Core business logic
│   │
│   ├── hooks/
│   │   └── useBuilds.js              # Data loading hooks
│   │
│   ├── store/
│   │   └── buildsStore.js            # Zustand global state
│   │
│   ├── pages/
│   │   └── BuildListPage.jsx         # Main page
│   │
│   ├── utils/
│   │   ├── exportCSV.js              # Export utilities
│   │   ├── formatters.js             # Display formatting
│   │   └── pricingCalculator.js      # Comparison logic
│   │
│   └── App.jsx                       # Root component with routing
│
├── package.json
├── vite.config.js                    # Build configuration
├── tailwind.config.js                # Styling configuration
└── DEPLOYMENT.md                     # Deployment guide
```

## 🔧 Configuration

### Update Pricing

Edit `public/data/base-config.json`:

```json
{
  "hardware": {
    "hinges": { "qty": 12, "unitPrice": 8.00, ... }
  },
  "professionalDoors": {
    "largeDoors": { "qty": 4, "unitPrice": 123.84, ... }
  }
}
```

### Add New Build

1. Create `public/data/builds/build-12.json`
2. Update loop in `src/hooks/useBuilds.js` (line 25):
   ```js
   for (let i = 1; i <= 12; i++) { // Change from 11 to 12
   ```

### Material Pricing

Update `public/data/pricing-data.json` or re-run the scraper from parent directory.

## 📊 Build Statistics

**Bundle Sizes (gzipped):**
- Main bundle: ~63KB
- React vendor: ~15.5KB
- Data vendor: ~7.5KB
- UI vendor: ~1.5KB
- CSS: ~4.5KB
- **Total**: ~93KB

**Features:**
- 11 builds with full details
- Real-time cost calculations
- Export to CSV/JSON
- Responsive design
- Optimized images

## 🎨 Customization

### Colors

Edit `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: { 600: '#your-color' }
    }
  }
}
```

### Branding

- Header: `src/components/layout/Header.jsx`
- Footer: `src/components/layout/Footer.jsx`
- Title/Meta: `index.html`

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**

```bash
npm run build
# Drag dist/ to https://app.netlify.com/drop
```

## 🏗️ Architecture

### Data Inheritance Model

```
base-config.json
    ↓
BuildModel (merges with build-specific data)
    ↓
Calculated costs, timeline, difficulty
    ↓
React components
```

### State Flow

```
JSON files → useBuilds() → Zustand store → React components
```

### Cost Calculation

```javascript
BuildModel.calculateCosts() {
  Materials (from pricing-data.json)
  + Doors/Drawers (from base-config)
  + Hardware (from base-config)
  + Extras (build-specific)
  = Grand Total
}
```

## 📝 Development

### Adding a Feature

1. Create component in `src/components/`
2. Add route in `src/App.jsx`
3. Update state in `src/store/buildsStore.js` if needed
4. Test with `npm run dev`

### Code Style

- Functional components with hooks
- Named exports for components
- JSDoc comments for complex functions
- Tailwind for styling (no CSS modules)

## 🧪 Testing

```bash
# Build and preview
npm run build && npm run preview
```

## 📖 API Reference

### BuildModel

```javascript
const build = new BuildModel(buildConfig, baseConfig, pricingData);

// Update methods
build.updateMaterial('carcass18mm', { sheets: 15 });
build.addExtra('newItem', { desc: 'Description', estimate: 100 });

// Export methods
build.toJSON();
build.toCSVRow();
build.clone(12, 'New Build Name');
```

### Zustand Store

```javascript
const {
  builds,              // All BuildModel instances
  selectedBuildIds,    // Array of selected IDs
  toggleBuildSelection,// Select/deselect
  startEditing,        // Open edit panel
  exportState          // Get full state
} = useBuildsStore();
```

## 🤝 Contributing

This is a personal project, but feel free to:
- Report issues
- Suggest improvements
- Fork and customize

## 📄 License

Private project - All rights reserved

## 🙏 Credits

- Built with [React](https://react.dev/)
- Powered by [Vite](https://vite.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)
- State by [Zustand](https://zustand-demo.pmnd.rs/)

---

**Built with ❤️ for custom wardrobe enthusiasts**
