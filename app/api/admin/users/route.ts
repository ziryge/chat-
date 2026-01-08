import { NextResponse } from 'next/server';

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

    const adminUser = await getUserById(session.userId);
    
    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all users
    const { getAllUsers } = await import('@/lib/storage');
    const users = await getAllUsers();

    // Sort users by join date (newest first)
    users.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
