## Page wrapping

Semantically, the `<Page />` component represents a single page in your document. When content exceeds its limits, React-pdf's built-in wrapping engine automatically creates new pages. This mimics typical PDF behavior for any large content.

To disable wrapping:
```
import { Document, Page } from '@react-pdf/renderer';

const doc = () => (
  <Document>
    <Page wrap={false}>
      {/* content */}
    </Page>
  </Document>
);
```

### Breakable vs. unbreakable components

- **Breakable components** (View, Text, Link) fill remaining space before a new page.
- **Unbreakable components** (like Image) move fully to the next page if there's not enough space.

Convert a component to unbreakable with `wrap={false}`.

### Page breaks

Force a page break by adding the `break` prop to a primitive:
```
<Text break>Start me on a new page!</Text>
```

### Fixed components

Render elements on all pages by using the `fixed` prop:
```
<View fixed>
  {/* e.g., header, footer, page numbers */}
</View>
```

---

## Document Navigation

React-pdf supports two main navigation tools: **destinations** and **bookmarks**.

### Destinations

Create internal links with destinations:
```
<Link src="#Footnote">Go to footnote</Link>

<Text id="Footnote">You are here!</Text>
```

### Bookmarks

Add a navigable tree-structured table of contents (for supporting readers):
```
<Page bookmark="Chapter 1">Chapter Content</Page>
<Page bookmark={{
  title: "Nested Section",
  fit: true
}}>Nested Content</Page>
```
Bookmarks have options for title, scroll position (`top`, `left`), zoom, and expansion.

---

## On the fly rendering

React-pdf provides multiple web-specific ways to generate documents without displaying them:

### Download Link

```
import { PDFDownloadLink } from '@react-pdf/renderer';

<PDFDownloadLink document={<MyDoc />} fileName="somename.pdf">
  {({ loading }) => loading ? 'Loading document...' : 'Download now!'}
</PDFDownloadLink>
```
You always have access to the underlying blob data.

### Access blob data

```
import { BlobProvider } from '@react-pdf/renderer';

<BlobProvider document={<MyDoc />}>
  {({ blob, url, loading, error }) => {
    // use blob, url, handle loading and error states
  }}
</BlobProvider>
```

Imperatively get blob data:
```
import { pdf } from '@react-pdf/renderer';
const blob = await pdf(<MyDoc />).toBlob();
```

### usePDF hook

Gives granular control of document state.
```
import { usePDF } from '@react-pdf/renderer';

const [instance, updateInstance] = usePDF({ document: <MyDoc /> });
// instance.url, instance.blob, instance.loading, instance.error
```

---

## Orphan & widow protection

React-pdf ships with built-in protection against orphans (single lines at the bottom) and widows (single lines at the top) in text:

| Prop           | Description                                                               | Type    | Default |
|----------------|---------------------------------------------------------------------------|---------|---------|
| minPresenceAhead | Prevents page wrapping between sibling elements within N points below this element | Integer | 0       |
| orphans        | Minimum number of text lines to show at the bottom of a page              | Integer | 2       |
| widows         | Minimum number of text lines to show at the top of a page                 | Integer | 2       |

Apply these to any valid primitive.

---

## Dynamic content

Render dynamic text depending on context by passing a function to the `render` prop of `<Text />` or `<View />`.

```
<Text
  render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
  fixed
/>
<View
  render={({ pageNumber }) =>
    pageNumber % 2 === 0 ? <Text>Even page!</Text> : null
  }
/>
```
Available render arguments: `pageNumber`, `totalPages`, `subPageNumber`, `subPageTotalPages`

---

## Debugging

Enable visual debugging by adding the `debug` prop to any primitive (except `<Document />`). This will draw red outlines around components to help with layout troubleshooting.

```
<View debug>
  {/* Content */}
</View>
```

---

## Hyphenation

React-pdf uses the Knuth-Plass algorithm to automatically hyphenate English words. For different languages or to customize breaks, provide a hyphenation callback:

```
import { Font } from '@react-pdf/renderer';
Font.registerHyphenationCallback(word => {
  // Return array of syllables
  return ["hy", "phen", "ation"];
});
```
To disable hyphenation, return the word as a single element array.

---
