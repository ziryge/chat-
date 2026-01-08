import { NextRequest, NextResponse } from 'next/server';
import { getSession, getUserById } from '@/lib/storage';
import { 
  getAllGroups,
  createGroup,
  getGroupsByUserId,
  addMemberToGroup,
  removeMemberFromGroup 
} from '@/lib/messaging';

// GET /api/groups - Get user's groups
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

    const groups = await getGroupsByUserId(user.id);

    return NextResponse.json({
      success: true,
      groups,
    });
  } catch (error) {
    console.error('Get groups error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/groups - Create a new group
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
    const { name, description, avatar } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      );
    }

    const group = await createGroup(name, user.id, description, avatar);

    return NextResponse.json({
      success: true,
      group,
    });
  } catch (error) {
    console.error('Create group error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/groups - Add/remove member from group
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
    const { action, groupId, memberId } = body;

    if (!action || !groupId) {
      return NextResponse.json(
        { error: 'Action and groupId are required' },
        { status: 400 }
      );
    }

    const groups = await getAllGroups();
    const group = groups.find(g => g.id === groupId);

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Only admin can add/remove members
    if (group.adminId !== user.id) {
      return NextResponse.json(
        { error: 'Only group admins can manage members' },
        { status: 403 }
      );
    }

    if (action === 'addMember') {
      if (!memberId) {
        return NextResponse.json(
          { error: 'Member ID is required' },
          { status: 400 }
        );
      }
      const updatedGroup = await addMemberToGroup(groupId, memberId);
      return NextResponse.json({ success: true, group: updatedGroup });
    } else if (action === 'removeMember') {
      if (!memberId) {
        return NextResponse.json(
          { error: 'Member ID is required' },
          { status: 400 }
        );
      }
      const updatedGroup = await removeMemberFromGroup(groupId, memberId);
      return NextResponse.json({ success: true, group: updatedGroup });
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Update group error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
