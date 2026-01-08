import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/storage';

interface RouteContext {
  params: Promise<{ username: string }>;
}

// GET /api/user/profile/[username] - Get user by username
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const username = params.username;

    const users = await getAllUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
