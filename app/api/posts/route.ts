import { NextRequest, NextResponse } from 'next/server';
import { getAllPostsWithVotes, savePost } from '@/lib/posts';
import { getSession, getUserById, getUserByUsername, saveNotification, saveMention } from '@/lib/storage';
import { generateId } from '@/lib/auth';
import { parseMediaLinks, stripMediaLinks } from '@/lib/media';
import { getMentionedUsernames } from '@/lib/mentions';

// GET /api/posts - Get all posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'newest';
    const limit = parseInt(searchParams.get('limit') || '50');
    
    let posts = await getAllPostsWithVotes();
    
    // Filter by category
    if (category && category !== 'all') {
      posts = posts.filter(post => post.category === category);
    }
    
    // Sort posts
    if (sort === 'newest') {
      posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'oldest') {
      posts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === 'popular') {
      posts.sort((a, b) => b.votes - a.votes);
    }
    
    // Limit results
    posts = posts.slice(0, limit);
    
    return NextResponse.json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, tags, codeSnippet, mediaEmbeds } = body;
    
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
    
    // Validate required fields
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      );
    }
    
    // Parse media links from content if not provided
    const parsedEmbeds = mediaEmbeds || parseMediaLinks(content);
    
    // Create post
    const newPost = {
      id: generateId(),
      author: user,
      title,
      content,
      codeSnippet,
      mediaEmbeds: parsedEmbeds.length > 0 ? parsedEmbeds : undefined,
      tags: tags || [],
      votes: 0,
      userVote: null,
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      category,
    };
    
    await savePost(newPost);
    
    // Update user's post count
    const updatedUser = { ...user, posts: user.posts + 1 };
    await (await import('@/lib/storage')).saveUser(updatedUser);
    
    // Process @mentions and create notifications
    const mentionedUsernames = getMentionedUsernames(content);
    for (const username of mentionedUsernames) {
      const mentionedUser = await getUserByUsername(username);
      if (mentionedUser && mentionedUser.id !== user.id) {
        // Save mention
        await saveMention({
          id: generateId(),
          mentionedUserId: mentionedUser.id,
          mentionedBy: {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
          },
          postId: newPost.id,
          createdAt: new Date(),
        });
        
        // Create notification for mentioned user
        await saveNotification({
          id: generateId(),
          type: 'mention',
          userId: mentionedUser.id,
          user: {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatar: user.avatar,
          },
          postId: newPost.id,
          postTitle: title,
          read: false,
          createdAt: new Date(),
        });
      }
    }
    
    return NextResponse.json(
      {
        success: true,
        post: newPost,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
