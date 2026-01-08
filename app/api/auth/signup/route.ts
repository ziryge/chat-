import { NextRequest, NextResponse } from 'next/server';
import { signUpUser } from '@/lib/auth';
import { createSession } from '@/lib/storage';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, displayName } = body;
    
    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }
    
    // Sign up user
    const result = await signUpUser(username, password, displayName);
    
    if (!result.success || !result.user) {
      return NextResponse.json(
        { error: result.error || 'Sign up failed' },
        { status: 400 }
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
    console.error('Sign up error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
