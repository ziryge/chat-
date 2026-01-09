import { NextRequest, NextResponse } from 'next/server';
import { getSession, getUserById, getAllUsers } from '@/lib/storage';
import { getDirectMessageById, getAllDirectMessages, saveDirectMessage } from '@/lib/messaging';
import { Message } from '@/lib/types';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/messages/[id] - Get messages in a conversation
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
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

    // Get conversation - could be DM ID or user ID
    let conversationId = params.id;
    let otherUser = null;
    let messages: Message[] = [];

    // Check if it's a direct message conversation
    const dm = await getDirectMessageById(conversationId);
    
    if (dm && dm.participants.includes(user.id)) {
      // Mark messages as read (only if there are unread messages from other user)
      let unreadChanged = false;
      dm.messages = dm.messages.map(m => {
        if (m.senderId !== user.id && !m.read) {
          unreadChanged = true;
          return { ...m, read: true };
        }
        return m;
      });
      
      // Only save if we actually marked messages as read
      if (unreadChanged) {
        await saveDirectMessage(dm);
      }
      
      // Get other user info
      const allUsers = await getAllUsers();
      const otherUserId = dm.participants.find(id => id !== user.id);
      otherUser = allUsers.find(u => u.id === otherUserId);
      
      messages = dm.messages.map(m => {
        const sender = allUsers.find(u => u.id === m.senderId);
        if (!sender) return null;
        return {
          ...m,
          sender,
        };
      }).filter((m): m is Message => m !== null);
    } else {
      // Try treating it as a user ID and create conversation if needed
      const allUsers = await getAllUsers();
      otherUser = allUsers.find(u => u.id === conversationId);
      
      if (otherUser) {
        // Create new DM if it doesn't exist
        const { getOrCreateDirectMessage } = await import('@/lib/messaging');
        const dm = await getOrCreateDirectMessage(user.id, conversationId);
        messages = dm.messages.map(m => {
          const sender = allUsers.find(u => u.id === m.senderId);
          if (!sender) return null;
          return {
            ...m,
            sender,
          };
        }).filter((m): m is Message => m !== null);
      }
    }

    return NextResponse.json({
      success: true,
      messages,
      otherUser,
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
