# Resume Tailoring Workflow Guide

This guide explains how to use the `resume-tailor` sub-agent to create job-specific resume versions.

## Overview

The resume tailoring system allows you to:
- Analyze job postings for key requirements
- Create optimized `resume_tailored.yaml` files
- Generate targeted PDF resumes for specific applications
- Maintain content truthfulness while maximizing relevance

## Workflow

### 1. Prepare Job Application Data
Collect the job posting information:
- Job description text
- Company information
- Required skills and qualifications
- Preferred experience levels

### 2. Invoke Resume Tailoring
Present the job application to Claude Code, which will automatically delegate to the resume-tailor sub-agent:

```
"I have a job application for [Position] at [Company]. Please analyze this job posting and create a tailored resume version:

[Paste job posting here]

Additional context:
- Focus area: [AI/QA/Frontend focused]  
- Key points to emphasize: [specific achievements or skills]
- Company culture insights: [any additional context]"
```

### 3. Sub-Agent Processing
The resume-tailor sub-agent will:
1. **Analyze** the job posting for requirements and keywords
2. **Map** requirements to existing resume content
3. **Select** most relevant achievements from all resume versions
4. **Generate** `data/resume_tailored.yaml` with optimized content
5. **Document** tailoring decisions in metadata

### 4. Generate Tailored PDF
After the tailored YAML is created, generate the PDF:

```bash
# Generate PDF from tailored resume
bun run save-to-pdf
```

## Example Scenarios

### Scenario 1: AI/ML Engineering Role
```
Job posting mentions: "React, Python, LangChain, vector embeddings, product mindset"

Sub-agent will:
- Select AI-focused title and summary
- Prioritize Seeker project and AI/ML technical expertise  
- Choose AI-focused achievements from Inkitt (conversational AI features)
- Highlight product engineering experience
- Include relevant frontend skills (React) to show full-stack capability
```

### Scenario 2: Senior Frontend + QA Role
```
Job posting mentions: "React, TypeScript, E2E testing, CI/CD, team leadership"

Sub-agent will:
- Select QA-focused or frontend-focused title based on emphasis
- Prioritize QA testing and frontend technical expertise
- Choose achievements highlighting testing frameworks and leadership
- Emphasize mentoring experience and systematic approach
- Include relevant CI/CD and automation experience
```

### Scenario 3: Startup Frontend Role
```
Job posting mentions: "Early-stage startup, React Native, fast-paced, cross-functional"

Sub-agent will:
- Select frontend-focused content
- Emphasize startup experience (Alba Care, Cornershop)
- Highlight mobile development (React Native) achievements
- Choose achievements showing adaptability and fast delivery
- Include cross-functional collaboration soft skills
```

## Output Structure

The generated `data/resume_tailored.yaml` will maintain the exact schema as `data/resume.yaml` but with:

### Optimized Content Selection
- **Title**: Most relevant from `personal_info.titles`
- **Summary**: Best-matching from `personal_info.summaries` or hybrid version
- **Technical Skills**: Reordered by job relevance
- **Achievements**: Top-scoring achievements from each company
- **Projects**: Emphasized based on job alignment

### Added Metadata
```yaml
tailoring_metadata:
  job_title: "Senior AI Engineer"
  company: "TechCorp"
  tailored_date: "2025-01-23"
  focus_areas: ["AI/ML", "Product Engineering", "Frontend"]
  keywords_targeted: ["LangChain", "React", "vector embeddings"]
  content_strategy: "Emphasized AI projects and product mindset"
  source_version: "ai_focused"
```

## Best Practices

### For Users
1. **Provide Complete Context**: Include full job posting and any insider knowledge about company culture
2. **Specify Focus**: Indicate which career direction to emphasize (AI/QA/Frontend)
3. **Highlight Priorities**: Mention specific achievements or experiences to emphasize
4. **Review Output**: Always review the tailored content before generating PDF

### For Content Quality
1. **Maintain Truthfulness**: All content comes from original resume - no fabrication
2. **Natural Keywords**: Job keywords integrated naturally, not forced
3. **Consistent Tone**: Professional language maintained throughout
4. **ATS Friendly**: Optimized for Applicant Tracking Systems

## Troubleshooting

### Common Issues

**Sub-agent not triggered?**
- Ensure you're asking Claude Code to analyze a job posting and create tailored resume
- Make sure the request is clear and includes job posting text

**Generated file missing sections?**
- Check if original `data/resume.yaml` has all required sections
- Verify YAML syntax in source file

**Content doesn't match job well?**
- Provide more specific guidance about which achievements to emphasize
- Include additional context about company culture or role expectations

**PDF generation fails?**
- Verify `data/resume_tailored.yaml` maintains proper YAML syntax
- Check that all required fields are present in tailored version

### File Management
- Tailored files are automatically saved as `data/resume_tailored.yaml`
- Original `data/resume.yaml` remains unchanged
- Generated PDFs use the tailored version when available

## Integration with Existing Workflow

This tailoring system integrates seamlessly with the existing resume generation:

```bash
# Standard workflow
1. Provide job posting to Claude Code
2. Sub-agent creates data/resume_tailored.yaml  
3. Run: bun run save-to-pdf
4. Review generated tmp/resume.pdf
```

The PDF generation system automatically uses `resume_tailored.yaml` when available, falling back to `resume.yaml` if no tailored version exists.

## Next Steps

After implementing this workflow:
1. Test with various job postings from different focus areas
2. Refine sub-agent prompts based on output quality
3. Consider adding job posting URL support for automatic fetching
4. Explore integration with job board APIs for streamlined workflow