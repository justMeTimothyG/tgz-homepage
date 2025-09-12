import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function debugSpecificPost() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    });

    try {
        console.log('Connecting to database...');
        
        // Check if there's any post with Alert components
        const alertQuery = `
            SELECT 
                slug, 
                title,
                content
            FROM blog_posts 
            WHERE content LIKE '%<Alert%'
            ORDER BY updated_at DESC;
        `;
        
        const alertResult = await pool.query(alertQuery);
        console.log('\n=== POSTS WITH ALERT COMPONENTS ===');
        console.log('Total posts with Alert:', alertResult.rows.length);
        
        for (const post of alertResult.rows) {
            console.log('\n---');
            console.log('Slug:', post.slug);
            console.log('Title:', post.title);
            
            // Find all Alert components in this post
            const alertMatches = post.content.match(/<Alert[^>]*>/g) || [];
            const incompleteAlertMatches = post.content.match(/<Alert[^>]*$/gm) || [];
            
            console.log('Complete Alert tags found:', alertMatches.length);
            alertMatches.forEach((match, idx) => {
                console.log(`  ${idx + 1}: ${match}`);
            });
            
            console.log('Incomplete Alert tags found:', incompleteAlertMatches.length);
            incompleteAlertMatches.forEach((match, idx) => {
                const position = post.content.indexOf(match);
                const beforeContext = post.content.substring(Math.max(0, position - 50), position);
                const afterContext = post.content.substring(position + match.length, position + match.length + 50);
                console.log(`  ${idx + 1}: "${beforeContext}[${match}]${afterContext}"`);
            });
            
            // Check specifically for the pattern mentioned in the issue
            const specificPattern = /<Alert\s+type="info"\s*$/gm;
            const specificMatches = post.content.match(specificPattern) || [];
            console.log('Specific incomplete pattern matches:', specificMatches.length);
            specificMatches.forEach((match, idx) => {
                const position = post.content.indexOf(match);
                const context = post.content.substring(position - 100, position + match.length + 100);
                console.log(`  ${idx + 1}: Context around line: "${context}"`);
            });
        }

        // Let's also check if there are posts that should have Alert components
        // by looking for posts that contain "Warum sind Definitionen so wichtig?"
        const definitionQuery = `
            SELECT 
                slug, 
                title,
                content
            FROM blog_posts 
            WHERE content LIKE '%Warum sind Definitionen so wichtig%'
            ORDER BY updated_at DESC;
        `;
        
        const definitionResult = await pool.query(definitionQuery);
        console.log('\n=== POSTS WITH "Warum sind Definitionen so wichtig?" ===');
        console.log('Total posts with definition text:', definitionResult.rows.length);
        
        for (const post of definitionResult.rows) {
            console.log('\n---');
            console.log('Slug:', post.slug);
            console.log('Title:', post.title);
            
            const titlePos = post.content.indexOf('Warum sind Definitionen so wichtig?');
            if (titlePos !== -1) {
                const contextBefore = post.content.substring(Math.max(0, titlePos - 200), titlePos);
                const contextAfter = post.content.substring(titlePos, titlePos + 200);
                
                console.log('Context around the title:');
                console.log('BEFORE:', contextBefore);
                console.log('AFTER:', contextAfter);
                
                // Check for Alert component around this area
                const alertNearby = post.content.substring(Math.max(0, titlePos - 100), titlePos + 300);
                const nearbyAlerts = alertNearby.match(/<Alert[^>]*>/g) || [];
                console.log('Alert components near this text:', nearbyAlerts);
            }
        }
        
    } catch (error) {
        console.error('Database error:', error);
    } finally {
        await pool.end();
    }
}

debugSpecificPost();