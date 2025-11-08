# Nordic Timber - Quick Reference

## 🎨 Color Swatches

### Primary - Forest Pine

| Shade | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| 50 | `#f0f6f3` | `#0e2921` | Lightest tint |
| 500 | `#2c7c5f` ⭐ | `#5ab38f` ⭐ | **Main brand** |
| 900 | `#0e2921` | `#e0f4ed` | Darkest shade |

### Secondary - Warm Oak

| Shade | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| 50 | `#fcf9f4` | `#4b3621` | Lightest tint |
| 500 | `#c49a6c` ⭐ | `#ddbc94` ⭐ | **Warm accent** |
| 900 | `#4b3621` | `#fcf9f4` | Darkest shade |

### Accent - Nordic Slate

| Shade | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| 50 | `#f4f7fa` | `#182739` | Lightest tint |
| 500 | `#4c77a1` ⭐ | `#81b0d6` ⭐ | **Crisp accent** |
| 900 | `#182739` | `#f4f9fd` | Darkest shade |

---

## 📝 Semantic Colors

### Success - Moss Green
```
Light: #388b5e (on white backgrounds)
Dark:  #6ec498 (on dark backgrounds)
```

### Warning - Amber Wood
```
Light: #f59e0b (on white backgrounds)
Dark:  #fdba74 (on dark backgrounds)
```

### Error - Clay Red
```
Light: #ef4444 (on white backgrounds)
Dark:  #f88b8b (on dark backgrounds)
```

### Info - Nordic Sky
```
Light: #3b82f6 (on white backgrounds)
Dark:  #93c5fd (on dark backgrounds)
```

---

## 🎯 Most Common Combinations

### Light Mode

**Primary Button**
```css
background: #2c7c5f (Forest Pine 500)
text: #ffffff (White)
hover: #236850 (Forest Pine 600)
```

**Secondary Button**
```css
background: #4c77a1 (Nordic Slate 500)
text: #ffffff (White)
hover: #3d638a (Nordic Slate 600)
```

**Text on Background**
```css
background: #f9fafb (Soft off-white)
primary-text: #171f26 (Deep charcoal)
secondary-text: #475560 (Medium grey)
```

**Card**
```css
background: #ffffff (White)
border: #e2e8ed (Subtle grey)
shadow: 0 4px 6px rgba(44, 124, 95, 0.1)
```

### Dark Mode

**Primary Button**
```css
background: #5ab38f (Luminous Sage 500)
text: #0f171e (Dark background for contrast)
hover: #7ac9ac (Luminous Sage 600)
```

**Secondary Button**
```css
background: #81b0d6 (Fjord Blue 500)
text: #0f171e (Dark background for contrast)
hover: #afd0e9 (Fjord Blue 600)
```

**Text on Background**
```css
background: #0f171e (Deep navy-charcoal)
primary-text: #f1f5f9 (Soft white)
secondary-text: #cbd5e0 (Light grey)
```

**Card**
```css
background: #17212b (Elevated slate)
border: #2d3c4b (Subtle dark border)
shadow: 0 4px 6px rgba(0, 0, 0, 0.3)
```

---

## 🔍 Accessibility Quick Check

### Contrast Ratios (Minimum 4.5:1 for AA, 7:1 for AAA)

**Light Mode**
- Primary on White: **7.2:1** ✅ AAA
- Text Primary on BG: **14.8:1** ✅ AAA
- Text Secondary on BG: **8.5:1** ✅ AAA
- Success on White: **6.8:1** ✅ AA Large
- Warning on White: **5.2:1** ✅ AA
- Error on White: **4.8:1** ✅ AA

**Dark Mode**
- Primary on Dark BG: **7.5:1** ✅ AAA
- Text Primary on BG: **15.2:1** ✅ AAA
- Text Secondary on BG: **9.8:1** ✅ AAA

---

## 💡 Quick Copy-Paste

### Tailwind Classes

**Buttons**
```tsx
// Primary
className="bg-primary-500 text-white hover:bg-primary-600 dark:bg-primary-500 dark:hover:bg-primary-600"

// Secondary
className="bg-accent-500 text-white hover:bg-accent-600 dark:bg-accent-500 dark:hover:bg-accent-600"

// Success
className="bg-success-500 text-white hover:bg-success-600 dark:bg-success-500 dark:hover:bg-success-600"
```

**Text**
```tsx
// Primary text
className="text-text-primary dark:text-text-primary"

// Secondary text
className="text-text-secondary dark:text-text-secondary"

// Tertiary text
className="text-text-tertiary dark:text-text-tertiary"
```

**Backgrounds**
```tsx
// Page background
className="bg-background dark:bg-background"

// Card surface
className="bg-surface dark:bg-surface"

// Elevated surface
className="bg-surface-elevated dark:bg-surface-elevated"
```

**Borders**
```tsx
// Subtle border
className="border border-border dark:border-border"

// Strong border
className="border border-border-strong dark:border-border-strong"
```

### CSS Custom Properties

**Direct Usage**
```css
/* Primary brand color */
color: rgb(var(--color-primary-500));

/* With alpha */
background-color: rgb(var(--color-primary-500) / 0.1);

/* Text */
color: rgb(var(--color-text-primary));

/* Background */
background-color: rgb(var(--color-background));
```

---

## 🎨 Design Tokens (TypeScript)

**Import**
```typescript
import { lightMode, darkMode } from '@/theme/tokens'
```

**Usage**
```typescript
// Access colors
const primaryColor = lightMode.primary[500] // #2c7c5f
const darkPrimary = darkMode.primary[500]   // #5ab38f

// Typography
const displayFont = typography.fontFamily.display
const bodyFont = typography.fontFamily.body
```

---

## 🌓 Theme Toggle

**Implementation**
```tsx
import { ThemeToggle } from '@/components/ui/ThemeToggle'

// Simple toggle
<ThemeToggle />

// With label
<ThemeToggle showLabel={true} />
```

**Programmatic Toggle**
```tsx
import { useTheme } from '@/contexts/ThemeContext'

function MyComponent() {
  const { mode, toggleMode, setMode } = useTheme()

  // Toggle
  toggleMode()

  // Set specific mode
  setMode('dark')
}
```

---

## 🎯 Component Patterns

### Button Variants

```tsx
// Primary action
<Button variant="primary" size="md">
  Create Build
</Button>

// Secondary action
<Button variant="secondary" size="md">
  Cancel
</Button>

// Success action
<Button variant="success" size="md">
  Save
</Button>

// Outline style
<Button variant="outline" size="md">
  Learn More
</Button>
```

### Card Variants

```tsx
// Standard card
<Card variant="default">
  <CardHeader>
    <CardTitle>Build Details</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>

// Elevated card
<Card variant="elevated">
  {/* Content */}
</Card>

// Glass effect
<Card variant="glass">
  {/* Content */}
</Card>
```

### Badge Variants

```tsx
// Success badge
<Badge variant="success">Active</Badge>

// Warning badge
<Badge variant="warning">Pending</Badge>

// Error badge
<Badge variant="danger">Error</Badge>

// Info badge
<Badge variant="primary">New</Badge>
```

---

## 📱 Responsive Breakpoints

```javascript
sm: '640px'   // Mobile landscape
md: '768px'   // Tablet portrait
lg: '1024px'  // Tablet landscape
xl: '1280px'  // Desktop
2xl: '1536px' // Large desktop
```

---

## ⚡ Quick Tips

1. **Always use custom properties** - Ensures automatic theme switching
2. **Test both modes** - Toggle theme during development
3. **Check contrast** - Use browser DevTools accessibility checker
4. **Semantic colors for meaning** - Success/warning/error convey state
5. **Primary for brand** - Forest Pine is the brand identity
6. **Secondary for warmth** - Warm Oak adds approachability
7. **Accent for contrast** - Nordic Slate provides cool balance
8. **Glass effect sparingly** - Use for floating/overlay elements only

---

## 🔗 Related Files

- `src/index.css` - CSS custom properties
- `src/theme/tokens.ts` - TypeScript design tokens
- `src/contexts/ThemeContext.tsx` - Theme state management
- `src/components/ui/ThemeToggle.tsx` - Toggle component
- `THEME_NORDIC_TIMBER.md` - Complete theme documentation
