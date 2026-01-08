'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { Textarea } from '@/ui/textarea';
import { MediaPreview } from '@/components/media-preview';
import { parseMediaLinks } from '@/lib/media';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Code2, X, Plus, Video } from 'lucide-react';

const CATEGORIES = [
  { value: 'discussion', label: 'Discussion' },
  { value: 'question', label: 'Question' },
  { value: 'showcase', label: 'Showcase' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'help', label: 'Help' },
  { value: 'hiring', label: 'Hiring' },
  { value: 'opensource', label: 'Open Source' },
];

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'rust', 'go', 'java', 'c++', 'c#', 'php', 'ruby', 'swift', 'kotlin', 'sql', 'html', 'css', 'json', 'bash', 'yaml'
];

interface CreatePostProps {
  onClose?: () => void;
  inDialog?: boolean;
}

export function CreatePost({ onClose, inDialog = false }: CreatePostProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string>('discussion');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [includeCode, setIncludeCode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const embeds = parseMediaLinks(content);
      
      const payload: any = {
        title,
        content,
        category,
        tags,
      };

      if (embeds.length > 0) {
        payload.mediaEmbeds = embeds;
      }

      if (includeCode && codeSnippet.trim()) {
        payload.codeSnippet = {
          language: codeLanguage,
          code: codeSnippet.trim(),
        };
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create post');
        setLoading(false);
        return;
      }

      if (onClose) {
        onClose();
      } else {
        router.push(`/posts/${data.post.id}`);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Card className={inDialog ? 'border-0 shadow-none' : 'w-full max-w-3xl mx-auto'}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Create New Post</CardTitle>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-white bg-white/10 rounded">
              {error}
            </div>
          )}

          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category *</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    category === cat.value
                      ? 'bg-foreground text-background border-foreground'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-lg font-medium ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="What's on your mind?"
              required
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/200 characters
            </p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium flex items-center gap-2">
              Content *
              <Video className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-normal">
                (YouTube, TikTok, Instagram, Twitter, Vimeo, Spotify links will auto-embed)
              </span>
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, ask questions, or show off your code...&#10;&#10;Drop any of these links to embed them:&#10;• YouTube: https://youtube.com/watch?v=...&#10;• TikTok: https://tiktok.com/@user/video/...&#10;• Instagram: https://instagram.com/p/...&#10;• Twitter: https://twitter.com/user/status/...&#10;• Vimeo: https://vimeo.com/...&#10;• Spotify: https://open.spotify.com/track/..."
              className="min-h-[200px] resize-y"
              required
              maxLength={5000}
            />
            <p className="text-xs text-muted-foreground">
              {content.length}/5000 characters
            </p>
          </div>

          {/* Media Link Preview */}
          <MediaPreview content={content} />

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Add tags (e.g., react, typescript)"
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Code Snippet (Optional) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                Code Snippet (Optional)
              </label>
              <button
                type="button"
                onClick={() => setIncludeCode(!includeCode)}
                className="text-sm text-primary hover:underline"
              >
                {includeCode ? 'Remove' : 'Add code snippet'}
              </button>
            </div>

            {includeCode && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <select
                    value={codeLanguage}
                    onChange={(e) => setCodeLanguage(e.target.value)}
                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
                <SyntaxHighlighter
                  language={codeLanguage}
                  style={vscDarkPlus}
                  customStyle={{ borderRadius: '0.5rem' }}
                >
                  {codeSnippet || '// Type your code here...'}
                </SyntaxHighlighter>
                <Textarea
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  placeholder="// Type or paste your code here..."
                  className="font-mono text-sm min-h-[150px]"
                  rows={8}
                />
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Creating...' : 'Create Post'}
            </Button>
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
