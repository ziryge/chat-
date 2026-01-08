'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Calendar, Link as LinkIcon, Edit3, Settings, Award, Code2 } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { Avatar } from '@/ui/avatar';
import { Badge } from '@/ui/badge';
import { SimpleBadge } from '@/components/simple-badge';
import { User, Post as PostType } from '@/lib/types';
import { formatDate, formatNumber } from '@/lib/utils';

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const [user, setUser] = useState<User | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    avatar: '',
    techStack: [] as string[],
  });
  const [newTech, setNewTech] = useState('');

  // Fetch current user (for edit permissions)
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
          setIsOwnProfile(data.user.username.toLowerCase() === username.toLowerCase());
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, [username]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/user/profile/${username}`);
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setEditForm({
            displayName: data.user.displayName,
            bio: data.user.bio || '',
            avatar: data.user.avatar || '',
            techStack: data.user.techStack || [],
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handleSave = async () => {
    if (!currentUser) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setCurrentUser(data.user);
        setIsEditing(false);
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addTech = () => {
    if (newTech.trim() && !editForm.techStack.includes(newTech.trim())) {
      setEditForm({
        ...editForm,
        techStack: [...editForm.techStack, newTech.trim()],
      });
      setNewTech('');
    }
  };

  const removeTech = (tech: string) => {
    setEditForm({
      ...editForm,
      techStack: editForm.techStack.filter(t => t !== tech),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-14">
      {/* Header */}
      <div className="bg-white/5 border-b">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <Avatar 
                user={user} 
                className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-background shadow-lg"
              />
              {isOwnProfile && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="absolute bottom-2 right-2 p-2 bg-background rounded-full shadow-md hover:bg-accent transition-colors"
                >
                  <Edit3 className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              {isEditing && isOwnProfile ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                    className="text-3xl font-bold bg-transparent border-b-2 border-primary focus:outline-none focus:border-primary/50 w-full"
                    placeholder="Display Name"
                  />
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full bg-background border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={3}
                    placeholder="Write a short bio..."
                  />
                  <div>
                    <label className="text-sm font-medium mb-2 block">Avatar URL</label>
                    <input
                      type="text"
                      value={editForm.avatar}
                      onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                      className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tech Stack</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newTech}
                        onChange={(e) => setNewTech(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTech()}
                        className="flex-1 bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Add a technology"
                      />
                      <Button onClick={addTech}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editForm.techStack.map((tech) => (
                        <SimpleBadge key={tech} variant="secondary" className="cursor-pointer" onClick={() => removeTech(tech)}>
                          {tech} ×
                        </SimpleBadge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 justify-center sm:justify-start pt-2">
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl sm:text-4xl font-bold">{user.displayName}</h1>
                  <p className="text-lg text-muted-foreground">@{user.username}</p>
                  {user.bio && (
                    <p className="mt-4 text-sm sm:text-base max-w-2xl">{user.bio}</p>
                  )}
                  <div className="flex flex-wrap gap-4 mt-4 justify-center sm:justify-start text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {formatDate(user.joinedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Code2 className="h-4 w-4" />
                      <span>{user.reputation} reputation</span>
                    </div>
                  </div>

                  {/* Badges */}
                  {user.badges && user.badges.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                      {user.badges.map((badge) => (
                        <SimpleBadge key={badge.id} variant="outline" className="gap-1">
                          <Award className="h-3 w-3" />
                          {badge.name}
                        </SimpleBadge>
                      ))}
                    </div>
                  )}

                  {/* Tech Stack */}
                  {user.techStack && user.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                      {user.techStack.map((tech) => (
                        <SimpleBadge key={tech} variant="secondary">
                          {tech}
                        </SimpleBadge>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold">{formatNumber(user.posts)}</div>
            <div className="text-sm text-muted-foreground">Posts</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold">{formatNumber(user.comments)}</div>
            <div className="text-sm text-muted-foreground">Comments</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold">{formatNumber(user.reputation)}</div>
            <div className="text-sm text-muted-foreground">Reputation</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold">{user.badges?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Badges</div>
          </Card>
        </div>
      </div>

      {/* Settings Button (for own profile) */}
      {isOwnProfile && !isEditing && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <Link href="/settings">
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Account Settings
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
