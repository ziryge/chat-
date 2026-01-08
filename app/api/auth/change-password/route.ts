import { NextRequest, NextResponse } from 'next/server';
import { getSession, getUserById, getHashedPassword } from '@/lib/storage';

// POST /api/auth/change-password - Change user password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

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

    // Verify current password
    const crypto = await import('crypto');
    const passwordData = await getHashedPassword(user.id);
    
    if (!passwordData) {
      return NextResponse.json(
        { error: 'Password data not found' },
        { status: 500 }
      );
    }

    const hash = crypto.pbkdf2Sync(
      currentPassword,
      passwordData.salt,
      1000,
      64,
      'sha512'
    ).toString('hex');

    if (hash !== passwordData.hash) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Generate new hash
    const { saveUserPasswordData } = await import('@/lib/auth');
    const newSalt = crypto.randomBytes(16).toString('hex');
    const newHash = crypto.pbkdf2Sync(
      newPassword,
      newSalt,
      1000,
      64,
      'sha512'
    ).toString('hex');

    await saveUserPasswordData(user.id, newHash, newSalt);

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
