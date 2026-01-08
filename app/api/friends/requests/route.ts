import { NextRequest, NextResponse } from 'next/server';
import { getSession, getUserById, getAllUsers } from '@/lib/storage';
import { getFriends } from '@/lib/messaging';

// GET /api/friends/requests - Get pending friend requests
export async function GET(request: NextRequest) {
  try {
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

    const friendships = await getFriends(user.id);
    const allUsers = await getAllUsers();
    
    // Get pending friend requests
    const pendingRequests = friendships
      .filter(f => f.status === 'pending' && f.friendId === user.id)
      .map(f => {
        const fromUser = allUsers.find(u => u.id === f.userId);
        return {
          id: f.id,
          from: fromUser,
          status: f.status,
          createdAt: f.createdAt,
        };
      })
      .filter(r => r.from);

    return NextResponse.json({
      success: true,
      requests: pendingRequests,
    });
  } catch (error) {
    console.error('Get friend requests error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
