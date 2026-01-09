import { NextRequest, NextResponse } from 'next/server';
import { getSession, getUserById, getAllUsers } from '@/lib/storage';
import { 
  getAllDirectMessages,
  getDirectMessagesByUserId,
  getOrCreateDirectMessage,
  addMessageToDM 
} from '@/lib/messaging';
import { Message } from '@/lib/types';

// GET /api/messages - Get all user's direct message conversations
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

    const messages = await getDirectMessagesByUserId(user.id);
    const allUsers = await getAllUsers();

    // Get conversation participants
    const conversations = messages.map(dm => {
      const otherUserId = dm.participants.find(id => id !== user.id);
      const otherUser = allUsers.find(u => u.id === otherUserId);
      
      return {
        id: dm.id,
        user: otherUser,
        lastMessage: dm.messages.length > 0 ? dm.messages[dm.messages.length - 1] : null,
        unreadCount: dm.messages.filter(m => !m.read && m.senderId !== user.id).length,
        updatedAt: dm.updatedAt,
      };
    }).filter(c => c.user);

    // Sort by most recent
    conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/messages - Send a direct message
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
    const { toUserId, content } = body;

    if (!toUserId || !content) {
      return NextResponse.json(
        { error: 'Recipient and content are required' },
        { status: 400 }
      );
    }

    // Get or create direct message conversation
    const dm = await getOrCreateDirectMessage(user.id, toUserId);

    // Create new message - include sender info for client response
    const messageInfo = {
      id: crypto.randomUUID(),
      senderId: user.id,
      content,
      timestamp: new Date().toISOString(),
      read: false,
    };

    // Message with full sender info for response
    const message: Message = {
      id: messageInfo.id,
      senderId: messageInfo.senderId,
      sender: user,
      content: messageInfo.content,
      timestamp: messageInfo.timestamp,
      read: messageInfo.read,
    };

    await addMessageToDM(dm.id, messageInfo as any);

    return NextResponse.json({
      success: true,
      message,
      conversationId: dm.id,
    });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
