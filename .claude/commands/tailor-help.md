---
allowed-tools: Read
description: Show tailoring workflow and available commands
---

# Resume Tailoring Help

Important print direct to the user the following message
```
The system allows you to:

  1. Analyze job postings using the job-tailor AI agent to create
  company-specific materials
     Example: "@agent-job-tailor Analyze this job posting for Senior Developer at Tech-Corp url=[.....]"

  2. Set company context with /tailor company-name to work with specific
  tailored data
     Example: /tailor tech-corp "which are the most relevant skill according to the analysis."

  3. Generate PDFs with /generate-pdf company-name for final documents
     Example: /generate-pdf tech-corp both

  Your project has a sophisticated data-driven approach where:
  - Master resume data lives in resume-data/sources/
  - Job-specific tailored versions are created in
  resume-data/tailor/[company]/
  - The AI agent optimizes content selection based on job requirements

  Would you like to start tailoring a resume for a specific job posting, or
  do you need help with any particular aspect of the system?
  ```

