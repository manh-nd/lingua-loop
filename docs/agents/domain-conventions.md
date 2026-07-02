# Domain & Architecture Conventions

Conventions for domain modeling, architectural consistency, and language constraints in this codebase.

## Domain Documentation Exploration

When exploring the codebase or preparing a task, consult these files for context:

- **`CONTEXT.md`** at the repo root: Defines the core domain language.
- **`docs/product.md`**: Defines the current product direction and roadmap phases.
- **`docs/adr/`**: Contains Architectural Decision Records (ADRs) under `docs/adr/*.md` that touch your area of work.

### Repository Structure

This repository uses a single-context domain layout:

```
/
├── CONTEXT.md
├── docs/adr/                  ← Architectural Decision Records (ADRs)
└── src/
```

## Glossary Vocabulary

Always use the domain terminology defined in `CONTEXT.md`. Avoid synonyms that are explicitly marked to be avoided (e.g., use `Correction Workspace` instead of standalone `Message Coach` or `Explanation Coach` when describing the current product direction).

If a concept is not yet defined in the glossary, design updates using the `/domain-modeling` skill to resolve and record new terms.

## Flagging ADR Conflicts

If a proposed change or output contradicts an existing ADR, surface the conflict explicitly rather than silently overriding it.

_Example format:_

> _Contradicts ADR-0001 (Stage Writing Workflows Before Reading, Memory, and Review) — but worth reopening because [rationale]..._
