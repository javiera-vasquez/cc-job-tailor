# Claude Code Hooks - Deep Documentation

This document provides comprehensive guidance for creating, configuring, and managing hooks in Claude Code. Use this as reference when working with the hooks system to automate workflows and customize Claude Code's behavior.

## Overview

Claude Code hooks are shell commands that execute automatically at specific points in Claude Code's workflow. They provide deterministic control over Claude Code's behavior and can be used for automation, logging, validation, formatting, and custom notifications.

## Hook Events

### Available Hook Events

#### `PreToolUse`
**When it runs**: Before any tool call is executed
**Purpose**: Block or validate tool calls before execution
**Use cases**:
- File protection (block edits to sensitive files)
- Command validation
- Security checks
- Pre-execution setup

```bash
# Example: Block edits to production config
if [[ "$TOOL_NAME" == "Edit" && "$1" == *"prod.config"* ]]; then
  echo "❌ Production config files are protected"
  exit 1
fi
```

#### `PostToolUse`
**When it runs**: After a tool call completes successfully
**Purpose**: Post-processing and cleanup
**Use cases**:
- Auto-formatting after file edits
- Logging completed actions
- Triggering dependent processes
- File validation

```bash
# Example: Auto-format TypeScript files after edit
if [[ "$TOOL_NAME" == "Edit" && "$1" == *.ts ]]; then
  npx prettier --write "$1"
fi
```

#### `UserPromptSubmit`
**When it runs**: When user submits a new prompt
**Purpose**: Log user interactions and prepare environment
**Use cases**:
- Session logging
- Environment preparation
- User activity tracking
- Context setup

```bash
# Example: Log user prompts with timestamp
echo "$(date): User prompt - $1" >> ~/.claude/session.log
```

#### `Notification`
**When it runs**: When Claude Code sends notifications
**Purpose**: Custom notification handling
**Use cases**:
- Desktop notifications
- Slack/Teams integration
- Email alerts
- Custom notification systems

```bash
# Example: Desktop notification on macOS
osascript -e "display notification \"$1\" with title \"Claude Code\""
```

#### `Stop`
**When it runs**: When Claude Code finishes responding
**Purpose**: End-of-response processing
**Use cases**:
- Response logging
- Cleanup operations
- Status updates
- Performance metrics

```bash
# Example: Log response completion
echo "$(date): Response completed" >> ~/.claude/activity.log
```

#### `SubagentStop`
**When it runs**: When a subagent task completes
**Purpose**: Subagent-specific post-processing
**Use cases**:
- Subagent result logging
- Task completion notifications
- Result validation
- Workflow continuation

```bash
# Example: Notify when code review subagent completes
if [[ "$SUBAGENT_TYPE" == "code-reviewer" ]]; then
  echo "Code review completed for: $1"
fi
```

#### `PreCompact`
**When it runs**: Before compact operations
**Purpose**: Pre-compaction preparation
**Use cases**:
- Backup important context
- Save session state
- Clean temporary files
- Prepare for context reduction

```bash
# Example: Backup important files before compacting
cp important.log ~/.claude/backups/$(date +%s).log
```

#### `SessionStart`
**When it runs**: At the beginning of a Claude Code session
**Purpose**: Session initialization
**Use cases**:
- Environment setup
- Tool preparation
- Session logging
- Configuration loading

```bash
# Example: Initialize development environment
source ~/.bashrc
cd "$PROJECT_ROOT"
npm install
```

#### `SessionEnd`
**When it runs**: At the end of a Claude Code session
**Purpose**: Session cleanup and finalization
**Use cases**:
- Cleanup temporary files
- Session summaries
- Backup session data
- Environment reset

```bash
# Example: Clean up and log session end
rm -rf /tmp/claude-session-*
echo "$(date): Session ended" >> ~/.claude/sessions.log
```

## Hook Configuration

### Setting Up Hooks

1. **Access Hook Configuration**:
   Use the `/hooks` slash command in Claude Code

2. **Select Hook Event**:
   Choose from the available events listed above

3. **Add Matcher Pattern**:
   Define when the hook should trigger:
   - `*` - Match all tool calls/events
   - `Bash` - Match only Bash tool calls
   - `Edit` - Match only Edit tool calls
   - `Read(*.ts)` - Match Read calls for TypeScript files
   - Multiple patterns: `Bash,Edit,Write`

4. **Define Hook Command**:
   Shell command to execute when hook triggers

5. **Choose Storage Location**:
   - User settings (global, all projects)
   - Project-specific (`.claude/` directory)

### Hook Command Structure

```bash
#!/bin/bash
# Hook commands receive context as arguments
# $1, $2, etc. contain relevant information based on hook type
# Environment variables provide additional context

# Example hook structure
TOOL_NAME="$1"
FILE_PATH="$2"
ADDITIONAL_ARGS="$3"

# Your hook logic here
echo "Hook triggered: $TOOL_NAME on $FILE_PATH"
```

### Environment Variables

Hooks receive context through environment variables:
- `CLAUDE_WORKING_DIR`: Current working directory
- `CLAUDE_SESSION_ID`: Unique session identifier
- `TOOL_NAME`: Name of the tool being used (for tool-related hooks)
- `SUBAGENT_TYPE`: Type of subagent (for SubagentStop hooks)

## Practical Examples

### Code Quality and Formatting

#### Auto-format on file save
```yaml
Event: PostToolUse
Matcher: Edit,Write
Command: |
  if [[ "$1" == *.ts || "$1" == *.tsx ]]; then
    npx prettier --write "$2"
    echo "✅ Formatted TypeScript file: $2"
  elif [[ "$1" == *.py ]]; then
    black "$2"
    echo "✅ Formatted Python file: $2"
  fi
```

#### Lint check before edits
```yaml
Event: PreToolUse
Matcher: Edit
Command: |
  if [[ "$2" == *.ts ]]; then
    npx eslint "$2" --quiet || {
      echo "❌ ESLint errors found in $2"
      exit 1
    }
  fi
```

### Security and Protection

#### Protect sensitive files
```yaml
Event: PreToolUse
Matcher: Edit,Write
Command: |
  PROTECTED_PATTERNS=(".env" "secrets" "private" "prod.config")
  for pattern in "${PROTECTED_PATTERNS[@]}"; do
    if [[ "$2" == *"$pattern"* ]]; then
      echo "🚫 Protected file: $2"
      echo "Use /override-protection to bypass"
      exit 1
    fi
  done
```

#### Log all file modifications
```yaml
Event: PostToolUse
Matcher: Edit,Write
Command: |
  LOG_FILE="$HOME/.claude/file-changes.log"
  echo "$(date): $1 - $2" >> "$LOG_FILE"
  echo "📝 Logged file change: $2"
```

### Development Workflow

#### Auto-test after code changes
```yaml
Event: PostToolUse
Matcher: Edit
Command: |
  if [[ "$2" == *.test.* || "$2" == *spec.* ]]; then
    echo "🧪 Running tests after test file change..."
    npm test "$2"
  elif [[ "$2" == *.ts && -f "$(dirname "$2")/*.test.ts" ]]; then
    echo "🧪 Running related tests..."
    npm test -- --testPathPattern="$(dirname "$2")"
  fi
```

#### Git auto-commit for documentation
```yaml
Event: PostToolUse
Matcher: Edit,Write
Command: |
  if [[ "$2" == *.md ]]; then
    cd "$CLAUDE_WORKING_DIR"
    git add "$2"
    git diff --staged --quiet || {
      git commit -m "docs: update $(basename "$2")" --quiet
      echo "📚 Auto-committed documentation: $2"
    }
  fi
```

### Notifications and Logging

#### Desktop notifications for long operations
```yaml
Event: Stop
Matcher: *
Command: |
  # macOS notification
  if [[ "$OSTYPE" == "darwin"* ]]; then
    osascript -e 'display notification "Claude Code task completed" with title "Claude Code"'
  # Linux notification
  elif command -v notify-send >/dev/null; then
    notify-send "Claude Code" "Task completed"
  fi
```

#### Comprehensive session logging
```yaml
Event: UserPromptSubmit
Matcher: *
Command: |
  LOG_DIR="$HOME/.claude/logs"
  mkdir -p "$LOG_DIR"
  SESSION_LOG="$LOG_DIR/session-$(date +%Y%m%d).log"
  echo "$(date): PROMPT: $1" >> "$SESSION_LOG"
```

### Resume Manager Project Specific

#### PDF generation workflow
```yaml
Event: PostToolUse
Matcher: Bash(bun run generate-pdf.ts:*)
Command: |
  if [[ $? -eq 0 ]]; then
    echo "✅ PDF generated successfully"
    # Open PDF if on macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
      open tmp/*.pdf 2>/dev/null || echo "No PDF files found to open"
    fi
  else
    echo "❌ PDF generation failed"
  fi
```

#### Resume data validation
```yaml
Event: PreToolUse
Matcher: Edit,Write
Command: |
  if [[ "$2" == resume-data/sources/*.yaml ]]; then
    echo "🔍 Validating YAML syntax..."
    python -c "import yaml; yaml.safe_load(open('$2'))" || {
      echo "❌ Invalid YAML syntax in $2"
      exit 1
    }
    echo "✅ YAML syntax valid"
  fi
```

## Best Practices

### Performance Considerations

1. **Keep hooks lightweight**: Long-running hooks block Claude Code
2. **Use background processes**: For heavy operations, use `&` to run in background
3. **Cache expensive operations**: Store results to avoid repeated computations
4. **Fail fast**: Exit early on invalid conditions

```bash
# Good: Quick validation
[[ -f "$FILE" ]] || { echo "File not found"; exit 1; }

# Better: Background heavy operation
heavy_operation "$FILE" &
echo "Started background processing"
```

### Error Handling

1. **Always provide meaningful error messages**
2. **Use appropriate exit codes**
3. **Handle missing dependencies gracefully**
4. **Provide recovery suggestions**

```bash
# Robust error handling example
if ! command -v prettier >/dev/null; then
  echo "❌ Prettier not found. Install with: npm install -g prettier"
  exit 1
fi

prettier --write "$FILE" || {
  echo "❌ Prettier failed for $FILE"
  echo "💡 Try: npx prettier --check $FILE"
  exit 1
}
```

### Security Guidelines

1. **Validate all inputs**: Never trust file paths or user input
2. **Use absolute paths**: Avoid relative path manipulation
3. **Limit file access**: Only access files you need
4. **Sanitize variables**: Escape special characters

```bash
# Secure file handling
FILE_PATH="$(realpath "$2")"
if [[ "$FILE_PATH" != "$CLAUDE_WORKING_DIR"* ]]; then
  echo "❌ File outside project directory"
  exit 1
fi
```

### Debugging Hooks

#### Enable debug output
```bash
# Add to hook for debugging
set -x  # Enable debug output
echo "DEBUG: Hook args: $*"
env | grep CLAUDE  # Show Claude-specific env vars
set +x  # Disable debug output
```

#### Test hooks manually
```bash
# Test hook command independently
TOOL_NAME="Edit" /path/to/hook/command test.ts
```

#### Hook logging
```bash
# Add comprehensive logging
LOG_FILE="$HOME/.claude/hook-debug.log"
{
  echo "$(date): Hook: $0"
  echo "Args: $*"
  echo "Env: $(env | grep CLAUDE)"
  echo "---"
} >> "$LOG_FILE"
```

## Advanced Patterns

### Conditional Hook Execution

```bash
# Execute based on project type
if [[ -f "package.json" ]]; then
  # Node.js project
  npm run lint
elif [[ -f "requirements.txt" ]]; then
  # Python project
  python -m flake8 .
fi
```

### Hook Chaining

```bash
# Call other hooks or commands
~/.claude/hooks/format-code.sh "$@"
~/.claude/hooks/run-tests.sh "$@"
```

### State Management

```bash
# Maintain state between hook executions
STATE_FILE="$HOME/.claude/hook-state"
echo "$CURRENT_STATE" >> "$STATE_FILE"
```

## Troubleshooting

### Common Issues

1. **Hook not executing**: Check matcher pattern and event type
2. **Permission denied**: Ensure hook script is executable
3. **Command not found**: Use absolute paths or check PATH
4. **Blocking operations**: Move long operations to background

### Debug Steps

1. Check hook configuration with `/hooks`
2. Test hook command manually
3. Review Claude Code logs
4. Simplify hook for testing
5. Add debug output to hook script

### Recovery

```bash
# Disable problematic hook temporarily
# Edit hook configuration via /hooks command
# Or rename hook file to disable
mv problematic-hook.sh problematic-hook.sh.disabled
```

## Integration Examples

### Resume Manager Hooks Setup

For the current resume manager project, recommended hooks:

1. **Auto-format YAML files**
2. **Validate resume data structure**
3. **Auto-generate data modules after YAML changes**
4. **PDF preview after generation**
5. **Git commit for documentation updates**

This documentation provides complete guidance for implementing and managing Claude Code hooks effectively within your development workflow.