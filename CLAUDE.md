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

# Run all (generate data + start server)
bun run start

# Testing
bun run test                # Run tests
bun run test:watch          # Run tests in watch mode
bun run test:coverage       # Run tests with coverage

# Type checking and linting
bun run tsc                 # Type checking
bun run lint                # Run ESLint
bun run lint:fix            # Run ESLint with auto-fix

# Code formatting
bun run format              # Format code with Prettier
bun run format:check        # Check formatting without changes
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

### Pull Request & Commit Message Policy

**IMPORTANT**: Never include Claude Code attribution or co-authored-by lines in git commit messages or pull requests. All commits should be clean and focused on the actual changes without tool attribution.

