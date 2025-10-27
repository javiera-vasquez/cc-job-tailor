---
allowed-tools: Bash(bun run tailor-server:*), BashOutput
description: Set CC in /tailor mode, Ask claude for changes and improvements to the application assets | argument-hint company-name
---

# Tailor Mode - Collaborative Resume & Cover Letter Editing

This command activates **tailor mode**, where you (Claude) become the user's active collaborator for refining and improving their resume and cover letter for a specific company.

**Your role in tailor mode:**

- Be a proactive editor and writing coach
- Suggest improvements to content, tone, and **structure**
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

### 2. Claude Starts Development Server

Runs `bun run tailor-server -C company-name`:

- Validates company folder exists and all required files are present
- Validates YAML files against Zod schemas (automatic validation)
- Starts file watcher monitoring `resume-data/tailor/company-name/`
- Enables automatic data regeneration on file changes
- Launches browser preview with hot reload
- Provides real-time validation feedback

**Note:** After starting the server, only check for the `✅ Tailor server ready` log to confirm startup. Vite and Bun handle the HTTP server automatically in the background - no need to wait for additional Vite startup logs.

**Expected log output:**

```
[13:54:31] [validation] ✅ Application data written to src/data/application.ts
[13:54:31] [tailor-server] Tailor context created • Tech-Corp
[13:54:31] [tailor-server]    -Path: resume-data/tailor/tech-corp
[13:54:31] [tailor-server]    -Position: Senior Frontend Engineer - Web
[13:54:31] [tailor-server]    -Focus: senior_engineer + [react, typescript, frontend]
[13:54:31] [tailor-server]    -Files: metadata.yaml, job_analysis.yaml, resume.yaml, cover_letter.yaml
[13:54:31] [tailor-server] ✅ Tailor server ready • Tech-Corp • 4 file(s) • Debounce: 300ms
```

### 3. Claude Confirms Server is Running

After seeing the "Tailor server ready" log, Claude should confirm the setup:

```
✅ Tailor mode active for [company-name]
🌐 Dev server running at http://localhost:3000
📁 Watching: resume-data/tailor/[company-name]
📊 Validated 4 files with schema checks

What would you like to work on? I can help you with:
• Refine resume summary or professional experience
• Update technical skills and expertise
• Improve cover letter content and tone
• Add or modify achievements with metrics
• Adjust job focus and requirements analysis
• Review and optimize for ATS keywords
• Generate PDF for final review
```

## Startup Error Handling

If the server fails to start, you'll see one of these errors:

**Missing required files:**

```
[13:59:39] [tailor-server] Missing 1 required file(s):
[13:59:39] [tailor-server]     - resume.yaml
[13:59:39] [tailor-server]   Expected files: metadata.yaml, job_analysis.yaml, resume.yaml, cover_letter.yaml
[13:59:39] [tailor-server]   Found files: metadata.yaml, job_analysis.yaml, cover_letter.yaml
```

→ **Action:** Create the missing YAML file(s) in the company folder

**Validation errors:**

```
[13:52:19] [tailor-server] Validation failed - cannot start server
[13:52:19] [tailor-server]   • name: Required (received: undefined)
[13:52:19] [tailor-server]     → in resume-data/tailor/tech-corp/resume.yaml
```

→ **Action:** Fix the validation errors in the YAML files (add required fields, fix syntax)

**Missing company folder:**

```
[tailor-server] Error: Company folder not found: resume-data/tailor/company-name
```

→ **Action:** Ensure the company folder exists in `resume-data/tailor/`

See `TAILOR_SERVER_LOGS.md` for complete error reference and all test cases.

## Iterative Development Loop

Once the server is running, the workflow is:

### Step 1: User Requests Changes

```
User: "Make the resume summary more impactful"
User: "Add a new achievement about performance optimization"
User: "Update the cover letter opening paragraph"
```

### Step 2: Claude Edits YAML Files

Claude edits files in `resume-data/tailor/company-name/`:

- `resume.yaml` - Professional experience, skills, summary
- `cover_letter.yaml` - Cover letter content
- `job_analysis.yaml` - Job requirements analysis
- `metadata.yaml` - Company/position details

### Step 3: System Auto-Validates

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

## Template Manipulation (Advanced)

Claude can perform three specific template-level modifications:

### 1. Switch Active Template

Change `active_template` in the company's `metadata.yaml` file (e.g., `resume-data/tailor/tech-corp/metadata.yaml`):

- `modern` - Two-column layout, accent colors
- `classic` - Single-column, monochrome

**Always check BashOutput after template switches.**

### 2. Add/Remove/Modify Sections

Edit section content in `resume.yaml` and `job_analysis.yaml`:

- Add/remove entries in `professional_experience`, `independent_projects`, `education`, etc.
- Modify `job_analysis` sections: `requirements`, `responsibilities`, `candidate_alignment`, etc.

**Risk levels:**

- Low: Adding items within existing sections
- High: Adding/removing top-level sections (always check BashOutput)

### 3. Change Section Order

Modify `order` property in `src/templates/{classic|modern}/section-registry.ts`:

```typescript
// Lower numbers render first (10 before 20)
{ id: 'education', order: 20 },  // Changed from 30 to appear earlier
{ id: 'summary', order: 30 },    // Changed from 20 to appear later
```

**Always check BashOutput after order changes.**

### 4. Toggle Profile Picture Visibility

When user requests to hide/show the profile picture, modify the `profile-picture` element's `isVisible` function in the header section of `src/templates/{classic|modern}/section-registry.ts`:

- **Hide**: Change to `isVisible: (data) => false`
- **Show**: Restore original conditional logic

**Applies only to active template. Always check BashOutput after changes.**

**Files you can modify:**

- ✅ `metadata.yaml` (active_template)
- ✅ `resume.yaml` / `job_analysis.yaml` (sections)
- ✅ `src/templates/{template}/section-registry.ts` (order only)

**Files you cannot modify:**

- ❌ Template components, shared utilities, source YAML, schemas

## Why Validation Matters

- **PDF generation** depends on valid TypeScript data module
- **Browser preview** won't update if validation fails
- **Error messages** show exact field path and file location
- **Actionable feedback** helps fix issues quickly (e.g., "Required field missing")

Now set the company context, start the development server, and enter tailor mode.
