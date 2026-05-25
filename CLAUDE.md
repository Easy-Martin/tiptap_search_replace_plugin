# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Tiptap V3+ search and replace plugin. Published as `tiptap_search_replace_plugin` on npm.

## Commands

| Command | Purpose |
|---------|---------|
| `pnpm install` | Install dependencies |
| `pnpm build` | Build library (tsc) |
| `pnpm dev` | Watch mode build (tsc --watch) |
| `pnpm demo:deploy` | Deploy React demo to GitHub Pages |

The demo React app lives under `demo/react/` — you must `cd` there and `pnpm install` separately to run it (`pnpm dev` in that directory).

## Architecture

The library has three source files in `lib/`:

- **`lib/index.ts`** — Tiptap `Extension.create()` that registers the ProseMirror plugin and exposes commands (`find`, `findNext`, `findPrevious`, `replace`, `replaceAll`, `openFindReplace`, `closeFindReplace`, `toggleFindReplace`). Commands dispatch actions via `tr.setMeta(findReplacePluginKey, { action })`. The extension also registers a keyboard shortcut (`Mod-f` by default, configurable via `openPanel` option) and emits a `findReplace:toggleFindReplace` event.

- **`lib/findReplacePlugin.ts`** — Core ProseMirror `Plugin` managing state (`query`, `matches`, `activeMatchIndex`, `isPanelOpen`). Renders highlight decorations using CSS classes `find-replace-highlight` (matches) and `find-replace-highlight-active` (current match). Handles `Escape` key to close the panel. Actions: `FIND`, `NAVIGATE`, `REPLACE`, `REPLACE_ALL`, `OPEN_PANEL`, `CLOSE_PANEL`.

- **`lib/util.ts`** — Exports `nextTick(fn)` (setTimeout 0 wrapper).

### Data flow

1. User action → Tiptap command (e.g., `find("text")`) → dispatches action via `tr.setMeta(findReplacePluginKey, { action })`
2. Plugin's `state.apply()` processes the action, recomputes matches, returns new state
3. Plugin's `decorations` prop reads state and returns `DecorationSet` with inline highlight decorations
4. `NAVIGATE` action scrolls to the active match and sets `TextSelection`

### Key details

- Match finding uses `doc.descendants()` to walk all text nodes, case-insensitive search
- Replace uses `tr.insertText()`; `replaceAll` processes matches in reverse order to avoid position drift
- Replace/close operations use `nextTick` to re-search after DOM update (avoids race conditions)
- No bundled CSS — consumers style `.find-replace-highlight` and `.find-replace-highlight-active` themselves

## Style

No tests yet. The `test` script in package.json is a placeholder.
