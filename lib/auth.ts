import { User } from './types';
import { getUserByUsername, saveUser } from './storage';
import { randomBytes, createHash } from 'crypto';

// Simple password hashing using SHA-256 with salt
// For production, consider using bcrypt or argon2
export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256')
    .update(password + salt)
    .digest('hex');
  
  return { hash, salt };
}

export async function verifyPassword(password: string, storedHash: string, salt: string): Promise<boolean> {
  const hash = createHash('sha256')
    .update(password + salt)
    .digest('hex');
  
  return hash === storedHash;
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Sign up a new user
export async function signUpUser(
  username: string,
  password: string,
  displayName?: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  // Validate username
  if (!username || username.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters' };
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { success: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  
  // Validate password
  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }
  
  // Check if username already exists
  const existingUser = await getUserByUsername(username);
  if (existingUser) {
    return { success: false, error: 'Username already taken' };
  }
  
  // Hash password
  const { hash, salt } = await hashPassword(password);
  
  // Create new user
  const newUser: User = {
    id: generateId(),
    username: username.toLowerCase(),
    displayName: displayName || username,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || username)}&background=random&color=fff`,
    bio: undefined,
    reputation: 0,
    badges: [],
    techStack: [],
    joinedAt: new Date(),
    posts: 0,
    comments: 0,
  };
  
  // Save user with password data (stored separately with hash and salt)
  await saveUser(newUser);
  await saveUserPasswordData(newUser.id, hash, salt);
  
  return { success: true, user: newUser };
}

// Sign in a user
export async function signInUser(
  username: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  const user = await getUserByUsername(username);
  
  if (!user) {
    return { success: false, error: 'Invalid username or password' };
  }
  
  const passwordData = await getUserPasswordData(user.id);
  
  if (!passwordData) {
    return { success: false, error: 'Invalid username or password' };
  }
  
  const isValid = await verifyPassword(password, passwordData.hash, passwordData.salt);
  
  if (!isValid) {
    return { success: false, error: 'Invalid username or password' };
  }
  
  return { success: true, user };
}

// Password data storage (separate from user data for security)
interface PasswordData {
  [userId: string]: {
    hash: string;
    salt: string;
  };
}

const PASSWORD_DATA_FILE = process.cwd() + '/data/passwords.json';

async function getPasswordData(): Promise<PasswordData> {
  const fs = await import('fs/promises');
  try {
    const data = await fs.readFile(PASSWORD_DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    // Initialize file if it doesn't exist
    await fs.writeFile(PASSWORD_DATA_FILE, JSON.stringify({}, null, 2));
    return {};
  }
}

async function savePasswordData(data: PasswordData): Promise<void> {
  const fs = await import('fs/promises');
  await fs.writeFile(PASSWORD_DATA_FILE, JSON.stringify(data, null, 2));
}

async function saveUserPasswordData(userId: string, hash: string, salt: string): Promise<void> {
  const passwordData = await getPasswordData();
  passwordData[userId] = { hash, salt };
  await savePasswordData(passwordData);
}

async function getUserPasswordData(userId: string): Promise<{ hash: string; salt: string } | null> {
  const passwordData = await getPasswordData();
  return passwordData[userId] || null;
}

export async function deleteUserPasswordData(userId: string): Promise<void> {
  const passwordData = await getPasswordData();
  delete passwordData[userId];
  await savePasswordData(passwordData);
}
