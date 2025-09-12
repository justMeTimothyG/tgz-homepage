import { compile } from '@mdx-js/mdx';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Test the extractComponentsFromMarkdown function with problematic content
async function extractComponentsFromMarkdown(content) {
  try {
    // Validate content before MDX evaluation
    if (!content || typeof content !== 'string') {
      return [];
    }
    
    console.log('🔍 Processing content:', content.substring(0, 200) + '...');
    console.log('📏 Content length:', content.length);
    
    // Use MDX compiler to get proper AST-based component detection
    console.log('⚙️ Starting MDX compilation...');
    const compiledCode = await compile(content, {
      remarkPlugins: [],
      rehypePlugins: [],
      development: false
    });
    
    console.log('✅ MDX compilation successful');
    
    // Extract components from the compiled code by looking for both createElement and _jsx calls
    const codeString = String(compiledCode);
    console.log('📝 Compiled code sample:', codeString.substring(0, 500) + '...');
    
    const createElementMatches = codeString.match(/createElement\(["']?([A-Z][a-zA-Z0-9]*)["']?/g) || [];
    const jsxMatches = codeString.match(/_jsx\(([A-Z][a-zA-Z0-9]*),/g) || [];
    
    console.log('🔍 createElement matches:', createElementMatches);
    console.log('🔍 _jsx matches:', jsxMatches);
    
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
    
    const components = [...new Set(
      allMatches
        .filter(Boolean)
        .filter(name => {
          // Filter out known React built-ins and MDX wrappers
          const builtins = new Set(['Fragment', 'Suspense', 'StrictMode', 'Profiler', 'MDXLayout']);
          return !builtins.has(name);
        })
    )];
    
    console.log('✅ Detected components:', components);
    return components;
  } catch (error) {
    console.error('❌ MDX compilation failed:', error.message);
    console.error('📍 Error details:', error);
    
    // Fallback to regex-based detection if MDX compilation fails
    console.log('🔄 Falling back to regex-based detection...');
    const htmlTags = new Set(['A', 'B', 'I', 'U', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV', 'SPAN', 'IMG', 'BR', 'HR']);
    const componentMatches = content.match(/<([A-Z][a-zA-Z0-9]*)/g) || [];
    
    const fallbackComponents = [...new Set(
      componentMatches
        .map(match => match.slice(1))
        .filter(name => !htmlTags.has(name.toUpperCase()))
    )];
    
    console.log('🔄 Fallback detected components:', fallbackComponents);
    return fallbackComponents;
  }
}

async function investigateIssue() {
  console.log('🕵️ Investigating MDX content truncation issue...\n');

  // Test cases based on the reported issue
  const testCases = [
    {
      name: 'Complete Alert component',
      content: `# Test Post

Some content before the alert.

<Alert type="info" title="Warum sind Definitionen so wichtig?">
  This is the content inside the alert.
</Alert>

Some content after the alert.`
    },
    {
      name: 'Incomplete Alert component (truncated at line 30:23)',
      content: `# Test Post

Some content before the alert.

<Alert type="info" `
    },
    {
      name: 'Incomplete Alert component (missing title end)',
      content: `# Test Post

Some content before the alert.

<Alert type="info" title="Warum sind Definitionen so wichtig`
    },
    {
      name: 'Empty content',
      content: ''
    },
    {
      name: 'Content with newlines at Alert boundary',
      content: `# Test Post

Some content before the alert.

<Alert type="info"
  title="Warum sind Definitionen so wichtig?"
>
  This is the content inside the alert.
</Alert>

Some content after the alert.`
    },
    {
      name: 'Multiple Alert components',
      content: `# Test Post

<Alert type="info" title="First Alert">
  First alert content.
</Alert>

<Alert type="warning" title="Second Alert">
  Second alert content.
</Alert>`
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🧪 Testing: ${testCase.name}`);
    console.log(`${'='.repeat(50)}`);
    
    try {
      const components = await extractComponentsFromMarkdown(testCase.content);
      console.log(`✅ Result: ${components.length > 0 ? components.join(', ') : 'No components detected'}`);
    } catch (error) {
      console.error(`❌ Test failed:`, error.message);
    }
  }

  // Test the specific issue scenario
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🎯 Testing specific issue scenario`);
  console.log(`${'='.repeat(50)}`);
  
  // Simulate what happens during the API save process
  const problematicContent = `# Some Post

Line 1
Line 2
Line 3
Line 4
Line 5
Line 6
Line 7
Line 8
Line 9
Line 10
Line 11
Line 12
Line 13
Line 14
Line 15
Line 16
Line 17
Line 18
Line 19
Line 20
Line 21
Line 22
Line 23
Line 24
Line 25
Line 26
Line 27
Line 28
Line 29
<Alert type="info" `;

  console.log('📍 Simulating truncated content at line 30, character 23...');
  try {
    const components = await extractComponentsFromMarkdown(problematicContent);
    console.log(`✅ Components found in problematic content:`, components);
  } catch (error) {
    console.error(`❌ Error processing problematic content:`, error.message);
  }
}

investigateIssue();