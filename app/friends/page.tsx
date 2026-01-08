'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, UserPlus, UserX, Search } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { Avatar } from '@/ui/avatar';
import { formatDate } from '@/lib/utils';
import { User as UserType, Friendship } from '@/lib/types';
import { SimpleBadge } from '@/components/simple-badge';

interface Friend {
  id: string;
  friend: UserType;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchFriends();
    fetchPendingRequests();
    const interval = setInterval(() => {
      fetchPendingRequests();
    }, 5000); // Poll for new requests every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends');
      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('/api/friends/requests');
      if (response.ok) {
        const data = await response.json();
        setPendingRequests(data.requests);
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const handleAddFriend = async () => {
    if (!searchQuery.trim() || isAdding) return;

    setIsAdding(true);
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friendUsername: searchQuery }),
      });

      if (response.ok) {
        setSearchQuery('');
        setShowAddFriend(false);
        alert('Friend request sent!');
        fetchFriends();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to send friend request');
      }
    } catch (error) {
      console.error('Error adding friend:', error);
      alert('Failed to send friend request');
    } finally {
      setIsAdding(false);
    }
  };

  const handleAcceptRequest = async (friendId: string) => {
    try {
      const response = await fetch('/api/friends', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'accept',
          friendId,
        }),
      });

      if (response.ok) {
        alert('Friend request accepted!');
        fetchFriends();
        fetchPendingRequests();
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleRejectRequest = async (friendId: string) => {
    try {
      const response = await fetch('/api/friends', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reject',
          friendId,
        }),
      });

      if (response.ok) {
        alert('Friend request rejected');
        fetchPendingRequests();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const handleBlockFriend = async (friendId: string) => {
    if (!confirm('Are you sure you want to block this user?')) return;

    try {
      const response = await fetch('/api/friends', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'block',
          friendId,
        }),
      });

      if (response.ok) {
        alert('User blocked');
        fetchFriends();
      }
    } catch (error) {
      console.error('Error blocking friend:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-14">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Friends</h1>
          <Button onClick={() => setShowAddFriend(!showAddFriend)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Friend
          </Button>
        </div>

        {/* Add Friend Dialog */}
        {showAddFriend && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Add a Friend</h2>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter username"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button onClick={handleAddFriend} disabled={isAdding}>
                {isAdding ? 'Sending...' : 'Send Request'}
              </Button>
            </div>
          </Card>
        )}

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">
              Pending Requests ({pendingRequests.length})
            </h2>
            <div className="space-y-3">
              {pendingRequests.map(request => (
                <Card key={request.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar user={request.from} />
                      <div>
                        <div className="font-semibold">{request.from.displayName}</div>
                        <div className="text-sm text-muted-foreground">@{request.from.username}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(request.from.id)}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectRequest(request.from.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Friends List */}
        <h2 className="text-lg font-semibold mb-4">
          All Friends ({friends.length})
        </h2>
        {friends.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground mb-4">
              You have no friends yet. Add some to start chatting!
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {friends.map(friendship => (
              <Card key={friendship.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar user={friendship.friend} />
                    <div>
                      <div className="font-semibold">{friendship.friend.displayName}</div>
                      <div className="text-sm text-muted-foreground">@{friendship.friend.username}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <SimpleBadge variant={friendship.status === 'accepted' ? 'default' : 'secondary'}>
                          {friendship.status}
                        </SimpleBadge>
                        <span className="text-xs text-muted-foreground">
                          Since {formatDate(friendship.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/chat/${friendship.friend.id}`}>
                      <Button size="sm" variant="outline" className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Message
                      </Button>
                    </Link>
                    {friendship.status === 'accepted' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        onClick={() => handleBlockFriend(friendship.friend.id)}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
