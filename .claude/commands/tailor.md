---
allowed-tools: Read, Write(.claude/tailor-context.yaml), Glob(resume-data/tailor/**)
description: Set Claude Code context to work on a specifict company | argument-hint: company-name
---

# Tailor Company Context Command

Set the active company context for tailored resume operations. This command reads the company's tailored materials and establishes context for all subsequent interactions.

## Usage
```
/tailor company-name
```

## What this command does:

1. **Validate Company Folder**: Check that `resume-data/tailor/$1/` exists
2. **Read Company Materials**: Load available files (resume.yaml, job_analysis.yaml, cover_letter.yaml)
3. **Create Context State**: Generate `.claude/tailor-context.yaml` with:
   ```yaml
   active_company: "$1"
   folder_path: "resume-data/tailor/$1"
   available_files: ["resume.yaml", "job_analysis.yaml", "cover_letter.yaml"]
   position: "Job Title from job_analysis.yaml"
   primary_focus: "Main job focus area"
   last_updated: "2025-09-20T15:30:00Z"
   ```
4. **Provide Summary**: Show brief overview of company materials and job focus

## Expected Company Folder Structure:
```
resume-data/tailor/$1/
├── resume.yaml          # Tailored resume for this company
├── job_analysis.yaml    # Job posting analysis and requirements
└── cover_letter.yaml    # Tailored cover letter
```

## Context Benefits:
After running this command, all subsequent interactions will:
- Automatically reference the active company's materials via tailor-context.yaml
- Default file operations to the company's folder
- Understand the job context for relevant suggestions
- Allow direct editing of company-specific files

**Company**: $1

## Process Flow:

1. **Validate Folder**: Confirm `resume-data/tailor/$1/` exists
2. **Discover Files**: Find available YAML files in company folder
3. **Extract Context**: Read job_analysis.yaml for position and job_focus details
4. **Generate State**: Create/update `.claude/tailor-context.yaml` with:
   - active_company: Company name
   - folder_path: Full path to company folder
   - available_files: List of existing files
   - position: Job title from job_analysis.yaml
   - primary_focus: Highest weighted job_focus (primary_area + specialties)
   - last_updated: Current timestamp
   - job_summary: Brief description (max 100 chars)
5. **Provide Summary**: Display company context overview

## Example Output:
```
✅ Active company context set: tech-corp
📁 Folder: resume-data/tailor/tech-corp
📄 Available files: resume.yaml, job_analysis.yaml, cover_letter.yaml
🎯 Position: Senior Frontend Engineer - Web, Open Application
🔧 Focus: senior_engineer + [react, typescript, frontend, mobile]
```

Validate that the company folder exists, read all available tailored materials, extract job details from job_analysis.yaml, create/update the `.claude/tailor-context.yaml` state file with complete company context, and provide a concise summary with company name, available files, position, and primary job focus.