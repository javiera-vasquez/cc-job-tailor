---
allowed-tools: Bash(bun run tailor-server:*)
description: (internal) Start live preview server for resume editing
---

# Tailor Development Server

Start the tailor development server in background for live validation and browser preview during resume editing sessions.

## What this command does:

1. **Start Background Server**: Launch `bun run tailor-server` as a background process
2. **Enable Live Preview**: Vite dev server provides browser preview (typically http://localhost:5173)
3. **Auto-Validation**: File watcher detects YAML changes in active company folder
4. **Instant Feedback**: Validation errors appear in console immediately on save

## Server Behavior:

The tailor-server combines two key features:

- **Vite Hot Reload**: Browser preview auto-updates on data regeneration
- **Smart File Watching**: Only watches YAML files in the active company's folder (reads from `.claude/tailor-context.yaml`)

## Auto-Regeneration Flow:

```
YAML file saved → company detected → generate-data runs → validation → browser updates
```

## Important Notes:

- Server reads active company from `.claude/tailor-context.yaml`
- Only YAML changes in the active company's folder trigger regeneration
- Server continues running even if validation fails
- Validation errors are displayed with helpful retry instructions
- User can see live PDF preview in browser while Claude makes edits

## Startup Instructions:

1. Run `bun run tailor-server` in background
2. Inform user that live preview server is starting
3. Explain that they can open their browser to see live changes
4. Mention that validation feedback will appear automatically
5. Remind them that the server will watch for all YAML changes in the active company folder

Start the tailor development server now in background mode.
