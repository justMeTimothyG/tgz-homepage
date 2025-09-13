# VS Code Extensions for MDX and KaTeX Development

This document provides recommendations for VS Code extensions that enhance the development experience when working with MDX files and KaTeX math expressions.

## Essential Extensions

### 1. MDX Language Support

**Extension ID**: `unifiedjs.vscode-mdx`
**Publisher**: Unified
**Features**:
- Syntax highlighting for MDX files
- IntelliSense for MDX components
- Error detection in MDX syntax
- Auto-completion for JSX components in markdown

**Installation**:
```bash
code --install-extension unifiedjs.vscode-mdx
```

### 2. MDX Preview

**Extension ID**: `xyc.vscode-mdx-preview`
**Publisher**: Yu Zhang
**Features**:
- Live preview of MDX files
- Synchronized scrolling between editor and preview
- Custom component rendering in preview
- Side-by-side or tab preview modes

**Installation**:
```bash
code --install-extension xyc.vscode-mdx-preview
```

### 3. KaTeX Math Renderer

**Extension ID**: `james-yu.latex-workshop`
**Publisher**: James Yu
**Features**:
- Live preview of LaTeX/KaTeX math expressions
- Syntax highlighting for math expressions
- Math snippet support
- PDF compilation (bonus for LaTeX)

**Installation**:
```bash
code --install-extension james-yu.latex-workshop
```

### 4. Math Preview (Alternative KaTeX Support)

**Extension ID**: `hnw.vscode-auto-open-markdown-preview`
**Publisher**: Hiroshi Nakamura
**Features**:
- Automatic markdown preview with math support
- KaTeX rendering in preview pane
- Real-time math expression updates

**Installation**:
```bash
code --install-extension hnw.vscode-auto-open-markdown-preview
```

## Configuration

### MDX File Association

Add to your VS Code `settings.json`:

```json
{
  "files.associations": {
    "*.mdx": "mdx"
  },
  "emmet.includeLanguages": {
    "mdx": "javascriptreact"
  }
}
```

### KaTeX Preview Settings

For LaTeX Workshop extension:

```json
{
  "latex-workshop.view.pdf.viewer": "tab",
  "latex-workshop.latex.autoBuild.run": "never",
  "markdown.math.enabled": true
}
```

### MDX IntelliSense

Enable React/JSX IntelliSense in MDX files:

```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "mdx.experimentalLanguageServer": true
}
```

## Workspace Setup

### Recommended Folder Structure
```
project/
├── .vscode/
│   ├── settings.json
│   └── extensions.json
├── content/
│   └── blog/
│       ├── post1.mdx
│       └── post2.mdx
└── src/
    └── components/
        └── mdx/
```

### Workspace Extensions File

Create `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "unifiedjs.vscode-mdx",
    "xyc.vscode-mdx-preview",
    "james-yu.latex-workshop",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode"
  ]
}
```

## Usage Tips

### 1. MDX Component Snippets

Create custom snippets in `.vscode/mdx.code-snippets`:

```json
{
  "Exercise Component": {
    "scope": "mdx",
    "prefix": "exercise",
    "body": [
      "<Exercise title=\"$1\" difficulty=\"$2\">",
      "  <Task>$3</Task>",
      "  <Hint>$4</Hint>",
      "  <Step>$5</Step>",
      "  <Solution>$6</Solution>",
      "</Exercise>"
    ],
    "description": "Insert Exercise component with all sub-components"
  },
  "KaTeX Math Block": {
    "scope": "mdx,markdown",
    "prefix": "math",
    "body": [
      "$$",
      "$1",
      "$$"
    ],
    "description": "Insert KaTeX math block"
  },
  "KaTeX Inline Math": {
    "scope": "mdx,markdown",
    "prefix": "imath",
    "body": ["$$$1$$"],
    "description": "Insert inline KaTeX math"
  }
}
```

### 2. Live Preview Setup

1. Open an MDX file
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "MDX: Open Preview" or "Markdown: Open Preview to the Side"
4. Edit your MDX file and see live updates

### 3. Math Expression Testing

Use the LaTeX Workshop extension to test KaTeX expressions:
- Type math expressions in MDX
- Use `Ctrl+Alt+M` to preview math
- Hover over math expressions for quick preview

## Troubleshooting

### MDX Syntax Highlighting Not Working

1. Ensure the `unifiedjs.vscode-mdx` extension is installed
2. Check file association in settings
3. Reload VS Code window (`Ctrl+Shift+P` → "Developer: Reload Window")

### KaTeX Math Not Rendering in Preview

1. Verify `markdown.math.enabled` is set to `true`
2. Install the LaTeX Workshop extension
3. Check that your math expressions use proper KaTeX syntax

### Component IntelliSense Missing

1. Ensure TypeScript is properly configured
2. Check that your MDX components are properly exported
3. Add proper type definitions for custom components

## Additional Resources

- [MDX Documentation](https://mdxjs.com/)
- [KaTeX Documentation](https://katex.org/)
- [VS Code MDX Extension](https://marketplace.visualstudio.com/items?itemName=unifiedjs.vscode-mdx)
- [LaTeX Workshop](https://marketplace.visualstudio.com/items?itemName=James-Yu.latex-workshop)

## Quick Setup Commands

```bash
# Install all recommended extensions
code --install-extension unifiedjs.vscode-mdx
code --install-extension xyc.vscode-mdx-preview
code --install-extension james-yu.latex-workshop
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode

# Open current project with all extensions
code .
```