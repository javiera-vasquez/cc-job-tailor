# Claude Code Job Tailor

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)
[![Built with Bun](https://img.shields.io/badge/Built%20with-Bun-000000?logo=bun)](https://bun.sh/)
![](https://img.shields.io/badge/Node.js-18%2B-brightgreen?style=flat-square)
![Tests](https://github.com/javiera-vasquez/claude-code-job-tailor/actions/workflows/ci.yml/badge.svg?branch=main)

AI-powered resume optimization system that analyzes job postings, ranks requirements by importance, and generates tailored PDFs in under 60 seconds. Write your experience once in YAML, then let Claude's agents automatically select your most relevant achievements for each application.

```
⚡ 60 Second job analysis • 🎯 Weighted skill matching • 🤖 3 specialized AI agents
           🖼️ 2 Available templates • 🧑‍🎨 Unlimited tailored versions
```

**Tailor in action:**
![Tailor in action!](demo.gif)

**Example Usage:**

1. **Analyze a job posting and create tailored materials:**

   ```
   @agent-job-tailor Analyze this job posting for Senior AI Engineer at TechCorp:

   [...paste job description | URL | PDF | Markdown file here...]
   ```

2. **Iterate on existing company materials and customize on the fly:**

   ```
   /tailor "tech-corp"
   ```

   Once in tailor mode, you can ask Claude to make changes in real-time:

   | Category                 | Examples                                                                                                                            |
   | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
   | **Content & Analysis**   | "Which are the top 5 skills to emphasize?" • "Analyze the job and tell me my focus areas" • "Add a new achievement about [project]" |
   | **Template & Layout**    | "Switch to the classic template" • "Reorder sections" • "Hide my profile picture"                                                   |
   | **Writing & Refinement** | "Make the summary more impactful" • "Rewrite the cover letter opening" • "Emphasize my React expertise"                             |

   All changes preview instantly in your browser as you iterate.

## Built-in Commands & Agents

**3 specialized AI agents** handle different stages of the workflow (analysis, tailoring, editing). **4 slash commands** give you direct control:

| Command/Agent                                             | Type    | Purpose                                                                                                               |
| --------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------- |
| `/tailor company-name`                                    | Command | Set active company context and start live preview server with automatic validation                                    |
| `/generate-pdf company-name [resume\|cover-letter\|both]` | Command | Generate PDF documents for specific company                                                                           |
| `/tailor-template-expert`                                 | Command | Template development workspace for creating and modifying React-PDF templates (experimental)                          |
| `/tailor-help`                                            | Command | Show resume tailoring workflow and available commands                                                                 |
| `@agent-job-analysis`                                     | Agent   | Analyze job postings and extract structured metadata and job analysis for tailored applications                       |
| `@agent-job-tailor`                                       | Agent   | Complete workflow: analyze job postings and create customized job analysis and tailored resumes                       |
| `@agent-tailor-resume-and-cover`                          | Agent   | Generate tailored resume and cover letter using existing job analysis data (requires metadata and job_analysis files) |
| `bun run set-env -C company-name`                         | Script  | Set the active environment for claude to work job offer (Claude trigger)                                              |
| `bun run tailor-server`                                   | Script  | Start live preview development server with file watching (Claude trigger)                                             |
| `bun run save-to-pdf -C company-name`                     | Script  | Generate PDF to `tmp/` (automatically generates data first)                                                           |
| `bun run generate-data -C company-name`                   | Script  | Convert YAML data to TypeScript module for specific company                                                           |

## PDF Output Examples

Two professional templates included: **modern** (two-column with accent colors) and **classic** (single-column monochrome).

![Available templates](/public/images/templates.png)

| File                                                                                                                        | Description                                                     | Expected Data                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`resume-modern.pdf`](public/pdf-examples/resume-modern.pdf) [`resume-classic.pdf`](public/pdf-examples/resume-classic.pdf) | Example tailored resume for a Senior Frontend Engineer position | [`ResumeSchema`](src/types.ts#L43): name, title, summary, contact details, technical expertise categories, skills array, languages, professional experience, independent projects, education |
| [`cover-letter.pdf`](public/pdf-examples/cover-letter.pdf)                                                                  | Example personalized cover letter                               | [`CoverLetterSchema`](src/types.ts#L59): company, position, job focus array, primary focus, date, personal info, content with opening/body/signature                                         |

## Why This Exists

**The problem:** Resume tailoring is expensive. Paid services promise AI-powered optimization, but most are template-filling bots that don't understand your experience or the actual job requirements. Manually customizing resumes for each application is slow, subjective, and draining—you're guessing which achievements matter and which skills to emphasize.

**The solution:** AI agents analyze job postings and extract weighted requirements (React: priority 10, Python: priority 7). Then they use specialty-based scoring to automatically select your most relevant experience. The `/tailor` command lets you collaborate with Claude in real-time to refine the output while watching changes in your browser.

**The result:** Data-driven optimization that takes 60 seconds instead of 2 hours, and actually matches what the job requires. **Best part: It's completely free and open-source.** No paywalls, no subscriptions, no proprietary algorithms locked behind corporate walls—just you, Claude, and a tool that actually works.

## How It Works

```
📝 Your Experience (YAML) → 🤖 AI Optimization → 📋 Auto-Validation → 📄 PDF Export → ✅ Ship Resume
```

### What Gets Generated (Per Company)

Each `resume-data/tailor/[company-name]/` folder contains AI-optimized files:

- **`metadata.yaml`** — Job context extracted from the posting (position, top skills, company details)
- **`job_analysis.yaml`** — Weighted requirements with skills ranked 1-10, candidate gap analysis, and optimization strategy
- **`resume.yaml`** — Tailored content with specialty-matched achievements and prioritized technical expertise
- **`cover_letter.yaml`** — Personalized letter emphasizing your alignment with the job's weighted focus areas

**The intelligence:** The system doesn't just template-fill. It uses weighted scoring to select which of your achievements are most relevant for this specific job. React mentioned 5 times in the posting? Your React projects get prioritized. Simple as that.

## Getting Started

You can see the resume generator in action without using any of your own data.

**Prerequisites:**

- [Bun](https://bun.sh/) JavaScript runtime
- [Claude Code](https://claude.ai/code) for AI-powered resume tailoring

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/javiera-vasquez/claude-code-job-tailor.git && cd claude-code-job-tailor
    ```

2.  **Install dependencies:**

    ```bash
    bun install
    ```

3.  **Configure environment:**

    ```bash
    cp .env.example .env
    ```

4.  **Start Claude Code session:**

    ```bash
    claude code
    ```

5.  **Start tailoring your resume:**
    ```
    /tailor "tech-corp"
    ```

## Using Your Own Data

1.  **Navigate to the data sources:**

    ```bash
    cd resume-data/sources
    ```

2.  **Copy the example files:**
    - `cp cover-letter.example.yaml cover-letter.yaml`
    - `cp professional-experience.example.yaml professional-experience.yaml`
    - `cp resume.example.yaml resume.yaml`

3.  **Edit the new `.yaml` files**
    with your personal information. The system will automatically detect and use your files instead of the examples.

4.  **Validation rules and schema guidance:**
    All data transformation and validation rules are in `resume-data/mapping-rules/`. Claude already knows how to use them.

**Need help migrating your data?**
Claude Code can read your existing resume and help you migrate it to the YAML format!

- Read your current resume (PDF, Word, or text format)
- Extract your experience, skills, and education
- Structure the data according to the validation rules in `resume-data/mapping-rules/`
- Validate your YAML files and fix any schema issues using `bun run generate-data`
- Guide you through the entire migration process

**Example prompt:**

```
Claude, read my resume at ~/Documents/my-resume.pdf and create validated YAML files in resume-data/sources/
```

## Template Development

Go beyond the built-in templates—create entirely new variants, modify component structures, and implement custom designs:

**What you can do:**

- Create new template variants with custom layouts (single-column, sidebar, multi-section)
- Modify component hierarchies and visual structures
- Update design tokens: color palettes, typography system, spacing constants
- Implement responsive design patterns and advanced layouts
- Refactor component organization for reusability
- Fix rendering issues and optimize for React-PDF constraints

**Getting Started:**

```
/tailor-template-expert
```

Work with Claude to design a new layout, update colors, or modify typography. You'll get:

- Live preview server at `http://localhost:3000` with hot-reload
- Full access to design system and React-PDF documentation
- Real-time compilation feedback for all template changes
- Guided support for component modification and creation

**Key Resources:**

- Design tokens: `src/templates/shared/design-tokens.ts` (colors, typography, spacing)
- Font registration: `src/templates/shared/fonts-register.ts` (Lato, Open Sans, Open Fonts)
- React-PDF docs: `.claude/rpdf-context/` (components, styling, fonts, troubleshooting)
- Existing templates: `src/templates/{modern,classic}/` (reference implementations)

## Troubleshooting

If you encounter any issues or have questions, please report them on our [GitHub Issues page](https://github.com/javiera-vasquez/claude-code-job-tailor/issues).

## License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International License**. See the [LICENSE](LICENSE) file for details.
