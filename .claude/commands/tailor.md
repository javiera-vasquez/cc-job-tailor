---
allowed-tools: Bash(bun run set-env), SlashCommand, BashOutput
description: Set CC in /tailor mode, Ask claude for changes and improvements to the application assets  | argument-hint company-name
---

# Tailor Mode - Collaborative Resume & Cover Letter Editing

This command activates **tailor mode**, where you (Claude) become the user's active collaborator for refining and improving their resume and cover letter for a specific company.

**Your role in tailor mode:**
- Be a proactive editor and writing coach
- Suggest improvements to content, tone, and structure
- Implement changes directly to YAML files based on user feedback
- Ensure all edits align with the job posting requirements
- Validate changes in real-time and fix any issues immediately

The technical infrastructure (server, file watching, validation) runs in the background to support this collaborative editing workflow.

## Usage

```
/tailor company-name
```

## Command Pipeline

### 1. User Invokes Command

```
/tailor company-name
```

### 2. Claude Sets Context

Runs `bun run set-env -C company-name`:

- Validates company folder exists at `resume-data/tailor/company-name/`
- Validates required files (`metadata.yaml`, `job_analysis.yaml`)
- Updates `.claude/tailor-context.yaml` automatically
- Returns formatted output with company context details

**Exit codes:**

- `0` = Success → Continue to step 3
- `1` = Failure → Display error and stop

**Example output:**

```
[10:00:00] [set-env] ✅ Context set • Tech-Corp • 4 file(s)
[10:00:00] [set-env]    -Path: resume-data/tailor/tech-corp
[10:00:00] [set-env]    -Position: Senior Frontend Engineer - Web
[10:00:00] [set-env]    -Focus: senior_engineer + [react, typescript, frontend]
[10:00:00] [set-env]    -Files: metadata.yaml, job_analysis.yaml, resume.yaml, cover_letter.yaml
[10:00:00] [set-env] 🚀 All good, please start the tailor-server
```

### 3. Claude Starts Development Server

Invokes `/tailor-server` slash command:

- Starts file watcher monitoring `resume-data/tailor/`
- Enables automatic data regeneration on file changes
- Launches browser preview with hot reload
- Provides real-time validation feedback

### 4. Claude Confirms Server is Running

After the tailor-server starts, Claude should confirm the setup:

```
✅ Tailor mode active for [company-name]
🌐 Dev server running at http://localhost:3000
📁 Watching: resume-data/tailor/[company-name]

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

Pipeline: File change → YAML parsing → Zod schema validation → TypeScript generation → Hot reload

The system processes changes silently and shows only the final result (see Step 4 for output examples).

### Step 4: Claude Checks Validation Result

**CRITICAL:** After each edit, Claude MUST use `BashOutput` to check server logs.

**Success path:**

```
✅ resume.yaml → Regenerated (0.2s)
```

**Failure path:**

```
❌ resume.yaml → Failed (0.1s)
$ bun scripts/generate-data.ts -C tech-corp
[10:24:34] [generate-data] Application data validation failed:
[10:24:34] [generate-data]   • resume.name: Required (received: undefined)
[10:24:34] [generate-data]     → in resume-data/tailor/tech-corp/resume.yaml
error: script "generate-data" exited with code 1
💡 Fix the errors above and save to retry
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
