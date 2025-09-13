# Component Development Workflow

This guide explains how to develop, manage, and deploy components in your MDX blog system.

## 🏗️ Component Architecture

### Component Types

1. **`builtin`** - Your core components (recommended for most use cases)
   - **Location**: `src/components/registry/*.tsx`
   - **Configuration**: `src/components/registry/components.config.json`
   - **Use Case**: Components you develop and maintain as part of your codebase
   - **Examples**: Alert, CodeComparison, InteractiveDemo

2. **`custom`** - User-uploaded components via admin panel
   - **Location**: Database only
   - **Use Case**: Quick prototypes, one-off components, user-generated content
   - **Security**: Requires sandboxing for untrusted code

3. **`npm`** - External npm packages
   - **Location**: npm registry + database metadata
   - **Use Case**: Third-party React components
   - **Examples**: `@mui/material/Button`, `recharts`

4. **`remote`** - Components fetched from external URLs
   - **Location**: Remote server + database metadata
   - **Use Case**: Shared component libraries across multiple sites
   - **Examples**: Company-wide design system components

## 🔄 Development Workflow

### 1. Creating a New Component

#### Step 1: Create Component File
```bash
# Create new component in registry
touch src/components/registry/MyNewComponent.tsx
```

#### Step 2: Implement Component
```tsx
// src/components/registry/MyNewComponent.tsx
"use client";

import React, { useState } from 'react';

interface MyNewComponentProps {
  title?: string;
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

export default function MyNewComponent({
  title = 'Default Title',
  variant = 'primary',
  children,
  onClick
}: MyNewComponentProps) {
  return (
    <div className={`component-wrapper ${variant}`}>
      {title && <h3>{title}</h3>}
      <div onClick={onClick}>
        {children}
      </div>
    </div>
  );
}
```

#### Step 3: Update Configuration
Add your component to `src/components/registry/components.config.json`:

```json
{
  "components": {
    "MyNewComponent": {
      "name": "MyNewComponent",
      "displayName": "My New Component",
      "description": "A versatile component for demonstrating new features",
      "category": "Custom",
      "version": "1.0.0",
      "isInteractive": true,
      "requiresSandbox": false,
      "dependencies": {},
      "props": {
        "title": {
          "type": "string",
          "default": "Default Title",
          "description": "The component title"
        },
        "variant": {
          "type": "string",
          "enum": ["primary", "secondary"],
          "default": "primary",
          "description": "Visual variant of the component"
        },
        "children": {
          "type": "ReactNode",
          "required": true,
          "description": "Content to render inside the component"
        },
        "onClick": {
          "type": "function",
          "optional": true,
          "description": "Click handler function"
        }
      },
      "config": {
        "examples": [
          {
            "title": "Basic Usage",
            "description": "Simple example with default props",
            "code": "<MyNewComponent>\\n  Hello World!\\n</MyNewComponent>"
          },
          {
            "title": "Custom Title and Variant",
            "description": "Example with custom props",
            "code": "<MyNewComponent title=\\"Custom Title\\" variant=\\"secondary\\">\\n  Custom content here\\n</MyNewComponent>"
          }
        ]
      }
    }
  }
}
```

#### Step 4: Sync to Database
```bash
npm run components:push
```

### 2. Updating Existing Components

#### Modify Component Code
Edit the `.tsx` file in `src/components/registry/`

#### Update Configuration
Modify the component's entry in `components.config.json`

#### Sync Changes
```bash
npm run components:push
```

### 3. Version Management

#### Bump Version and Sync
```bash
npm run components:version patch  # 1.0.0 → 1.0.1
npm run components:version minor  # 1.0.0 → 1.1.0  
npm run components:version major  # 1.0.0 → 2.0.0
```

## 📋 Component Sync Commands

### Available Commands

```bash
# Check sync status
npm run components:status

# Push local components to database
npm run components:push

# Bump versions and sync
npm run components:version [patch|minor|major]

# Initialize component manifest
npm run components:init

# General sync command
npm run sync:components [command]
```

### Status Output Example
```
📊 Component Status:
   Local: 4 components
   Database: 3 components  
   Changes: 1 components need sync

📋 Changes needed:
   🆕 MyNewComponent (new)
   📝 Alert (modified)

💡 Run "npm run components:push" to apply changes
```

## 📖 Component Configuration Schema

### Props Definition

```json
{
  "propName": {
    "type": "string | number | boolean | function | ReactNode | array | object",
    "required": true,           // or omit for optional
    "optional": true,           // explicit optional flag
    "default": "defaultValue",  // default value
    "description": "Prop description for documentation",
    "enum": ["option1", "option2"]  // for string enums
  }
}
```

### Example Configuration

```json
{
  "config": {
    "examples": [
      {
        "title": "Example Title",
        "description": "Optional description",
        "code": "<Component prop=\"value\">Content</Component>"
      }
    ]
  }
}
```

## 🎯 Best Practices

### Component Development

1. **TypeScript**: Always use proper TypeScript interfaces
2. **Props**: Document all props with descriptions and examples
3. **Defaults**: Provide sensible default values
4. **Accessibility**: Follow ARIA guidelines
5. **Styling**: Use Tailwind classes consistently
6. **Error Handling**: Handle edge cases gracefully

### Configuration Management

1. **Version Control**: Include `components.config.json` in git
2. **Examples**: Provide multiple usage examples
3. **Documentation**: Write clear prop descriptions
4. **Categories**: Group related components

### Development Workflow

1. **Test Locally**: Always test components before pushing
2. **Version Bumps**: Use semantic versioning
3. **Sync Regularly**: Keep database in sync with local changes
4. **Review Changes**: Check status before pushing

## 🔍 Troubleshooting

### Component Not Appearing in Admin Panel

```bash
# Check sync status
npm run components:status

# If out of sync, push changes
npm run components:push
```

### Props Documentation Missing

Ensure your component is properly configured in `components.config.json` and run:

```bash
npm run components:push
```

### Component Not Rendering in MDX

1. Check component is published (`isPublished: true` in database)
2. Verify component syntax in MDX content
3. Check browser console for errors
4. Verify component is loaded in ComponentRegistry

### Database Connection Issues

```bash
# Check database is running
npm run db:status

# Start database if needed
npm run db:up
```

## 🚀 Advanced Usage

### Custom Component Loading

For `npm` and `remote` components, the system attempts to load them dynamically:

- **NPM**: `import('package-name')`
- **Remote**: `fetch(remoteUrl)`

### Sandbox Requirements

Components requiring sandboxing (`requiresSandbox: true`) run in isolated environments for security.

### Component Registry Extension

The `componentRegistry` service can be extended to support additional loading strategies:

```typescript
// src/services/componentRegistry.tsx
const customLoader = async (definition: ComponentDefinition) => {
  // Custom loading logic
  return YourComponent;
};
```

This workflow gives you complete control over your component development lifecycle while maintaining a clean separation between code and configuration.