# Claude Code Custom Commands - Deep Documentation

This document provides comprehensive guidance for creating, editing, and managing custom slash commands in Claude Code. Use this as reference when working with the custom command system.

## Overview

Claude Code's custom command system allows users to define reusable prompts as Markdown files with special frontmatter configuration. These commands can accept arguments, execute specific tools, and automate common workflows.

## Command File Structure

### File Locations
- **Project-specific**: `.claude/commands/` (version controlled, team shared)
- **Personal**: `~/.claude/commands/` (user-specific, cross-project)

### Basic File Structure
```markdown
---
# Frontmatter configuration (YAML)
allowed-tools: Tool(pattern:constraints)
description: Brief command description
argument-hint: Expected argument format
model: Specific AI model (optional)
---

# Command prompt content
Your prompt template with argument placeholders
```

## Frontmatter Configuration

### Core Configuration Fields

#### `allowed-tools`
Specifies which tools the command can use, with optional constraints:

```yaml
# Single tool with any arguments
allowed-tools: Bash

# Multiple tools
allowed-tools: Bash, Read, Write

# Tool with specific command constraints
allowed-tools: Bash(git *:*), Read(*.md)

# Tool with multiple patterns
allowed-tools: Bash(npm run *:*, git *:*)

# Complex constraints
allowed-tools: Bash(bun run generate-pdf.ts:*), Read, Write(*.md)
```

**Tool Constraint Patterns:**
- `*` - wildcard matching
- `tool:*` - any arguments for specific command
- `command:constraint` - specific command with constraint
- `*.ext` - file extension filtering
- Multiple patterns separated by commas

#### `description`
Brief explanation of command purpose (shown in help/autocomplete):
```yaml
description: Generate PDF resume for specific company
```

#### `argument-hint`
Describes expected argument format for user guidance:
```yaml
argument-hint: company-name [resume|cover-letter|both]
```

#### `model`
Forces specific AI model for this command:
```yaml
model: sonnet  # or claude-3-haiku, etc.
```

## Argument Handling

### Argument Placeholders

#### `$ARGUMENTS`
All arguments passed to command as single string:
```markdown
Generate report for: $ARGUMENTS
```
Usage: `/report Q4 sales data` → "Generate report for: Q4 sales data"

#### Positional Arguments
Individual argument access:
```markdown
Deploy $1 to $2 environment with config $3
```
Usage: `/deploy myapp production config.yml` → "Deploy myapp to production environment with config config.yml"

#### Default Values
Provide fallbacks using bash-style syntax:
```markdown
Generate PDF for: $1
Document type: ${2:-both}
Environment: ${3:-production}
```
Usage: `/generate-pdf TechCorp` → Uses "both" and "production" as defaults

### Argument Processing Examples

**Company-specific command:**
```markdown
---
allowed-tools: Bash(bun run generate-pdf.ts:*)
description: Create PDF resume for specific company
argument-hint: company-name [document-type]
---
Generate PDF documents for company: $1

Document type: ${2:-both}

Run PDF generation with company-specific tailored data
```

**Multi-step workflow:**
```markdown
---
allowed-tools: Bash(git *:*), Read, Write
description: Create feature branch and initial setup
argument-hint: feature-name
---
Create new feature branch '$1' and set up initial files:

1. Create and checkout branch feature/$1
2. Create initial component structure
3. Add basic tests
4. Update documentation
```

## Tool Integration Patterns

### File Operations
```markdown
---
allowed-tools: Read, Write(src/**/*), Edit
description: Refactor component structure
---
Analyze and refactor the component in $1:

1. Read current implementation
2. Identify improvement opportunities
3. Implement changes using Edit tool
4. Ensure TypeScript compliance
```

### Build and Development
```markdown
---
allowed-tools: Bash(npm *:*, bun *:*), Read(package.json)
description: Run development workflow
---
Execute development workflow for $1:

1. Install dependencies if needed
2. Run linting and type checking
3. Execute tests
4. Start development server
```

### Git Operations
```markdown
---
allowed-tools: Bash(git *:*), Read(.gitignore)
description: Smart git commit with analysis
---
Create intelligent git commit:

1. Analyze staged changes
2. Generate appropriate commit message
3. Check for sensitive files
4. Execute commit with proper formatting
```

## Best Practices

### Command Design Principles

1. **Single Responsibility**: Each command should have one clear purpose
2. **Predictable Naming**: Use descriptive, consistent naming conventions
3. **Argument Validation**: Handle missing or invalid arguments gracefully
4. **Tool Constraints**: Be specific about allowed tools for security
5. **Documentation**: Always include clear descriptions and argument hints

### Security Considerations

**Tool Restrictions:**
```yaml
# Too permissive - avoid
allowed-tools: Bash

# Better - specific constraints
allowed-tools: Bash(git *:*, npm run *:*)

# Best - explicit command patterns
allowed-tools: Bash(bun run generate-pdf.ts:*), Read(*.md), Write(tmp/*)
```

**File Access Patterns:**
```yaml
# Restrict file operations to specific paths
allowed-tools: Read(src/**/*), Write(docs/**/*.md), Edit(*.ts)
```

### Error Handling

Include guidance for common failure scenarios:
```markdown
---
allowed-tools: Bash(bun run generate-pdf.ts:*)
description: Generate PDF with error handling
---
Generate PDF for company: $1

If company data doesn't exist:
1. List available companies in tailor/ directory
2. Suggest running job analysis first
3. Provide template creation guidance

Execute PDF generation and handle any build errors
```

## Advanced Patterns

### Conditional Logic
```markdown
Check if $1 exists as a company directory, then:
- If exists: generate PDF directly
- If not exists: create company structure first
```

### Multi-Command Workflows
```markdown
---
allowed-tools: Bash(git *:*), Task
description: Complete feature development cycle
---
Execute full feature development for: $1

1. Create feature branch
2. Use specialized agents for implementation
3. Run comprehensive testing
4. Create pull request with proper documentation
```

### Data Processing
```markdown
---
allowed-tools: Read(resume-data/**/*), Task(job-tailor), Bash(bun run generate-pdf.ts:*)
description: Complete job application workflow
---
Process job application for $1:

1. Analyze job posting using job-tailor agent
2. Generate tailored resume data
3. Create PDF documents
4. Prepare application summary
```

## Integration with Project Workflows

### Resume Manager Example
Current project commands demonstrate integration patterns:

**PDF Generation Command** (`.claude/commands/generate-pdf.md`):
```markdown
---
allowed-tools: Bash(bun run generate-pdf.ts:*)
description: Create PDF resume/cover letter for specific company
---
Generate PDF documents for company: $1
Document type: ${2:-both}
Run PDF generation with company-specific tailored data
```

### Command Dependencies
Commands can reference other project elements:
- Build scripts in `package.json`
- Data files in specific directories
- Configuration files
- Other custom commands

## Debugging and Troubleshooting

### Common Issues

**Tool Permission Errors:**
- Check `allowed-tools` frontmatter
- Verify command patterns match actual usage
- Use specific constraints instead of wildcards

**Argument Processing:**
- Test with various argument combinations
- Provide default values for optional parameters
- Include argument validation in prompt

**File Path Issues:**
- Use absolute paths when possible
- Check file/directory existence before operations
- Handle missing dependencies gracefully

### Testing Commands
1. Create command with minimal functionality
2. Test argument handling edge cases
3. Verify tool constraints work as expected
4. Check error handling scenarios
5. Validate with team workflows

## Command Maintenance

### Version Control
- Commit command files to project repository
- Document command changes in commit messages
- Use semantic versioning for major command updates

### Documentation
- Keep argument hints current
- Update descriptions when functionality changes
- Document breaking changes in project notes

### Team Coordination
- Establish naming conventions for team commands
- Review command additions in pull requests
- Share useful patterns across projects

## Examples Library

### Basic Commands
```markdown
# Simple file operation
---
allowed-tools: Read
description: Display file contents with analysis
---
Read and analyze the file: $1
```

### Complex Workflows
```markdown
# Multi-agent coordination
---
allowed-tools: Task, Bash(npm *:*), Read, Write
description: Full feature implementation with testing
---
Implement feature '$1' with complete testing:

1. Use general-purpose agent for research
2. Implement core functionality
3. Add comprehensive tests
4. Update documentation
5. Verify build and deployment readiness
```

This documentation serves as the complete reference for Claude Code custom command development and should be consulted when creating, modifying, or troubleshooting custom commands.