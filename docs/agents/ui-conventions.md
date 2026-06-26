# UI & Component Conventions

Guidelines for building UI interfaces, adding components, and choosing icons in this codebase.

## UI Components

- **Component Library**: Use **shadcn/ui** for UI components.
- **Configuration**: Standard configuration is defined in `components.json`.
- **Custom Components**: Place custom reusable components in `src/components/ui/` or `src/components/`.

## Icon Library

- **Icons**: Always use **`lucide-react`** for icons.
- **Constraint**: Do not import or install other icon libraries (such as `@phosphor-icons/react` or FontAwesome) to avoid dependency bloat and visual inconsistency.

## Shadcn MCP & Skill Tools

When adding, configuring, or updating UI components, use the following tools:

1. **`shadcn` MCP Server**: Use the available MCP tools to manage components:
   - Discover registries: `get_project_registries`
   - Search/View components: `search_items_in_registries` and `view_items_in_registries`
   - Install components: Use `get_add_command_for_items` to generate the correct installation command rather than writing files manually.
2. **`shadcn` Skill**: Trigger and follow `.agents/skills/shadcn/SKILL.md` when designing, styling, or composing UI components.
3. **Audit Verification**: Always call the `get_audit_checklist` tool from the shadcn MCP server to run a quality audit (checking accessibility, HSL variable mappings, type safety) before finalizing any UI modifications.
