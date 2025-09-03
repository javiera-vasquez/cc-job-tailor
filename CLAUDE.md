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
```

## Architecture

### Core Stack
- **Runtime**: Bun (JavaScript runtime and bundler)
- **Frontend**: React 19 with TypeScript
- **PDF Generation**: @react-pdf/renderer for React-to-PDF rendering
- **Build System**: Native Bun bundler (no additional build tools)

### File Structure
```
├── index.html              # HTML entry point, loads ui.tsx
├── ui.tsx                  # React app with PDFViewer component  
├── generate-pdf.ts         # Server-side PDF generation script
├── src/
│   ├── index.ts            # Export barrel for components
│   ├── types.ts            # TypeScript type definitions for React-PDF schema
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
│   └── resume.yaml         # Structured resume data (228 lines)
├── tsconfig.json           # TypeScript configuration (ESNext, strict mode)
├── rpdf/                   # React-pdf documentation
│   ├── components.md       # Available PDF components reference
│   ├── fonts.md            # Font registration and typography guide
│   └── styling.md          # PDF styling and CSS properties reference
├── public/images/          # Static assets for PDF
└── tmp/                    # Generated PDF output directory
```

### Application Flow
1. **Browser Development**: `index.html` → `ui.tsx` → `PDFViewer` → `src/pages/DocumentWrapper.tsx`
2. **PDF Generation**: `generate-pdf.ts` → `renderToFile` → `tmp/resume.pdf`
3. **Data Source**: `data/resume.yaml` contains comprehensive structured resume data (228+ lines)
4. **Resume Tailoring**: `data/resume_transformation_map.yaml` defines schema transformation rules for job-specific versions

### PDF Document Architecture
The application uses react-pdf's component hierarchy:
- `Document` → `Page` → `View/Text/Image` components
- StyleSheet API for PDF-specific styling
- Font registration system (Google Fonts integration)
- Debug mode available for layout troubleshooting
- Fixed elements for headers/footers and page numbering

## Key Patterns

### Component Separation
- `ui.tsx`: Browser UI with PDFViewer wrapper for development
- `src/pages/DocumentWrapper.tsx`: Placeholder PDF document component with Don Quixote content
- `src/pages/resume/index.tsx`: Complete professional resume document with real data integration
- `src/index.ts`: Export barrel for modular component access
- `generate-pdf.ts`: Server-side rendering for file output
- `data/resume.yaml`: Comprehensive structured resume data (version-specific content)
- `data/resume_transformation_map.yaml`: Schema transformation rules for React-PDF compatibility

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
- **Resume Tailoring**: System supports job-specific resume generation via transformation mapping

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
- Font loading requires internet connection for Google Fonts
- PDF generation works both client-side (browser) and server-side (Node.js)
- Generated PDFs output to `tmp/` directory
- Modular component architecture with proper TypeScript exports
- YAML parsing available via js-yaml or native Bun YAML support
- Schema transformation system ready for resume tailoring workflow

## Claude Code Guidelines

### Commit Message Policy
**IMPORTANT**: Never include Claude Code attribution or co-authored-by lines in git commit messages. All commits should be clean and focused on the actual changes without tool attribution.