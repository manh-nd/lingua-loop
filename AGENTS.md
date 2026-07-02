<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Lingua Loop

Lingua Loop is an English improvement system for Vietnamese professionals, built around the Active Correction Loop.

## Product Documentation

Product direction lives under `docs/`:

- [Product Direction](./docs/product.md)
- [Backlog](./docs/backlog.md)
- [Vietnamese Product Companion](./docs/vi/product.md)
- [Domain Glossary](./CONTEXT.md)

## Project Environment

- **Package Manager**: `pnpm`
- **Next.js & React versions**: Next.js 16 and React 19.
- **Default AI Model**: `gemini-3.1-flash-lite` (Free tier limits: 15 RPM, 250K TPM 500 RPD)

## Framework Constraints

- **Client-Side Navigation Optimization**: If fixing slow client-side navigations, `Suspense` alone is not enough. You must also export `unstable_instant` from the route. Read `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.mdx` before making navigation changes.

## Agent Guidelines

Specific guidelines for development, tracking, and domain conventions:

- [Development Quickstart & Commands](./docs/agents/development.md)
- [Local Issue Tracking & Triage](./docs/agents/issue-tracking.md)
- [Domain & Architecture Conventions](./docs/agents/domain-conventions.md)
- [UI & Component Conventions](./docs/agents/ui-conventions.md)
