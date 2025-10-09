---
allowed-tools: Bash(bun run set-env), SlashCommand, BashOutput
description: Set CC in /tailor mode, Ask claude for changes and improvements to the application assets  | argument-hint company-name
---

# Tailor Company Context Command

Set the active company context for tailored resume operations and start the development server with automatic validation and hot reload.

## Usage

```
/tailor company-name
```

## Command Pipeline

### 1. User Invokes Command

```
/tailor tech-corp
```

### 2. Claude Sets Context

Runs `bun run set-env -C tech-corp`:

- Validates company folder exists at `resume-data/tailor/tech-corp/`
- Validates required files (`metadata.yaml`, `job_analysis.yaml`)
- Updates `.claude/tailor-context.yaml` automatically
- Returns structured JSON with company details

**Exit codes:**

- `0` = Success → Continue to step 3
- `1` = Failure → Display error and stop

### 3. Claude Starts Development Server

Invokes `/tailor-server` slash command:

- Starts file watcher monitoring `resume-data/tailor/`
- Enables automatic data regeneration on file changes
- Launches browser preview with hot reload
- Provides real-time validation feedback

### 4. Claude Displays Context Summary

```
✅ Active company context: company-name
📁 Path: resume-data/tailor/[company-name]
📄 Files: metadata.yaml, job_analysis.yaml, resume.yaml, cover_letter.yaml
🎯 Position: actual possition described on publication
🔧 Focus: main roll + [top 3 skill to have]
🌐 Dev server: http://localhost:3000

What would you like to work on? I can help you with:
• Refine resume summary or professional experience
• Update technical skills and expertise
• Improve cover letter content and tone
• Add or modify achievements with metrics
• Adjust job focus and requirements analysis
• Review and optimize for ATS keywords
• Generate PDF for final review
```

## Iterative Development Loop

Once the server is running, the workflow is:

### Step 1: User Requests Changes

```
User: "Make the resume summary more impactful"
User: "Add a new achievement about performance optimization"
User: "Update the cover letter opening paragraph"
```

### Step 2: Claude Edits YAML Files

Claude edits files in `resume-data/tailor/tech-corp/`:

- `resume.yaml` - Professional experience, skills, summary
- `cover_letter.yaml` - Cover letter content
- `job_analysis.yaml` - Job requirements analysis
- `metadata.yaml` - Company/position details

### Step 3: System Auto-Validates

File watcher triggers automatic pipeline:

```
[file-watcher] Tailor data changed: tech-corp/resume.yaml
[tailor-server] 🔄 Regenerating data for company: tech-corp
[generate-data] Validating application data
```

Pipeline: File change → YAML parsing → Zod schema validation → TypeScript generation → Hot reload

### Step 4: Claude Checks Validation Result

**CRITICAL:** After each edit, Claude MUST use `BashOutput` to check server logs.

**Success path:**

```
[generate-data] ✅ Application data validation passed
[generate-data] Writing TypeScript module to src/data/application.ts
[tailor-server] ✅ Data regenerated successfully
[tailor-server] Hot reload will pick up changes automatically
```

**Failure path:**

```
[tailor-server] Application data validation failed:
[tailor-server]   • resume.contact: Required (received: undefined)
[tailor-server]     → in resume-data/tailor/tech-corp/resume.yaml
[tailor-server] 💡 Fix the data issues and try again
```

### Step 5: Claude Responds Based on Result

**If validation passes:**

- Confirm changes to user
- Mention browser preview has updated
- Proceed with next task or await further instructions

**If validation fails:**

- Fix the validation error immediately
- Re-check logs with `BashOutput`
- Verify fix was successful before responding to user

## Company Folder Structure

```
resume-data/tailor/company-name/
├── metadata.yaml        # Company/position metadata (REQUIRED)
├── job_analysis.yaml    # Job requirements analysis (REQUIRED)
├── resume.yaml          # Tailored resume content
└── cover_letter.yaml    # Tailored cover letter content
```

## Why Validation Matters

- **PDF generation** depends on valid TypeScript data module
- **Browser preview** won't update if validation fails
- **Error messages** show exact field path and file location
- **Actionable feedback** helps fix issues quickly (e.g., "Required field missing")

Now set the company context, start the development server, and enter tailor mode.
