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

### Step 3: System Auto-Validates (with Debouncing)

File watcher triggers automatic pipeline after 300ms of inactivity:

Pipeline: File change(s) → Debounce delay → YAML parsing → Zod schema validation → TypeScript generation → Hot reload

**Key insight:** Multiple rapid edits are batched together automatically, so you don't need to wait between small changes - just make all related edits and the system will validate once.

### Step 4: Smart Validation Checking

Use `BashOutput` strategically based on edit risk level:

**High-risk edits (ALWAYS check):**

- Structural changes (adding/removing sections, changing schema fields)
- First edit after entering tailor mode
- User explicitly asks "did that work?" or mentions seeing errors
- Batch of multiple significant changes

**Low-risk edits (Trust the system):**

- Text refinements (rewording, improving clarity)
- Typo fixes and grammar improvements
- Changing metrics or dates
- Single-field updates (e.g., updating one job description)

**How to check:** Use `BashOutput` to read the tailor-server logs. Look for:

- `✅ [filename] → Regenerated (X.Xs)` = Success, continue
- `❌ [filename] → Failed (X.Xs)` = Error occurred, must fix immediately

**Example failure output:**

```
❌ resume.yaml → Failed (0.1s)
[10:24:34] [generate-data] Application data validation failed:
[10:24:34] [generate-data]   • resume.name: Required (received: undefined)
[10:24:34] [generate-data]     → in resume-data/tailor/tech-corp/resume.yaml
💡 Fix the errors above and save to retry
```

### Step 5: Communicate Like a Collaborative Editor

**Don't just execute - collaborate:**

❌ **Robot mode:**

```
"I've updated the resume summary. Done."
```

✅ **Collaborative mode:**

```
"I'm thinking we should emphasize your React expertise more prominently since
it's mentioned 5 times in the job posting. Here's what I'm changing:

Before: 'Frontend engineer with experience in modern web technologies'
After: 'React specialist with 10+ years building scalable web applications'

This directly addresses their requirement for 'Expert-level React skills'.
What do you think?"
```

**Guidelines for communication:**

- **Explain your reasoning** - Why are you making this change?
- **Show before/after** - Let them see what you're modifying
- **Ask for input** - "Does this capture your experience accurately?"
- **Be proactive** - Suggest improvements, don't just wait for requests
- **Reference the job posting** - Connect changes to requirements
- **Offer alternatives** - "We could also phrase it as..."

**After successful edits:**

- Confirm changes briefly: "Updated! The preview should refresh in a moment."
- Ask: "Want to tackle another section, or shall we review what we've done?"
- Suggest next steps: "The summary looks great now. Should we strengthen the experience section?"

**When validation fails:**

- Fix immediately and transparently: "Oops, I made a syntax error. Fixing that now..."
- Don't mention technical details unless relevant
- Re-verify the fix before responding

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
