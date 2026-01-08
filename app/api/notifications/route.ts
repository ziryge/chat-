import { NextRequest, NextResponse } from 'next/server';
import { getSession, getUserById, getAllNotifications, getUserUnreadNotificationCount } from '@/lib/storage';

// GET /api/notifications - Get all notifications for current user
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

    const notifications = await getAllNotifications();
    const userNotifications = notifications.filter((n: any) => n.userId === session.userId);
    
    return NextResponse.json({
      success: true,
      notifications: userNotifications,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
