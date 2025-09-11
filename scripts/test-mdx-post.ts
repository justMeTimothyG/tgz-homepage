import { drizzle } from 'drizzle-orm/postgres-js';
import { blogPosts } from '../src/db/schema';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';

// Direct database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5433/tgz_lol';
const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

async function createTestPost() {
  try {
    console.log('🧪 Creating test MDX post...');

    const testContent = `# Test MDX Components

This is a test post to verify that MDX components are working properly.

## Interactive Demo

Here's an interactive component:

<InteractiveDemo 
  title="MDX Test Demo" 
  description="This slider should work if MDX components are rendering correctly"
  initialValue={50} 
  min={0} 
  max={100} 
/>

## Alert Component

<Alert type="success" title="Success!">
If you can see this styled alert, then the Alert component is working correctly!
</Alert>

<Alert type="warning" title="Warning">
This is a warning alert to test different types.
</Alert>

## Code Comparison

<CodeComparison 
  title="Before vs After"
  beforeTitle="Old Code"
  afterTitle="New Code"
  beforeCode="const old = 'legacy';"
  afterCode="const modern = 'updated';"
  showDiff={true}
/>

## Regular Markdown

This is regular markdown content that should also render normally:

- List item 1
- List item 2
- List item 3

**Bold text** and *italic text* should work fine.

### Math Support

Here's some math: $x^2 + y^2 = z^2$

And a block equation:

$$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$

## Conclusion

If all the components above are rendering correctly, then the MDX system is working!`;

    // Check if test post already exists
    const [existingPost] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, 'mdx-component-test'));

    if (existingPost) {
      console.log('📝 Updating existing test post...');
      await db
        .update(blogPosts)
        .set({
          content: testContent,
          components: ['InteractiveDemo', 'Alert', 'CodeComparison'],
          status: 'published',
          publishedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(blogPosts.id, existingPost.id));
      
      console.log(`✅ Updated test post: http://localhost:3000/blog/mdx-component-test`);
    } else {
      console.log('📝 Creating new test post...');
      await db.insert(blogPosts).values({
        slug: 'mdx-component-test',
        title: 'MDX Component Test',
        content: testContent,
        excerpt: 'A test post to verify MDX component rendering',
        status: 'published',
        publishedAt: new Date(),
        components: ['InteractiveDemo', 'Alert', 'CodeComparison'],
        tags: [],
        views: 0
      });
      
      console.log(`✅ Created test post: http://localhost:3000/blog/mdx-component-test`);
    }

    console.log('🎉 Test post ready! Visit the URL above to test component rendering.');
    
  } catch (error) {
    console.error('❌ Error creating test post:', error);
    process.exit(1);
  } finally {
    await client.end();
    process.exit(0);
  }
}

createTestPost();