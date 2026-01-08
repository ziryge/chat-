'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, X, UserPlus, MessageSquare, Heart, Check, MoreHorizontal } from 'lucide-react';
import { Button } from '@/ui/button';
import { Avatar } from '@/ui/avatar';
import { Notification } from '@/lib/types-extended';
import { formatDate } from '@/lib/utils';

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, { method: 'PUT' });
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'PUT' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    onClose();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'mention':
        return <MessageSquare className="h-4 w-4" />;
      case 'friend_request':
        return <UserPlus className="h-4 w-4" />;
      case 'friend_accepted':
        return <Check className="h-4 w-4" />;
      case 'like':
      case 'vote_up':
        return <Heart className="h-4 w-4" />;
      case 'comment':
      case 'reply':
        return <MessageSquare className="h-4 w-4" />;
      case 'vote_down':
        return <MoreHorizontal className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'mention':
        return `${notification.user.displayName} mentioned you`;
      case 'friend_request':
        return `${notification.user.displayName} sent you a friend request`;
      case 'friend_accepted':
        return `${notification.user.displayName} accepted your friend request`;
      case 'like':
        return `${notification.user.displayName} liked your post`;
      case 'comment':
        return `${notification.user.displayName} commented on your post`;
      case 'reply':
        return `${notification.user.displayName} replied to your comment`;
      case 'vote_up':
        return `${notification.user.displayName} upvoted your post`;
      case 'vote_down':
        return `${notification.user.displayName} downvoted your post`;
      default:
        return 'New notification';
    }
  };

  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case 'mention':
      case 'comment':
      case 'reply':
      case 'like':
      case 'vote_up':
      case 'vote_down':
        return notification.postId ? `/posts/${notification.postId}` : '#';
      case 'friend_request':
      case 'friend_accepted':
        return notification.user ? `/u/${notification.user.username}` : '#';
      default:
        return '#';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div ref={panelRef} className="relative">
      {/* Close on outside click */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute right-0 top-2 w-96 max-h-[80vh] bg-background border border-border rounded-lg shadow-xl overflow-hidden z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-white text-black rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mb-3 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={getNotificationLink(notification)}
                  onClick={() => handleNotificationClick(notification)}
                  className="block hover:bg-white/5 transition-colors"
                >
                  <div
                    className={`flex items-start gap-3 p-4 ${
                      !notification.read ? 'bg-white/5' : ''
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        !notification.read ? 'bg-white text-black' : 'bg-white/10 text-white'
                      }`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar user={notification.user} className="w-6 h-6" />
                            <p className="text-sm font-medium">
                              {getNotificationText(notification)}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(notification.createdAt)}
                          </p>
                          {notification.postTitle && (
                            <p className="text-xs text-foreground/70 mt-1 truncate">
                              "{notification.postTitle}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-white shrink-0 mt-2" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border">
          <Link
            href="/notifications"
            onClick={onClose}
            className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View all notifications
          </Link>
        </div>
      </div>
    </div>
  );
}
