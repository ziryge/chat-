'use client';

import { useState, useEffect } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { Button } from '@/ui/button';

interface CopyButtonProps {
  code: string;
  language?: string;
  fileName?: string;
  authorUsername?: string;
  authorDisplayName?: string;
  postTitle?: string;
  showDownload?: boolean;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'icon';
}

export function CopyButton({
  code,
  language,
  fileName,
  authorUsername,
  authorDisplayName,
  postTitle,
  showDownload = true,
  variant = 'ghost',
  size = 'icon',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const textToCopy = code.trim();
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      
      // Store attribution info in localStorage for tracking
      if (authorDisplayName) {
        const attribution: any = {
          author: authorDisplayName,
          username: authorUsername,
          postTitle,
          language,
          timestamp: new Date().toISOString(),
        };
        
        // Store copy history
        const history = JSON.parse(localStorage.getItem('codeCopyHistory') || '[]');
        history.unshift(attribution);
        localStorage.setItem('codeCopyHistory', JSON.stringify(history.slice(0, 50)));
        
        console.log('Attribution:', `Code copied from ${authorDisplayName}'s${postTitle ? ` post: "${postTitle}"` : ' post'}`);
      }
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleDownload = () => {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      rust: 'rs',
      go: 'go',
      java: 'java',
      'c++': 'cpp',
      'c#': 'cs',
      php: 'php',
      ruby: 'rb',
      sql: 'sql',
      html: 'html',
      css: 'css',
      json: 'json',
      bash: 'sh',
      yaml: 'yaml',
      markdown: 'md',
      dockerfile: 'dockerfile',
      xml: 'xml',
      shell: 'sh',
    };

    const ext = language ? extensions[language.toLowerCase()] || 'txt' : 'txt';
    const name = fileName || `code.${ext}`;
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={variant}
        size={size}
        onClick={handleCopy}
        title={copied ? 'Copied!' : 'Copy code'}
        className={copied ? 'text-green-500' : ''}
      >
        {copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        {size !== 'icon' && (
          <span className="ml-2">{copied ? 'Copied!' : 'Copy'}</span>
        )}
      </Button>
      
      {showDownload && (
        <Button
          variant={variant}
          size={size}
          onClick={handleDownload}
          title="Download code"
        >
          <Download className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
