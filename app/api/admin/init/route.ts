import { NextResponse } from 'next/server';
import { initializeAdmin } from '@/lib/admin-init';

export async function POST() {
  try {
    const success = await initializeAdmin();
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Admin account initialized',
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to initialize admin account' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Admin init error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
