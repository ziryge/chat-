import fs from 'fs/promises';
import path from 'path';
import { User, Post, Comment } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Initialize data directory and files
async function initDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Initialize users file if it doesn't exist
    try {
      await fs.access(USERS_FILE);
    } catch {
      await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2));
    }
    
    // Initialize posts file if it doesn't exist
    try {
      await fs.access(POSTS_FILE);
    } catch {
      await fs.writeFile(POSTS_FILE, JSON.stringify([], null, 2));
    }
    
    // Initialize sessions file if it doesn't exist
    try {
      await fs.access(SESSIONS_FILE);
    } catch {
      await fs.writeFile(SESSIONS_FILE, JSON.stringify({}, null, 2));
    }
  } catch (error) {
    console.error('Error initializing data directory:', error);
  }
}

// Generic file operations
async function readJSON<T>(filePath: string): Promise<T> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return {} as T;
  }
}

async function writeJSON<T>(filePath: string, data: T): Promise<void> {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    throw error;
  }
}

// User storage
export async function getAllUsers(): Promise<User[]> {
  await initDataDir();
  return readJSON<User[]>(USERS_FILE);
}

export async function saveUser(user: User): Promise<void> {
  await initDataDir();
  const users = await getAllUsers();
  const index = users.findIndex(u => u.id === user.id);
  
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  
  await writeJSON(USERS_FILE, users);
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getAllUsers();
  return users.find(u => u.id === id) || null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const users = await getAllUsers();
  return users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
}

// Post storage
export async function getAllPosts(): Promise<Post[]> {
  await initDataDir();
  return readJSON<Post[]>(POSTS_FILE);
}

export async function savePost(post: Post): Promise<void> {
  await initDataDir();
  const posts = await getAllPosts();
  const index = posts.findIndex(p => p.id === post.id);
  
  if (index >= 0) {
    posts[index] = post;
  } else {
    posts.push(post);
  }
  
  await writeJSON(POSTS_FILE, posts);
}

export async function getPostById(id: string): Promise<Post | null> {
  const posts = await getAllPosts();
  return posts.find(p => p.id === id) || null;
}

export async function deletePost(id: string): Promise<void> {
  await initDataDir();
  const posts = await getAllPosts();
  const filteredPosts = posts.filter(p => p.id !== id);
  await writeJSON(POSTS_FILE, filteredPosts);
}

// Session storage (user sessions/tokens)
interface SessionData {
  [sessionId: string]: {
    userId: string;
    createdAt: string;
    expiresAt: string;
  };
}

export async function getAllSessions(): Promise<SessionData> {
  await initDataDir();
  return readJSON<SessionData>(SESSIONS_FILE);
}

export async function createSession(userId: string, duration: number = 30 * 24 * 60 * 60 * 1000): Promise<string> {
  await initDataDir();
  const sessions = await getAllSessions();
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date();
  
  sessions[sessionId] = {
    userId,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + duration).toISOString(),
  };
  
  await writeJSON(SESSIONS_FILE, sessions);
  return sessionId;
}

export async function getSession(sessionId: string): Promise<{ userId: string; createdAt: string; expiresAt: string } | null> {
  const sessions = await getAllSessions();
  const session = sessions[sessionId];
  
  if (!session) {
    return null;
  }
  
  // Check if session is expired
  if (new Date(session.expiresAt) < new Date()) {
    await deleteSession(sessionId);
    return null;
  }
  
  return session;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await initDataDir();
  const sessions = await getAllSessions();
  delete sessions[sessionId];
  await writeJSON(SESSIONS_FILE, sessions);
}

export async function deleteAllUserSessions(userId: string): Promise<void> {
  await initDataDir();
  const sessions = await getAllSessions();
  
  for (const [sessionId, session] of Object.entries(sessions)) {
    if (session.userId === userId) {
      delete sessions[sessionId];
    }
  }
  
  await writeJSON(SESSIONS_FILE, sessions);
}

// Clean up expired sessions
export async function cleanupExpiredSessions(): Promise<void> {
  await initDataDir();
  const sessions = await getAllSessions();
  const now = new Date();
  
  for (const [sessionId, session] of Object.entries(sessions)) {
    if (new Date(session.expiresAt) < now) {
      delete sessions[sessionId];
    }
  }
  
  await writeJSON(SESSIONS_FILE, sessions);
}
