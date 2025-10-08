---
allowed-tools: Bash(bun run set-env), SlashCommand, BashOutput
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

1. **Execute set-env script**: Run `bun run set-env -C $1` to validate and configure context
2. **Check exit code**:
   - Exit 0 = Success → Parse JSON output and start server
   - Exit 1 = Failure → Display error message to user
3. **Start Development Server**: If validation succeeds, invoke `/tailor-server` command
4. **Provide Summary**: Show brief overview of company materials and job focus

The `set-env` script performs comprehensive validation:
- Validates company folder exists
- Validates `metadata.yaml` exists and passes Zod schema validation
- Validates `job_analysis.yaml` exists and passes Zod schema validation
- Updates `.claude/tailor-context.yaml` atomically
- Returns structured JSON on success or detailed errors on failure

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

1. **Validate Company Name**: Ensure company name argument is provided
2. **Execute Validation Script**: Run `bun run set-env -C $1`
   - The script validates folder structure
   - Validates `metadata.yaml` exists and passes schema validation
   - Validates `job_analysis.yaml` exists and passes schema validation
   - Updates `.claude/tailor-context.yaml` atomically
3. **Check Result**:
   - If exit code 0: Parse JSON output and proceed to step 4
   - If exit code 1: Display error message from stderr and stop
4. **Provide Summary**: Display company context overview:
   - Company name and folder path
   - Available files
   - Position and primary focus
5. **Start Development Server**: Invoke `/tailor-server` command

## Example Output:

```
✅ Active company context set: tech-corp
📁 Folder: resume-data/tailor/tech-corp
📄 Available files: resume.yaml, job_analysis.yaml, cover_letter.yaml
🎯 Position: Senior Frontend Engineer - Web, Open Application
🔧 Focus: senior_engineer + [react, typescript, frontend, mobile]
```

## Execution Steps:

1. **Run set-env Script**:
   ```bash
   bun run set-env -C $1
   ```

2. **Handle Result**:
   - **On success (exit 0)**:
     - Parse JSON output from stdout
     - Display formatted summary to user
     - Proceed to step 3
   - **On failure (exit 1)**:
     - Display error message from stderr
     - Ask user to fix the issue
     - Stop execution

3. **Start Live Preview Server**:
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
