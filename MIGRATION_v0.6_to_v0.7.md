# Migration Guide: v0.6 to v0.7

This guide outlines the required changes to migrate company-specific data in `resume-data/tailor/[company]/` from v0.6 to v0.7 format.

## Overview

Version 0.7 introduces a new **metadata system** that consolidates company context and job details into a single `metadata.yaml` file, plus schema updates to existing files.

## Benefits of v0.7

- **Centralized Context**: `metadata.yaml` provides single source of truth for company data
- **Better Agent Integration**: Agents can load context from one file instead of parsing multiple files
- **Validation**: New validation scripts ensure data integrity
- **Cleaner Structure**: Removed redundant fields from `resume.yaml` metadata
- **Consistency**: Standardized field names and formats across files

## Automated Migration

To automate migration, use the job tailoring agent:

```bash
# The agent will automatically generate v0.7-compliant files
@agent-job-analysis [job-posting-url]
@agent-tailor-resume-and-cover company-name
```

The agents are pre-configured to generate files in v0.7 format with all required validations.

## Required Changes

### 1. Add `metadata.yaml` (NEW FILE)

**Action**: Create a new `metadata.yaml` file in each company folder.

**Purpose**: Centralized company context and job details for the `/tailor` command and agents.

**Schema**:

```yaml
# Company Context File
company: 'Company-Name'
folder_path: 'resume-data/tailor/company-name'
available_files:
  - 'metadata.yaml'
  - 'job_analysis.yaml'
  - 'resume.yaml'
  - 'cover_letter.yaml'

position: 'Job Position Title'
primary_focus: 'primary_area + [specialty1, specialty2]'
job_summary: 'Brief job description (max 100 chars)'

job_details:
  company: 'Company-Name'
  location: 'Location'
  experience_level: 'Junior|Mid|Senior|Staff|Principal'
  employment_type: 'Full-time|Part-time|Contract'
  must_have_skills:
    - 'Skill 1'
    - 'Skill 2'
  nice_to_have_skills:
    - 'Skill 1'
    - 'Skill 2'
  team_context: 'Team size, structure, organization details'
  user_scale: 'Product scale, user base metrics'

last_updated: '2025-10-01T12:00:00Z'
```

**How to Generate**:

- Extract `company`, `position`, `location`, `experience_level`, `employment_type` from `job_analysis.yaml`
- Derive `primary_focus` from highest weighted `job_focus` item
- Extract `must_have_skills` and `nice_to_have_skills` from `job_analysis.requirements`
- Extract `team_context` and `user_scale` from `job_analysis.role_context`
- Generate `job_summary` from `job_analysis.role_context.key_points`

### 2. Update `resume.yaml` Structure

**Action**: Modify the top-level structure of `resume.yaml`.

**Changes**:

**v0.6 Format** (BEFORE):

```yaml
metadata:
  company: 'Company-Name'
  position: 'Position Title'
  last_updated: '2025-09-19'
  transformation_decisions: '...'
  job_focus_used: '...'

resume:
  name: 'John Doe'
  # ... rest of resume data
```

**v0.7 Format** (AFTER):

```yaml
version: '2.0.0'
metadata:
  last_updated: '2025-10-01'
  tailored_for: 'Company-Name - Position Title'

resume:
  name: 'John Doe'
  # ... rest of resume data (unchanged)
```

**Key Changes**:

- ✅ Add `version: '2.0.0'` at top level
- ✅ Simplify `metadata` section:
  - Remove `company`, `position`, `transformation_decisions`, `job_focus_used`
  - Add `tailored_for` field (combines company + position)
  - Keep `last_updated`
- ✅ `resume` section structure remains the same

### 3. Update `job_analysis.yaml` Schema

**Action**: Minor structural adjustments to `job_analysis.yaml`.

**Changes**:

**v0.6 → v0.7 Differences**:

```yaml
# Top-level changes
version: '2.0.0' # Keep
analysis_date: '2025-10-01' # Update date
source: 'Job posting source' # Keep

job_analysis:
  position: 'Senior Frontend Engineer - Web' # v0.7: Shortened title
  # v0.6 had: 'Senior Frontend Engineer - Web, Open Application'

  location: 'Berlin, Germany (or remote in Sweden, Estonia, Finland)' # v0.7: More specific
  # v0.6 had: 'Berlin, Germany'

  requirements:
    must_have_skills:
      - skill: 'TypeScript'
        priority: 10
      # v0.7: Added 'Frontend Development' as explicit skill
      - skill: 'Frontend Development'
        priority: 10
```

**Minor adjustments**:

- Shorten verbose position titles
- Expand location details if remote options exist
- Ensure `must_have_skills` includes explicit skill names (not just frameworks)

### 4. Update `cover_letter.yaml` Schema

**Action**: Minimal changes to `cover_letter.yaml` structure.

**Changes**:

```yaml
# Top-level remains the same
version: '2.0.0'
analysis_date: '2025-10-01' # Update date

cover_letter:
  position: 'Senior Frontend Engineer - Web' # Shortened (match job_analysis)
  # v0.6 had: 'Senior Frontend Engineer - Web, Open Application'

  # All other fields remain unchanged
```

**Key Point**: The only substantive change is shortening verbose position titles to match `job_analysis.yaml`.

## Migration Checklist

For each company folder in `resume-data/tailor/[company]/`:

- [ ] **Create `metadata.yaml`** with all required fields
- [ ] **Update `resume.yaml`**:
  - [ ] Add `version: '2.0.0'`
  - [ ] Simplify `metadata` section (remove old fields, add `tailored_for`)
- [ ] **Update `job_analysis.yaml`**:
  - [ ] Update `analysis_date`
  - [ ] Shorten position title if verbose
  - [ ] Expand location details if applicable
  - [ ] Add explicit skill names to `must_have_skills`
- [ ] **Update `cover_letter.yaml`**:
  - [ ] Update `analysis_date`
  - [ ] Shorten position title to match `job_analysis.yaml`
- [ ] **Validate** all files:
  ```bash
  bun scripts/validate-metadata.ts -C company-name
  bun scripts/validate-job-analysis.ts -C company-name
  bun scripts/validate-resume.ts -C company-name
  bun scripts/validate-cover-letter.ts -C company-name
  ```

## Validation

After migration, run validation scripts to ensure compliance:

```bash
# Validate all files for a company
bun scripts/validate-metadata.ts -C company-name
bun scripts/validate-job-analysis.ts -C company-name
bun scripts/validate-resume.ts -C company-name
bun scripts/validate-cover-letter.ts -C company-name

# Or validate all at once
bun scripts/validate-job-analysis.ts -C company-name && \
bun scripts/validate-metadata.ts -C company-name && \
bun scripts/validate-resume.ts -C company-name && \
bun scripts/validate-cover-letter.ts -C company-name
```

All validation scripts use Zod schemas defined in `src/zod/schemas.ts`.

## Questions?

Refer to:

- `CHANGELOG.md` - Full v0.7 release notes
- `src/zod/schemas.ts` - Schema definitions
- `scripts/validate-*.ts` - Validation script implementations
- `.claude/commands/tailor.md` - Tailor command documentation
