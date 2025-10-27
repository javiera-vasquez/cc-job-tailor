# Changelog

All notable changes to the Resume Manager will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-10-27 ([ad19ed1](https://github.com/javiera-vasquez/claude-code-job-tailor/commit/ad19ed1))

### Added

- **Railway-Oriented Pipelines**: Functional composition architecture using `remeda` pipes and `ts-pattern` matching in all CLI scripts (`set-env`, `generate-pdf`, `tailor-server`, `validate-schema`) with automatic error propagation via Result types
- **Reusable Validation Pipelines**: `tailor-check-pipeline` (validation-only) and `tailor-setup-pipeline` (complete setup) using functional composition for YAML-to-ZOD workflows
- **Shared Result Handlers**: Centralized error and success handlers with consistent output formatting and specialized ZodError handling
- **Comprehensive Test Suite**: New tests for CLI argument parsing, validation workflows, and document generation
- **Schema Validation Command**: `validate-schema.ts` exposing validation pipeline with five modes (all, metadata, resume, job-analysis, cover-letter)

### Changed

- **CLI Architecture**: Consolidated `set-env`, `generate-pdf`, and `tailor-server` to use functional pipelines with consistent error handling patterns
- **Validation Modules**: Refactored validation system with dedicated modules for path resolution, YAML validation, and type definitions
- **Package Scripts**: Reorganized and enhanced CI workflows with expanded validation pipelines
- **Documentation**: Removed deprecated flow-chart and tailor-help references; updated README with current command guidance

### Improved

- **Code Modularity**: Extracted reusable components (path helpers, CLI parser, result handlers, loggers) reducing duplication across scripts
- **Type Safety**: Centralized validation types and streamlined Zod schemas for better maintainability
- **Test Coverage**: Added integration tests validating complete workflows from company validation to PDF generation
- **Developer Experience**: Structured logging with context-aware instances; JSDoc improvements for CLI utilities

### Removed

- **Legacy Code**: Removed obsolete company loader, generate-data script, deprecated `_display_cache` field, and unused Zod schemas
- **Outdated Documentation**: Cleaned up flow-chart documentation and redundant validation script references

## [0.9.0] - 2025-10-15 ([5c2bd98](https://github.com/javiera-vasquez/claude-code-job-tailor/commit/5c2bd98))

### Added

- **Section Registry System**: New architecture for dynamic section rendering in resume and cover letter templates
- **Component Visibility Logic**: Conditional rendering system based on section data availability
- **Compact Logging Mode**: `TAILOR_SERVER_COMPACT_LOGS` environment variable for streamlined server output
- **File Watcher Debouncing**: Configurable debounce delay to prevent excessive regeneration on rapid file changes
- **Demo GIF**: Visual demonstration of the application workflow added to repository
- **Environment Configuration**: Comprehensive `.env.example` file with all configuration options
- **Section Registry Tests**: 62 new tests covering classic and modern theme section registries

### Changed

- **Template Architecture**: Restructured template files from `index.tsx` to theme-specific files (`resume.tsx`, `cover-letter.tsx`)
- **Component Organization**: Moved components to dedicated directories within each theme (`components/resume/`, `components/cover-letter/`)
- **Resume Schema**: Enhanced with top-level `name` field and improved section structure
- **Cover Letter Schema**: Refactored for improved flexibility with top-level `name` field
- **Tailor Command Documentation**: Comprehensive rewrite with advanced template manipulation guidelines
- **Section Management**: Dynamic section rendering replaces hardcoded component inclusion
- **Logging Standards**: Enhanced structured logging with context-aware output formatting

### Improved

- **Type Safety**: Enhanced Zod schemas for better validation and flexibility across resume and cover letter data
- **Template Components**: All components now support conditional rendering for optional fields
- **Documentation**: Major improvements to `CLAUDE.md`, `/tailor` command docs, and agent documentation
- **Development Experience**: Better logging output with timestamps and context labels
- **Code Organization**: Centralized section management utilities in `shared/section-utils.ts`

### Technical Details

- **Section Registry Pattern**: Each theme now exports `resumeSectionRegistry` and `coverLetterSectionRegistry`
- **Dynamic Rendering**: Components are registered with visibility checks and render functions
- **Configuration System**: Expanded `config.ts` with watcher debouncing and logging options
- **Component Props**: Standardized `ResumeComponentProps` and `CoverLetterComponentProps` interfaces
- **Mapping Rules**: Updated transformation schemas to support new section structure

## [0.8.4] - 2025-10-09 ([b297ae7](https://github.com/javiera-vasquez/claude-code-job-tailor/commit/b297ae7))

### Added

- **Tailor Context Setup Script**: New `set-env` script for validating and configuring tailor environment context
- **Field-to-File Mapper**: Utility to map validation error field paths to their corresponding YAML files for better debugging
- **Structured Logging System**: Comprehensive logging module with dual output formats (human-readable and JSON)
- **Company Data Validation**: Automatic validation of application data before server startup
- **Enhanced Dev Server**: Intelligent file watching with automatic data regeneration on YAML changes
- **Comprehensive Test Coverage**: New tests for tailor context utilities, validation handlers, and logging functionality

### Changed

- **Tailor Command**: Expanded to include development server startup with automatic validation and hot reload
- **Tailor Context Structure**: Enhanced `.claude/tailor-context.yaml` with additional fields (position, primary focus, job details)
- **Validation Scripts**: Consolidated individual validation scripts into unified `validate-tailor-schema.ts`
- **Error Handling**: Centralized validation error handling across all scripts with improved user feedback
- **Dependencies**: Added `remeda` and `ts-pattern` for improved functional programming capabilities

### Improved

- **Configuration Management**: Centralized paths, script names, and constants in new `config.ts` file
- **Type Safety**: Enhanced error handling with functional programming patterns using `remeda` and `ts-pattern`
- **Logging Output**: Context-aware logging with log levels (debug, info, warn, error) for better traceability
- **Error Messages**: Validation errors now include file locations and clearer guidance for fixing issues
- **Code Organization**: Streamlined codebase by removing redundant error handling code

### Fixed

- **Type Safety**: Added TypeScript guard for undefined top-level field in field-to-file mapper

### Technical Details

- **Validation Pipeline**: Unified schema validation with centralized error handling
- **File Watching**: Real-time YAML change detection with intelligent data regeneration
- **Context Management**: Strict validation modes for different contexts (PDF generation vs. general use)
- **Logging Architecture**: Structured logging with dual output formats for development and production

## [0.8.3] - 2025-10-07 ([faa79f6](https://github.com/javiera-vasquez/claude-code-job-tailor/commit/faa79f6))

### Added

- **Classic Theme**: New professional resume and cover letter theme with clean, traditional layout
- **Theme Components**: Complete component set for classic theme (Header, Summary, Experience, Education, Skills, Languages, Additional, Contact)
- **Cover Letter Components**: Classic theme cover letter with Header, Title, DateLine, Body, and Signature components
- **Single-Column Layout**: Simplified resume structure with improved visual hierarchy

### Changed

- **Design Token System**: Unified token imports across all templates for better consistency
- **Theme Initialization**: Updated to prioritize `active_template` from metadata, defaulting to 'modern'
- **PDF Viewer**: Enhanced key generation to include theme and document type for proper re-renders
- **Tailor Command**: Expanded metadata management with `active_company`, `active_template`, and `available_files` fields
- **UI Simplification**: Removed theme selector dropdown from Header component

### Improved

- **Component Organization**: Better structured classic theme components with Summary and Additional sections
- **Design Tokens**: Enhanced token structure for improved styling consistency and maintainability
- **Styling System**: Consolidated color management using modern design tokens in PDF wrapper
- **Metadata Tracking**: Streamlined template management with automatic timestamp updates

### Removed

- **Template Configuration**: Removed redundant template section from metadata.yaml
- **Unused Logic**: Cleaned up contact formatting code from Header component
- **UI Elements**: Removed manual theme selector in favor of metadata-driven theme selection

## [0.8.2] - 2025-10-07 ([fb48427](https://github.com/javiera-vasquez/claude-code-job-tailor/commit/fb48427))

### Added

- **Active Template Feature**: Template selection system with `active_template` configuration in tailor context
- **Template Development Command**: New `/tailor-template-expert` slash command for experimental template development workspace
- **React-PDF Documentation**: Comprehensive local documentation for components, fonts, styling, and troubleshooting in `rpdf/` directory
- **Tailor Context Validation**: Enhanced validation system for tailor context management

### Changed

- **Design Tokens Structure**: Restructured design tokens with improved import paths and organization
- **Module Imports**: Updated template imports to use new design token paths
- **Live Preview URL**: Fixed tailor-server documentation with correct preview URL

### Documentation

- **README Updates**: Multiple iterations improving clarity, structure, and usage examples
- **Template Documentation**: Enhanced documentation for components, fonts, and styling reference
- **rpdf/ Directory**: Added local React-PDF reference documentation (components.md, fonts.md, styling.md)

### Technical Details

- **Import Path Fixes**: Corrected tailwindColors import path and added tailwind color definitions
- **Font Registration**: Updated fonts-register module location and imports
- **Template Organization**: Improved template component structure and design token access

## [0.8.1] - 2025-10-06 ([6cf6684](https://github.com/javiera-vasquez/claude-code-job-tailor/commit/6cf6684))

### Added

- **Theme System**: New theming architecture for resume and cover letter templates
- **WithPDFWrapper Component**: Reusable wrapper for PDF document generation with standardized configuration
- **Theme Validation**: Comprehensive Zod schemas for validating theme structure and components
- **Theme Selector**: Interactive dropdown in UI for switching between themes
- **Test Coverage**: 41 new unit tests for theme validation (27 tests) and PDF wrapper component (14 tests)

### Changed

- **Template Organization**: Restructured templates into `modern/` theme directory with component subdirectories
- **Component Architecture**: Introduced `components/` subdirectories for resume and cover letter sections
- **Module Aliases**: Added new TypeScript/Vite aliases for design tokens, types, fonts, and utilities
- **Development Command**: Updated `dev` script to use `tailor-server` for consistency
- **Tailor Documentation**: Enhanced with live preview server instructions and validation requirements

### Improved

- **Type Safety**: Enhanced with new component prop types (`ResumeComponentProps`, `CoverLetterComponentProps`)
- **Theme Initialization**: Centralized font registration in theme definition
- **PDF Generation**: Modular theme structure with dynamic component loading
- **Data Handling**: Simplified component data extraction and optional data handling
- **Error Handling**: Better validation for missing or invalid theme data
- **Code Organization**: Clearer separation between templates, themes, and shared components

### Technical Details

- **Theme Structure**: Each theme now contains `resume`, `coverLetter`, and `init()` function
- **Component Props**: Type-safe props for all theme components with explicit data structures
- **Validation Schemas**: `ThemeSchema`, `ThemeComponentSchema`, and document type validation
- **Module Organization**: `/src/templates/[theme-name]/[document-type]/components/`
- **Radix UI Integration**: Added `@radix-ui/react-select` for enhanced UI components

## [0.8.0] - 2025-10-02 ([3bd06cc](https://github.com/javiera-vasquez/claude-code-job-tailor/commit/3bd06cc))

### Added

- **Interactive Development UI**: New web-based interface with live PDF preview and document switcher
- **Job Context Sidebar**: Display job requirements, must-have/nice-to-have skills, and key responsibilities with automatic scroll tracking
- **Visual Navigation**: Smooth scrolling between sidebar sections with active section highlighting
- **Dark Mode Support**: Complete dark theme implementation

### Changed

- **Development Workflow**: Replaced basic PDF viewer with rich web UI using Vite, Tailwind CSS, and shadcn/ui
- **Document Selection**: Easy toggle between Resume and Cover Letter views with icon indicators
- **Component Architecture**: Modular design with reusable UI components (Header, Sidebar, Navigation)

## [0.7.0] - 2025-10-01 ([6dbad84](https://github.com/javiera-vasquez/claude-code-job-tailor/commit/6dbad84))

### Added

- **Job Analysis Agent**: New specialized `@agent-job-analysis` for analyzing job postings and extracting structured requirements
- **Resume Tailoring Agent**: `@agent-tailor-resume-and-cover` for generating tailored resumes and cover letters based on job analysis
- **Validation Scripts**: Four new validation scripts for `resume`, `cover letter`, `job analysis`, and `metadata` files
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

## [0.6.2] - 2025-09-26 ([1c4aa10](https://github.com/javiera-vasquez/claude-code-job-tailor/commit/1c4aa10))

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

## [0.6.1] - 2025-09-25 ([9dd2322](https://github.com/javiera-vasquez/claude-code-job-tailor/commit/9dd2322))

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

## [0.6.0] - 2025-09-24 ([3c8fc1d](https://github.com/javiera-vasquez/claude-code-job-tailor/commit/3c8fc1d))

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

## [0.5.0] - 2025-09-23 ([23e8053](https://github.com/javiera-vasquez/claude-code-job-tailor/commit/23e8053))

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
