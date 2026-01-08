'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowUp, ArrowDown, Edit3, Share2, Bookmark, MoreHorizontal, Code2 } from 'lucide-react';
import { Button } from '@/ui/button';
import { Avatar } from '@/ui/avatar';
import { Badge as BadgeComponent, Badge } from '@/ui/badge';
import { CommentSection } from '@/components/comment-section';
import { MediaEmbedCompact } from '@/components/media-preview';
import { MentionableText } from '@/components/mentionable-text';
import { loadInstagramEmbed } from '@/lib/media-client';
import { Post } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
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

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState(0);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [postId, setPostId] = useState<string | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setPostId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  useEffect(() => {
    // Load Instagram embeds if post has media
    if (post && post.mediaEmbeds && post.mediaEmbeds.some((m: any) => m.type === 'instagram')) {
      loadInstagramEmbed();
    }
  }, [post]);

  const fetchPost = async () => {
    try {
      if (!postId) return;
      const response = await fetch(`/api/posts/${postId}`);
      const data = await response.json();
      if (data.success) {
        setPost(data.post);
        setVotes(data.post.votes);
        setUserVote(data.post.userVote);
      }
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (direction: 'up' | 'down') => {
    try {
      if (!postId) return;
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote: userVote === direction ? null : direction }),
      });
      const data = await response.json();
      if (data.success) {
        setPost(data.post);
        setVotes(data.post.votes);
        setUserVote(data.post.userVote);
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-muted-foreground">Loading post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 pt-20">
      {/* Back Button */}
      <Link href="/">
        <Button variant="ghost" className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </Link>

      {/* Post Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Avatar user={post.author} />
            <div>
              <div className="flex items-center gap-2">
                <Link href={`/u/${post.author.username}`} className="font-semibold hover:text-primary">
                  {post.author.displayName}
                </Link>
                <span className="text-muted-foreground text-sm">@{post.author.username}</span>
                <span className="text-muted-foreground text-sm">·</span>
                <span className="text-muted-foreground text-sm">
                  {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {post.author.badges.map((badge) => (
                  <BadgeComponent key={badge.id} badge={badge} />
                ))}
              </div>
            </div>
          </div>

          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span
            className={`text-sm font-medium px-3 py-1 rounded-full border ${categoryColors[post.category]}`}
          >
            {categoryLabels[post.category]}
          </span>
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-sm font-medium px-3 py-1 rounded-full bg-secondary text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-8">
        <div className="prose prose-invert max-w-none">
          <div className="text-lg leading-relaxed whitespace-pre-line mb-6">
            <MentionableText text={post.content} />
          </div>

          {/* Media Embeds */}
          {post.mediaEmbeds && post.mediaEmbeds.length > 0 && (
            <div className="mb-6 space-y-6">
              {post.mediaEmbeds.map((media, index) => (
                <MediaEmbedCompact key={`${media.type}-${media.id}-${index}`} embed={media} />
              ))}
            </div>
          )}

          {post.codeSnippet && (
            <div className="mb-6 rounded-xl border bg-[#1e1e1e] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#333] bg-[#1e1e1e]">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  <span className="text-sm font-medium text-muted-foreground">Code Snippet</span>
                </div>
                <span className="text-sm text-muted-foreground">{post.codeSnippet.language}</span>
              </div>
              <SyntaxHighlighter
                language={post.codeSnippet.language.toLowerCase()}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '1.5rem',
                  fontSize: '0.9375rem',
                  background: '#1e1e1e',
                }}
                showLineNumbers
                lineNumberStyle={{
                  color: '#858585',
                  fontSize: '0.9375rem',
                  paddingRight: '1.5rem',
                  textAlign: 'right',
                }}
              >
                {post.codeSnippet.code}
              </SyntaxHighlighter>
            </div>
          )}
        </div>
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between py-4 border bg-card/50 backdrop-blur rounded-xl px-4 mb-6">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={`h-9 w-9 ${userVote === 'up' ? 'text-foreground' : ''}`}
            onClick={() => handleVote('up')}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
          <span className="text-lg font-bold min-w-[4rem] text-center">
            {formatNumber(votes)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className={`h-9 w-9 ${userVote === 'down' ? 'text-foreground' : ''}`}
            onClick={() => handleVote('down')}
          >
            <ArrowDown className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" className="h-9 sm:gap-2">
            <Edit3 className="h-4 w-4" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button variant="ghost" className="h-9 sm:gap-2">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button
            variant="ghost"
            className={`h-9 sm:gap-2 ${isBookmarked ? 'text-primary' : ''}`}
            onClick={() => setIsBookmarked(!isBookmarked)}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">Save</span>
          </Button>
        </div>
      </div>

      {/* Comments Section */}
      <CommentSection comments={post.comments} />
    </div>
  );
}
