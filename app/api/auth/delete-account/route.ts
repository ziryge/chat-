import { NextRequest, NextResponse } from 'next/server';
import { getSession, getUserById, deleteUser } from '@/lib/storage';

// DELETE /api/auth/delete-account - Delete user account
export async function DELETE(request: NextRequest) {
  try {
    // Get current user from session
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getUserById(session.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete all posts by this user
    const { getAllPosts, savePost } = await import('@/lib/storage');
    const posts = await getAllPosts();
    const userPosts = posts.filter(p => p.author.id === user.id);
    
    // Delete user posts
    for (const post of userPosts) {
      await (await import('@/lib/posts'))?.deletePost?.(post.id);
    }

    // Delete user account
    await deleteUser(user.id);

    const response = NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });

    response.cookies.set('session_id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
