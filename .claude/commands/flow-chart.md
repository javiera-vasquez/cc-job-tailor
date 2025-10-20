---
allowed-tools: Read, Task(subagent_type=Explore)
description: Generate interactive Control Flow Diagram for any file with visualization options
argument-hint: @filename [optional-line-range]
---

# Generate Control Flow Diagram

You are helping the user create a Control Flow Diagram (CFD) for a specific file. Follow this two-step interactive process:

## Step 1: Analyze the File

Read and analyze the file: `$1`

Identify:
- Main function(s) or entry point
- Decision points and branches
- Number of exit points
- Error handling patterns used
- Overall complexity

## Step 2: Present Diagram Options

Based on your analysis, present these 4 options to the user (use clear formatting):

### Option 1: Basic CFD (Logical Paths Only)
- **Best for**: Quick overview
- **Nodes**: ~10-15
- **Shows**: Decision points, major operations, exit points
- **Hides**: Implementation details, nested conditions
- **Mermaid style**: Simple graph with color coding

### Option 2: Detailed CFD (Complete Analysis)
- **Best for**: Full understanding
- **Nodes**: ~20-30
- **Shows**: All conditions, operations, error paths, validations
- **Hides**: Implementation details
- **Mermaid style**: Comprehensive graph with labeled branches

### Option 3: Error Handling Focus
- **Best for**: Understanding failure scenarios
- **Nodes**: ~15-25
- **Shows**: All validations, error paths, try-catch blocks
- **Emphasizes**: Error branches and recovery paths
- **Mermaid style**: Color-coded (green success, red errors)

### Option 4: Logical Flow Only
- **Best for**: Simplest view
- **Nodes**: ~8-12
- **Shows**: Only if/else branches and main flow
- **Hides**: Operations and nested logic
- **Mermaid style**: Minimal with boolean paths

**Analysis Summary:**
Based on the file provided, I recommend: [MENTION WHICH OPTION FITS BEST AND WHY]

## Step 3: Wait for User Selection

Ask the user to choose one option by entering 1, 2, 3, or 4.

---

## Step 4: Generate the Diagram (After User Selects)

Once the user selects an option (1-4), generate the appropriate Mermaid Control Flow Diagram using the corresponding template:

### Generation Template - Option 1 (Basic CFD)
```
Use the Basic CFD Prompt Template:
- Show only decision nodes for key validations
- Include entry point, major operations, and exit points
- Use descriptive labels
- Color code: blue for entry, green for success, red for errors
- Mermaid format: graph TD
- Target: ~12 nodes
```

### Generation Template - Option 2 (Detailed CFD)
```
Use the Detailed CFD Prompt Template:
- Map all logical decision points
- Identify all validation checkpoints
- Show both normal and error execution paths
- Include early returns and exit conditions
- Use rectangles for operations, rhombuses for decisions
- Color code appropriately
- Mermaid format: graph TD
- Target: ~25 nodes
```

### Generation Template - Option 3 (Error Handling Focus)
```
Analyze error handling patterns:
- Try-catch blocks and error flows
- Result types / Either patterns
- Validation checkpoints
- Error accumulation or short-circuiting
- All exit points with outcomes
- Green branches for success, red for errors
- Mermaid format: graph TD
- Target: ~18 nodes
```

### Generation Template - Option 4 (Logical Flow Only)
```
Create simplified diagram:
- Only if/else conditions
- Entry and exit points only
- Boolean decision nodes
- Minimal operations shown
- No nested logic detail
- Basic color coding
- Mermaid format: graph TD
- Target: ~10 nodes
```

## Step 5: Output Format

After generating the diagram, create a Markdown file with:

**File name**: `${1}.cfd.md` (or extract filename if path provided)

**File contents**:
```markdown
# Control Flow Diagram: [Filename]

**Diagram Type**: [Selected option name]
**Generated**: [Current date]
**Source File**: $1

## Flow Summary

[2-3 bullet points describing the main flow, key decision points, and primary exit conditions]

## Mermaid Diagram

\`\`\`mermaid
[Insert generated Mermaid code here]
\`\`\`

## Key Flow Points

1. [First key decision or operation]
2. [Second key decision or operation]
3. [Third key decision or operation]

## Exit Paths

- **Success**: [Describe success condition]
- **Error**: [Describe error condition]
[Add more as applicable]
```

## Step 6: Confirmation

Save the file and report:
- ✅ Diagram type generated
- ✅ File saved location
- ✅ Node count and complexity summary

---

## Error Handling

**If file not found:**
- Report the issue
- Suggest checking the file path

**If file has multiple functions:**
- Ask user which function to focus on
- Or analyze the main entry point

**If complexity is very high:**
- Suggest breaking into smaller pieces
- Recommend Option 1 or 4 for simplicity
- Offer to create multiple diagrams

**If user doesn't respond:**
- Remind options available (1-4)
- Wait for selection before proceeding to Step 4

---

## Important Notes

- **Interactive first**: Always present options before generating
- **File safe**: Save to new file, don't modify source
- **Naming**: Use `.cfd.md` extension for easy identification
- **Reusable**: Users can run again with different options
- **Context-aware**: Suggest best option based on file analysis
