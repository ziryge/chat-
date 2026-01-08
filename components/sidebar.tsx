'use client';

import { Home, TrendingUp, Hash, Users, Archive, Shield } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/ui/button';
import { useEffect, useState } from 'react';
import { User } from '@/lib/types';

const sidebarLinks = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: TrendingUp, label: 'Popular', href: '/?sort=popular' },
];

const categories = [
  { label: 'Discussion', href: '/?category=discussion' },
  { label: 'Question', href: '/?category=question' },
  { label: 'Tutorial', href: '/?category=tutorial' },
  { label: 'Showcase', href: '/?category=showcase' },
  { label: 'Help', href: '/?category=help' },
];

export function Sidebar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  return (
    <aside className="hidden lg:block w-64 sticky top-[3.5rem] h-[calc(100vh-3.5rem)] overflow-y-auto border-r bg-background">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-2">Menu</h3>
        <nav className="space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-10"
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex-1 text-left">{link.label}</span>
                </Button>
              </Link>
            );
          })}
          
          {/* Admin Link - Only show when user is admin */}
          {user?.isAdmin && (
            <Link href="/admin">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-10"
              >
                <Shield className="h-5 w-5" />
                <span className="flex-1 text-left font-medium">Admin Panel</span>
              </Button>
            </Link>
          )}
        </nav>

        <div className="mt-8">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-2">Categories</h3>
          <div className="space-y-1">
            {categories.map((cat) => (
              <Link key={cat.href} href={cat.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-10"
                >
                  <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                  <span className="flex-1 text-left">{cat.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
