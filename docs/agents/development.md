# Development Quickstart & Commands

This guide lists the scripts and commands available for building, typechecking, testing, and evaluating the Lingua Loop application.

## Development Scripts

Run these commands using `pnpm`:

### Core Tasks

- **Start Development Server**: `pnpm dev`
- **Build Production Bundle**: `pnpm build`
- **Typecheck Codebase**: `pnpm typecheck` (runs `tsc --noEmit`)

### Running Tests

- **Run All Tests**: `pnpm test`
- **Run Unit Tests**: `pnpm test:unit`
- **Run Contract Tests**: `pnpm test:contract`

### Running Workflow Evaluations

- **Evaluate Message Coach**: `pnpm eval:message`
- **Evaluate Explanation Coach**: `pnpm eval:explanation`
- **Evaluate Reading Coach**: `pnpm eval:reading`
