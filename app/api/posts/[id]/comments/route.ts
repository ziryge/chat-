import { NextRequest, NextResponse } from 'next/server';
import { getPostById, addCommentToPost } from '@/lib/posts';
import { getSession, getUserById } from '@/lib/storage';

interface RouteContext {
  params: { id: string };
}

// POST /api/posts/[id]/comments - Add a comment to a post
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const body = await request.json();
    const { content, codeSnippet, parentId } = body;
    
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
    
    // Validate required fields
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }
    
    // Add comment
    const updatedPost = await addCommentToPost(
      context.params.id,
      user,
      content,
      codeSnippet,
      parentId
    );
    
    if (!updatedPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Update user's comment count
    const updatedUser = { ...user, comments: user.comments + 1 };
    await (await import('@/lib/storage')).saveUser(updatedUser);
    
    return NextResponse.json({
      success: true,
      post: updatedPost,
    }, { status: 201 });
  } catch (error) {
    console.error('Add comment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
