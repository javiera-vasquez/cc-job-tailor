# Changelog

All notable changes to the Resume Manager will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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