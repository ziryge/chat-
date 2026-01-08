import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/storage';

// GET /api/users/search - Search users by username
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        users: [],
      });
    }

    const users = await getAllUsers();
    const filteredUsers = users.filter(
      u => u.username.toLowerCase().includes(query.toLowerCase()) ||
           u.displayName.toLowerCase().includes(query.toLowerCase())
    );

    return NextResponse.json({
      success: true,
      users: filteredUsers,
    });
  } catch (error) {
    console.error('Search users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
