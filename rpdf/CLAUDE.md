# CLAUDE.md - React-PDF Component Development Guide

This comprehensive guide provides everything Claude Code instances need to create, modify, and debug React-PDF components in this resume generator project.

## Project Overview

This is a React-PDF based resume generator that creates professional PDF documents from structured YAML data. The architecture emphasizes modularity, type safety, and professional document standards.

### Key Technologies

- **Runtime**: Bun (JavaScript runtime and bundler)
- **PDF Generation**: @react-pdf/renderer for React-to-PDF rendering
- **Type Safety**: TypeScript with strict mode
- **Design System**: Centralized design tokens and font management
- **Data Source**: YAML with TypeScript conversion

## Project Architecture

### Directory Structure

```
├── src/pages/                          # React-PDF components
│   ├── design-tokens.ts                # Centralized design system
│   ├── fonts-register.ts               # Font registration system
│   ├── index.tsx                       # Component export barrel
│   └── resume/                         # Resume-specific components
│       ├── index.tsx                   # Main resume document
│       ├── Header.tsx                  # Name, title, summary, profile image
│       ├── Contact.tsx                 # Contact information with links
│       ├── Skills.tsx                  # Technical expertise and soft skills
│       ├── Experience.tsx              # Professional experience and projects
│       ├── Education.tsx               # Education section
│       ├── Languages.tsx               # Language proficiency
│       ├── List.tsx                    # Generic list utility component
│       └── Title.tsx                   # Generic title utility component
├── src/data/
│   └── resume.ts                       # Auto-generated TypeScript data module
├── data/
│   ├── resume.yaml                     # Master resume data (multi-version)
│   └── resume_tailored.yaml            # Job-specific optimized version
├── rpdf/                               # React-PDF documentation
│   ├── components.md                   # React-PDF component API reference
│   ├── fonts.md                        # Typography and font registration
│   ├── styling.md                      # CSS properties and styling
│   └── troubleshooting.md              # Advanced features and debugging
├── web_layout.tsx                      # Browser PDFViewer for development
├── generate-pdf.ts                     # Server-side PDF generation
└── generate-data.ts                    # YAML to TypeScript converter
```

### Data Flow Architecture

```
data/resume.yaml → generate-data.ts → src/data/resume.ts → React components → PDF output
```

### Component Hierarchy

```tsx
<Document>
  <Page style={styles.page}>
    <Header resume={data} />
    <View style={styles.container}>
      <View style={styles.leftColumn}>
        <Contact resume={data} />
        <Skills resume={data} />
        <Languages resume={data} />
      </View>
      <View style={styles.rightColumn}>
        <Experience resume={data} />
        <Education resume={data} />
      </View>
    </View>
  </Page>
</Document>
```

## Design System Integration

### Using Design Tokens (`src/pages/design-tokens.ts`)

The project uses a centralized design token system to ensure consistency:

```tsx
import { colors, spacing, typography } from '../design-tokens';

// Colors - based on Tailwind palette with semantic mapping
colors.primary; // Main text and elements (zinc-900)
colors.accent; // Highlights and links (rose-600)
colors.darkGray; // Content text (zinc-800)
colors.mediumGray; // Secondary text (zinc-600)
colors.separatorGray; // Separator lines (zinc-400)

// Typography scales
typography.text; // Body text: 9px, Lato, lineHeight 1.33
typography.title; // Main titles: 22px, Lato Bold, uppercase
typography.subtitle; // Section headers: 14px, Lato Bold, capitalize
typography.small; // Small text: 9px, lineHeight 1.33

// Spacing system
spacing.columnWidth; // Left column width: 180
spacing.documentPadding; // Document padding: 42
spacing.pagePadding; // Section padding: 18
spacing.profileImageSize; // Profile image: 46
spacing.listItemSpacing; // List item spacing: 4
```

### Font System (`src/pages/fonts-register.ts`)

Two font families are registered with multiple weights:

```tsx
// Font families available:
'Open Sans'; // Regular weight
'Open Sans Light'; // Light weight
'Open Sans Bold'; // Bold weight
'Open Sans Italic'; // Italic style

'Lato'; // Regular weight (primary)
'Lato Italic'; // Italic style
'Lato Light'; // Light weight
'Lato semibold'; // Semibold weight
'Lato Bold'; // Bold weight (primary for headers)
```

## Component Development Patterns

### Basic Component Structure

Every resume component follows this pattern:

```tsx
import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors, spacing, typography } from '../design-tokens';
import type { ResumeSchema } from '../../types';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.pagePadding / 2,
  },
  sectionTitle: {
    fontFamily: 'Lato Bold',
    fontSize: 12,
    color: colors.primary,
    marginBottom: spacing.pagePadding / 3,
  },
  // Additional styles...
});

const ComponentName = ({ resume }: { resume: ResumeSchema }) => (
  <View style={styles.container}>
    <Text style={styles.sectionTitle}>Section Title</Text>
    {/* Component content */}
  </View>
);

export default ComponentName;
```

### Real Component Examples

#### Header Component Pattern (`src/pages/resume/Header.tsx`)

```tsx
// Key patterns demonstrated:
// - Profile image positioning with absolute layout
// - Typography hierarchy with design tokens
// - Flexible content area with proper spacing

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.pagePadding / 1.5,
  },
  profileArea: {
    top: 0,
    right: 0,
    width: spacing.profileImageSize,
    height: spacing.profileImageSize,
    position: 'absolute',
  },
  contentArea: {
    flex: 1,
    paddingRight: spacing.profileImageSize + spacing.pagePadding,
  },
  name: {
    color: colors.primary,
    fontSize: 22,
    fontFamily: 'Lato Bold',
    textTransform: 'uppercase',
  },
});
```

#### Skills Component Pattern (`src/pages/resume/Skills.tsx`)

```tsx
// Key patterns demonstrated:
// - Data iteration with proper mapping
// - Conditional rendering for technical vs soft skills
// - List formatting with bullets

const TechnicalExpertiseSection = ({ resume }: { resume: ResumeSchema }) => (
  <View>
    <Text style={styles.sectionTitle}>Technical Expertise</Text>
    {resume.technical_expertise.map((category, index) => (
      <View key={index} style={styles.groupBySection}>
        <Text style={styles.categoryTitle}>{category.resume_title}</Text>
        <Text style={styles.skillText}>{category.skills.join(', ')}</Text>
      </View>
    ))}
  </View>
);
```

#### Contact Component Pattern (`src/pages/resume/Contact.tsx`)

```tsx
// Key patterns demonstrated:
// - Link components for interactive elements
// - Bullet point lists with proper alignment
// - Contact information formatting

<View style={styles.contactItem}>
  <Text style={styles.bullet}>•</Text>
  <Text style={styles.contactText}>
    <Link style={styles.contactText} src={contact.linkedin}>
      LinkedIn Profile
    </Link>
  </Text>
</View>
```

## Data Integration Guide

### Type Safety with ResumeSchema

All components receive typed data through the `ResumeSchema` interface:

```tsx
// Component props pattern
const ComponentName = ({ resume }: { resume: ResumeSchema }) => {
  // Access data with full type safety
  const { contact, professional_experience, skills } = resume;

  return <View>{/* Use data with confidence */}</View>;
};
```

### Data Structure Integration

The resume data follows this structure:

```tsx
interface ResumeSchema {
  name: string;
  title: string;
  summary: string;
  contact: ContactDetails;
  technical_expertise: TechnicalCategory[];
  skills: string[];
  professional_experience: ProfessionalExperience[];
  independent_projects: IndependentProject[];
  languages: Language[];
  education: Education[];
}
```

### Handling Optional Data

```tsx
// Safe data access patterns
{
  company_description && <Text style={styles.companyDescription}>{company_description}</Text>;
}

{
  achievements && achievements.length > 0 && (
    <View>
      {achievements.map((achievement, index) => (
        <View key={index} style={styles.achievementItem}>
          <Text>{achievement}</Text>
        </View>
      ))}
    </View>
  );
}
```

## Development Workflow

### Essential Commands

```bash
# Development with hot reload
bun run dev

# Generate PDF file (outputs to tmp/resume.pdf)
bun run save-to-pdf

# Data conversion (runs automatically in other commands)
bun run generate-data
```

### Development Process

1. **Data First**: Ensure `data/resume.yaml` contains required data
2. **Component Development**: Use `bun run dev` for live preview with PDFViewer
3. **Styling**: Use design tokens for consistency
4. **Testing**: Test with both PDFViewer and file generation
5. **Debugging**: Enable debug mode for layout issues

### Debug Mode Usage

```tsx
// Enable visual debugging
<Page style={styles.page} debug={true}>
  <View style={styles.section} debug={true}>
    <Text style={styles.text} debug={true}>
      Content
    </Text>
  </View>
</Page>
```

## Component Creation Guide

### Step 1: Create Component File

Create new component in `src/pages/resume/ComponentName.tsx`:

```tsx
import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors, spacing, typography } from '../design-tokens';
import type { ResumeSchema } from '../../types';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.pagePadding / 2,
  },
  sectionTitle: {
    fontFamily: 'Lato Bold',
    fontSize: 12,
    color: colors.primary,
    marginBottom: spacing.pagePadding / 3,
  },
});

const ComponentName = ({ resume }: { resume: ResumeSchema }) => (
  <View style={styles.container}>
    <Text style={styles.sectionTitle}>Section Title</Text>
    {/* Component implementation */}
  </View>
);

export default ComponentName;
```

### Step 2: Integrate with Main Document

Add to `src/pages/resume/index.tsx`:

```tsx
import ComponentName from './ComponentName';

// Add to appropriate column in the Resume component
<View style={styles.leftColumn}>
  <ComponentName resume={data} />
</View>;
```

### Step 3: Update Export Barrel

Add to `src/pages/index.tsx` if needed for external access.

## Component Modification Guide

### Styling Modifications

1. **Use Design Tokens**: Always prefer design tokens over hardcoded values
2. **Follow Existing Patterns**: Mimic existing component styles
3. **Test Responsively**: Check how changes affect layout flow

```tsx
// Good - uses design tokens
marginBottom: spacing.pagePadding / 2,
color: colors.primary,
fontFamily: 'Lato Bold',

// Avoid - hardcoded values
marginBottom: 9,
color: '#18181b',
fontFamily: 'Arial',
```

### Layout Modifications

1. **Understand Flexbox**: React-PDF uses flexbox for layout
2. **Mind the Columns**: Left column has fixed width, right column is flexible
3. **Consider Page Breaks**: Components may span pages

### Data Integration Changes

When adding new data fields:

1. Update `data/resume.yaml` with new data
2. Run `bun run generate-data` to update TypeScript types
3. Update component to use new data fields
4. Test with both development and file generation

## Styling Best Practices

### StyleSheet Usage

```tsx
// Always use StyleSheet.create() for performance
const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    marginBottom: spacing.pagePadding / 2,
  },
  text: {
    fontSize: typography.text.size,
    fontFamily: typography.text.fontFamily,
    lineHeight: typography.text.lineHeight,
    color: colors.darkGray,
  },
});
```

### Layout Patterns

```tsx
// Two-column layout pattern
flexDirection: 'row',
leftColumn: {
  width: spacing.columnWidth,
  paddingRight: spacing.pagePadding,
},
rightColumn: {
  flex: 1,
  paddingLeft: spacing.pagePadding,
},

// List item pattern
flexDirection: 'row',
alignItems: 'flex-start',
marginBottom: spacing.listItemSpacing,

// Section separator pattern
borderBottom: `1px solid ${colors.separatorGray}`,
```

### Typography Patterns

```tsx
// Section title pattern
sectionTitle: {
  fontFamily: 'Lato Bold',
  fontSize: 12,
  color: colors.primary,
  marginBottom: spacing.pagePadding / 3,
},

// Body text pattern
bodyText: {
  fontSize: typography.text.size,
  fontFamily: typography.text.fontFamily,
  lineHeight: typography.text.lineHeight,
  color: colors.darkGray,
},

// Emphasis text pattern
emphasis: {
  fontFamily: 'Lato Bold',
  fontSize: typography.text.size,
  color: colors.primary,
},
```

## Troubleshooting and Debugging

### Common Issues and Solutions

#### 1. Component Not Rendering

**Problem**: Component appears empty or not rendering

**Solutions**:

```tsx
// Check data availability
console.log('Resume data:', resume);

// Verify component structure
<View style={styles.container} debug={true}>
  <Text>Test content</Text>
</View>;

// Check for data iteration issues
{
  resume.skills && resume.skills.map((skill, index) => <Text key={index}>{skill}</Text>);
}
```

#### 2. Layout Issues

**Problem**: Components overlapping or incorrect positioning

**Solutions**:

```tsx
// Enable debug mode to visualize boundaries
<View style={styles.container} debug={true}>

// Check flexbox properties
flexDirection: 'column', // vs 'row'
alignItems: 'flex-start', // vs 'center', 'flex-end'
justifyContent: 'flex-start', // vs 'center', 'space-between'

// Verify width constraints
width: spacing.columnWidth, // Fixed width
flex: 1, // Flexible width
```

#### 3. Font Loading Issues

**Problem**: Custom fonts not appearing

**Solutions**:

```tsx
// Verify font registration in fonts-register.ts
Font.register({
  family: 'Font Name',
  src: 'valid-url-or-path',
});

// Check fontFamily usage exactly matches registered name
fontFamily: 'Lato Bold', // Must match registration exactly

// Test with built-in fonts first
fontFamily: 'Helvetica', // Built-in fallback
```

#### 4. Styling Not Applied

**Problem**: StyleSheet styles not rendering

**Solutions**:

```tsx
// Prefer StyleSheet.create() over inline styles
const styles = StyleSheet.create({
  container: { /* styles */ }
});

// Check supported CSS properties in rpdf/styling.md
// Some CSS properties are not supported in React-PDF

// Verify style object structure
style={styles.container} // Single style
style={[styles.base, styles.modifier]} // Array of styles
```

#### 5. Performance Issues

**Problem**: Slow PDF generation

**Solutions**:

```tsx
// Use StyleSheet.create() instead of inline styles
// Avoid complex component nesting
// Optimize image sizes and formats
// Use memo for repeated components

const MemoizedComponent = React.memo(ComponentName);
```

### Debugging Workflow

1. **Enable Debug Mode**: Add `debug={true}` to components
2. **Check Data Flow**: Log resume data at component entry
3. **Validate Types**: Ensure TypeScript types match data structure
4. **Test Incrementally**: Build component in small steps
5. **Use Browser DevTools**: Check PDF rendering in browser first
6. **Generate File**: Test with actual PDF file generation

### Development vs Production Testing

```tsx
// Development: Use PDFViewer for rapid iteration
// File: web_layout.tsx with PDFViewer component

// Production: Generate actual PDF files
// Command: bun run save-to-pdf
// Output: tmp/resume.pdf
```

## React-PDF Documentation Reference

### Core Documentation Files

When working with React-PDF features, always reference these documentation files in the `/rpdf` folder:

1. **`rpdf/components.md`**: Complete React-PDF component API reference
   - Use for: Understanding component props, available components, layout features
   - Key sections: Document, Page, View, Text, Image, Link, Canvas

2. **`rpdf/fonts.md`**: Typography system and font registration guide
   - Use for: Font registration, typography issues, text rendering
   - Key sections: Font.register(), built-in fonts, hyphenation

3. **`rpdf/styling.md`**: CSS properties and styling techniques
   - Use for: Supported CSS properties, layout systems, media queries
   - Key sections: StyleSheet API, Flexbox, units, valid properties

4. **`rpdf/troubleshooting.md`**: Advanced features and debugging
   - Use for: Page wrapping, dynamic content, navigation, debugging

### Quick Reference Patterns

```tsx
// Document structure (from components.md)
<Document>
  <Page size="A4" orientation="portrait" style={styles.page}>
    <View style={styles.section}>
      <Text style={styles.text}>Content</Text>
    </View>
  </Page>
</Document>;

// Font registration (from fonts.md)
Font.register({
  family: 'FontName',
  src: 'https://fonts.gstatic.com/path/to/font.ttf',
  fontWeight: 'normal',
  fontStyle: 'normal',
});

// Styling patterns (from styling.md)
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
});
```

## Advanced Features

### Dynamic Content

```tsx
// Page numbers and dynamic content
<Text
  style={styles.pageNumber}
  render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
  fixed
/>

// Conditional rendering based on page context
<View
  render={({ pageNumber }) =>
    pageNumber % 2 === 0 ? <EvenPageHeader /> : <OddPageHeader />
  }
/>
```

### Links and Navigation

```tsx
// External links
<Link src="https://example.com" style={styles.link}>
  External Link
</Link>

// Email links
<Link src="mailto:email@example.com" style={styles.email}>
  email@example.com
</Link>

// Internal navigation (requires id prop on target)
<Link src="#section1" style={styles.internalLink}>Go to Section 1</Link>
<Text id="section1">Section 1 Content</Text>
```

### Fixed Elements

```tsx
// Headers and footers that appear on all pages
<View style={styles.header} fixed>
  <Text>Document Header</Text>
</View>

<View style={styles.footer} fixed>
  <Text>Document Footer</Text>
</View>
```

## File Organization Conventions

### Component Placement

- **Resume components**: `src/pages/resume/ComponentName.tsx`
- **Utility components**: `src/pages/resume/` (List.tsx, Title.tsx)
- **Design tokens**: `src/pages/design-tokens.ts`
- **Font registration**: `src/pages/fonts-register.ts`

### Naming Conventions

- **Components**: PascalCase (e.g., `Header.tsx`, `ContactInfo.tsx`)
- **Styles**: camelCase object keys (e.g., `sectionTitle`, `contactItem`)
- **Files**: PascalCase for components, kebab-case for utilities

### Export Patterns

```tsx
// Component files: default export
export default ComponentName;

// Utility files: named exports for multiple utilities
export const UtilityOne = () => {};
export const UtilityTwo = () => {};
export default { UtilityOne, UtilityTwo };

// Index files: re-export pattern
export { default as ComponentName } from './ComponentName';
```

## Integration Patterns

### Main Document Integration

The main document (`src/pages/resume/index.tsx`) orchestrates all components:

```tsx
const Resume = ({ data }: { data: ResumeSchema }) => (
  <Page style={styles.page}>
    <Header resume={data} />
    <View style={styles.container}>
      <View style={styles.leftColumn}>
        <Contact resume={data} />
        <Skills resume={data} />
        <Languages resume={data} />
      </View>
      <View style={styles.rightColumn}>
        <Experience resume={data} />
        <Education resume={data} />
      </View>
    </View>
  </Page>
);
```

### Data Flow Integration

```tsx
// Data flows from YAML → TypeScript → Components
import data from '../../data/resume'; // Auto-generated
const resumeData = data.resume as unknown as ResumeSchema;

// Components receive typed data
<ComponentName resume={resumeData} />;
```

### Design System Integration

```tsx
// Import design tokens
import { colors, spacing, typography } from '../design-tokens';

// Use in StyleSheet
const styles = StyleSheet.create({
  title: {
    fontSize: typography.title.fontSize,
    fontFamily: typography.title.fontFamily,
    color: colors.primary,
    marginBottom: spacing.pagePadding / 3,
  },
});
```

## Quick Reference Checklists

### Creating a New Component

- [ ] Create file in `src/pages/resume/ComponentName.tsx`
- [ ] Import required React-PDF components and design tokens
- [ ] Define TypeScript interface with `ResumeSchema`
- [ ] Create StyleSheet with design token usage
- [ ] Implement component with proper data access
- [ ] Add to main document in appropriate column
- [ ] Test with `bun run dev` and debug mode
- [ ] Verify with file generation `bun run save-to-pdf`

### Modifying Existing Components

- [ ] Understand current component structure and data usage
- [ ] Use design tokens for any new styling
- [ ] Follow existing patterns in the component
- [ ] Test changes with debug mode enabled
- [ ] Verify layout doesn't break in two-column system
- [ ] Check both development PDFViewer and file output

### Debugging Layout Issues

- [ ] Enable debug mode on problematic components
- [ ] Check flexbox properties and alignment
- [ ] Verify width constraints and column behavior
- [ ] Test with minimal content to isolate issues
- [ ] Check console for React-PDF warnings
- [ ] Reference `rpdf/troubleshooting.md` for advanced debugging

### Performance Optimization

- [ ] Use StyleSheet.create() instead of inline styles
- [ ] Avoid unnecessary component re-renders
- [ ] Optimize image sizes and formats
- [ ] Use memoization for expensive operations
- [ ] Test with large datasets to identify bottlenecks

## Summary

This guide provides comprehensive coverage of React-PDF development in this project. Key principles:

1. **Use Design Tokens**: Always prefer centralized design system
2. **Follow Type Safety**: Leverage TypeScript for reliable data access
3. **Reference Documentation**: Use `/rpdf` docs for React-PDF specifics
4. **Debug Systematically**: Use debug mode and systematic troubleshooting
5. **Test Thoroughly**: Verify with both PDFViewer and file generation
6. **Maintain Consistency**: Follow established patterns and conventions

For React-PDF specific questions, always consult the documentation files in the `/rpdf` folder. For project-specific patterns, refer to existing components as examples and follow the conventions established in this codebase.
