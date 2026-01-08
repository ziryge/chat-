// Core types for Devsquare

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  reputation: number;
  badges: Badge[];
  techStack: string[];
  joinedAt: Date;
  posts: number;
  comments: number;
  isAdmin?: boolean;
}

export interface Post {
  id: string;
  author: User;
  title: string;
  content: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
  mediaEmbeds?: {
    type: string;
    url: string;
    id: string;
  }[];
  tags: string[];
  votes: number;
  userVote?: 'up' | 'down' | null;
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
  category: PostCategory;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
  votes: number;
  userVote?: 'up' | 'down' | null;
  replies: Comment[];
  createdAt: Date;
  parentId?: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  awardedAt: Date;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export type PostCategory = 
  | 'discussion'
  | 'question'
  | 'showcase'
  | 'tutorial'
  | 'help'
  | 'hiring'
  | 'opensource';

export interface TechTag {
  name: string;
  icon: string;
  popularity: number;
}

export interface Message {
  id: string;
  senderId: string;
  sender: User;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface DirectMessage {
  id: string;
  participants: string[];
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  adminId: string;
  members: string[];
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
}

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export type NotificationType = 
  | 'mention'
  | 'friend_request'
  | 'friend_accepted'
  | 'like'
  | 'comment'
  | 'reply'
  | 'vote_up'
  | 'vote_down';

export interface Notification {
  id: string;
  type: NotificationType;
  userId: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
  postId?: string;
  postTitle?: string;
  commentId?: string;
  message?: string;
  read: boolean;
  createdAt: Date;
}

export interface Mention {
  id: string;
  mentionedUserId: string;
  mentionedBy: {
    id: string;
    username: string;
    displayName: string;
  };
  postId?: string;
  commentId?: string;
  createdAt: Date;
}

export type NotificationType = 
  | 'mention'
  | 'like'
  | 'comment'
  | 'friend_request'
  | 'friend_request_accepted'
  | 'post_comment';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  data: {
    mentionedBy?: string;
    mentionedByDisplayName?: string;
    postId?: string;
    commentId?: string;
    postTitle?: string;
    content?: string;
    fromUserId?: string;
    fromUserDisplayName?: string;
  };
  read: boolean;
  createdAt: Date;
}
