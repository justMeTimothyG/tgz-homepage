import { getDb, schema } from '../src/db/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const db = getDb();

async function seedComponents() {
  try {
    console.log('🌱 Seeding components...');

    // Read the component source code files
    const alertCode = readFileSync(join(process.cwd(), 'src/components/registry/Alert.tsx'), 'utf8');
    const codeComparisonCode = readFileSync(join(process.cwd(), 'src/components/registry/CodeComparison.tsx'), 'utf8');
    const interactiveDemoCode = readFileSync(join(process.cwd(), 'src/components/registry/InteractiveDemo.tsx'), 'utf8');

    // Component data
    const components = [
      {
        name: 'Alert',
        displayName: 'Alert Component',
        description: 'A versatile alert component with multiple styles (info, warning, success, error, tip, note). Perfect for displaying important messages and notifications.',
        category: 'Feedback',
        sourceType: 'builtin' as const,
        sourceCode: alertCode,
        version: '1.0.0',
        status: 'published' as const,
        isPublished: true,
        isInteractive: false,
        requiresSandbox: false,
        props: {
          type: { type: 'string', enum: ['info', 'warning', 'success', 'error', 'tip', 'note'], default: 'info' },
          title: { type: 'string', optional: true },
          children: { type: 'ReactNode', required: true },
          icon: { type: 'boolean', default: true }
        },
        config: {
          examples: [
            {
              title: 'Info Alert',
              code: '<Alert type="info" title="Information">This is an informational message.</Alert>'
            },
            {
              title: 'Warning Alert',
              code: '<Alert type="warning" title="Warning">Please be careful with this action.</Alert>'
            },
            {
              title: 'Success Alert',
              code: '<Alert type="success" title="Success">Your operation completed successfully!</Alert>'
            }
          ]
        },
        dependencies: {
          'lucide-react': '^0.263.1'
        }
      },
      {
        name: 'CodeComparison',
        displayName: 'Code Comparison',
        description: 'A sophisticated before/after code comparison component with tabbed interface, syntax highlighting, and copy functionality. Great for tutorials and documentation.',
        category: 'Content',
        sourceType: 'builtin' as const,
        sourceCode: codeComparisonCode,
        version: '1.0.0',
        status: 'published' as const,
        isPublished: true,
        isInteractive: true,
        requiresSandbox: false,
        props: {
          title: { type: 'string', default: 'Code Comparison' },
          beforeTitle: { type: 'string', default: 'Before' },
          afterTitle: { type: 'string', default: 'After' },
          beforeCode: { type: 'string', required: true },
          afterCode: { type: 'string', required: true },
          language: { type: 'string', default: 'javascript' },
          showDiff: { type: 'boolean', default: false }
        },
        config: {
          examples: [
            {
              title: 'JavaScript Comparison',
              code: `<CodeComparison 
  title="Refactoring Example"
  beforeCode="function oldFunction() { return 'old'; }"
  afterCode="const newFunction = () => 'new';"
  language="javascript"
/>`
            }
          ]
        },
        dependencies: {
          'lucide-react': '^0.263.1'
        }
      },
      {
        name: 'InteractiveDemo',
        displayName: 'Interactive Demo',
        description: 'An interactive demonstration component with sliders, progress visualization, and history tracking. Perfect for educational content and interactive tutorials.',
        category: 'Interactive',
        sourceType: 'builtin' as const,
        sourceCode: interactiveDemoCode,
        version: '1.0.0',
        status: 'published' as const,
        isPublished: true,
        isInteractive: true,
        requiresSandbox: false,
        props: {
          title: { type: 'string', default: 'Interactive Demo' },
          description: { type: 'string', default: 'This is a sample interactive component for educational content.' },
          initialValue: { type: 'number', default: 50 },
          min: { type: 'number', default: 0 },
          max: { type: 'number', default: 100 }
        },
        config: {
          examples: [
            {
              title: 'Temperature Slider',
              code: `<InteractiveDemo 
  title="Temperature Control"
  description="Adjust the temperature and see the effect"
  initialValue={20}
  min={-10}
  max={40}
/>`
            }
          ]
        },
        dependencies: {}
      }
    ];

    // Insert components
    for (const component of components) {
      const [existing] = await db
        .select()
        .from(schema.componentCatalog)
        .where({ name: component.name } as any);

      if (existing) {
        console.log(`⏩ Component '${component.name}' already exists, skipping...`);
        continue;
      }

      await db.insert(schema.componentCatalog).values(component);
      console.log(`✅ Created component: ${component.displayName}`);
    }

    console.log('🎉 Component seeding completed successfully!');
    
    // Show summary
    const totalComponents = await db.select().from(schema.componentCatalog);
    console.log(`📊 Total components in database: ${totalComponents.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding components:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the seeding
seedComponents();