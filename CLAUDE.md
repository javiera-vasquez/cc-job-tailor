# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dynamic PDF resume generator built with React and `@react-pdf/renderer`. Creates PDF documents using React components with both browser preview and server-side file generation.

**Key Features:**

- Data-driven resume generation from YAML sources
- Multi-version support (AI-focused, QA-focused, frontend-focused)
- Company-specific tailoring system
- Zod schema validation

## Development Commands

```bash
# Install dependencies
bun install

# Development server with hot reload and file watching
bun run dev

# Generate PDF to disk with company-specific data
bun run save-to-pdf -C company-name

# Generate TypeScript data from YAML
bun run generate-data -C company-name

# Type checking
bun run tsc
```

## Architecture

**Core Stack:** Bun runtime, React 19, TypeScript, @react-pdf/renderer, Zod validation

### File Structure

```
├── dev-server-index.tsx    # Development server entry point
├── dev-with-watch.ts      # Development server with file watching
├── generate-data.ts       # YAML to TypeScript converter with Zod validation
├── generate-pdf.ts        # Server-side PDF generation
├── src/
│   ├── data/application.ts          # Auto-generated from YAML sources
│   ├── templates/
│   │   ├── resume/                  # Resume PDF components
│   │   ├── cover-letter/            # Cover letter PDF components
│   │   ├── design-tokens.ts         # Styling constants
│   │   └── fonts-register.ts        # Font configuration
│   ├── zod/
│   │   ├── schemas.ts               # Zod validation schemas
│   │   └── validation.ts            # Validation utilities
│   └── types.ts                     # TypeScript definitions
├── resume-data/
│   ├── sources/                     # Source YAML files
│   ├── mapping-rules/               # Transformation schemas
│   └── tailor/[company]/           # Company-specific outputs
└── tmp/                            # Generated PDFs
```

### Application Flow

1. **Data Generation**: YAML sources → Zod validation → TypeScript module
2. **Development**: File watching → auto-regeneration → browser preview
3. **PDF Generation**: Company data → validated transformation → PDF output

## Data & Schema

**Data Flow**: YAML sources → Zod validation → TypeScript → PDF components

### Source Structure (`resume-data/sources/`)

- Multi-version support: `ai_focused`, `qa_focused`, `frontend_focused`
- Modular files: `resume.yaml`, `professional-experience.yaml`, `cover-letter.yaml`
- Example files for development (`.example.yaml` suffix)

### Tailoring System (`resume-data/tailor/[company]/`)

Company-specific optimization:

1. Job posting analysis → requirements extraction
2. Content selection from source data
3. Schema-validated transformation
4. PDF generation: `bun run save-to-pdf -C company-name`

### Validation

- **Zod schemas** in `src/zod/schemas.ts` validate all data transformations
- **Type safety** from YAML to PDF components
- **Error handling** for missing or invalid data

## React-PDF Reference

Local documentation in `rpdf/`:

- `components.md`: Document, Page, View, Text, Image, Link APIs
- `fonts.md`: Font registration and typography
- `styling.md`: CSS properties and responsive design

## Design System

### Design Tokens (`src/templates/design-tokens.ts`)

Centralized styling constants for consistent PDF appearance:

```typescript
// Customizable brand colors
colors: {
  primary: tailwindColors.zinc[900],    // Main text/elements
  accent: tailwindColors.rose[600],     // Highlights/links
  darkGray: tailwindColors.zinc[800],   // Content text
  mediumGray: tailwindColors.zinc[600], // Secondary text
}

// Typography scales
typography: {
  text: { size: 9, fontFamily: 'Lato' },
  title: { fontSize: 22, fontFamily: 'Lato Bold' },
  subtitle: { fontSize: 14, fontFamily: 'Lato Bold' },
}

// Layout spacing
spacing: {
  columnWidth: 180,
  documentPadding: 42,
  profileImageSize: 46,
}
```

## Quick Reference

### Key Files

- `src/data/application.ts` - Auto-generated data (don't edit directly)
- `src/templates/design-tokens.ts` - Styling constants
- `src/zod/schemas.ts` - Data validation rules
- `resume-data/sources/` - Edit source YAML files here
- `resume-data/tailor/[company]/` - Company-specific outputs

### Common Tasks

- **Styling changes**: Edit design tokens, not individual components
- **Data changes**: Modify YAML sources, regenerate with `bun run generate-data`
- **New company**: Create `resume-data/tailor/[company]/` directory structure
- **Validation errors**: Check Zod schemas in `src/zod/schemas.ts`

## Development Notes

- **File watching**: `dev-with-watch.ts` monitors YAML changes and auto-regenerates
- **No build step**: Bun handles bundling directly
- **Type safety**: Full TypeScript coverage from YAML to PDF components
- **Font loading**: Requires internet connection for Google Fonts

## Claude Code Guidelines

### Commit Message Policy

**IMPORTANT**: Never include Claude Code attribution or co-authored-by lines in git commit messages or pull requests. All commits should be clean and focused on the actual changes without tool attribution.

### Pull Request Policy

**CRITICAL**: Never add Claude Code attribution, "Generated with Claude Code", co-authored-by lines, or any tool attribution in pull request descriptions, titles, or comments. All PRs must appear as regular development work without mentioning AI assistance.
