# Contributing

Thanks for helping improve Catan Dice Tracker.

## Development

```bash
npm install
npm run dev
```

Before opening a pull request:

```bash
npm run typecheck
npm run build
```

## Pull requests

Keep pull requests focused and explain:

- what changed
- why it changed
- how it was tested
- whether the change affects persisted data

For UI changes, include screenshots or a short recording when practical.

## Engineering principles

Prefer:

- strict TypeScript
- small focused components
- reusable hooks for browser APIs
- local-first storage
- accessible controls
- touch-friendly UI
- mobile-first responsive behavior

Avoid introducing cloud dependencies for functionality that can remain local.

## Commit messages

Use clear, action-oriented commits:

```text
feat: add heat map statistics
fix: prevent duplicate active games
refactor: simplify roll persistence
docs: improve installation guide
```

## Scope discipline

The core product is intentionally small. New features should justify additional complexity and preserve the fast table workflow.
