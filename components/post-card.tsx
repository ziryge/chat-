'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowUp, ArrowDown, MessageCircle, Share2, Bookmark, MoreHorizontal, Code2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '@/ui/card';
import { Button } from '@/ui/button';
import { Avatar } from '@/ui/avatar';
import { Badge as BadgeUI } from '@/ui/badge';
import { Post, User, Badge as BadgeType } from '@/lib/types';
import { formatDate, formatNumber } from '@/lib/utils';
import { MentionableText } from '@/components/mentionable-text';
import { MediaEmbedCompact, parseMediaLinks } from '@/components/media-preview';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const categoryColors: Record<string, string> = {
  discussion: 'bg-secondary text-foreground border-border',
  question: 'bg-secondary text-foreground border-border',
  showcase: 'bg-secondary text-foreground border-border',
  tutorial: 'bg-secondary text-foreground border-border',
  help: 'bg-destructive/10 text-destructive border-destructive/20',
  hiring: 'bg-secondary text-foreground border-border',
  opensource: 'bg-secondary text-foreground border-border',
};

const categoryLabels: Record<string, string> = {
  discussion: 'Discussion',
  question: 'Question',
  showcase: 'Showcase',
  tutorial: 'Tutorial',
  help: 'Help',
  hiring: 'Hiring',
  opensource: 'Open Source',
};

interface PostCardProps {
  post: Post;
  variant?: 'default' | 'compact' | 'feed';
}

export function PostCard({ post, variant = 'default' }: PostCardProps) {
  const [votes, setVotes] = useState(post.votes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(post.userVote || null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVote = async (direction: 'up' | 'down') => {
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote: userVote === direction ? null : direction }),
      });
      const data = await response.json();
      if (data.success) {
        setVotes(data.post.votes);
        setUserVote(data.post.userVote);
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/posts/${post.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the page to remove the post
        window.location.reload();
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    } finally {
      setDeleting(false);
      setShowDropdown(false);
    }
  };

  const isAdmin = currentUser?.isAdmin === true;
  const isPostAuthor = currentUser?.id === post.author.id;
  const canDelete = isAdmin || isPostAuthor;

  const postContent = (
    <>
      <CardHeader className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Avatar user={post.author} />
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-sm truncate">{post.author.displayName}</span>
              {post.author.isAdmin && (
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                  Admin
                </span>
              )}
              <span className="text-muted-foreground text-sm">@{post.author.username}</span>
              <span className="text-muted-foreground text-sm">· {formatDate(post.createdAt)}</span>
            </div>
          </div>
          
          {/* 3-dot menu */}
          {canDelete && (
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              
              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-background border rounded-lg shadow-lg min-w-[160px] p-1">
                  <button
                    onClick={handleDeletePost}
                    disabled={deleting}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleting ? 'Deleting...' : 'Delete Post'}
                  </button>
                </div>
              )}
            </div>
          )}
          
          {!canDelete && (
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 invisible">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span
            className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${categoryColors[post.category]}`}
          >
            {categoryLabels[post.category]}
          </span>
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mb-4">
          <Link href={`/posts/${post.id}`}>
            <h2 className="text-lg font-semibold mb-2 hover:text-primary cursor-pointer transition-colors">
              {post.title}
            </h2>
          </Link>
          {post.mediaEmbeds && post.mediaEmbeds.length > 0 ? (
            <div className="mb-3">
              {post.mediaEmbeds.slice(0, 2).map((media, index) => (
                <MediaEmbedCompact key={`${media.type}-${media.id}-${index}`} embed={media} />
              ))}
            </div>
          ) : null}
          <MentionableText text={post.content} />
        </div>

        {/* Media Embeds - show remaining ones */}
        {post.mediaEmbeds && post.mediaEmbeds.length > 2 && (
          <div className="mb-4">
            {post.mediaEmbeds.slice(2).map((media, index) => (
              <MediaEmbedCompact key={`${media.type}-${media.id}-${index}`} embed={media} />
            ))}
          </div>
        )}

        {post.codeSnippet && (
          <div className="mb-4 rounded-lg border bg-[#1e1e1e] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#333] bg-[#1e1e1e]">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Code Snippet</span>
              </div>
              <span className="text-xs text-muted-foreground">{post.codeSnippet.language}</span>
            </div>
            <SyntaxHighlighter
              language={post.codeSnippet.language.toLowerCase()}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: '1rem',
                fontSize: '0.875rem',
                background: '#1e1e1e',
              }}
              showLineNumbers
              lineNumberStyle={{
                color: '#858585',
                fontSize: '0.875rem',
                paddingRight: '1rem',
                textAlign: 'right',
              }}
            >
              {post.codeSnippet.code}
            </SyntaxHighlighter>
          </div>
        )}

        {post.author.badges.length > 0 && variant !== 'compact' && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.author.badges.slice(0, 3).map((badge) => (
              <BadgeUI key={badge.id} badge={badge} />
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-3 border-t">
        <div className="flex items-center justify-between w-full">
          {/* Vote Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${userVote === 'up' ? 'text-foreground' : ''}`}
              onClick={() => handleVote('up')}
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
            <span className="text-sm font-semibold min-w-[3rem] text-center">
              {formatNumber(votes)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${userVote === 'down' ? 'text-foreground' : ''}`}
              onClick={() => handleVote('down')}
            >
              <ArrowDown className="h-5 w-5" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Link href={`/posts/${post.id}`}>
              <Button variant="ghost" size="sm" className="gap-1.5 h-9">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}
                </span>
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="h-9">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-9 ${isBookmarked ? 'text-primary' : ''}`}
              onClick={() => setIsBookmarked(!isBookmarked)}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </CardFooter>
    </>
  );

  return (
    <Card className="hover:border-primary/20 transition-colors">
      {variant === 'compact' ? (
        <div className="flex gap-3 p-4">
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${userVote === 'up' ? 'text-white' : ''}`}
              onClick={() => handleVote('up')}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <span className="text-xs font-bold">{formatNumber(votes)}</span>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${userVote === 'down' ? 'text-white' : ''}`}
              onClick={() => handleVote('down')}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 min-w-0">
            {postContent}
          </div>
        </div>
      ) : (
        postContent
      )}
    </Card>
  );
}
