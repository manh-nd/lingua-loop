# UI & Component Conventions

Guidelines for building UI interfaces, adding components, and choosing icons in this codebase.

## UI Components

- **Component Library**: Use **shadcn/ui** for UI components.
- **Configuration**: Standard configuration is defined in `components.json`.
- **Custom Components**: Place custom reusable components in `src/components/ui/` or `src/components/`.

## Icon Library

- **Icons**: Always use **`lucide-react`** for icons.
- **Constraint**: Do not import or install other icon libraries (such as `@phosphor-icons/react` or FontAwesome) to avoid dependency bloat and visual inconsistency.
