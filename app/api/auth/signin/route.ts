import { NextRequest, NextResponse } from 'next/server';
import { signInUser } from '@/lib/auth';
import { createSession } from '@/lib/storage';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }
    
    // Sign in user
    const result = await signInUser(username, password);
    
    if (!result.success || !result.user) {
      return NextResponse.json(
        { error: result.error || 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Create session
    const sessionId = await createSession(result.user.id);
    
    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'session_id',
      value: sessionId,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });
    
    // Return user data (excluding sensitive info)
    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        username: result.user.username,
        displayName: result.user.displayName,
        avatar: result.user.avatar,
        bio: result.user.bio,
        reputation: result.user.reputation,
        badges: result.user.badges,
        techStack: result.user.techStack,
        joinedAt: result.user.joinedAt,
        posts: result.user.posts,
        comments: result.user.comments,
      },
    });
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
