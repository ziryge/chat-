import { NextRequest, NextResponse } from 'next/server';
import { deletePost, getPostById as getPostFromLib } from '@/lib/posts';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;

    // Verify admin access
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { getSession, getUserById, saveUser } = await import('@/lib/storage');
    const session = await getSession(sessionId);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminUser = await getUserById(session.userId);
    
    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get the post to find the author before deleting
    const postToDelete = await getPostFromLib(postId);
    
    if (!postToDelete) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const authorId = postToDelete.author.id;

    // Get comment count from the post being deleted
    const commentCount = postToDelete.comments.length;

    // Decrement author's post count
    const author = await getUserById(authorId);
    if (author) {
      const updatedAuthor = {
        ...author,
        posts: Math.max(0, author.posts - 1),
        comments: Math.max(0, author.comments - commentCount),
      };
      await saveUser(updatedAuthor);
    }

    // Delete post
    await deletePost(postId);

    // Delete votes for this post
    const fs = await import('fs/promises');
    const VOTES_FILE = process.cwd() + '/data/votes.json';
    
    try {
      const voteData = JSON.parse(await fs.readFile(VOTES_FILE, 'utf-8'));
      delete voteData[postId];
      await fs.writeFile(VOTES_FILE, JSON.stringify(voteData, null, 2));
    } catch (error) {
      console.error('Error deleting votes:', error);
    }

    return NextResponse.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
