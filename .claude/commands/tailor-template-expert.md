---
allowed-tools: Read, Glob(src/templates/**), Bash(bun run dev:vite:*), Edit, Write(src/templates/**/*), MultiEdit
description: Experimental | Template development workspace for creating and modifying React-PDF templates
---

# Template Development Expert Mode

Enter template development mode with full context for creating and modifying React-PDF templates in the `src/templates/` directory.

## What this command does:

1. **Establish Template Context**: Scan and analyze the current template architecture
2. **Start Vite Dev Server**: Launch live preview server for real-time template development
3. **Provide Expert Guidance**: Assist with template creation, modification, and optimization

## Process Flow:

### 1. Template Architecture Discovery

**Scan Current Structure**:
- Use Glob to discover all files in `src/templates/`
- Identify existing templates (modern/resume, modern/cover-letter, etc.)
- Map component organization and file structure

**Load Design System**:
- Read `src/templates/design-tokens.ts` for:
  - Color palette (primary, accent, darkGray, mediumGray, separatorGray)
  - Typography system (text, title, subtitle, small)
  - Spacing constants (columnWidth, documentPadding, pagePadding)
- Read `src/templates/fonts-register.ts` for available font families (Lato, Open Sans)

**Load React-PDF Documentation**:
- Reference `.claude/rpdf-context/components.md` for component APIs
- Reference `.claude/rpdf-context/styling.md` for CSS properties
- Reference `.claude/rpdf-context/fonts.md` for typography patterns
- Reference `.claude/rpdf-context/troubleshooting.md` for common issues

### 2. Start Development Server

**Launch Vite**:
- Run `bun run dev:vite` in background
- Provide server URL to user at http://localhost:3000
- Explain hot-reload capabilities for instant template preview

### 3. User Interaction

**Present Template Context**:
Display summary of:
- Available templates discovered
- Design system configuration
- Font families available
- React-PDF documentation available

**Prompt for Action**:
Ask user what they want to do:
- Create new template variant
- Modify existing template components
- Update design tokens
- Implement new layout patterns
- Refactor component structure
- Add new typography styles
- Fix rendering issues

**Common Modification Patterns**:
- Layout transformations (single to multi-column, sidebar implementations)
- Typography enhancements (font registration, hierarchy creation)
- Visual polish (color schemes, spacing systems, alignment)
- Component modularity improvements
- Responsive design implementations

## Critical Implementation Rules

### ❌ NEVER Use These:
- **`letterSpacing` prop**: Causes rendering issues in React-PDF Text components
  - Use font selection, fontSize adjustments, or layout spacing instead

### ✅ Always Use:
- **Design tokens**: Import from `@template-core/design-tokens.ts`
- **Registered fonts**: Use Lato or Open Sans families from `@template-core/fonts-register.ts`
- **StyleSheet.create()**: For performance optimization
- **Proper component hierarchy**: Document → Page → View/Text
- **Project conventions**: Follow patterns in existing templates

## Design System Integration

All template modifications should:
- Use centralized design tokens for consistency
- Follow established typography hierarchy
- Maintain responsive design patterns
- Leverage registered font families
- Create modular, reusable components

## Development Workflow

1. **Make changes** to template components
2. **Save files** to trigger hot-reload
3. **Check browser** for instant preview
4. **Iterate** based on visual feedback
5. **Test** with different data scenarios

## CRITICAL: Post-Edit Validation

**IMPORTANT**: After making ANY changes to template files in `src/templates/`, you MUST:

1. Use `BashOutput` tool to check the Vite dev server output for compilation errors
2. Look for messages like "✓ built in Xms" (success) or error stack traces (failure)
3. If compilation fails, the error message will show exactly which files have TypeScript errors, import issues, or React-PDF syntax problems
4. Fix compilation errors immediately before proceeding

**Why this matters**: The Vite dev server compiles all template changes in real-time. If compilation fails, the browser preview won't update and the user won't see your changes. Always verify your modifications compiled successfully by checking the server output.

## Scope

**Can modify**:
- Any files in `src/templates/` directory
- Template components (resume, cover-letter)
- Shared template utilities
- Design tokens and styling
- Font configurations

**Cannot modify**:
- Files outside `src/templates/`
- Source data files
- Build scripts
- Other project configuration

---

Now, let's establish your template development context and start the Vite server.
