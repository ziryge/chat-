'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, PlusSquare, User, Bell, LogOut, Home, Flame, Code2, MessageSquare, Users, UserPlus } from 'lucide-react';
import { Button } from '@/ui/button';
import { Avatar } from '@/ui/avatar';
import { NotificationPanel } from '@/components/notification-panel';
import { User as UserType } from '@/lib/types';

export function Navigation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchCurrentUser();
    fetchUnreadCount();
    fetchNotificationCount();
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchNotificationCount();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        const totalUnread = data.conversations.reduce((sum: number, conv: any) => 
          sum + (conv.unreadCount || 0), 0
        );
        setUnreadCount(totalUnread);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const fetchNotificationCount = async () => {
    try {
      const response = await fetch('/api/notifications/count');
      if (response.ok) {
        const data = await response.json();
        setNotificationCount(data.unread || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      setCurrentUser(null);
      router.push('/signin');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const handleCreatePost = () => {
    if (!currentUser) {
      router.push('/signin');
      return;
    }
    router.push('/posts/new');
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass-effect border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative h-8 w-8 rounded bg-white flex items-center justify-center">
              <Code2 className="h-5 w-5 text-black" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Devsquare
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/">
              <Button variant="ghost" className="gap-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Button>
            </Link>
            <Button variant="ghost" className="gap-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg">
              <Flame className="h-4 w-4" />
              <span>Popular</span>
            </Button>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md items-center gap-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search posts, tags, or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded bg-white/10 border border-white/20 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Link href="/groups" className="hidden sm:block">
              <Button variant="ghost" className="gap-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg">
                <Users className="h-4 w-4" />
                <span>Groups</span>
              </Button>
            </Link>
            <Link href="/friends" className="hidden sm:block">
              <Button variant="ghost" className="gap-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg">
                <UserPlus className="h-4 w-4" />
                <span>Friends</span>
              </Button>
            </Link>
            <Button 
              onClick={handleCreatePost} 
              className="gap-2 bg-white text-black hover:bg-gray-200 rounded transition-all"
            >
              <PlusSquare className="h-4 w-4" />
              <span className="hidden sm:inline">New Post</span>
            </Button>

            {loading ? (
              <div className="h-9 w-9 rounded-full bg-white/10 animate-pulse" />
            ) : currentUser ? (
              <>
                <Link href="/chat">
                  <Button variant="ghost" size="icon" className="relative text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg">
                    <MessageSquare className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 bg-white text-black rounded-full text-xs flex items-center justify-center font-semibold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </div>
                    )}
                  </Button>
                </Link>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg"
                  >
                    <Bell className="h-5 w-5" />
                    {notificationCount > 0 && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 bg-white text-black rounded-full text-xs flex items-center justify-center font-semibold">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </div>
                    )}
                  </Button>
                  {showNotifications && (
                    <NotificationPanel onClose={() => setShowNotifications(false)} />
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleSignOut} 
                  title="Sign out"
                  className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
                <Link href={`/u/${currentUser.username}`}>
                  <Avatar user={currentUser} />
                </Link>
              </>
            ) : (
              <div className="flex gap-2">
                <Link href="/signin">
                  <Button variant="outline" className="border-white/20 text-zinc-300 hover:bg-white/5 hover:text-white rounded-lg">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-white text-black hover:bg-gray-200 rounded transition-all">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
