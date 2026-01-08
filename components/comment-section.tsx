'use client';

import { useState } from 'react';
import { ArrowUp, ArrowDown, Reply } from 'lucide-react';
import { Button } from '@/ui/button';
import { Avatar } from '@/ui/avatar';
import { Comment as CommentType } from '@/lib/types';
import { formatDate, formatNumber } from '@/lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CommentProps {
  comment: CommentType;
  isReply?: boolean;
}

function Comment({ comment, isReply = false }: CommentProps) {
  const [votes, setVotes] = useState(comment.votes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(comment.userVote || null);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleVote = (direction: 'up' | 'down') => {
    if (userVote === direction) {
      setVotes(direction === 'up' ? votes - 1 : votes + 1);
      setUserVote(null);
    } else {
      const currentVoteValue = userVote === 'up' ? 1 : userVote === 'down' ? -1 : 0;
      const newVoteValue = direction === 'up' ? 1 : -1;
      setVotes(votes - currentVoteValue + newVoteValue);
      setUserVote(direction);
    }
  };

  return (
    <div className={`${isReply ? 'ml-12 mt-3' : 'mt-4'}`}>
      <div className="flex gap-3">
        {/* Vote Column */}
        <div className="flex flex-col items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className={`h-6 w-6 ${userVote === 'up' ? 'text-foreground' : ''}`}
            onClick={() => handleVote('up')}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <span className="text-xs font-bold">{formatNumber(votes)}</span>
          <Button
            variant="ghost"
            size="icon"
            className={`h-6 w-6 ${userVote === 'down' ? 'text-foreground' : ''}`}
            onClick={() => handleVote('down')}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Avatar user={comment.author} />
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{comment.author.displayName}</span>
              <span className="text-muted-foreground text-sm">@{comment.author.username}</span>
              <span className="text-muted-foreground text-xs">· {formatDate(comment.createdAt)}</span>
            </div>
          </div>

          <p className="text-sm leading-relaxed whitespace-pre-line mb-2">
            {comment.content}
          </p>

          {comment.codeSnippet && (
            <div className="mb-3 rounded-lg border bg-[#1e1e1e] overflow-hidden">
              <div className="px-3 py-1.5 border-b border-[#333] bg-[#1e1e1e]">
                <span className="text-xs text-muted-foreground">{comment.codeSnippet.language}</span>
              </div>
              <SyntaxHighlighter
                language={comment.codeSnippet.language.toLowerCase()}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '0.75rem',
                  fontSize: '0.8125rem',
                  background: '#1e1e1e',
                }}
                showLineNumbers
              >
                {comment.codeSnippet.code}
              </SyntaxHighlighter>
            </div>
          )}

          {/* Reply Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => setShowReply(!showReply)}
            >
              <Reply className="h-3 w-3" />
              Reply
            </Button>
          </div>

          {/* Reply Input */}
          {showReply && (
            <div className="mt-3">
              <textarea
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Write a reply..."
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowReply(false);
                    setReplyText('');
                  }}
                >
                  Cancel
                </Button>
                <Button size="sm" disabled={!replyText.trim()}>
                  Reply
                </Button>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {comment.replies.map((reply) => (
                <Comment key={reply.id} comment={reply} isReply />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface CommentSectionProps {
  comments: CommentType[];
}

export function CommentSection({ comments }: CommentSectionProps) {
  return (
    <div className="mt-6 pt-6 border-t">
      <h3 className="text-lg font-semibold mb-4">
        Comments ({comments.length})
      </h3>

      {/* Comment Input */}
      <div className="mb-6">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
            U
          </div>
          <div className="flex-1">
            <textarea
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="What are your thoughts?"
              rows={3}
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="ghost">Cancel</Button>
              <Button>Post Comment</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No comments yet. Be the first to share your thoughts!
        </div>
      ) : (
        comments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))
      )}
    </div>
  );
}
