# Claude Code Sub-Agents - Deep Documentation

This document provides comprehensive guidance for creating, configuring, and using sub-agents in Claude Code. Use this as reference when working with the sub-agent system.

## Overview

Claude Code's sub-agent system allows you to create specialized AI assistants that handle specific types of tasks with dedicated context, tools, and expertise. Sub-agents operate independently with their own context windows, making them ideal for focused, repeatable workflows.

## Sub-Agent Fundamentals

### What Are Sub-Agents?

Sub-agents are specialized AI assistants that:

- **Operate independently** with separate context windows from the main conversation
- **Have targeted expertise** through custom system prompts
- **Access specific tools** with configurable permissions
- **Preserve context** in the main conversation while handling complex subtasks
- **Enable reusability** across projects and team members

### Core Benefits

**Context Preservation:**

- Main conversation context remains clean and focused
- Sub-agent handles detailed analysis without cluttering main thread
- Results summarized back to main conversation

**Specialized Expertise:**

- Custom system prompts define specific domain knowledge
- Focused behavior patterns for particular task types
- Consistent approach to similar problems

**Reusability:**

- Define once, use across multiple conversations
- Share configurations across team members
- Version control for team consistency

**Flexible Permissions:**

- Restrict tool access to only what's needed
- Enhance security with minimal privilege principle
- Prevent unintended operations

## Sub-Agent File Structure

### File Locations

- **Project-specific**: `.claude/subagents/` (version controlled, team shared)
- **Personal**: `~/.claude/subagents/` (user-specific, cross-project)

### Basic File Structure

```markdown
---
# Frontmatter configuration (YAML)
description: Brief agent description
allowed-tools: Tool(pattern:constraints)
model: Specific AI model (optional)
---

# System Prompt

Your detailed system prompt that defines the agent's expertise,
behavior, and task approach.
```

## Frontmatter Configuration

### Core Configuration Fields

#### `description`

Brief explanation of agent purpose (shown in agent selection):

```yaml
description: Expert code quality and security reviewer
```

#### `allowed-tools`

Specifies which tools the agent can use, with optional constraints:

```yaml
# Single tool with any arguments
allowed-tools: Read

# Multiple tools
allowed-tools: Read, Grep, Glob, Bash

# Tool with specific command constraints
allowed-tools: Bash(git *:*, npm test:*)

# Tool with multiple patterns
allowed-tools: Bash(git diff:*, git log:*), Read(src/**)

# Complex constraints
allowed-tools: Read, Edit(src/**/*), Bash(npm test:*, npm run lint:*)
```

**Tool Constraint Patterns:**

- `*` - wildcard matching
- `tool:*` - any arguments for specific command
- `command:constraint` - specific command with constraint
- `path/**/*` - recursive path patterns
- Multiple patterns separated by commas

#### `model`

Forces specific AI model for this agent:

```yaml
model: sonnet # or claude-3-haiku, opus, etc.
```

## System Prompts

### Crafting Effective System Prompts

System prompts define the agent's expertise, behavior, and approach. They should:

1. **Define expertise domain clearly**
2. **Specify task approach and methodology**
3. **Include quality criteria and standards**
4. **Provide output format expectations**
5. **Set boundaries and constraints**

### System Prompt Structure

**Expert Identity:**

```markdown
You are an expert [DOMAIN] specialist with deep knowledge of [TECHNOLOGIES].
Your role is to [PRIMARY RESPONSIBILITY].
```

**Task Methodology:**

```markdown
When analyzing [TASK TYPE], follow this approach:

1. [STEP 1]
2. [STEP 2]
3. [STEP 3]
```

**Quality Standards:**

```markdown
Focus on:

- [CRITERION 1]
- [CRITERION 2]
- [CRITERION 3]

Prioritize findings by severity: Critical > High > Medium > Low
```

**Output Format:**

```markdown
Provide results in this format:

## [SECTION 1]

- Finding details
- Recommendations

## [SECTION 2]

- Analysis
- Suggestions
```

## Built-in Agent Examples

### Code Reviewer Agent

**Purpose:** Expert code quality and security review

```markdown
---
description: Expert code quality and security reviewer
allowed-tools: Read, Grep, Glob, Bash(git diff:*, git log:*)
---

You are an expert code reviewer specializing in code quality, security,
and maintainability.

When reviewing code, follow this approach:

1. Run git diff to see all changes
2. Analyze code for:
   - Security vulnerabilities
   - Performance issues
   - Code quality and maintainability
   - Best practices adherence
   - Test coverage

3. Prioritize findings: Critical > High > Medium > Low

Provide actionable feedback with specific file locations and line numbers.
```

### Debugger Agent

**Purpose:** Root cause analysis and minimal fixes

```markdown
---
description: Debugging specialist for error analysis and fixes
allowed-tools: Read, Edit, Bash, Grep, Glob
---

You are a debugging expert focused on root cause analysis and minimal fixes.

When debugging issues:

1. Capture complete error details (stack traces, logs, error messages)
2. Identify reproduction steps
3. Analyze root cause with systematic investigation
4. Implement minimal, focused fixes
5. Verify solution resolves the issue

Avoid refactoring or unrelated changes. Focus solely on fixing the reported issue.
```

### Data Scientist Agent

**Purpose:** SQL queries and data analysis

```markdown
---
description: SQL and data analysis specialist
allowed-tools: Bash, Read, Write
---

You are a data scientist expert specializing in SQL analysis and insights.

When handling data tasks:

1. Write efficient, optimized SQL queries
2. Analyze query results for patterns and insights
3. Provide clear data summaries
4. Make data-driven recommendations
5. Document assumptions and limitations

Focus on accuracy, efficiency, and actionable insights.
```

## Agent Invocation Patterns

### Automatic Delegation

Claude Code automatically delegates to sub-agents based on task description:

```markdown
User: "Please review my recent code changes for security issues"
Claude: [Automatically invokes code-reviewer sub-agent]
```

### Explicit Invocation

Explicitly mention the agent name:

```markdown
User: "Use the debugger agent to investigate this error"
Claude: [Invokes debugger sub-agent]
```

### Tool-Based Invocation

Use the Task tool programmatically:

```typescript
// In custom commands or workflows
Task({
  subagent_type: 'code-reviewer',
  description: 'Review security changes',
  prompt: 'Analyze the authentication module changes for security vulnerabilities',
});
```

## Common Agent Patterns

### Testing Specialist

```markdown
---
description: Automated testing expert
allowed-tools: Read, Write, Bash(npm test:*, npm run test:*)
---

You are a testing specialist focused on comprehensive test coverage.

When creating tests:

1. Analyze code structure and edge cases
2. Write unit tests for individual functions
3. Create integration tests for workflows
4. Add edge case and error handling tests
5. Ensure tests are maintainable and clear

Follow project testing conventions and achieve 80%+ coverage.
```

### Documentation Writer

```markdown
---
description: Technical documentation specialist
allowed-tools: Read, Write(docs/**)
---

You are a technical writer specializing in clear, comprehensive documentation.

When creating documentation:

1. Understand the code/feature thoroughly
2. Write for the target audience (developers/users)
3. Include practical examples
4. Structure with clear headings and sections
5. Keep language concise and actionable

Follow project documentation standards and style guides.
```

### Refactoring Specialist

```markdown
---
description: Code refactoring and architecture expert
allowed-tools: Read, Edit, Grep, Glob
---

You are a refactoring expert focused on improving code quality without
changing behavior.

When refactoring:

1. Identify code smells and improvement opportunities
2. Maintain existing behavior and tests
3. Improve readability and maintainability
4. Apply design patterns appropriately
5. Ensure type safety and error handling

Make incremental improvements with clear rationale.
```

### Performance Optimizer

```markdown
---
description: Performance analysis and optimization specialist
allowed-tools: Read, Edit, Bash(npm run benchmark:*, npm run profile:*)
---

You are a performance optimization expert.

When optimizing code:

1. Profile and identify bottlenecks
2. Measure before and after performance
3. Optimize algorithms and data structures
4. Implement caching strategies
5. Verify improvements with benchmarks

Focus on measurable improvements with minimal code changes.
```

## Best Practices

### Agent Design Principles

1. **Single Responsibility**: Each agent should have one clear, focused purpose
2. **Clear Boundaries**: Define what the agent should and shouldn't do
3. **Minimal Tools**: Only grant access to tools the agent actually needs
4. **Detailed Prompts**: Provide comprehensive system prompts for consistency
5. **Testable**: Agents should produce verifiable, consistent results

### Security Considerations

**Tool Restrictions:**

```yaml
# Too permissive - avoid
allowed-tools: Bash, Edit, Write

# Better - specific constraints
allowed-tools: Bash(npm test:*, git diff:*), Edit(src/**)

# Best - minimal necessary permissions
allowed-tools: Read(src/**/*.ts), Bash(npm test:*)
```

**File Access Patterns:**

```yaml
# Restrict operations to specific paths
allowed-tools: Read(src/**/*), Write(docs/**/*.md), Edit(src/**/*.ts)
```

**Command Restrictions:**

```yaml
# Allow only safe, specific commands
allowed-tools: Bash(git diff:*, git log:*, npm test:*)
```

### Quality Guidelines

**System Prompt Quality:**

- Be explicit about methodology and approach
- Define output format and structure expectations
- Include quality criteria and standards
- Set clear boundaries on what agent should/shouldn't do
- Provide examples of expected behavior

**Tool Configuration:**

- Start with minimal tool access
- Add tools only as needed
- Use specific constraints over wildcards
- Document why each tool is required

**Testing and Validation:**

- Test agents with various input scenarios
- Verify agents stay within defined boundaries
- Ensure output format consistency
- Validate tool usage matches expectations

## Advanced Patterns

### Multi-Agent Workflows

Coordinate multiple agents for complex tasks:

```markdown
# Main conversation orchestrates agents

1. Use code-reviewer to analyze changes
2. Use debugger to fix identified issues
3. Use testing-specialist to add test coverage
4. Use documentation-writer to update docs
```

### Agent Composition

Build specialized agents from focused components:

```markdown
---
description: Full-stack feature implementation expert
allowed-tools: Read, Edit, Write, Bash(npm *:*, git *:*)
---

You are a full-stack developer combining multiple specialties:

1. Implement backend logic with security focus
2. Create frontend components with accessibility
3. Add comprehensive test coverage
4. Update documentation

Coordinate all aspects of feature development.
```

### Context-Aware Agents

Agents that adapt to project context:

```markdown
---
description: Project-aware code reviewer
allowed-tools: Read, Grep, Glob, Bash(git *:*)
---

Before reviewing, analyze project structure to understand:

1. Testing framework and conventions
2. Linting and formatting rules
3. Architecture patterns in use
4. Tech stack and dependencies

Apply project-specific standards in review.
```

## Integration with Project Workflows

### Resume Manager Example

Project-specific agents for this codebase:

**PDF Template Agent** (`.claude/subagents/pdf-template-expert.md`):

```markdown
---
description: React-PDF template specialist
allowed-tools: Read, Edit(src/templates/**/*), Bash(bun run dev:*)
---

You are an expert in @react-pdf/renderer and PDF template development.

When working with PDF templates:

1. Follow design token system in design-tokens.ts
2. Maintain React-PDF component best practices
3. Ensure proper styling and layout
4. Test with development server
5. Validate generated PDFs

Reference documentation in rpdf/ directory.
```

**Data Generation Agent** (`.claude/subagents/data-generator.md`):

```markdown
---
description: YAML data processing and validation expert
allowed-tools: Read, Bash(bun run generate-data:*), Grep(resume-data/**)
---

You are a data transformation specialist for this project.

When processing resume data:

1. Validate YAML structure against schemas
2. Transform data using mapping rules
3. Generate TypeScript output with Zod validation
4. Handle company-specific tailoring
5. Verify generated data integrity

Follow schemas in src/zod/schemas.ts.
```

## Debugging and Troubleshooting

### Common Issues

**Agent Not Invoked:**

- Check agent description matches task domain
- Try explicit invocation by name
- Verify agent file is in correct location
- Check frontmatter syntax validity

**Tool Permission Errors:**

- Review allowed-tools configuration
- Verify tool patterns match actual usage
- Use specific constraints instead of wildcards
- Check file path patterns are correct

**Inconsistent Behavior:**

- Make system prompt more specific
- Add explicit methodology steps
- Define clear output format
- Include examples in system prompt

**Context Issues:**

- Ensure agent has access to needed tools
- Provide complete task description
- Include relevant file paths or patterns
- Break complex tasks into smaller subtasks

### Testing Agents

1. Create agent with minimal functionality
2. Test with various task descriptions
3. Verify tool usage matches expectations
4. Check output format consistency
5. Validate agent stays within boundaries
6. Test error handling scenarios

## Agent Maintenance

### Version Control

- Commit agent files to project repository
- Document agent changes in commit messages
- Use semantic versioning for major updates
- Review agent additions in pull requests

### Documentation

- Keep descriptions current and accurate
- Update system prompts when behavior changes
- Document tool requirements and rationale
- Share effective patterns with team

### Team Coordination

- Establish naming conventions for agents
- Define standard agent categories
- Review new agents in code review
- Share useful patterns across projects

## Quick Reference

### Agent File Template

```markdown
---
description: [Clear, concise agent purpose]
allowed-tools: [Minimal required tools with constraints]
model: [optional - specific model if needed]
---

You are [EXPERT IDENTITY].

When [TASK TYPE]:

1. [METHODOLOGY STEP 1]
2. [METHODOLOGY STEP 2]
3. [METHODOLOGY STEP 3]

Focus on:

- [QUALITY CRITERION 1]
- [QUALITY CRITERION 2]

Provide results in [OUTPUT FORMAT].
```

### Common Agent Types

- **code-reviewer**: Quality, security, best practices
- **debugger**: Error analysis, root cause, fixes
- **testing-specialist**: Test creation, coverage
- **documentation-writer**: Docs, README, API reference
- **refactoring-specialist**: Code quality improvements
- **performance-optimizer**: Profiling, optimization
- **security-auditor**: Vulnerability analysis
- **data-scientist**: SQL, data analysis

This documentation serves as the complete reference for Claude Code sub-agent development and should be consulted when creating, configuring, or troubleshooting sub-agents.
