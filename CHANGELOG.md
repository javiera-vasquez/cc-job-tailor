# Changelog

All notable changes to the Resume Manager will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.1] - 2025-09-25

### Added
- **Comprehensive Testing Layer**: Complete unit test suite with 66 tests covering data pipeline
- **Test Coverage Reporting**: Coverage analysis with 88.10% function and 80.81% line coverage
- **Priority-based Test Implementation**:
  - Zod schema validation tests (19 tests)
  - Data generation pipeline tests (13 tests)
  - PDF generation pipeline tests (16 tests)
  - Application validation tests (18 tests)
- **Mock Testing Infrastructure**: File system mocking and external dependency simulation
- **CI Test Integration**: Unit tests added to GitHub Actions workflow

### Changed
- **Package Scripts**: Added `test:coverage` command for coverage reporting
- **CI Workflow**: Enhanced with comprehensive test execution before integration tests
- **Error Handling**: Improved test coverage for edge cases and validation scenarios

### Technical Details
- **Testing Framework**: Bun's native test runner with TypeScript support
- **Mock Strategy**: Dependency injection for external processes (Bun.spawn, renderToFile, mkdir)
- **Test Structure**: Option 2 architecture with centralized test utilities and fixtures
- **Coverage Tools**: Built-in Bun coverage reporting with detailed file-by-file analysis

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