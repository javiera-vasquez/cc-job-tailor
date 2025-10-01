# Changelog

All notable changes to the Resume Manager will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.7.0] - 2025-10-01

### Added

- **Job Analysis Agent**: New specialized agent for analyzing job postings and extracting structured requirements
- **Job Tailoring Agent**: Comprehensive agent for generating tailored resumes and cover letters based on job analysis
- **Validation Scripts**: Four new validation scripts for resume, cover letter, job analysis, and metadata files
- **Metadata System**: Introduced `metadata.yaml` for storing company-specific application context and job details
- **Company Loader Module**: Centralized company data loading with validation and error handling
- **CLI Arguments Parser**: Shared module for consistent command-line argument parsing across scripts
- **Sub-agents Documentation**: Comprehensive guide for creating and configuring Claude Code sub-agents

### Changed

- **Script Organization**: Moved `generate-data.ts` and `generate-pdf.ts` to `scripts/` directory
- **Data Generation**: Enhanced to load and validate `metadata.yaml` alongside other company files
- **Tailor Command**: Updated to utilize pre-built `context.yaml` file instead of reading multiple individual files
- **Agent Workflow**: Improved job tailoring agent with mandatory validation steps and metadata generation
- **Application Data Structure**: Enhanced metadata structure with job details, skills requirements, and folder paths
- **Formatting Process**: Integrated Prettier formatting for generated TypeScript modules

### Technical Details

- **JobDetailsSchema**: New Zod schema for structured job information (company, location, experience level, skills)
- **MetadataSchema**: Updated to include comprehensive job details and extended context fields
- **Validation Requirements**: All generated YAML files must pass schema validation before task completion
- **Error Handling**: Enhanced error messages and validation feedback for missing or invalid data
- **Context Management**: Improved company context tracking with timestamps and available files list

### Documentation

- **Token Consumption Report** (`TOKEN_CONSUME.md`): Added cost and resource usage analysis for different agent approaches
- **CC Agents Context**: Comprehensive documentation on sub-agent system fundamentals and best practices
- **CLAUDE.md**: Updated with pull request and commit message policies
- **Transformation Rules**: Enhanced mapping rules with metadata generation specifications

## [0.6.2] - 2025-09-26

### Added

- **ESLint Configuration**: Migrated from .eslintrc.json to modern eslint.config.js format
- **Prettier Configuration**: Added code formatting with .prettierrc.json and .prettierignore
- **Enhanced CI Pipeline**: Integrated linting and formatting checks into GitHub Actions workflow

### Changed

- **Code Quality**: Updated ESLint ignore patterns to exclude auto-generated files
- **Logging**: Replaced console.log with console.warn for consistent logging practices
- **File Formatting**: Applied consistent formatting across codebase with Prettier
- **CI Workflow**: Enhanced with comprehensive linting and formatting validation

### Technical Details

- **Linting**: Modern ESLint configuration with TypeScript and React support
- **Formatting**: Prettier integration with exclusion rules for YAML test fixtures
- **CI Integration**: Automated quality checks before testing pipeline
- **Ignore Patterns**: Comprehensive exclusion of generated files and build artifacts

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
