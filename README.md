# Claude Code Job Tailor

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)

Your personal AI job application assistant. Stop manually tailoring your resume for every job application. You're spending hours tweaking bullet points, reordering skills, and trying to match keywords from job descriptions, leading to dozens of `resume_final_v2_real.docx` files.

CC-Job-Tailor treats your resume as code. You define your full career history once in simple YAML files, then Claude Code intelligently selects your best achievements and generates perfectly matched resume PDFs that highlight exactly what employers want for any specific role.

![Gemini Fullstack LangGraph](/public/images/job-tailor-flow.png)

**Example Usage:**
```
@agent-job-tailor Analyze this job posting and create a tailored resume for a Senior AI Engineer at TechCorp:

[...paste job description | URL | PDF | Markdown file here...]
```

The AI agent will analyze the job requirements, select the best achievements from your data, prioritize relevant skills, and generate an optimized resume in minutes instead of hours.

## How It Works

The process is designed to be simple and powerful, flowing from your data to the final PDF.

```
1. Your Data     2. AI Analysis      3. PDF Generation    4. Final Output
(YAML files)     (Claude Code)       (@react-pdf/renderer)  (PDF Document)
      │                │
      ▼                ▼
┌─────────────┐  ┌──────────────┐  ┌───────────────────┐
│ resume.yaml │  │ Job Posting  │  │ React Components  │
│ experience. │  └──────────────┘  └───────────────────┘
│ yaml        │         │                    │
└─────────────┘         ▼                    │
                 ┌────────────────┐  ┌───────────────────┐  ┌─────────────────┐
                 │ AI Agent       │  │ Tailored Data     │  │ resume-company. │
                 │ (Optimizes &   │──▶│ (resume.yaml in  │──▶│ pdf             │
                 │  Selects Data) │  │  /resume-data/tailor/) │  │ (tmp/ folder)   │
                 └────────────────┘  └───────────────────┘  └─────────────────┘
```

## Features

-   📄 **Data-Driven**: Manage your resume content in simple, structured YAML files.
-   🤖 **AI-Powered Tailoring**: Uses a Claude Code sub-agent to analyze job postings and optimize your resume content automatically.
-   🎨 **Professional Template**: A clean, modern, and ATS-friendly two-column resume layout.
-   ⚙️ **Multi-Version Support**: Define different achievements for different roles (e.g., `ai_focused`, `qa_focused`) in your data, and let the AI choose the best ones.
-   🚀 **Live Preview**: A browser-based PDF viewer with hot reload for rapid development and styling.
-   📦 **Example Data Included**: Get started in minutes with pre-built example files. No need to add your own data to try it out!

## Getting Started

You can see the resume generator in action without using any of your own data.

**Prerequisites:**
- [Bun](https://bun.sh/) JavaScript runtime
- [Claude Code](https://claude.ai/code) for AI-powered resume tailoring

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/javiera-vasquez/cc-job-tailor.git
    cd cc-job-tailor
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Start Claude Code session:**
    ```bash
    claude code
    ```

4.  **Start tailoring your resume:**

    In Claude Code, use the job-tailor agent to analyze job postings:
    ```
    @agent-job-tailor Analyze this job posting and create a tailored resume for [Position] at [Company]:

    [Paste job description, URL, or upload PDF here]
    ```

    
This will generate a tailor job and cover letter application for the position.

## Using Your Own Data

1.  **Navigate to the data sources:**
    ```bash
    cd resume-data/sources
    ```

2.  **Copy the example files:**
    *   `cp cover-letter.example.yaml cover-letter.yaml`
    *   `cp professional-experience.example.yaml professional-experience.yaml`
    *   `cp resume.example.yaml resume.yaml`

3.  **Edit the new `.yaml` files** with your personal information. The system will automatically detect and use your files instead of the examples.

## Complete Workflow Example

Here's a step-by-step example of creating a tailored resume:

1. **Job Analysis**: In Claude Code, analyze a job posting:
   ```
   @agent-job-tailor Analyze this job posting and create a tailored resume for Senior AI Engineer at TechCorp:

   We're looking for a Senior AI Engineer with experience in LangChain, React, and vector databases...
   ```

2. **Files Created**: The agent creates:
   ```
   resume-data/tailor/techcorp/
   ├── resume.yaml          # Tailored resume with AI-focused content
   ├── job_analysis.yaml    # Structured job requirements analysis
   └── cover_letter.yaml    # Personalized cover letter
   ```

3. **PDF Generation**: Generate the tailored PDF:
   ```bash
   bun run generate-pdf.ts -C techcorp
   ```

   Output: `tmp/resume-techcorp.pdf` with content optimized for the AI Engineer role.

## Commands

-   `bun run dev`: Start the live preview development server.
-   `bun run generate-pdf.ts -C company-name`: Generate the final PDF to `tmp/resume-{company-name}.pdf` for a specific company (automatically generates data first).
-   `bun run generate-data`: Manually convert YAML data to a TypeScript module.
-   `@agent-job-tailor`: Claude Code agent for analyzing job postings and creating tailored resumes.

## Troubleshooting

If you encounter any issues or have questions, please report them on our [GitHub Issues page](https://github.com/javiera-vasquez/cc-job-tailor/issues)).

## License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International License**. See the [LICENSE](LICENSE) file for details.
