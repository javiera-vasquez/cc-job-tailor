# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a PDF resume generator built with React and `@react-pdf/renderer`. The application creates PDF documents using React components that render directly to PDF format. It supports both browser-based preview (via PDFViewer) and server-side file generation (via renderToFile). Currently demonstrated with Don Quixote text sample as placeholder content.

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
├── index.html          # HTML entry point, loads ui.tsx
├── ui.tsx              # React app with PDFViewer component  
├── index.tsx           # DocumentWrapper component (PDF structure)
├── generate-pdf.ts     # Server-side PDF generation script
├── tsconfig.json       # TypeScript configuration (ESNext, strict mode)
├── docs/               # React-pdf documentation
│   ├── components.md   # Available PDF components reference
│   ├── fonts.md        # Font registration and typography guide
│   └── styling.md      # PDF styling and CSS properties reference
├── public/images/      # Static assets for PDF
└── tmp/                # Generated PDF output directory
```

### Application Flow
1. **Browser Development**: `index.html` → `ui.tsx` → `PDFViewer` → `DocumentWrapper`
2. **PDF Generation**: `generate-pdf.ts` → `renderToFile` → `tmp/resume.pdf`

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
- `index.tsx`: Reusable DocumentWrapper component (PDF structure)
- `generate-pdf.ts`: Server-side rendering for file output

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

## React-PDF Documentation Reference

The `/docs` folder contains comprehensive react-pdf documentation that serves as the primary reference for PDF development in this project. Understanding this taxonomy is crucial for effective PDF document creation.

### Documentation Structure

```
docs/
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