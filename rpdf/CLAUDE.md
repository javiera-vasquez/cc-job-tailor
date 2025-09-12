# CLAUDE.md - React-PDF Documentation and Template Guide

This file provides guidance for Claude Code instances working with React-PDF templates and documentation in this project.

## Purpose and Structure Overview

The `/rpdf` folder serves as the primary documentation source for React-PDF development in this project. It contains comprehensive API references, styling guides, and template examples that should be consulted when creating or modifying PDF documents.

```
rpdf/
├── CLAUDE.md                    # This guide (usage instructions for Claude instances)
├── components.md                # Complete React-PDF component API reference
├── fonts.md                     # Typography system and font registration guide
├── styling.md                   # CSS properties and styling techniques reference
└── templates/                   # Example templates and design references
    └── Mockup-Resume/
        ├── AI PRODUCT DEV.jpg   # Professional resume template example
        ├── AI PRODUCT DEV (2).jpg # Alternative layout variation
        └── MIGRATION_REPORT.md  # Visual migration analysis and requirements
```

## Documentation Reference Guide

### When to Use Each Documentation File

#### 1. components.md - Component API Reference
**Use when:**
- Adding new React-PDF components to templates
- Understanding component props and capabilities
- Implementing advanced features (fixed positioning, dynamic content, bookmarks)
- Debugging component behavior

**Key Sections:**
- **Core Components**: Document, Page, View, Text, Image, Link
- **Advanced Components**: Canvas (custom drawing), Note (annotations)
- **Web Components**: PDFViewer, PDFDownloadLink, BlobProvider
- **Props Reference**: Complete tables with types, defaults, and descriptions

**Critical Patterns:**
```tsx
// Document structure hierarchy
<Document>
  <Page style={styles.body} debug={true}>
    <Text style={styles.header} fixed>Header</Text>
    <View style={styles.section}>
      <Text style={styles.text}>Content</Text>
    </View>
    <Text style={styles.pageNumber} 
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} 
          fixed />
  </Page>
</Document>
```

#### 2. fonts.md - Typography System
**Use when:**
- Registering custom fonts for professional documents
- Handling multiple font weights and styles
- Implementing proper typography hierarchy
- Troubleshooting font rendering issues

**Key Features:**
- **Built-in Fonts**: Courier, Helvetica, Times-Roman families
- **Font Registration**: `Font.register()` for TTF/WOFF fonts
- **Advanced Typography**: Hyphenation control, emoji support

**Essential Pattern:**
```tsx
Font.register({
  family: 'Roboto',
  src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff',
  fontWeight: 'normal',
  fontStyle: 'normal'
});
```

#### 3. styling.md - CSS Properties and Styling
**Use when:**
- Implementing responsive layouts
- Understanding supported CSS properties
- Creating professional document styling
- Debugging layout and spacing issues

**Supported Systems:**
- **Flexbox**: Complete flexbox layout support
- **Units**: pt (default), in, mm, cm, %, vw, vh
- **Media Queries**: Width, height, orientation-based responsive design
- **Transformations**: Rotate, scale, translate, skew, matrix

## Template Analysis Guidelines

### Professional Resume Templates

The `templates/Mockup-Resume/` folder contains high-quality resume examples that demonstrate:

#### Design Patterns Observed:
- **Two-Column Layout**: Left sidebar for contact/skills, main content for experience
- **Typography Hierarchy**: Clear distinction between headers, subheaders, and body text
- **Professional Color Scheme**: Minimal color usage with high contrast
- **Consistent Spacing**: Uniform margins, padding, and line spacing
- **Metrics Integration**: Quantified achievements with specific numbers and percentages

#### Key Layout Techniques:
- **Section Separation**: Clear visual boundaries between resume sections
- **Skill Categorization**: Organized technical skills into logical groups
- **Achievement Formatting**: Bullet points with action-oriented language
- **Multi-Language Support**: Professional display of language proficiency levels

### Template Analysis Workflow

When analyzing templates for new designs:

1. **Visual Structure Analysis**:
   - Identify layout grid system (columns, rows, sections)
   - Note spacing patterns and alignment principles
   - Document color usage and typography choices

2. **Content Organization Patterns**:
   - Study how information is grouped and prioritized
   - Analyze text hierarchy and emphasis techniques
   - Note how achievements and metrics are presented

3. **Professional Standards**:
   - Ensure compliance with resume best practices
   - Verify readability and print-friendliness
   - Check for consistent branding and formatting

## Development Workflow

### Step-by-Step Template Creation Process

1. **Research Phase**:
   ```bash
   # Always start by reviewing the documentation
   # Read components.md for component capabilities
   # Check styling.md for layout possibilities
   # Study fonts.md for typography options
   ```

2. **Design Analysis**:
   - Study existing templates in `templates/` folder
   - Identify reusable patterns and components
   - Plan component hierarchy and data flow

3. **Implementation Phase**:
   - Start with Document and Page structure
   - Implement layout using View components
   - Add typography with proper font registration
   - Style with StyleSheet.create() for performance

4. **Integration**:
   - Ensure compatibility with main project data structure
   - Test with development PDFViewer
   - Validate with file output generation

### Research Methodology

**Before implementing any React-PDF feature:**

1. **Component Questions**: Always reference `components.md` first for available components and props
2. **Styling Issues**: Check `styling.md` for supported CSS properties and valid units  
3. **Typography Problems**: Consult `fonts.md` for font registration and text rendering
4. **Cross-Reference**: Use all three docs together - components reference styling, fonts affect text rendering
5. **Template Patterns**: Look at `templates/` folder for real-world implementation examples
6. **Migration Reports**: Check for MIGRATION_REPORT.md files in template folders for detailed implementation guidance

## Migration Reports and Template Analysis

### Understanding Migration Reports

Each template folder may contain a `MIGRATION_REPORT.md` file that provides detailed analysis of visual design patterns and specific implementation requirements.

#### Purpose of Migration Reports:
- **Visual Analysis**: Comprehensive breakdown of template design elements
- **Component Mapping**: Direct correlation between visual elements and React-PDF components
- **Implementation Specifications**: Detailed requirements for layout, typography, colors, and spacing
- **Gap Analysis**: Comparison between current implementation and target design
- **Migration Roadmap**: Step-by-step implementation guidance

#### Using Migration Reports Effectively:

1. **Pre-Implementation Review**: Always check for existing MIGRATION_REPORT.md files before starting template work
2. **Component-by-Component Guidance**: Use the detailed component analysis sections for specific updates
3. **Visual Reference**: Cross-reference migration reports with template images for complete understanding
4. **Implementation Priority**: Follow the suggested phases and priorities outlined in reports

### Template Analysis Workflow Enhanced

**Step 1: Check for Existing Analysis**
```bash
# Always look for migration reports first
ls templates/[template-name]/MIGRATION_REPORT.md
```

**Step 2: Comprehensive Template Study**
- Review migration report for detailed analysis
- Examine template images with report specifications in mind
- Cross-reference visual elements with React-PDF component capabilities

**Step 3: Implementation Planning**
- Use migration report phases and priorities
- Plan component modifications based on detailed specifications
- Consider responsive design requirements outlined in reports

## Sub-Agent Integration

### PDF Template Migrator Agent

This project includes a specialized sub-agent (`pdf-template-migrator`) designed specifically for template-to-component migrations.

#### When to Use the Sub-Agent:
- Complex template migrations requiring multiple component updates
- Professional layout implementations from visual designs
- Comprehensive styling and typography overhauls
- Large-scale template-to-component transformations

#### Sub-Agent Capabilities:
- **Template Analysis**: Expert visual design pattern extraction
- **Component Architecture**: Professional React-PDF component planning
- **Implementation**: Direct component modification and creation
- **Quality Assurance**: Professional standards validation

#### Invoking the Sub-Agent:
```
"Use the pdf-template-migrator subagent to implement the resume template migration based on the MIGRATION_REPORT.md specifications"
```

#### Integration with Migration Reports:
The sub-agent is designed to work seamlessly with migration reports, using them as detailed implementation specifications for component updates.

## Best Practices and Patterns

### Component Usage Patterns

#### Professional Document Structure
```tsx
const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica'
  },
  sidebar: {
    width: '30%',
    paddingRight: 20,
    borderRight: '1px solid #E0E0E0'
  },
  main: {
    width: '70%',
    paddingLeft: 20
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2C3E50'
  }
});
```

#### Typography Hierarchy
```tsx
const typographyStyles = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  h2: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  h3: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  body: { fontSize: 11, lineHeight: 1.4, marginBottom: 4 },
  small: { fontSize: 9, color: '#666666' }
});
```

### Font Registration Best Practices

```tsx
// Register multiple weights for same family
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'path/to/Roboto-Regular.ttf' }, // normal weight
    { src: 'path/to/Roboto-Bold.ttf', fontWeight: 'bold' },
    { src: 'path/to/Roboto-Italic.ttf', fontStyle: 'italic' },
    { src: 'path/to/Roboto-BoldItalic.ttf', fontWeight: 'bold', fontStyle: 'italic' }
  ]
});
```

### Layout Debugging Techniques

```tsx
// Enable debug mode to visualize component boundaries
<Page style={styles.page} debug={true}>
  <View style={styles.section} debug={true}>
    <Text style={styles.text} debug={true}>Content</Text>
  </View>
</Page>
```

## Troubleshooting Guide

### Common Issues and Solutions

#### Font Loading Problems
- **Issue**: Custom fonts not appearing
- **Solution**: Verify font URL accessibility and correct format (TTF/WOFF only)
- **Debug**: Check browser network tab for font loading errors

#### Layout Overflow Issues
- **Issue**: Content extending beyond page boundaries
- **Solution**: Use `wrap` prop and proper width constraints
- **Debug**: Enable debug mode to visualize component boundaries

#### Performance Problems
- **Issue**: Slow PDF generation with large documents
- **Solution**: Use StyleSheet.create() instead of inline styles
- **Optimization**: Implement component memoization for repeated elements

#### Text Rendering Issues
- **Issue**: Text not wrapping properly
- **Solution**: Implement hyphenation callback or adjust text layout
- **Alternative**: Use multiple Text components for better control

### Debugging Checklist

When encountering React-PDF issues:

1. ✅ Check component hierarchy (Document → Page → View/Text structure)
2. ✅ Verify font registration for custom typography
3. ✅ Enable debug mode to visualize layouts
4. ✅ Validate CSS properties against styling.md reference
5. ✅ Test with both PDFViewer (development) and renderToFile (production)
6. ✅ Check browser console for font loading and rendering errors

## Integration with Main Project

### Data Flow Pattern

The rpdf documentation should be used in conjunction with:
- **Main project data structure**: Located in `data/resume.yaml`
- **Component architecture**: React components in `src/pages/resume/`
- **Build process**: Bun-based development and production workflows

### Template Development Lifecycle

1. **Research**: Study rpdf documentation and existing templates
2. **Analysis**: Check for MIGRATION_REPORT.md files and template specifications
3. **Design**: Plan layout using React-PDF principles and migration guidance
4. **Implementation Strategy**: Decide between manual implementation or sub-agent assistance
5. **Implement**: Create components following project patterns and migration specifications
6. **Test**: Use PDFViewer for development iteration
7. **Generate**: Produce final PDF with renderToFile
8. **Integrate**: Ensure compatibility with project data structure

## Summary

This rpdf documentation folder serves as the authoritative source for React-PDF development in this project. Always consult these documentation files before implementing new features, and use the template examples as references for professional document design patterns.

**Key Remember Points:**
- Documentation files are comprehensive - use them extensively
- Templates show real-world professional standards
- Migration reports provide detailed implementation guidance
- Sub-agent integration available for complex template migrations
- Debug mode is essential for layout troubleshooting
- Font registration is critical for professional typography
- Component hierarchy must follow Document → Page → View/Text pattern

## Quick Reference

### For Template Migration Projects:
1. ✅ Check for existing MIGRATION_REPORT.md in template folder
2. ✅ Review template images alongside migration specifications
3. ✅ Consider sub-agent assistance for complex implementations
4. ✅ Use migration report phases for organized development
5. ✅ Cross-reference with core documentation files
6. ✅ Test thoroughly with both PDFViewer and renderToFile

### For Sub-Agent Usage:
- Invoke `pdf-template-migrator` for comprehensive template-to-component migrations
- Provide migration reports and template references for optimal results
- Use for professional layout implementations and complex styling requirements
- Ideal for multi-component updates and architectural changes