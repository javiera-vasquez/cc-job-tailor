# AI-Powered Resume Generator

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)

Stop manually tailoring your resume for every job application. You're spending hours tweaking bullet points, reordering skills, and trying to match keywords from job descriptions, leading to dozens of `resume_final_v2_real.docx` files.

This project treats your resume as code. You define your full career history once in simple YAML files, then use Claude Code's specialized AI agent to automatically generate a tailored resume PDF that highlights your most relevant skills and experiences for any specific role.

*(Screenshot/video of the solution working will go here)*

**Example Usage:**
```
@agent-job-tailor Analyze this job posting and create a tailored resume for a Senior AI Engineer at TechCorp:

[...paste job description | URL | PDF | Markdown file here...]
```

The AI agent will analyze the job requirements, select the best achievements from your data, prioritize relevant skills, and generate an optimized resume in minutes instead of hours.

## How It Works

The process is designed to be simple and powerful, flowing from your data to the final PDF.

```
1. Your Data     2. AI Analysis      3. PDF Generation
(YAML files)     (Claude Code)       (@react-pdf/renderer)
      │                │                     │
      ▼                ▼                     ▼
┌─────────────┐  ┌──────────────┐  ┌───────────────────┐
│ resume.yaml │  │ Job Posting  │  │ React Components  │
│ experience. │  └──────────────┘  └───────────────────┘
│ yaml        │         │                    ▲
└─────────────┘         ▼                    │
                 ┌────────────────┐  ┌───────────────────┐
                 │ AI Agent       │  │ Tailored Data     │
                 │ (Optimizes &   │──▶│ (resume.yaml in  │
                 │  Selects Data) │  │  /data/tailor/)   │
                 └────────────────┘  └───────────────────┘
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
    cd cc-resume-manager
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Start Claude Code session:**
    ```bash
    claude code
    ```
3.  **Start tailoring your resume:**
    ```bash
    @agent-job-tailor Analyze this job posting...
    /tailor I want to modify the cover letter for 'company-name'...
    ```

This will open a live preview in your browser showing a resume generated from the included `*.example.yaml` files.

## Using Your Own Data

1.  **Navigate to the data sources:**
    ```bash
    cd data/sources
    ```

2.  **Copy the example files:**
    *   `cp cover-letter.example.yaml cover-letter.yaml`
    *   `cp professional-experience.example.yaml professional-experience.yaml`
    *   `cp resume.example.yaml resume.yaml`

3.  **Edit the new `.yaml` files** with your personal information. The system will automatically detect and use your files instead of the examples.

## Commands

-   `bun run dev`: Start the live preview development server.
-   `bun run generate-data.ts -C company-name && bun run generate-pdf.ts`: Generate the final PDF to `tmp/resume.pdf` for a specific company.
-   `bun run generate-data`: Manually convert YAML data to a TypeScript module.

## Troubleshooting

If you encounter any issues or have questions, please report them on our [GitHub Issues page](https://github.com/javier-lopez-montes/cc-resume-manager/issues).

## License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International License**. See the [LICENSE](LICENSE) file for details.