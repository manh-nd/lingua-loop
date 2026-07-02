# Lingua Loop

Lingua Loop is an English improvement system for Vietnamese professionals. It helps users improve workplace English through an Active Correction Loop: real writing and speaking moments are corrected, explained, saved as personal memory, and practiced later in new contexts.

Product documentation lives in `docs/`:

- [Product Direction](./docs/product.md)
- [Backlog](./docs/backlog.md)
- [Vietnamese Product Companion](./docs/vi/product.md)
- [Domain Glossary](./CONTEXT.md)

## Development

### Install

Use `pnpm`:

```bash
pnpm install
```

### Run locally

```bash
pnpm dev
```

### AI evaluations

Prompt evaluation scripts:

```bash
pnpm eval:message
pnpm eval:explanation
```

### Checks

```bash
pnpm typecheck
pnpm lint
pnpm test
```
