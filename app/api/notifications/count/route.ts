import { NextRequest, NextResponse } from 'next/server';
import { getSession, getUserUnreadNotificationCount } from '@/lib/storage';

// GET /api/notifications/count - Get unread notification count
export async function GET(request: NextRequest) {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ unread: 0 });
    }

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ unread: 0 });
    }

    const unread = await getUserUnreadNotificationCount(session.userId);
    
    return NextResponse.json({ unread });
  } catch (error) {
    console.error('Get notification count error:', error);
    return NextResponse.json({ unread: 0 });
  }
}
