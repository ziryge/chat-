import { User } from './types';
import { getUserByUsername, saveUser } from './storage';
import { hashPassword } from './auth';

const ADMIN_USERNAME = 'devstral';
const ADMIN_PASSWORD = 'jebogy84';
const ADMIN_DISPLAY_NAME = 'Devstral Admin';
const ADMIN_BIO = 'System administrator for Devsquare';

export async function initializeAdmin(): Promise<boolean> {
  try {
    // Check if admin already exists
    const existingAdmin = await getUserByUsername(ADMIN_USERNAME);
    
    if (existingAdmin) {
      console.log('Admin account already exists');
      return true;
    }

    // Create admin account
    const { hash, salt } = await hashPassword(ADMIN_PASSWORD);
    
    const adminUser: User = {
      id: `admin_${Date.now()}`,
      username: ADMIN_USERNAME.toLowerCase(),
      displayName: ADMIN_DISPLAY_NAME,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(ADMIN_DISPLAY_NAME)}&background=8b5cf6&color=fff`,
      bio: ADMIN_BIO,
      reputation: 10000,
      badges: [],
      techStack: ['TypeScript', 'Next.js', 'React', 'Node.js'],
      joinedAt: new Date(),
      posts: 0,
      comments: 0,
      isAdmin: true,
    };

    await saveUser(adminUser);
    
    // Save password data
    const fs = await import('fs/promises');
    const path = await import('path');
    const passwordsFile = path.join(process.cwd(), 'data', 'passwords.json');
    
    const passwords = JSON.parse(await fs.readFile(passwordsFile, 'utf-8'));
    passwords[adminUser.id] = { hash, salt };
    await fs.writeFile(passwordsFile, JSON.stringify(passwords, null, 2));

    console.log('✓ Admin account created successfully');
    console.log(`  Username: ${ADMIN_USERNAME}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    
    return true;
  } catch (error) {
    console.error('Failed to initialize admin account:', error);
    return false;
  }
}

export function getAdminCredentials(): { username: string; password: string } {
  return {
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD,
  };
}
