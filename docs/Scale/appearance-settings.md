# Appearance Settings (Scale Plan)

This document captures the planned appearance settings work for the teacher
platform. We will revisit after curriculum is finalized.

## Goal

Persist per-user appearance preferences and apply them consistently across
sessions and devices.

## Proposed Preferences (v1)

- `theme`: `light | dark | system`
- `color_scheme`: `purple | blue | green | orange` (or expanded later)

## Storage Options

1. **Local-only (quick win)**
   - Save to `localStorage`.
   - Apply `data-theme` and `data-color` attributes on `html`/`body`.
   - Fast, but not synced across devices.

2. **Server-synced (preferred)**
   - Store on the preferences table tied to `auth.users.id`.
   - Load on session start and hydrate UI.
   - Syncs across devices and sessions.

## UI Notes

- Settings page should load stored values on mount.
- Changes should apply immediately (preview).
- Persist on "Save" or auto-save with debounce.

## Open Questions

- Should theme selection be global (all platforms) or teacher-platform only?
- Do we need more color schemes for branding or accessibility?
