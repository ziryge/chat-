import { Post, Comment, User } from './types';
import { getAllPosts, savePost as savePostToStorage, getPostById as getPostFromStorage, deletePost as deletePostFromStorage } from './storage';
import { generateId } from './auth';

// Re-export savePost and deletePost for use in API routes
export { savePostToStorage as savePost };
export { deletePostFromStorage as deletePost };

// Vote storage
interface VoteData {
  [postId: string]: {
    [userId: string]: 'up' | 'down';
  };
}

const VOTES_FILE = process.cwd() + '/data/votes.json';

async function getVoteData(): Promise<VoteData> {
  const fs = await import('fs/promises');
  try {
    const data = await fs.readFile(VOTES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    await fs.writeFile(VOTES_FILE, JSON.stringify({}, null, 2));
    return {};
  }
}

async function saveVoteData(data: VoteData): Promise<void> {
  const fs = await import('fs/promises');
  await fs.writeFile(VOTES_FILE, JSON.stringify(data, null, 2));
}

// Get all posts with user votes included
export async function getAllPostsWithVotes(): Promise<Post[]> {
  const posts = await getAllPosts();
  const voteData = await getVoteData();
  
  return posts.map(post => {
    const postVotes = voteData[post.id] || {};
    return {
      ...post,
      votes: Object.values(postVotes).reduce((sum, vote) => {
        return sum + (vote === 'up' ? 1 : -1);
      }, 0),
    };
  });
}

// Get post by ID with votes
export async function getPostById(id: string): Promise<Post | null> {
  const post = await getPostFromStorage(id);
  if (!post) return null;
  
  const voteData = await getVoteData();
  const postVotes = voteData[id] || {};
  
  return {
    ...post,
    votes: Object.values(postVotes).reduce((sum, vote) => {
      return sum + (vote === 'up' ? 1 : -1);
    }, 0),
  };
}

// Update votes for a post
export async function updatePostVotes(
  postId: string,
  userId: string,
  vote: 'up' | 'down' | null
): Promise<Post | null> {
  const voteData = await getVoteData();
  
  if (!voteData[postId]) {
    voteData[postId] = {};
  }
  
  // Remove previous vote if it exists
  if (voteData[postId][userId] && voteData[postId][userId] === vote) {
    delete voteData[postId][userId];
  } else {
    voteData[postId][userId] = vote;
  }
  
  await saveVoteData(voteData);
  
  return await getPostById(postId);
}

// Add a comment to a post
export async function addCommentToPost(
  postId: string,
  author: User,
  content: string,
  codeSnippet?: { language: string; code: string },
  parentId?: string
): Promise<Post | null> {
  const post = await getPostFromStorage(postId);
  if (!post) return null;
  
  const newComment: Comment = {
    id: generateId(),
    author,
    content,
    codeSnippet,
    votes: 0,
    replies: [],
    createdAt: new Date(),
    ...(parentId && { parentId }),
  };
  
  if (parentId) {
    // Add as a reply to an existing comment
    const addReply = (comments: Comment[]): boolean => {
      for (let i = 0; i < comments.length; i++) {
        if (comments[i].id === parentId) {
          comments[i].replies.push(newComment);
          return true;
        }
        if (comments[i].replies && comments[i].replies.length > 0) {
          if (addReply(comments[i].replies!)) {
            return true;
          }
        }
      }
      return false;
    };
    
    addReply(post.comments);
  } else {
    // Add as a top-level comment
    post.comments.push(newComment);
  }
  
  post.updatedAt = new Date();
  await savePost(post);
  
  return await getPostById(postId);
}

// Vote on a comment
export async function voteOnComment(
  postId: string,
  commentId: string,
  userId: string,
  vote: 'up' | 'down' | null
): Promise<Post | null> {
  const post = await getPostFromStorage(postId);
  if (!post) return null;
  
  const voteData = await getVoteData();
  const commentVoteKey = `${postId}_${commentId}`;
  
  if (!voteData[commentVoteKey]) {
    voteData[commentVoteKey] = {};
  }
  
  // Remove previous vote if it exists and is the same
  if (voteData[commentVoteKey][userId] && voteData[commentVoteKey][userId] === vote) {
    delete voteData[commentVoteKey][userId];
  } else {
    voteData[commentVoteKey][userId] = vote;
  }
  
  await saveVoteData(voteData);
  
  // Update comment vote count
  const updateCommentVotes = (comments: Comment[]): boolean => {
    for (let i = 0; i < comments.length; i++) {
      if (comments[i].id === commentId) {
        const commentVotes = Object.values(voteData[commentVoteKey] || {}).reduce((sum, vote) => {
          return sum + (vote === 'up' ? 1 : -1);
        }, 0);
        comments[i].votes = commentVotes;
        return true;
      }
      if (comments[i].replies && comments[i].replies.length > 0) {
        if (updateCommentVotes(comments[i].replies!)) {
          return true;
        }
      }
    }
    return false;
  };
  
  updateCommentVotes(post.comments);
  post.updatedAt = new Date();
  await savePost(post);
  
  return await getPostById(postId);
}
