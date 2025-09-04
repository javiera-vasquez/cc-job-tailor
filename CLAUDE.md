# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a dynamic PDF resume generator built with React and `@react-pdf/renderer`. The application creates PDF documents using React components that render directly to PDF format. It supports both browser-based preview (via PDFViewer) and server-side file generation (via renderToFile). 

**Key Features:**
- **Data-Driven Resume Generation**: Uses structured YAML data (`data/resume.yaml`) containing comprehensive resume information
- **Multi-Version Support**: Supports different resume versions (AI-focused, QA-focused) from the same data source
- **Professional Resume Template**: Ready for real-world use with complete professional experience, skills, and contact information
- **Modular Architecture**: Separated data layer from presentation logic for easy customization

## Development Commands

```bash
# Install dependencies
bun install

# Development server with hot reload (opens PDF viewer in browser)
bun run dev

# Start application (same as dev)
bun run start

# Generate PDF file to disk (outputs to tmp/resume.pdf)
bun run save-to-pdf

# Generate TypeScript data module from YAML (runs automatically in other commands)
bun run generate-data
```

**Note**: All commands automatically run `generate-data.ts` first to convert YAML data to TypeScript modules.

## Architecture

### Core Stack
- **Runtime**: Bun (JavaScript runtime and bundler)
- **Frontend**: React 19 with TypeScript
- **PDF Generation**: @react-pdf/renderer for React-to-PDF rendering
- **Build System**: Native Bun bundler (no additional build tools)

### File Structure
```
├── index.html              # HTML entry point, loads web_layout.tsx
├── web_layout.tsx          # React app with PDFViewer component (renamed from ui.tsx)
├── generate-pdf.ts         # Server-side PDF generation script
├── generate-data.ts        # YAML to TypeScript data converter
├── src/
│   ├── index.ts            # Export barrel for components
│   ├── types.ts            # TypeScript type definitions for React-PDF schema
│   ├── data/
│   │   └── resume.ts       # Auto-generated TypeScript data module from YAML
│   └── pages/
│       ├── DocumentWrapper.tsx  # Placeholder PDF document component (Don Quixote content)
│       ├── index.tsx       # Web layout component
│       └── resume/         # Complete resume component suite
│           ├── index.tsx   # Main resume document
│           ├── Header.tsx  # Resume header component
│           ├── Skills.tsx  # Skills section component
│           ├── Experience.tsx # Experience section component
│           ├── Education.tsx  # Education section component
│           ├── List.tsx    # List formatting component
│           └── Title.tsx   # Title formatting component
├── data/
│   ├── resume.yaml         # Master structured resume data (multi-version)
│   ├── resume_tailored.yaml # Job-specific optimized resume version  
│   └── resume_transformation_map.yaml # Schema transformation rules
├── public/
│   ├── images/             # Static assets for PDF
│   └── jobs/               # Job posting PDFs and analysis files
├── rpdf/                   # React-pdf documentation
│   ├── components.md       # Available PDF components reference
│   ├── fonts.md            # Font registration and typography guide
│   └── styling.md          # PDF styling and CSS properties reference
├── tmp/                    # Generated PDF output directory
├── RESUME_TAILORING_GUIDE.md # Complete resume tailoring workflow documentation
├── GEMINI.md               # Gemini AI model specific guidance
└── tsconfig.json           # TypeScript configuration (ESNext, strict mode)
```

### Application Flow
1. **Data Generation**: `generate-data.ts` → converts YAML → `src/data/resume.ts` TypeScript module
2. **Browser Development**: `index.html` → `web_layout.tsx` → `PDFViewer` → `resume.Document`  
3. **PDF Generation**: `generate-pdf.ts` → `renderToFile` → `tmp/resume.pdf`
4. **Resume Tailoring**: Job posting analysis → `data/resume_tailored.yaml` → optimized PDF output

**Data Priority**: Uses `resume_tailored.yaml` when available, falls back to `resume.yaml`

### PDF Document Architecture
The application uses react-pdf's component hierarchy:
- `Document` → `Page` → `View/Text/Image` components
- StyleSheet API for PDF-specific styling
- Font registration system (Google Fonts integration)
- Debug mode available for layout troubleshooting
- Fixed elements for headers/footers and page numbering

## Key Patterns

### Component Separation
- `web_layout.tsx`: Browser UI with PDFViewer wrapper for development
- `generate-data.ts`: YAML to TypeScript converter (auto-generates `src/data/resume.ts`)
- `src/data/resume.ts`: Auto-generated TypeScript data module from YAML source
- `src/pages/DocumentWrapper.tsx`: Placeholder PDF document component with Don Quixote content
- `src/pages/resume/index.tsx`: Complete professional resume document with real data integration
- `src/index.ts`: Export barrel for modular component access
- `generate-pdf.ts`: Server-side rendering for file output
- `data/resume.yaml`: Master structured resume data (all versions and comprehensive content)
- `data/resume_tailored.yaml`: Job-specific optimized resume version (generated by resume-tailor agent)
- `data/resume_transformation_map.yaml`: Schema transformation rules for React-PDF compatibility
- `public/jobs/`: Storage for job posting PDFs and analysis materials
- `RESUME_TAILORING_GUIDE.md`: Complete workflow documentation for job-specific resume generation

### PDF Component Structure
```tsx
<Document>
  <Page style={styles.body} debug={true}>
    <Text style={styles.header} fixed>Header</Text>
    <Text style={styles.title}>Title</Text>
    <View style={styles.section}>
      <Text style={styles.text}>Content</Text>
    </View>
    <Text style={styles.pageNumber} 
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} 
          fixed />
  </Page>
</Document>
```

### Font Registration
```tsx
Font.register({
  family: 'Oswald',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf'
});
```

### Styling Approach
- Uses react-pdf's StyleSheet.create() for PDF-optimized styles
- Supports flexbox layout with PDF-specific properties
- Fixed positioning for headers/footers and page numbers
- Text justification and custom font families
- Page breaks via `break` prop on Text components

## Resume Data & Schema Structure

The project uses a dual-schema approach:

### Source Data (`data/resume.yaml`)
Comprehensive resume data with multi-version support:

### Data Schema
```yaml
personal_info:
  name: string
  titles:
    ai_focused: string    # Version-specific titles
    qa_focused: string
  summaries:
    ai_focused: string    # Version-specific summaries
    qa_focused: string
  contact: {...}

technical_expertise:
  frontend: [skills array]
  backend: [skills array]
  qa_testing: [skills array]
  ai_machine_learning: [skills array]
  systems_design: [skills array]
  version_control: [skills array]

soft_skills:
  analytical_strategic: [skills array]
  product_user_focus: [skills array]
  collaboration_leadership: [skills array]
  development_methodology: [skills array]

professional_experience:
  - company: string
    position: string
    location: string
    duration: string
    company_description: string
    linkedin: string
    achievements:
      ai_focused: [achievements array]
      qa_focused: [achievements array]
      frontend_focused: [achievements array]

independent_projects: [projects array]
languages: [language proficiency array]
education: [education array]
metadata: {last_updated, versions}
```

### Multi-Version Resume Support
The source data structure supports multiple resume versions:
- **ai_focused**: Emphasizes AI/ML projects and product engineering
- **qa_focused**: Highlights QA automation and testing expertise
- **frontend_focused**: Focuses on frontend development achievements

### Schema Transformation (`data/resume_transformation_map.yaml`)
Defines transformation rules to convert rich source data into React-PDF compatible format:

```yaml
target_schema:
  resume:
    name: string
    profile_picture: string
    title: string           # Single selected title
    summary: string         # Single selected summary
    contact: ContactDetails
    technical_expertise:    # Categories with resume_title + skills
      category_name:
        resume_title: string
        skills: array[string]
    skills: array[string]   # Flattened soft skills
    languages: array[Language]
```

**Transformation Rules:**
- **Direct Mapping**: Basic fields copied as-is (name, contact, languages)
- **Version Selection**: Title/summary chosen based on job focus (ai_focused/qa_focused/frontend_focused)
- **Expertise Transformation**: Technical skills categorized with display titles, prioritized by job relevance
- **Skills Flattening**: Soft skills flattened from categorized structure to simple array
- **Validation Rules**: Field constraints (max lengths, item counts) and data integrity requirements

### Integration Status
- **Placeholder Component**: DocumentWrapper uses Don Quixote content for testing
- **Production Components**: Complete resume component suite in `src/pages/resume/` (Header, Skills, Experience, Education)
- **Data Ready**: Comprehensive resume data in `data/resume.yaml` (228+ lines) with multi-version support
- **Schema Transformation**: `data/resume_transformation_map.yaml` provides React-PDF compatibility rules
- **Resume Tailoring**: Full job-specific resume generation system with AI-powered optimization
- **Data Generation**: Automated YAML to TypeScript conversion with build-time integration

## Resume Tailoring System

The project includes a comprehensive resume tailoring system that creates job-specific resume versions through AI analysis.

### Workflow Overview

1. **Job Analysis**: Analyze job postings using Claude Code's resume-tailor sub-agent
2. **Content Optimization**: Select most relevant achievements, skills, and experience from master data
3. **Schema Generation**: Create optimized `data/resume_tailored.yaml` following transformation rules  
4. **PDF Generation**: Generate tailored resume PDF with `bun run save-to-pdf`

### Key Components

**Master Data (`data/resume.yaml`)**:
- Comprehensive resume information with multi-version support
- Version-specific titles, summaries, and achievements (AI-focused, QA-focused, frontend-focused)
- Rich technical expertise categorization and soft skills taxonomy

**Tailored Output (`data/resume_tailored.yaml`)**:
- Job-optimized resume following React-PDF schema requirements
- Prioritized technical expertise (max 4 categories)
- Curated achievements and flattened skills (max 12 items)
- Metadata tracking transformation decisions and job analysis

**Transformation Rules (`data/resume_transformation_map.yaml`)**:
- Schema compatibility requirements for React-PDF components
- Field validation rules and content constraints  
- Direct mapping vs. transformation logic specifications

### Usage Example

```bash
# 1. Provide job posting to Claude Code:
# "Analyze this job posting and create a tailored resume for [Position] at [Company]"

# 2. Sub-agent generates data/resume_tailored.yaml automatically

# 3. Generate PDF with tailored content:
bun run save-to-pdf
```

### Documentation

Complete workflow documentation available in **[RESUME_TAILORING_GUIDE.md](./RESUME_TAILORING_GUIDE.md)**.

## React-PDF Documentation Reference

The `/rpdf_docs` folder contains comprehensive react-pdf documentation that serves as the primary reference for PDF development in this project. Understanding this taxonomy is crucial for effective PDF document creation.

### Documentation Structure

```
rpdf/
├── components.md    # Complete component API reference
├── fonts.md         # Font registration and typography system
└── styling.md       # CSS properties and styling techniques
```

### Key Documentation Areas

#### Components (`components.md`)
- **Core Components**: Document, Page, View, Text, Image, Link
- **Advanced Components**: Canvas (for custom drawing), Note (annotations)  
- **Web-only Components**: PDFViewer, PDFDownloadLink, BlobProvider
- **Component Properties**: Comprehensive prop tables with types and defaults
- **Layout Features**: Page wrapping, fixed positioning, debugging, bookmarks

#### Fonts (`fonts.md`)
- **Font Registration**: `Font.register()` API with family, src, fontStyle, fontWeight
- **Built-in Fonts**: Courier, Helvetica, Times-Roman families with variants
- **External Fonts**: TTF and WOFF support from URLs or local paths
- **Font Variants**: Multiple weights and styles for same family
- **Hyphenation Control**: Custom word-breaking callbacks
- **Emoji Support**: Image-based emoji rendering via CDN

#### Styling (`styling.md`)
- **StyleSheet API**: `StyleSheet.create()` vs inline styles
- **CSS Properties**: Flexbox, layout, dimensions, colors, text, borders
- **Media Queries**: Width, height, and orientation-based responsive design
- **Units**: pt (default), in, mm, cm, %, vw, vh support
- **Advanced Features**: Transformations, positioning, overflow control

### Research Guidelines for Claude

When working with react-pdf features:

1. **Component Questions**: Always reference `components.md` first for available components and their props
2. **Styling Issues**: Check `styling.md` for supported CSS properties and valid units  
3. **Typography Problems**: Consult `fonts.md` for font registration and text rendering
4. **Cross-reference**: Use all three docs together - components reference styling, fonts affect text rendering
5. **Examples**: Look for code examples in each doc to understand implementation patterns

## Development Notes

### Dual Rendering Modes
- **Browser**: PDFViewer for interactive development and preview
- **File Output**: renderToFile for generating actual PDF files

### Technical Details
- Hot reload enabled via `bun --hot index.html`
- TypeScript strict mode with ESNext features and bundler module resolution
- No build step required - Bun handles bundling directly
- **Data Generation Pipeline**: YAML → TypeScript conversion runs automatically before all commands
- Font loading requires internet connection for Google Fonts
- PDF generation works both client-side (browser) and server-side (Node.js)
- Generated PDFs output to `tmp/` directory
- Modular component architecture with proper TypeScript exports
- **YAML Parsing**: Uses js-yaml for robust YAML processing with error handling
- **Resume Tailoring**: Full integration with Claude Code's resume-tailor sub-agent
- **Data Priority System**: Automatically uses tailored data when available, fallback to master data
- **Job Storage**: Dedicated `public/jobs/` directory for storing job postings and analysis files

## Claude Code Guidelines

### Commit Message Policy
**IMPORTANT**: Never include Claude Code attribution or co-authored-by lines in git commit messages. All commits should be clean and focused on the actual changes without tool attribution.