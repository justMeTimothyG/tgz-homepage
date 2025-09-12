import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function debugDbContent() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    });

    try {
        console.log('Connecting to database...');
        
        // List all blog posts
        const postsQuery = `
            SELECT 
                slug, 
                title, 
                LENGTH(content) as content_length,
                SUBSTRING(content, 1, 100) as content_start,
                SUBSTRING(content, LENGTH(content) - 100, 100) as content_end,
                status,
                created_at,
                updated_at
            FROM blog_posts 
            ORDER BY updated_at DESC;
        `;
        
        const postsResult = await pool.query(postsQuery);
        console.log('\n=== BLOG POSTS ===');
        console.log('Total posts:', postsResult.rows.length);
        
        for (const post of postsResult.rows) {
            console.log('\n---');
            console.log('Slug:', post.slug);
            console.log('Title:', post.title);
            console.log('Status:', post.status);
            console.log('Content Length:', post.content_length);
            console.log('Content Start:', post.content_start.replace(/\n/g, '\\n').substring(0, 100));
            console.log('Content End:', post.content_end.replace(/\n/g, '\\n').substring(0, 100));
            console.log('Created:', post.created_at);
            console.log('Updated:', post.updated_at);
            
            // Check for specific Alert component issues
            if (post.content_start.includes('<Alert') || post.content_end.includes('<Alert')) {
                console.log('🚨 ALERT COMPONENT DETECTED - Checking for truncation...');
                
                // Get the full content for this specific post
                const fullContentQuery = `SELECT content FROM blog_posts WHERE slug = $1`;
                const fullResult = await pool.query(fullContentQuery, [post.slug]);
                const fullContent = fullResult.rows[0].content;
                
                // Look for Alert components
                const alertMatches = fullContent.match(/<Alert[^>]*>/g);
                if (alertMatches) {
                    console.log('Alert components found:');
                    alertMatches.forEach((match, idx) => {
                        console.log(`  ${idx + 1}: ${match}`);
                    });
                }
                
                // Check for incomplete Alert tags
                const incompleteAlerts = fullContent.match(/<Alert[^>]*$/gm);
                if (incompleteAlerts) {
                    console.log('⚠️ INCOMPLETE ALERT TAGS FOUND:');
                    incompleteAlerts.forEach((match, idx) => {
                        const position = fullContent.indexOf(match);
                        const context = fullContent.substring(position - 50, position + match.length + 50);
                        console.log(`  ${idx + 1}: Position ${position}: ${context}`);
                    });
                }
            }
        }

        // Check database column constraints
        const schemaQuery = `
            SELECT 
                column_name, 
                data_type, 
                character_maximum_length, 
                is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'blog_posts' 
            AND column_name = 'content';
        `;
        
        const schemaResult = await pool.query(schemaQuery);
        console.log('\n=== DATABASE SCHEMA ===');
        console.log('Content column info:', schemaResult.rows[0]);
        
    } catch (error) {
        console.error('Database error:', error);
    } finally {
        await pool.end();
    }
}

debugDbContent();