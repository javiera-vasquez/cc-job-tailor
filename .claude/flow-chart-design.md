# /flow-chart Command Design Document

## Command Mechanics (Interactive Two-Step Approach)

### User Interaction Flow

**Step 1: Initial Command**

```
/flow-chart @src/utils/tailor-context.ts
```

**Step 2: Claude presents options**
Claude displays available visualization options:

- Option 1: Basic CFD (logical paths only, ~15 nodes max)
- Option 2: Detailed CFD (all decision points, operations, ~25 nodes)
- Option 3: Error Handling Focus CFD (emphasizes error paths)
- Option 4: Logical Flow Only (simplest - only if/else branches)

**Step 3: User selects option**
User responds with number (1-4) or select option interactively

**Step 4: Generation**
Claude generates the selected diagram and saves to file

---

## Why Option 1 is Better

### Advantages of Interactive Approach

✅ **User Control**: User sees options before committing to a diagram type
✅ **File Flexibility**: Can analyze any file without pre-selecting type
✅ **Context Aware**: Claude can suggest most appropriate diagram based on file analysis
✅ **Discoverability**: User learns about different diagram types
✅ **Lower Friction**: Single command entry point
✅ **Intelligent Defaults**: Claude can suggest based on file complexity

### Disadvantages of Option 2 (Type Parameter)

❌ Users must know diagram types upfront
❌ Less discoverable - requires documentation
❌ Hard to remember type codes
❌ No benefit of file analysis before selection

---

## Command Specification

### File: `.claude/commands/flow-chart.md`

**Frontmatter:**

```yaml
allowed-tools: Read, Write, Task(subagent_type=Explore)
description: Generate interactive Control Flow Diagram for any file
argument-hint: @filename [optional-line-range]
```

**Purpose:**

1. User provides file path
2. Claude reads and analyzes file
3. Claude presents 4 diagram options
4. User selects option
5. Claude generates Mermaid CFD
6. Saves to `[filename].cfd.md`

---

## Diagram Option Details

### Option 1: Basic CFD (Logical Paths)

- **Best for**: Quick understanding
- **Node count**: ~10-15 nodes max
- **Includes**: Decision points only, major operations, exit points
- **Excludes**: Implementation details, nested conditions
- **Use case**: Function overview, simple flows

### Option 2: Detailed CFD

- **Best for**: Complete analysis
- **Node count**: ~20-30 nodes
- **Includes**: All conditions, all operations, error paths, validations
- **Excludes**: Implementation details
- **Use case**: Complex functions, error handling

### Option 3: Error Handling Focus

- **Best for**: Understanding failure paths
- **Node count**: ~15-25 nodes
- **Includes**: All validations, error paths, try-catch blocks
- **Emphasizes**: Error branches (red), recovery paths
- **Use case**: Error-prone functions, validation logic

### Option 4: Logical Flow Only

- **Best for**: Simplest view
- **Node count**: ~8-12 nodes
- **Includes**: Only if/else branches, entry/exit
- **Excludes**: Operations, nested logic
- **Use case**: Simple conditionals, boolean logic

---

## Implementation Details

### File Analysis

1. Read target file
2. Identify functions/main flow
3. Analyze complexity
4. Suggest best option

### Output Format

- **File created**: `[filename].cfd.md`
- **Contains**: Mermaid code block + optional documentation
- **Styling**: Color-coded (blue entry, green success, red error)

### User Interaction Pattern

Claude should:

1. Analyze file silently
2. Present options with brief descriptions
3. Ask user to choose (1-4)
4. Wait for response
5. Generate diagram
6. Save and confirm

---

## Example Interaction

**User Input:**

```
/flow-chart @scripts/set-env.ts
```

**Claude Response:**

```
I'll analyze the file and present diagram options.

File analyzed: scripts/set-env.ts
- Main function: setTailorContext flow
- Complexity: Medium (5 decision points, 3 exit points)
- Pattern: Functional error handling with early returns

Choose your diagram type:

1. Basic CFD - Logical paths only (~12 nodes)
   Quick overview of execution flow without implementation details

2. Detailed CFD - Complete analysis (~28 nodes)
   All decision points, operations, and error paths

3. Error Handling Focus - Error paths emphasized (~18 nodes)
   Highlights all validation steps and failure scenarios

4. Logical Flow Only - Simplest view (~10 nodes)
   Only if/else branches and entry/exit points

Which option would you like? (Enter 1-4)
```

**User Response:**

```
2
```

**Claude generates Detailed CFD and saves to `scripts/set-env.ts.cfd.md`**

---

## Technical Implementation

### Tool Usage

- **Read**: Analyze file content
- **Task(Explore)**: Identify functions and patterns
- **Write**: Save generated diagram to disk

### Error Handling

- File not found → suggest available files
- Multiple functions → ask which to analyze
- Too complex → suggest breaking down

### Output Files

- Location: Same directory as source file
- Naming: `{filename}.cfd.md`
- Format: Markdown with Mermaid code block

---

## Command Benefits

1. **Single entry point**: Users only learn one command
2. **Intelligent**: Claude analyzes before presenting options
3. **Educational**: Helps users understand diagram types
4. **Flexible**: Works with any file
5. **Non-destructive**: Saves to new file
6. **Reusable**: Can run multiple times with different options
