import { DirectMessage, Message, Group, Friendship, FriendRequest } from './types';
import { generateId } from './auth';

const MESSAGES_FILE = process.cwd() + '/data/messages.json';
const GROUPS_FILE = process.cwd() + '/data/groups.json';
const FRIENDSHIPS_FILE = process.cwd() + '/data/friendships.json';
const FRIEND_REQUESTS_FILE = process.cwd() + '/data/friend-requests.json';

// Generic file operations
async function readJSON<T>(filePath: string): Promise<T> {
  const fs = await import('fs/promises');
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [] as T;
  }
}

async function writeJSON<T>(filePath: string, data: T): Promise<void> {
  const fs = await import('fs/promises');
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Direct Messages
export async function getAllDirectMessages(): Promise<DirectMessage[]> {
  const messages = await readJSON<DirectMessage[]>(MESSAGES_FILE);
  return messages.map(m => ({
    ...m,
    createdAt: new Date(m.createdAt),
    updatedAt: new Date(m.updatedAt),
    messages: m.messages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    })),
  }));
}

export async function saveDirectMessage(dm: DirectMessage): Promise<void> {
  const messages = await getAllDirectMessages();
  const index = messages.findIndex(m => m.id === dm.id);
  
  if (index >= 0) {
    messages[index] = dm;
  } else {
    messages.push(dm);
  }
  
  await writeJSON(MESSAGES_FILE, messages);
}

export async function getDirectMessageById(id: string): Promise<DirectMessage | null> {
  const messages = await getAllDirectMessages();
  return messages.find(m => m.id === id) || null;
}

export async function getDirectMessagesByUserId(userId: string): Promise<DirectMessage[]> {
  const messages = await getAllDirectMessages();
  return messages.filter(m => m.participants.includes(userId));
}

export async function createDirectMessage(participants: string[]): Promise<DirectMessage> {
  const newDM: DirectMessage = {
    id: generateId(),
    participants,
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  await saveDirectMessage(newDM);
  return newDM;
}

export async function addMessageToDM(dmId: string, message: Message): Promise<DirectMessage | null> {
  const dm = await getDirectMessageById(dmId);
  if (!dm) return null;
  
  dm.messages.push(message);
  dm.updatedAt = new Date();
  await saveDirectMessage(dm);
  
  return dm;
}

export async function getOrCreateDirectMessage(userId1: string, userId2: string): Promise<DirectMessage> {
  const messages = await getDirectMessagesByUserId(userId1);
  const existingDM = messages.find(dm => dm.participants.includes(userId2));
  
  if (existingDM) {
    return existingDM;
  }
  
  return await createDirectMessage([userId1, userId2]);
}

// Groups
export async function getAllGroups(): Promise<Group[]> {
  const groups = await readJSON<Group[]>(GROUPS_FILE);
  return groups.map(g => ({
    ...g,
    createdAt: new Date(g.createdAt),
    updatedAt: new Date(g.updatedAt),
    messages: g.messages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    })),
  }));
}

export async function getGroupById(id: string): Promise<Group | null> {
  const groups = await getAllGroups();
  return groups.find(g => g.id === id) || null;
}

export async function saveGroup(group: Group): Promise<void> {
  const groups = await getAllGroups();
  const index = groups.findIndex(g => g.id === group.id);
  
  if (index >= 0) {
    groups[index] = group;
  } else {
    groups.push(group);
  }
  
  await writeJSON(GROUPS_FILE, groups);
}

export async function createGroup(name: string, adminId: string, description?: string, avatar?: string): Promise<Group> {
  const newGroup: Group = {
    id: generateId(),
    name,
    description,
    adminId,
    members: [adminId],
    messages: [],
    avatar,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  await saveGroup(newGroup);
  return newGroup;
}

export async function addMemberToGroup(groupId: string, userId: string): Promise<Group | null> {
  const group = await getGroupById(groupId);
  if (!group || group.members.includes(userId)) return null;
  
  group.members.push(userId);
  group.updatedAt = new Date();
  await saveGroup(group);
  
  return group;
}

export async function removeMemberFromGroup(groupId: string, userId: string): Promise<Group | null> {
  const group = await getGroupById(groupId);
  if (!group) return null;
  
  // Can't remove admin
  if (group.adminId === userId) return null;
  
  group.members = group.members.filter(m => m !== userId);
  group.updatedAt = new Date();
  await saveGroup(group);
  
  return group;
}

export async function getGroupsByUserId(userId: string): Promise<Group[]> {
  const groups = await getAllGroups();
  return groups.filter(g => g.members.includes(userId));
}

export async function addMessageToGroup(groupId: string, message: Message): Promise<Group | null> {
  const group = await getGroupById(groupId);
  if (!group) return null;
  
  group.messages.push(message);
  group.updatedAt = new Date();
  await saveGroup(group);
  
  return group;
}

// Friendships
export async function getAllFriendships(): Promise<Friendship[]> {
  const friendships = await readJSON<Friendship[]>(FRIENDSHIPS_FILE);
  return friendships.map(f => ({
    ...f,
    createdAt: new Date(f.createdAt),
    updatedAt: new Date(f.updatedAt),
  }));
}

export async function saveFriendship(friendship: Friendship): Promise<void> {
  const friendships = await getAllFriendships();
  const index = friendships.findIndex(
    f => f.userId === friendship.userId && f.friendId === friendship.friendId
  );
  
  if (index >= 0) {
    friendships[index] = friendship;
  } else {
    friendships.push(friendship);
  }
  
  await writeJSON(FRIENDSHIPS_FILE, friendships);
}

export async function getFriendship(userId: string, friendId: string): Promise<Friendship | null> {
  const friendships = await getAllFriendships();
  return friendships.find(
    f => (f.userId === userId && f.friendId === friendId) ||
         (f.userId === friendId && f.friendId === userId)
  ) || null;
}

export async function getFriends(userId: string): Promise<Friendship[]> {
  const friendships = await getAllFriendships();
  return friendships.filter(
    f => (f.userId === userId || f.friendId === userId) && f.status === 'accepted'
  );
}

export async function createFriendship(userId: string, friendId: string): Promise<Friendship> {
  const newFriendship: Friendship = {
    id: generateId(),
    userId,
    friendId,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  await saveFriendship(newFriendship);
  return newFriendship;
}

export async function acceptFriendship(userId: string, friendId: string): Promise<Friendship | null> {
  const friendship = await getFriendship(userId, friendId);
  if (!friendship) return null;
  
  friendship.status = 'accepted';
  friendship.updatedAt = new Date();
  await saveFriendship(friendship);
  
  return friendship;
}

export async function rejectFriendship(userId: string, friendId: string): Promise<boolean> {
  const friendships = await getAllFriendships();
  const filtered = friendships.filter(
    f => !((f.userId === userId && f.friendId === friendId) ||
          (f.userId === friendId && f.friendId === userId))
  );
  
  await writeJSON(FRIENDSHIPS_FILE, filtered);
  return true;
}

export async function blockFriend(userId: string, friendId: string): Promise<Friendship | null> {
  // First, get existing friendship if any
  const friendship = await getFriendship(userId, friendId);
  
  if (friendship) {
    friendship.status = 'blocked';
    friendship.updatedAt = new Date();
    await saveFriendship(friendship);
    return friendship;
  } else {
    const newFriendship: Friendship = {
      id: generateId(),
      userId,
      friendId,
      status: 'blocked',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await saveFriendship(newFriendship);
    return newFriendship;
  }
}

export async function unblockFriend(userId: string, friendId: string): Promise<boolean> {
  const friendships = await getAllFriendships();
  const filtered = friendships.filter(
    f => !((f.userId === userId && f.friendId === friendId && f.status === 'blocked') ||
          (f.userId === friendId && f.friendId === userId && f.status === 'blocked'))
  );
  
  await writeJSON(FRIENDSHIPS_FILE, filtered);
  return true;
}
