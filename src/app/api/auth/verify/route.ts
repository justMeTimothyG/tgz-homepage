import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('x-admin-token') || req.nextUrl.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    const adminToken = process.env.ADMIN_TOKEN;
    
    if (!adminToken) {
      return NextResponse.json({ error: 'Admin authentication not configured' }, { status: 500 });
    }

    if (token !== adminToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json({ success: true, valid: true });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}