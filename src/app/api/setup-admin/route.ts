import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Only allow this endpoint in development or with a special setup token
    const setupToken = req.headers.get('x-setup-token');
    const expectedToken = process.env.ADMIN_SETUP_TOKEN || '***REMOVED***';
    
    if (setupToken !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log("Creating admin user...");
    
    // Use the Better Auth API to create the user
    const result = await auth.api.signUpEmail({
      body: {
        email: "admin@tgz.lol",
        password: "***REMOVED***",
        name: "Admin"
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Admin user created successfully',
      user: result 
    });
  } catch (error: unknown) {
    console.error("Error creating admin user:", error);
    
    // If user already exists, that's ok
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('User already exists')) {
      return NextResponse.json({ 
        success: true, 
        message: 'Admin user already exists' 
      });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create admin user', 
      details: errorMessage 
    }, { status: 500 });
  }
}