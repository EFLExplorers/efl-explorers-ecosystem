# Teachers Platform UI — Theme & Dark/Light Mode Audit

**Date:** 2025-03-10  
**Purpose:** Ensure dark/light mode and color variants don't break the UI. Identify risks and fix recommendations.

---

## 1. How the Theme System Works

### Architecture

- **Data attributes on `<html>`**: `data-theme` (`light` | `dark`) and `data-color` (`purple` | `blue` | `green` | `orange`)
- **Storage**: `localStorage` keys `efl.teacher.appearance.theme` and `efl.teacher.appearance.color`
- **Bootstrap**: `AppearanceBootstrap` in `_app.tsx` runs `applyAppearance()` in `useEffect` on mount
- **Settings**: Theme and color picker in `pages/dashboard/settings.tsx` (Appearance tab)

### CSS Variable Cascade

| Layer | Selector | What it overrides |
|-------|----------|-------------------|
| Base | `:root` | Default dark theme values (background, text, sidebar, etc.) |
| Theme | `:root[data-theme="light"]` | Light-specific surfaces, text, sidebar |
| Color | `:root[data-color="purple"]` etc. | Primary, accent, ring, `text-secondary`, `text-muted` |

**Important:** Color blocks come *after* theme blocks in `variables.css`. So when both `data-theme="light"` and `data-color="purple"` are set, the color block **overrides** `--text-secondary` and `--text-muted` with purple-tinted values (`#c4b5fd`, `#ddd6fe`) that were designed for dark backgrounds. In light mode this can cause **low contrast** (light purple on white).

---

## 2. Critical Issues

### 2.1 Undefined CSS Variables

These variables are **used but not defined** in `variables.css`:

| Variable | Used in | Impact |
|----------|---------|--------|
| `--muted` | `Chart.module.css` (lines 33, 37), `Menubar.module.css` (line 194) | Chart tooltip/background and menubar separator render with no/transparent fill |
| `--color-border` | `Chart.module.css` (line 99) | Chart indicator border may be broken |
| `--color-bg` | `Chart.module.css` (line 100) | Chart indicator background may be broken |

**Fix:** Add `--muted` to `variables.css` (e.g. `--muted: var(--theme-muted);` or a dedicated value). Add `--color-border` and `--color-bg` or replace with existing vars like `--border` and `--card`.

### 2.2 Tailwind Config Mismatch

`tailwind.config.ts` expects **HSL** variables that don't exist:

- `--background`, `--foreground`
- `--popover`, `--popover-foreground`
- `--muted`
- `--chart-1` through `--chart-5`

`variables.css` uses **hex** values and different names (`--theme-background`, `--card`, etc.). Any Tailwind classes like `bg-background`, `text-foreground`, `bg-muted` would resolve to invalid CSS.

**Current state:** The app appears to rely on **CSS Modules + `var()`** rather than Tailwind color utilities, so this may not be actively breaking things. If you add Tailwind color classes later, they will fail unless you either:

- Define the expected variables in `variables.css`, or
- Update `tailwind.config.ts` to map to your actual variables (e.g. `background: "var(--theme-background)"`).

### 2.3 Light Mode + Color Variant: Text Contrast

In light mode, `--text-secondary` and `--text-muted` are overridden by the color scheme with values tuned for dark backgrounds:

- Purple: `#c4b5fd`, `#ddd6fe`
- Blue: `#93c5fd`, `#bfdbfe`
- Green: `#86efac`, `#bbf7d0`
- Orange: `#fdba74`, `#fed7aa`

On a light background (`#f8fafc`, `#ffffff`), these can have poor contrast.

**Fix options:**

1. **Theme-aware color blocks**: Use compound selectors so color variants only override `text-secondary` / `text-muted` in dark mode:
   ```css
   :root[data-theme="dark"][data-color="purple"] {
     --text-secondary: #c4b5fd;
     --text-muted: #ddd6fe;
   }
   :root[data-theme="light"][data-color="purple"] {
     /* Keep neutral grays or use darker purple tints */
     --text-secondary: #5b21b6;
     --text-muted: #6b21a8;
   }
   ```
2. **Don't override text in color blocks**: Let `--text-secondary` and `--text-muted` be theme-only; use color variants only for primary/accent/ring.

### 2.4 Default :root vs Dark Theme

The base `:root` block (lines 1–88) defines what looks like a **dark** theme. The `:root[data-theme="dark"]` block only sets `color-scheme: dark` and does not override variables. So dark mode correctly uses the base values.

When neither `data-theme` nor `data-color` is set (e.g. before `AppearanceBootstrap` runs), the page uses these base values. There is a potential **flash** on first load if the user's stored preference differs from the default.

---

## 3. Hardcoded Colors (Theme-Breaking)

These files use **hardcoded hex/rgba** instead of CSS variables. They will **not** respond to theme or color changes:

### High impact (visible UI)

| File | Lines | Colors | Use case |
|------|-------|--------|----------|
| `materials.module.css` | 239, 247, 251, 551–552, 561–562, 841, 845, 894 | Blue, green, gray, red, black | Status badges, links, error states |
| `messages.module.css` | 185–186, 190, 448, 452, 456–457, 461, 465–466, 470 | Red, white, amber | Message states, error/warning |
| `bookmarks.module.css` | 185, 389, 397, 433, 444, 515, 529, 603, 607 | Yellow, blue, green, red | Status indicators, actions |
| `students.module.css` | 174–175, 179, 192–193, 197, 201–202, 206 | Green, amber, red | Status badges |
| `settings.module.css` | 286–302, 384–396 | Green, red, purple, blue, green, orange | Success/error feedback, color swatches |
| `dashboard.module.css` | 125, 141 | Green | Stats/success |
| `TasksCard.module.css` | 75, 79 | Red, orange | Priority/status |
| `UpcomingClassesCard.module.css` | 72–76, 88–92, 104–108, 112–116 | Amber, green, red | Class status |
| `AnnouncementsCard.module.css` | 79–93 | Red, amber | Announcement types |
| `lessons.module.css` | 303–308 | Green | Status |
| `curriculum.module.css` | 331–332, 337 | Green | Status |
| `calendar.module.css` | 256–257, 261–262, 350, 354 | Amber, red, orange, blue | Event types |
| `404.module.css` | 32 | Red | Error link |
| `Toast.module.css` | 155, 159 | Red-tinted rgba | Destructive toast text |

### Lower impact (overlays, shadows)

- `rgba(0, 0, 0, 0.8)` for modal/drawer/sheet backdrops — acceptable; usually theme-agnostic
- `rgb(0 0 0 / 0.1)` etc. for box-shadows — generally fine

### Recommended replacements

| Semantic use | Replace with |
|--------------|--------------|
| Success (green) | `var(--success)` or `color-mix(in srgb, var(--primary) 80%, green)` — add `--success` if needed |
| Error/destructive | `var(--destructive)` and `var(--destructive-foreground)` |
| Warning (amber) | Add `--warning` and `--warning-foreground` to variables |
| Info (blue) | Add `--info` or use `var(--primary)` when blue scheme |
| Neutral gray | `var(--text-muted)` or `var(--theme-muted)` |

---

## 4. Components Using Theme Variables Correctly

These components rely on `var(--*)` and will respond to theme/color changes:

- **Layout**: `TeacherLayout`, `Sidebar`, `TeacherHeader`
- **UI primitives**: `Button`, `Card`, `Input`, `Select`, `Tabs`, `Switch`, `Toast`, `Dialog`, `Sheet`, `Popover`, `DropdownMenu`, `ContextMenu`, `Table`, `Pagination`, `Badge`, `Avatar`, `Alert`, `Form`, `Breadcrumb`, `Calendar`, `Command`, etc.
- **Dashboard cards**: `StatsCard`, `TasksCard` (partial — some hardcoded), `UpcomingClassesCard` (partial), `AnnouncementsCard` (partial), `PerformanceCard`

---

## 5. Suggested Fix Order

1. **Add missing variables** (`--muted`, fix Chart `--color-*`) — quick win, prevents invisible/broken elements.
2. **Light-mode text contrast** — adjust color blocks so `text-secondary` / `text-muted` stay readable in light mode.
3. **Replace hardcoded colors** — start with high-traffic pages (materials, messages, students, dashboard cards).
4. **Align Tailwind config** — either define the expected variables or update the config to match your design tokens.
5. **Optional: reduce flash** — inline a small script in `<head>` to set `data-theme` and `data-color` before first paint, using `localStorage`.

---

## 6. Quick Reference: Theme Variables

| Variable | Dark (default) | Light override |
|----------|----------------|----------------|
| `--theme-background` | `#211534` | `#f8fafc` |
| `--theme-foreground` | `#32184a` | `#ffffff` |
| `--theme-muted` | `#3a1f56` | `#e2e8f0` |
| `--text-primary` | `#ffffff` | `#111827` |
| `--text-secondary` | (from color) | (from color — **watch contrast**) |
| `--text-muted` | (from color) | (from color — **watch contrast**) |
| `--card` | `#ffffff` | `#ffffff` |
| `--card-foreground` | `#32184a` | `#111827` |
| `--sidebar` | `#211534` | `#ffffff` |

---

## 7. Related Docs

- [Appearance Settings (Scale)](../../../Scale/appearance-settings.md)
- [Teacher Platform Styles](./styles.md)
