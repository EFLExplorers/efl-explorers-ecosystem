# UI Package

## Purpose

`@repo/ui` provides a small set of shared UI primitives that can be reused by
apps in the monorepo.

## Exports

The package uses a simple export map (`"./*": "./src/*.tsx"`). Example usage:

```tsx
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Code } from "@repo/ui/code";
```

### Components

- `Button` — Basic button with a demo alert handler.
- `Card` — Linked card component with default UTM params.
- `Code` — Inline code wrapper.

## Notes

- Components are intentionally minimal and app-agnostic.
- Styling is owned by consuming apps (CSS modules).
