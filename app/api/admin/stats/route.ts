import { NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/storage';

// Helper function to verify admin access
async function verifyAdmin(request: Request): Promise<boolean> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    if (!sessionId) return false;

    const session = await require('@/lib/storage').then(m => m.getSession(sessionId));
    if (!session) return false;

    const user = await require('@/lib/storage').then(m => m.getUserById(session.userId));
    if (!user) return false;

    return user.isAdmin === true;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    // Verify admin access
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { getSession, getUserById } = await import('@/lib/storage');
    const session = await getSession(sessionId);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserById(session.userId);
    
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get statistics
    const users = await getAllUsers();
    const posts = await (await import('@/lib/posts')).getAllPostsWithVotes();

    let totalComments = 0;
    posts.forEach(post => {
      totalComments += post.comments.length;
    });

    const stats = {
      totalUsers: users.length,
      totalPosts: posts.length,
      totalComments,
      onlineUsers: Math.floor(Math.random() * Math.max(1, Math.floor(users.length / 3))), // Simulated
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
