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

## IMPORTANT: .claude Directory

**Do not try to create the .claude folder - it is already created.**

## What this command does:

1. **Validate Company Folder**: Check that `resume-data/tailor/$1/` exists
2. **Read Company Metadata**: Load the pre-built `metadata.yaml` file
3. **Update Context State**: Copy content from `resume-data/tailor/$1/metadata.yaml` to `.claude/tailor-context.yaml` and update:
   ```yaml
   last_updated: '2025-09-26T17:00:00Z' # Only timestamp is updated
   ```
4. **Provide Summary**: Show brief overview of company materials and job focus

## Expected Company Folder Structure:

```
resume-data/tailor/$1/
├── metadata.yaml        # Company metadata and context (REQUIRED)
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
2. **Validate Metadata File**: Check that `metadata.yaml` exists in company folder
3. **Read Pre-built Metadata**: Load complete metadata from `resume-data/tailor/$1/metadata.yaml`
4. **Update State**: Copy entire metadata to `.claude/tailor-context.yaml` and update:
   - last_updated: Current timestamp (only field that changes)
5. **Provide Summary**: Display company context overview from loaded metadata

## Example Output:

```
✅ Active company context set: tech-corp
📁 Folder: resume-data/tailor/tech-corp
📄 Available files: resume.yaml, job_analysis.yaml, cover_letter.yaml
🎯 Position: Senior Frontend Engineer - Web, Open Application
🔧 Focus: senior_engineer + [react, typescript, frontend, mobile]
```

Validate that the company folder exists, read the pre-built `metadata.yaml` file, copy its contents to `.claude/tailor-context.yaml` (updating only the timestamp), and provide a concise summary with company name, available files, position, and primary job focus.
