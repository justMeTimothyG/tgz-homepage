import { compile } from '@mdx-js/mdx';

/**
 * Extract component names from MDX content using AST-based parsing
 * This is a server-side utility function for use in API routes
 */
export async function extractComponentsFromMarkdown(content: string): Promise<string[]> {
  try {
    // Validate content before MDX evaluation
    if (!content || typeof content !== 'string') {
      return [];
    }
    
    // Basic content validation
    if (content.length > 50000) {
      // Large content detected, but proceeding without warning in production
    }
    
    // Use MDX compiler to get proper AST-based component detection
    const compiledCode = await compile(content, {
      remarkPlugins: [],
      rehypePlugins: [],
      development: false
    });
    
    // Extract components from the compiled code by looking for both createElement and _jsx calls
    const codeString = String(compiledCode);
    const createElementMatches = codeString.match(/createElement\(["']?([A-Z][a-zA-Z0-9]*)["']?/g) || [];
    const jsxMatches = codeString.match(/_jsx\(([A-Z][a-zA-Z0-9]*),/g) || [];
    
    const allMatches = [
      // Extract from createElement calls
      ...createElementMatches.map(match => {
        const nameMatch = match.match(/createElement\(["']?([A-Z][a-zA-Z0-9]*)["']?/);
        return nameMatch ? nameMatch[1] : null;
      }),
      // Extract from _jsx calls (modern JSX runtime)
      ...jsxMatches.map(match => {
        const nameMatch = match.match(/_jsx\(([A-Z][a-zA-Z0-9]*),/);
        return nameMatch ? nameMatch[1] : null;
      })
    ];
    
    let components = [...new Set(
      allMatches
        .filter(Boolean)
        .filter(name => {
          // Filter out known React built-ins and MDX wrappers
          const builtins = new Set(['Fragment', 'Suspense', 'StrictMode', 'Profiler', 'MDXLayout']);
          return !builtins.has(name!);
        })
    )] as string[];
    
    // Auto-include parent components when sub-components are detected
    const subComponentMap: Record<string, string> = {
      'Task': 'Exercise',
      'Hint': 'Exercise',
      'Step': 'Exercise', 
      'Solution': 'Exercise'
    };
    
    const parentsToAdd = new Set<string>();
    components.forEach(component => {
      const parent = subComponentMap[component];
      if (parent && !components.includes(parent)) {
        parentsToAdd.add(parent);
      }
    });
    
    components = [...components, ...Array.from(parentsToAdd)];
    
    return components;
  } catch (error) {
    // Fallback to regex-based detection if MDX compilation fails
    const htmlTags = new Set(['A', 'B', 'I', 'U', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV', 'SPAN', 'IMG', 'BR', 'HR']);
    const componentMatches = content.match(/<([A-Z][a-zA-Z0-9]*)/g) || [];
    
    return [...new Set(
      componentMatches
        .map(match => match.slice(1))
        .filter(name => !htmlTags.has(name.toUpperCase()))
    )];
  }
}

/**
 * Validate component usage in MDX content
 */
export async function validateComponentUsage(content: string, availableComponents: { name: string }[]): Promise<{
  valid: boolean;
  missingComponents: string[];
  usedComponents: string[];
}> {
  const usedComponents = await extractComponentsFromMarkdown(content);
  const availableNames = availableComponents.map(c => c.name);
  const missingComponents = usedComponents.filter(name => !availableNames.includes(name));
  
  return {
    valid: missingComponents.length === 0,
    missingComponents,
    usedComponents
  };
}