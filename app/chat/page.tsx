'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, Users, Plus, Search, MoreVertical } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { Avatar } from '@/ui/avatar';
import { formatDate, formatNumber } from '@/lib/utils';
import { User as UserType } from '@/lib/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface Conversation {
  id: string;
  user: UserType;
  lastMessage: {
    content: string;
    timestamp: Date;
  };
  unreadCount: number;
  updatedAt: Date;
}

export default function ChatPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'messages' | 'groups'>('messages');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  useEffect(() => {
    fetchConversations();
    fetchGroups();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups');
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleSearchUsers = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch('/api/users/search?q=' + encodeURIComponent(query));
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const startConversation = (user: UserType) => {
    router.push(`/chat/${user.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-14 flex">
      {/* Sidebar */}
      <div className="w-80 border-r bg-background h-[calc(100vh-3.5rem)] sticky top-[3.5rem] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold mb-4">Messages</h1>
          <Dialog open={showNewMessage} onOpenChange={setShowNewMessage}>
            <DialogTrigger asChild>
              <Button className="w-full gap-2">
                <Plus className="h-4 w-4" />
                New Message
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start a conversation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setSearchQuery(e.target.value);
                      handleSearchUsers(e.target.value);
                    }}
                    className="pl-10"
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {searchResults.map(user => (
                      <div
                        key={user.id}
                        onClick={() => startConversation(user)}
                        className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg cursor-pointer"
                      >
                        <Avatar user={user} className="h-10 w-10" />
                        <div>
                          <div className="font-semibold">{user.displayName}</div>
                          <div className="text-sm text-muted-foreground">@{user.username}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setSelectedTab('messages')}
            className={`flex-1 py-3 text-sm font-medium ${
              selectedTab === 'messages' ? 'bg-accent border-b-2 border-primary' : 'text-muted-foreground'
            }`}
          >
            <MessageSquare className="h-4 w-4 inline mr-2" />
            Messages
          </button>
          <button
            onClick={() => setSelectedTab('groups')}
            className={`flex-1 py-3 text-sm font-medium ${
              selectedTab === 'groups' ? 'bg-accent border-b-2 border-primary' : 'text-muted-foreground'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Groups
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedTab === 'messages' ? (
            conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground px-4">
                No conversations yet
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map(conv => (
                  <Link
                    key={conv.id}
                    href={`/chat/${conv.id}`}
                    className="block hover:bg-accent transition-colors"
                  >
                    <div className="p-4 flex items-center gap-3">
                      <div className="relative">
                        <Avatar user={conv.user} className="h-12 w-12" />
                        {conv.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full text-xs text-white flex items-center justify-center">
                            {conv.unreadCount}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold truncate">{conv.user.displayName}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(conv.lastMessage.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.lastMessage.content}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          ) : (
            groups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground px-4">
                No groups yet. Create one to chat with multiple people!
              </div>
            ) : (
              <div className="divide-y">
                {groups.map(group => (
                  <Link
                    key={group.id}
                    href={`/chat/${group.id}`}
                    className="block hover:bg-accent transition-colors"
                  >
                    <div className="p-4 flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                        {group.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold truncate">{group.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {group.members.length} members
                          </span>
                        </div>
                        {group.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {group.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <Card className="p-8 text-center max-w-md">
          <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Welcome to Messages</h2>
          <p className="text-muted-foreground mb-4">
            Select a conversation or start a new one to begin chatting
          </p>
          <Button onClick={() => setShowNewMessage(true)}>
            Start New Message
          </Button>
        </Card>
      </div>
    </div>
  );
}
