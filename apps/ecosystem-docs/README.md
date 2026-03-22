# Deprecated: ecosystem-docs pages tree

This folder previously held draft MDX for a standalone Nextra site. **It is not a runnable app** (no `package.json` here).

Canonical documentation now lives in the monorepo’s Nextra app:

- **App:** `apps/docs` (`@repo/docs`)
- **Content root:** `apps/docs/content/`
- **Architecture hub:** `apps/docs/content/index.mdx`

Run locally:

```bash
pnpm --filter @repo/docs dev
```

The old `pages/` tree here is obsolete; edit MDX under `apps/docs/content/` instead.
