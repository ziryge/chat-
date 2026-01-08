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
