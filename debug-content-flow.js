import { getDb, schema } from './src/db/client.ts';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function debugContentFlow() {
  console.log('🔍 Debugging content truncation in data flow pipeline...\n');
  
  try {
    const db = getDb();
    
    // Get the most recent blog post to see what's in the database
    const posts = await db
      .select({
        id: schema.blogPosts.id,
        slug: schema.blogPosts.slug,
        title: schema.blogPosts.title,
        content: schema.blogPosts.content,
        status: schema.blogPosts.status
      })
      .from(schema.blogPosts)
      .orderBy(schema.blogPosts.updatedAt)
      .limit(5);
    
    console.log(`📊 Found ${posts.length} blog posts in database:\n`);
    
    posts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title} (${post.slug})`);
      console.log(`   Status: ${post.status}`);
      console.log(`   Content length: ${post.content.length} characters`);
      console.log(`   Content starts: ${post.content.substring(0, 100)}...`);
      console.log(`   Content ends: ...${post.content.substring(post.content.length - 100)}`);
      
      // Check for Alert component
      if (post.content.includes('<Alert')) {
        const alertMatch = post.content.match(/<Alert[^>]*>/);
        if (alertMatch) {
          console.log(`   🎯 Alert component found: ${alertMatch[0]}`);
          console.log(`   🔍 Alert position: ${post.content.indexOf('<Alert')}-${post.content.indexOf('>', post.content.indexOf('<Alert')) + 1}`);
        }
        
        const alertEndMatch = post.content.match(/<\/Alert>/);
        if (alertEndMatch) {
          console.log(`   ✅ Alert closing tag found at position: ${post.content.indexOf('</Alert>')}`);
        } else {
          console.log(`   ❌ No Alert closing tag found!`);
        }
      }
      console.log('');
    });
    
    // Simulate what happens during blog post page rendering
    if (posts.length > 0) {
      const testPost = posts[0];
      console.log(`🧪 Testing blog post page rendering for: ${testPost.title}`);
      
      // This mimics what happens in /blog/[slug]/page.tsx line 34-37
      const [postFromDb] = await db
        .select()
        .from(schema.blogPosts)
        .where(eq(schema.blogPosts.slug, testPost.slug));
      
      if (postFromDb) {
        console.log(`📥 Retrieved from DB - Content length: ${postFromDb.content.length}`);
        console.log(`📥 Content starts: ${postFromDb.content.substring(0, 100)}...`);
        console.log(`📥 Content ends: ...${postFromDb.content.substring(postFromDb.content.length - 100)}`);
        
        // Check if the content is intact at this point
        if (postFromDb.content.includes('<Alert') && !postFromDb.content.includes('</Alert>')) {
          console.log(`❌ PROBLEM: Content is already truncated when retrieved from database!`);
        } else if (postFromDb.content.includes('<Alert') && postFromDb.content.includes('</Alert>')) {
          console.log(`✅ Content appears complete when retrieved from database`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error debugging content flow:', error);
  }
}

debugContentFlow();