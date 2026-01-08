import { NextRequest, NextResponse } from 'next/server';
import { getSession, getUserById, getAllUsers } from '@/lib/storage';
import { 
  getFriends, 
  createFriendship, 
  acceptFriendship, 
  rejectFriendship, 
  blockFriend,
  unblockFriend,
  getFriendship
} from '@/lib/messaging';

// GET /api/friends - Get current user's friends
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
    
    // Get friend user objects
    const friendUsers = friendships.map(f => {
      const friendId = f.userId === user.id ? f.friendId : f.userId;
      const friend = allUsers.find(u => u.id === friendId);
      return {
        id: f.id,
        friend,
        status: f.status,
        createdAt: f.createdAt,
      };
    }).filter(f => f.friend);

    return NextResponse.json({
      success: true,
      friends: friendUsers,
    });
  } catch (error) {
    console.error('Get friends error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/friends - Send friend request
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { friendUsername } = body;

    if (!friendUsername) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Find friend user
    const allUsers = await getAllUsers();
    const friend = allUsers.find(u => u.username.toLowerCase() === friendUsername.toLowerCase());

    if (!friend) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (friend.id === user.id) {
      return NextResponse.json(
        { error: 'Cannot add yourself as a friend' },
        { status: 400 }
      );
    }

    // Check if friendship already exists
    const existingFriendship = await getFriendship(user.id, friend.id);
    if (existingFriendship) {
      if (existingFriendship.status === 'blocked') {
        return NextResponse.json(
          { error: 'This user is blocked' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Friend request already sent or friendship exists' },
        { status: 400 }
      );
    }

    const friendship = await createFriendship(user.id, friend.id);

    return NextResponse.json({
      success: true,
      friendship: {
        id: friendship.id,
        friend: friend,
        status: friendship.status,
      },
    });
  } catch (error) {
    console.error('Add friend error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/friends - Accept/reject/block/unblock friend
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { action, friendId } = body;

    if (!action || !friendId) {
      return NextResponse.json(
        { error: 'Action and friendId are required' },
        { status: 400 }
      );
    }

    if (action === 'accept') {
      const friendship = await acceptFriendship(user.id, friendId);
      if (!friendship) {
        return NextResponse.json(
          { error: 'Friend request not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, friendship });
    } else if (action === 'reject') {
      await rejectFriendship(user.id, friendId);
      return NextResponse.json({ success: true });
    } else if (action === 'block') {
      const friendship = await blockFriend(user.id, friendId);
      return NextResponse.json({ success: true, friendship });
    } else if (action === 'unblock') {
      await unblockFriend(user.id, friendId);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Update friendship error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
