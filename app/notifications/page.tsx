'use client';

import { useState, useEffect } from 'react';
import { Bell, X, UserPlus, MessageCircle, Heart, Check, MoreHorizontal } from 'lucide-react';
import { Button } from '@/ui/button';
import { Avatar } from '@/ui/avatar';
import { NotificationPanel } from '@/components/notification-panel';

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLoading(false);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen pt-14">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Notifications</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex justify-center items-center min-h-[400px]">
          <NotificationPanel onClose={() => {}} />
        </div>
      </div>
    </div>
  );
}
