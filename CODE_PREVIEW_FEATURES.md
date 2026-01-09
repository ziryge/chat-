# Code Preview & Copy Features

## Overview

This document describes the new live code preview and code copy with attribution features added to Devsquare.

## Components

### 1. `CodePreview` - Main Component

Location: `/components/code-preview.tsx`

A reusable, intelligent code display component with:
- **Live syntax highlighting** with React Syntax Highlighter
- **One-click copy** with visual feedback
- **Attribution tracking** for copied code
- **Editable mode** for code input
- **Language selector** for switching languages
- **20+ supported languages**

#### Props:

```typescript
interface CodePreviewProps {
  code: string;                    // The code content
  language: CodeLanguage;          // Programming language
  showLanguageSelector?: boolean;  // Show/hide language dropdown
  showCopyButton?: boolean;        // Show/hide copy button
  authorUsername?: string;          // For attribution
  authorDisplayName?: string;       // For attribution
  postTitle?: string;              // For attribution
  editable?: boolean;              // Enable editing
  onCodeChange?: (code: string) => void;    // Code change handler
  onLanguageChange?: (lang: CodeLanguage) => void;  // Language change handler
  readonly?: boolean;              // Read-only mode
  placeholder?: string;            // Empty state text
}
```

#### Supported Languages:
- JavaScript, TypeScript
- Python, Ruby, PHP
- Rust, Go, Java
- C++, C#
- SQL, HTML, CSS, JSON
- Bash, YAML, Markdown, Dockerfile

### 2. `CodeEditor` - Enhanced Code Input

Location: `/components/code-editor.tsx`

A sophisticated code editor component for creating posts with:
- **Split view**: Edit vs Preview tabs
- **Live syntax highlighting** in preview mode
- **Multiple language support**
- **Inline integration** with post creation form
- **Clean, intuitive UI**

#### Usage:

```tsx
<CodeEditor
  isOpen={showCodeEditor}
  onToggle={() => setShowCodeEditor(!showCodeEditor)}
  onCodeSubmit={(snippet) => {
    // Handle code submission
  }}
  initialLanguage="javascript"
  initialCode=""
/>
```

### 3. `CodePlayground` - Interactive Playground

Location: `/components/code-playground.tsx`

A full-featured code playground page with:
- **Multi-language code editor**
- **Live preview** of syntax-highlighted code
- **Code execution** for JavaScript/TypeScript in the browser
- **Output console** for displaying results
- **Download code** as files
- **Copy functionality**
- **Reset to default** code examples

#### Features:
- JavaScript/TypeScript code runs in the browser
- Other languages display instructions for external execution
- Export code with proper file extensions
- Responsive design

#### Route: `/code-playground`

### 4. `CopyButton` - Standalone Copy Component

Location: `/components/copy-button.tsx`

A reusable copy button component with:
- **One-click copy** to clipboard
- **Visual feedback** (checkmark animation)
- **Download code** as files
- **Attribution tracking** stored in localStorage
- **Multiple variants** (ghost, outline, default)

#### Features:
- Copies with attribution info (author, post title, language)
- Stores copy history in localStorage (up to 50 entries)
- Proper file extension support for downloads
- Customizable appearance

## Usage Examples

### In Post Cards

```tsx
<PostCard
  post={{
    id: '1',
    title: 'How to use React hooks',
    content: '...',
    codeSnippet: {
      language: 'javascript',
      code: 'const [count, setCount] = useState(0);'
    },
    author: {
      id: '123',
      username: 'devuser',
      displayName: 'Dev User'
    }
    // ... other fields
  }}
/>
```

### In Create Post Form

The `CreatePost` component now uses `CodePreview` for real-time preview:

```tsx
<CodePreview
  code={codeSnippet}
  language={codeLanguage}
  editable={true}
  onCodeChange={setCodeSnippet}
  placeholder="// Type or paste your code here..."
/>
```

### In Comments

Comments with code snippets now include copy functionality:

```tsx
<Comment
  comment={{
    id: '1',
    content: '...',
    codeSnippet: {
      language: 'python',
      code: 'print("Hello, World!")'
    },
    author: { ... }
  }}
/>
```

### Standalone Code Playground

Access at `/code-playground` - full interactive code editor with execution.

## Attribution System

When users copy code:
1. **Attribution info** is captured (author, post, language, timestamp)
2. **Stored in localStorage** as `codeCopyHistory`
3. **Logged to console** for debugging
4. **Displayed** in UI feedback messages

### Attribution Data Structure:

```typescript
{
  author: string;          // Display name
  username: string;         // Username
  postTitle?: string;      // Post title (if available)
  language: string;         // Programming language
  timestamp: string;       // ISO timestamp
}
```

## Integration Points

### Updated Files:

1. **`components/post-card.tsx`**
   - Replaced inline SyntaxHighlighter with `CodePreview`
   - Added copy button with attribution
   - Cleaner, more maintainable code

2. **`components/comment-section.tsx`**
   - Integrated `CodePreview` for comment code snippets
   - Added copy functionality
   - Improved code display

3. **`components/post/create-post.tsx`**
   - Enhanced with live preview
   - Shows syntax highlighting as user types
   - Better UX for code input

4. **`components/navigation.tsx`**
   - Added "Playground" link to navigation
   - Links to `/code-playground` route

5. **New Page: `app/code-playground/page.tsx`**
   - Dedicated playground page
   - Full code editing capabilities

## Features

### ✅ Live Code Preview
- Real-time syntax highlighting as you type
- No page reloads needed
- Supports 20+ languages
- Line numbers for readability

### ✅ Code Copy with Attribution
- One-click copy to clipboard
- Tracks who created the code
- Attributions stored locally
- Visual feedback when copied

### ✅ Copy History
- Stores up to 50 copy actions
- Includes full attribution data
- Accessible via localStorage
- Useful for citation/reference

### ✅ Download Code
- Download code with proper file extensions
- Automatic filetype detection
- Clean filenames
- Preserves formatting

### ✅ Code Playground
- Interactive code editor
- Execute JS/TS in browser
- Multi-language support
- Output console view
- Easy code sharing

### ✅ Responsive Design
- Works on all screen sizes
- Mobile-friendly controls
- Accessible keyboard navigation
- Dark theme optimized

## Future Enhancements

### Planned Features:
1. **More language support** - C, C++, Go, Swift, Kotlin, etc.
2. **Sandboxed execution** - For all languages via backend
3. **Code templates** - Pre-written code snippets
4. **Share playground** - Shareable links to code
5. **Collaboration** - Real-time multiplayer editing
6. **Version history** - Track code changes
7. **Auto-save** - Never lose your work
8. **Integrations** - CodeSandbox, StackBlitz, Repl.it
9. **Testing framework** - Run unit tests inline
10. **AI suggestions** - Code completion suggestions

### External Services to Integrate:
- **CodeSandbox** - Full React/Node environments
- **StackBlitz** - WebContainer-based execution
- **JDoodle** - Multi-language compilation
- **Paiza** - Online code execution
- **Compiler Explorer** - Assembly output viewing

## API Changes

No breaking changes. All components are backward compatible.

New optional props added:
- `showCopyButton` - enables/disables copy
- `authorUsername`, `authorDisplayName`, `postTitle` - for attribution
- `editable` - enables edit mode
- `onCodeChange`, `onLanguageChange` - event handlers

## Performance Considerations

- Syntax highlighting uses virtualized rendering for large files
- Copy operations use efficient clipboard API
- Attributions stored locally (minimal network impact)
- Lazy loading of code fonts and languages

## Accessibility

- Keyboard navigation support
- Screen reader friendly labels
- High contrast mode compatible
- Focus indicators visible
- ARIA labels on controls

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Uses clipboard API (secure contexts only)
- Works in PWA mode

## Troubleshooting

### Copy button not working:
- Ensure HTTPS or localhost (clipboard API requirement)
- Check browser permissions
- Try refreshing the page

### Code execution not working:
- JavaScript/TypeScript only in browser
- Other languages require external execution
- Check console for errors

### Syntax highlighting wrong:
- Verify language is supported
- Check spelling of language name
- Try a different language

## License

This feature is part of Devsquare and follows the same license.

## Credits

Built with:
- React Syntax Highlighter
- Lucide React Icons
- Tailwind CSS
