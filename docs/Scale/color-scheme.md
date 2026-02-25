# Color Scheme System (Teacher Platform)

This document describes the theme + color-scheme system used by the teacher
platform and how to extend it safely.

## Goal

Provide consistent theming across all components with:

- Light and Dark modes
- Four color schemes: purple, blue, green, orange
- Single source of truth via CSS variables

## How It Works

The root element exposes two data attributes:

- `data-theme="light|dark"`
- `data-color="purple|blue|green|orange"`

These attributes control CSS variables in:

- `apps/teacher-platform/src/styles/variables.css`

The theme and color scheme are applied on app load in:

- `apps/teacher-platform/src/pages/_app.tsx`
- `apps/teacher-platform/src/utils/appearance.ts`

## Primary Tokens

These tokens define the accent color used by buttons, highlights, and rings:

- `--primary`
- `--primary-foreground`
- `--primary-light`
- `--secondary`
- `--accent`
- `--ring`

## Base Theme Tokens

These define the layout contrast and typography:

- `--theme-background`
- `--theme-foreground`
- `--theme-muted`
- `--text-primary`
- `--text-secondary`
- `--text-muted`
- `--card`
- `--card-foreground`
- `--border`
- `--input`

## Sidebar Tokens

Sidebar-specific colors inherit from the scheme:

- `--sidebar`
- `--sidebar-background`
- `--sidebar-foreground`
- `--sidebar-primary`
- `--sidebar-accent`
- `--sidebar-ring`

## Component Guidance

To ensure schemes apply consistently:

- Use CSS variables in components instead of hard-coded colors.
- Prefer semantic tokens (`--primary`, `--text-primary`, `--border`, etc.).
- Avoid hex values inside component styles unless they are structural neutrals.

## Extending the System

To add a new scheme:

1. Add a new `:root[data-color="..."]` block in `variables.css`.
2. Set the primary tokens for that scheme.
3. Ensure the sidebar tokens remain readable (contrast check).

To add a new theme mode:

1. Add `:root[data-theme="..."]` overrides in `variables.css`.
2. Update appearance options in `settings.tsx`.
3. Optionally add a `color-scheme` declaration for native inputs.

## Recommendation

Current UI leans blue because many components use fixed colors. For best
results, keep colors semantic and funnel through the tokens above so all
components respond to the scheme uniformly.
