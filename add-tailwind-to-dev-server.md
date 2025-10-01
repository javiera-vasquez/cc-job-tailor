# Dev Server Interface Integration: Tailwind CSS + shadcn/ui

## Executive Summary

This document outlines the findings and recommendations for adding a user interface layer to the `dev-server.tsx` using Tailwind CSS and shadcn/ui. The goal is to create an enhanced development experience with a proper UI framework while maintaining the existing React-PDF functionality.

## Current State Analysis

### Existing Setup
- **Runtime**: Bun (fast, modern JavaScript runtime)
- **Framework**: React 19 with react-dom
- **Build Tool**: Native Bun bundler (no Vite/webpack)
- **Dev Server**: `dev-server.tsx` with simple inline styles
- **PDF Generation**: @react-pdf/renderer
- **Project Structure**:
  ```
  cc-resume-manager/
  ├── src/
  │   ├── templates/         # React-PDF components
  │   ├── zod/              # Validation schemas
  │   ├── types.ts
  │   └── data/application.ts
  ├── dev-server.tsx        # Development preview
  └── package.json
  ```

### Current Limitations
- Inline styles in dev-server.tsx (no styling framework)
- No component library for UI elements
- Limited interactivity options for development preview

## Integration Strategy

### Recommended Approach: Minimal Setup with @tailwindcss/vite Plugin

Based on research, the cleanest approach for Bun projects is to use Tailwind CSS v4 with minimal configuration.

### Why This Approach?
1. **Bun Native**: Bun has excellent CSS support built-in
2. **Modern Tailwind**: Tailwind CSS v4 uses CSS imports (`@import "tailwindcss"`)
3. **Simple Setup**: No complex PostCSS configuration needed
4. **shadcn/ui Compatible**: Works seamlessly with shadcn/ui components
5. **Maintains Separation**: UI layer separate from PDF generation

## Implementation Plan

### Phase 1: Dependencies Installation

```bash
# Tailwind CSS dependencies
bun add -d tailwindcss @tailwindcss/cli

# shadcn/ui dependencies
bun add class-variance-authority clsx tailwind-merge lucide-react

# TypeScript path support
bun add -d @types/node
```

### Phase 2: Configuration Files

#### 1. Update `tsconfig.json`
Add path aliases for clean imports:

```json
{
  "compilerOptions": {
    // ... existing config
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@ui/*": ["./src/ui/*"]
    }
  },
  "exclude": ["src/data/application.ts"]
}
```

#### 2. Create `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

export default {
  content: [
    './dev-server.tsx',
    './dev-server-index.tsx',
    './src/ui/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

#### 3. Create `src/ui/styles/globals.css`

```css
@import "tailwindcss";

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 5.9% 10%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

#### 4. Create `src/ui/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

#### 5. Create `components.json` for shadcn/ui

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/ui/styles/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@ui/components",
    "utils": "@ui/lib/utils",
    "ui": "@ui/components/ui",
    "lib": "@ui/lib",
    "hooks": "@ui/hooks"
  }
}
```

### Phase 3: Build Configuration

#### Option A: Using Bun's Native CSS Support (Recommended)

Update `package.json` scripts:

```json
{
  "scripts": {
    "dev": "bun dev-with-watch.ts",
    "dev:css": "bunx @tailwindcss/cli -i ./src/ui/styles/globals.css -o ./src/ui/styles/output.css --watch",
    "build:css": "bunx @tailwindcss/cli -i ./src/ui/styles/globals.css -o ./src/ui/styles/output.css --minify"
  }
}
```

Run both in parallel during development:
```bash
# Terminal 1
bun run dev:css

# Terminal 2
bun run dev
```

#### Option B: Using Vite Plugin (Alternative)

If you prefer a more integrated solution, add Vite:

```bash
bun add -d vite @vitejs/plugin-react @tailwindcss/vite
```

Create `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ui': path.resolve(__dirname, './src/ui'),
    },
  },
  server: {
    port: 3000,
  },
});
```

Update dev script:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
```

### Phase 4: Folder Structure

```
cc-resume-manager/
├── src/
│   ├── templates/              # Existing: React-PDF components
│   │   ├── resume/
│   │   ├── cover-letter/
│   │   ├── design-tokens.ts
│   │   └── fonts-register.ts
│   ├── ui/                     # NEW: UI Layer
│   │   ├── components/         # React components for dev server
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   └── ...
│   │   │   ├── document-viewer.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── header.tsx
│   │   ├── lib/               # Utilities
│   │   │   └── utils.ts
│   │   ├── hooks/             # Custom React hooks
│   │   │   └── use-document-state.ts
│   │   └── styles/            # Global styles
│   │       ├── globals.css
│   │       └── output.css (generated)
│   ├── zod/                   # Existing: Validation
│   ├── types.ts               # Existing: Types
│   └── data/application.ts    # Existing: Generated data
├── dev-server.tsx             # Modified: Uses UI components
├── dev-server-index.tsx       # Entry point with CSS import
├── dev-with-watch.ts          # Existing: File watcher
├── generate-data.ts           # Existing: YAML → TS
├── generate-pdf.ts            # Existing: PDF generation
├── tailwind.config.ts         # NEW
├── components.json            # NEW: shadcn/ui config
├── package.json
└── tsconfig.json              # Modified: Add path aliases
```

### Phase 5: Installing shadcn/ui Components

After setup, add components as needed:

```bash
# Initialize shadcn/ui (if not using components.json)
bunx shadcn@latest init

# Add specific components
bunx shadcn@latest add button
bunx shadcn@latest add card
bunx shadcn@latest add tabs
bunx shadcn@latest add select
bunx shadcn@latest add dialog
bunx shadcn@latest add scroll-area
```

### Phase 6: Update Dev Server

Modify `dev-server.tsx` to use the new UI layer:

```tsx
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PDFViewer } from '@react-pdf/renderer';
import { Buffer } from 'buffer';

// NEW: Import Tailwind CSS
import '@ui/styles/globals.css';

// NEW: Import UI components
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@ui/components/ui/tabs';
import { Card } from '@ui/components/ui/card';
import { Button } from '@ui/components/ui/button';

// Existing: Polyfill Buffer
globalThis.Buffer = Buffer;

import { resume, coverLetter } from './src';

const App = () => {
  const [activeDocument, setActiveDocument] = useState<'resume' | 'cover-letter'>('resume');

  return (
    <div className="flex h-screen w-full flex-col">
      {/* NEW: Header with Tailwind */}
      <header className="border-b bg-background p-4">
        <div className="container flex items-center justify-between">
          <h1 className="text-2xl font-bold">Resume Manager</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Download PDF
            </Button>
          </div>
        </div>
      </header>

      {/* NEW: Document selector with shadcn/ui Tabs */}
      <Tabs value={activeDocument} onValueChange={(v) => setActiveDocument(v as any)} className="flex-1 p-4">
        <TabsList>
          <TabsTrigger value="resume">Resume</TabsTrigger>
          <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
        </TabsList>

        <TabsContent value="resume" className="h-[calc(100vh-12rem)] mt-4">
          <Card className="h-full">
            <PDFViewer style={{ width: '100%', height: '100%' }} showToolbar={true} key={Date.now()}>
              <resume.Document />
            </PDFViewer>
          </Card>
        </TabsContent>

        <TabsContent value="cover-letter" className="h-[calc(100vh-12rem)] mt-4">
          <Card className="h-full">
            <PDFViewer style={{ width: '100%', height: '100%' }} showToolbar={true} key={Date.now()}>
              <coverLetter.Document />
            </PDFViewer>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
```

## Recommended Workflow

### Development Process

1. **Start CSS watcher** (if using Option A):
   ```bash
   bun run dev:css
   ```

2. **Start dev server**:
   ```bash
   bun run dev
   ```

3. **Add new UI components as needed**:
   ```bash
   bunx shadcn@latest add [component-name]
   ```

### Building for Production

```bash
# Build CSS
bun run build:css

# Generate PDF
bun run save-to-pdf -C company-name
```

## Key Considerations

### 1. Separation of Concerns

- **PDF Layer** (`src/templates/`): React-PDF components, design tokens, fonts
- **UI Layer** (`src/ui/`): Tailwind + shadcn/ui components for dev server only
- **Data Layer** (`src/zod/`, `src/types.ts`): Shared validation and types

### 2. Performance

- Tailwind's JIT compiler generates only used CSS
- shadcn/ui components are tree-shakeable
- Bun's native bundler is extremely fast

### 3. Maintenance

- shadcn/ui components are copied to your codebase (full control)
- Easy to customize design tokens via CSS variables
- TypeScript strict mode ensures type safety

### 4. Future Enhancements

With this setup, you can add:

- **Live editing**: Edit YAML data in UI, preview changes instantly
- **Template switcher**: Toggle between AI/QA/Frontend-focused versions
- **Export options**: Download PDFs with different configurations
- **Theme toggle**: Dark/light mode for dev server
- **Company selector**: Choose tailored versions from dropdown
- **Data validation UI**: Visual feedback for schema errors

## Alternative Approaches Considered

### 1. Vanilla CSS Modules
- ❌ Less powerful than Tailwind
- ❌ No component library
- ✅ Simpler setup

### 2. Styled Components / Emotion
- ❌ Runtime CSS-in-JS overhead
- ❌ Not compatible with React-PDF styling
- ✅ Component-scoped styles

### 3. Tailwind + Headless UI (instead of shadcn/ui)
- ✅ Smaller bundle
- ❌ Less complete component set
- ❌ More manual styling work

## Migration Path

### Step-by-step Migration

1. **Week 1**: Setup Tailwind CSS + configuration
2. **Week 2**: Add shadcn/ui components and folder structure
3. **Week 3**: Migrate dev-server.tsx to use new UI components
4. **Week 4**: Add enhanced features (company selector, live editing, etc.)

### Rollback Strategy

If issues arise:
1. Keep `dev-server.tsx` backup as `dev-server-old.tsx`
2. Can revert by switching entry point in package.json
3. UI layer is completely isolated from PDF generation

## Conclusion

### Recommended Solution

**Option A: Bun Native + Tailwind CLI** is recommended for this project because:

1. ✅ Minimal dependencies (no Vite needed)
2. ✅ Leverages Bun's native strengths
3. ✅ Fast, simple, maintainable
4. ✅ shadcn/ui provides production-ready components
5. ✅ Clear separation between PDF and UI layers
6. ✅ Easy to extend with new features

### Next Steps

1. Create a feature branch for this work
2. Install dependencies (Phase 1)
3. Add configuration files (Phase 2)
4. Setup folder structure (Phase 4)
5. Install initial shadcn/ui components (Phase 5)
6. Migrate dev-server.tsx (Phase 6)
7. Test thoroughly
8. Document any project-specific patterns

### Estimated Timeline

- **Setup + Configuration**: 2-3 hours
- **Component Installation**: 1 hour
- **Dev Server Migration**: 2-3 hours
- **Testing + Documentation**: 1-2 hours
- **Total**: ~1 day of focused work

### Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [Bun Documentation](https://bun.sh/docs)
- [React 19 Docs](https://react.dev)

---

**Document Version**: 1.0
**Last Updated**: 2025-09-30
**Status**: Ready for Implementation