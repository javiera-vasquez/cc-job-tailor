---
allowed-tools: Read, Write(.claude/tailor-context.yaml), Glob(resume-data/tailor/**), SlashCommand
description: Set CC in /tailor mode, Ask claude for changes and improvements to the application assets  | argument-hint company-name
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
   - last_updated: Current timestamp
   - active_company: Current Company
   - active_template: 'modern' or 'classic' default value is 'modern' - If user prompt to update the 'active_template' we need to update `tailor-context.yaml` and `metadata.yaml`
   - available_files: list of available files on `resume-data/tailor/$1/`
5. **Provide Summary**: Display company context overview from loaded metadata

## Example Output:

```
✅ Active company context set: tech-corp
📁 Folder: resume-data/tailor/tech-corp
📄 Available files: resume.yaml, job_analysis.yaml, cover_letter.yaml
🎯 Position: Senior Frontend Engineer - Web, Open Application
🔧 Focus: senior_engineer + [react, typescript, frontend, mobile]
```

## Execution Steps:

1. **Validate & Load Context**:
   - Confirm company folder exists
   - Read pre-built `metadata.yaml` file
   - Copy contents to `.claude/tailor-context.yaml` (update only timestamp)
   - Provide summary with company name, available files, position, and primary job focus

2. **Start Live Preview Server**:
   - Invoke `/tailor-server` command to start background development server
   - Inform user that live preview is available
   - Explain that all YAML edits will trigger automatic validation and browser updates

## CRITICAL: Post-Edit Validation

**IMPORTANT**: After making ANY changes to YAML files in the company folder, you MUST:

1. Use `BashOutput` tool to check the tailor-server output for validation errors
2. Look for messages like "✅ Data regenerated successfully" or "❌ Data regeneration failed"
3. If validation fails, the error message will show exactly which fields are invalid
4. Fix validation errors immediately before proceeding

**Why this matters**: The tailor-server validates all YAML changes against Zod schemas. If validation fails, the PDF won't regenerate and the user's browser won't update. Always verify your changes passed validation by checking the server output.

Now validate the company folder, set the context, start the live preview server, and provide a comprehensive summary.
