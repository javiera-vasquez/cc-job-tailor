# Changelog

All notable changes to the Resume Manager will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.0] - 2025-09-24

### Added
- **Zod Schema Validation**: Complete data validation system with type-safe schemas
- **CI/CD Pipeline**: GitHub Actions workflow for automated testing and validation
- **Enhanced Type Safety**: Comprehensive TypeScript coverage from YAML to PDF components

### Changed
- **File Structure**: Reorganized `src/pages/` → `src/templates/` for better clarity
- **Documentation**: Streamlined CLAUDE.md by ~80% for improved clarity and accuracy
- **Package Scripts**: Updated commands to reflect current workflow (`save-to-pdf`, etc.)
- **Development Workflow**: Enhanced validation and error handling throughout data pipeline

### Improved
- **Type System**: Major refactoring of `src/types.ts` with Zod schema integration
- **Data Validation**: All YAML transformations now pass through Zod schemas
- **Error Handling**: Better validation errors and data integrity checks
- **Documentation**: Updated README.md with correct commands and current file structure

### Removed
- **Outdated Assets**: Cleaned up old mockup images from template directories
- **Redundant Code**: Simplified type definitions leveraging Zod inference

## [0.5.0] - 2025-09-23

### Added
- Enhanced development server with automatic tailor data hot reload
- TypeScript-based file watching for resume-data/tailor/ directory changes
- Smart company-aware data regeneration during development
- Graceful shutdown and error handling for dev server

### Changed
- Dev command now uses enhanced hot reload (`dev-with-watch.ts`)
- Added `dev:basic` command for simple hot reload fallback

### Technical Details
- Implements dual-process architecture (Bun hot reload + file watcher)
- Automatic detection of active company from `.claude/tailor-context.yaml`
- Real-time YAML change detection with `bun run generate-data -C company`

## [0.4.0] - Previous Release
### Added
- Initial PDF resume generation system
- React-PDF based document rendering
- YAML-based resume data management
- Job tailoring system with Claude Code integration