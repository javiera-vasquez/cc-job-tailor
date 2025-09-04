# cc-resume-manager

A dynamic PDF resume generator built with React and `@react-pdf/renderer`. Creates professional resumes from structured YAML data with AI-powered job-specific tailoring capabilities through Claude Code integration.

## Features

- **Data-Driven Generation**: Uses structured YAML data with comprehensive resume information
- **Job-Specific Tailoring**: AI-powered resume optimization for specific job applications
- **Multi-Version Support**: Different resume versions (AI-focused, QA-focused, frontend-focused)
- **Professional Template**: Ready-for-production resume layout and styling
- **Live Preview**: Browser-based PDF viewer with hot reload during development

## Quick Start

### Install Dependencies
```bash
bun install
```

### Development (with live preview)
```bash
bun run dev
```
Opens a browser window with live PDF preview that updates as you make changes.

### Generate PDF File
```bash
bun run save-to-pdf
```
Generates `tmp/resume.pdf` from your resume data.

### Resume Tailoring with Claude Code
```bash
# 1. Ask Claude Code to analyze a job posting:
# "Analyze this job posting and create a tailored resume: [paste job posting]"

# 2. Claude Code's resume-tailor agent automatically:
#    - Analyzes job requirements and keywords
#    - Selects most relevant achievements from your data
#    - Generates optimized data/resume_tailored.yaml

# 3. Generate tailored PDF
bun run save-to-pdf
```

## Claude Code Integration

This project is designed to work seamlessly with **Claude Code** through a specialized resume-tailor sub-agent that provides intelligent job-specific resume optimization.

### How Claude Code Helps

**🎯 Intelligent Job Analysis**
- Analyzes job postings to extract key requirements, skills, and company culture indicators
- Identifies whether the role is AI-focused, QA-focused, or frontend-focused
- Maps job requirements to your existing achievements and experience

**📝 AI-Powered Content Optimization**  
- Selects the most relevant title and summary from your multi-version resume data
- Prioritizes technical expertise categories based on job keywords
- Curates achievements that best demonstrate required capabilities
- Flattens and prioritizes soft skills for maximum impact

**⚡ Automated Resume Generation**
- Transforms rich source data into React-PDF compatible format
- Generates `data/resume_tailored.yaml` following strict schema requirements
- Ensures ATS optimization while maintaining content truthfulness
- Creates job-specific metadata for tracking tailoring decisions

### Usage with Claude Code
Simply provide a job posting to Claude Code and ask:
```
"Analyze this job posting and create a tailored resume for [Position] at [Company]:

[paste job description here]"
```

Claude Code will automatically invoke the resume-tailor agent to create an optimized resume version.

## Architecture

**Core Stack**: React 19 + TypeScript + @react-pdf/renderer + Bun
**Data Flow**: YAML → Claude Code Analysis → Optimized YAML → TypeScript → React Components → PDF

### Key Files
- `data/resume.yaml` - Master resume data (all versions)
- `data/resume_tailored.yaml` - AI-optimized job-specific version
- `.claude/agents/resume-tailor.md` - Claude Code sub-agent configuration
- `src/pages/resume/` - PDF resume components
- `generate-data.ts` - YAML to TypeScript converter
- `web_layout.tsx` - Browser preview interface

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Complete technical documentation and development guide
- **[RESUME_TAILORING_GUIDE.md](./RESUME_TAILORING_GUIDE.md)** - Job-specific resume optimization workflow
- **[rpdf/](./rpdf/)** - React-PDF component and styling reference

This project was created using `bun init` in bun v1.2.12. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
