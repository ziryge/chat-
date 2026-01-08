import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession, getUserById } from '@/lib/storage';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    if (!sessionId) {
      return NextResponse.json({
        success: false,
        user: null,
      });
    }
    
    // Get session
    const session = await getSession(sessionId);
    
    if (!session) {
      // Clear invalid cookie
      cookieStore.delete({
        name: 'session_id',
        path: '/',
      });
      
      return NextResponse.json({
        success: false,
        user: null,
      });
    }
    
    // Get user data
    const user = await getUserById(session.userId);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        user: null,
      });
    }
    
    // Return user data (excluding sensitive info)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio,
        reputation: user.reputation,
        badges: user.badges,
        techStack: user.techStack,
        joinedAt: user.joinedAt,
        posts: user.posts,
        comments: user.comments,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
