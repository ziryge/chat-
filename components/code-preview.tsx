'use client';

import { useState } from 'react';
import { Check, Copy, Code2, X } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/ui/button';

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'rust', 'go', 'java', 'c++', 'c#', 'php', 'ruby', 'swift', 'kotlin', 'sql', 'html', 'css', 'json', 'bash', 'yaml', 'markdown', 'dockerfile'
] as const;

export type CodeLanguage = typeof LANGUAGES[number];

interface CodePreviewProps {
  code: string;
  language: CodeLanguage;
  showLanguageSelector?: boolean;
  showCopyButton?: boolean;
  authorUsername?: string;
  authorDisplayName?: string;
  postTitle?: string;
  isEditable?: boolean;
  onCodeChange?: (code: string) => void;
  onLanguageChange?: (language: CodeLanguage) => void;
  readonly?: boolean;
  placeholder?: string;
  editable?: boolean;
}

export function CodePreview({
  code,
  language,
  showLanguageSelector = false,
  showCopyButton = true,
  authorUsername,
  authorDisplayName,
  postTitle,
  isEditable = false,
  onCodeChange,
  onLanguageChange,
  readonly = false,
  placeholder = '// Type or paste your code here...',
  editable = false,
}: CodePreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const textToCopy = code.trim();
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      
      // Show attribution in notification or console
      if (authorDisplayName) {
        console.log(`Copied from ${authorDisplayName}'s${postTitle ? ` post: "${postTitle}"` : ' post'}`);
      }
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const getAttributionText = () => {
    if (!authorDisplayName) return '';
    return `Copied from ${authorDisplayName}'s${postTitle ? ` post: "${postTitle}"` : ' post'}`;
  };

  // Placeholder code for syntax highlighting when empty
  const displayCode = code || placeholder;
  const isEmpty = !code.trim();

  return (
    <div className="rounded-lg border overflow-hidden bg-[#1e1e1e]">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#333] bg-[#1e1e1e]">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-primary" />
          {showLanguageSelector && onLanguageChange ? (
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as CodeLanguage)}
              className="bg-transparent text-sm text-muted-foreground focus:outline-none cursor-pointer hover:text-foreground"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang} className="bg-[#1e1e1e]">
                  {lang}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-sm text-muted-foreground capitalize">{language}</span>
          )}
        </div>
        
        {showCopyButton && (
          <div className="flex items-center gap-2">
            {copied && authorDisplayName && (
              <span className="text-xs text-primary">
                {getAttributionText()}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleCopy}
              title="Copy code"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Code Display */}
      {editable && !readonly && onCodeChange ? (
        <textarea
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[200px] p-4 bg-[#1e1e1e] text-sm font-mono text-foreground focus:outline-none resize-y"
          spellCheck={false}
        />
      ) : (
        <SyntaxHighlighter
          language={language.toLowerCase()}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.875rem',
            background: '#1e1e1e',
            opacity: isEmpty ? '0.5' : '1',
          }}
          showLineNumbers
          lineNumberStyle={{
            color: '#858585',
            fontSize: '0.875rem',
            paddingRight: '1rem',
            textAlign: 'right',
            userSelect: 'none',
          }}
        >
          {displayCode}
        </SyntaxHighlighter>
      )}

      {/* Footer with attribution hint */}
      {showCopyButton && authorDisplayName && (
        <div className="px-4 py-1.5 border-t border-[#333] bg-[#181818]">
          <p className="text-xs text-muted-foreground">
            {copied ? (
              <span className="text-green-500">
                ✓ Copied{getAttributionText()}
              </span>
            ) : (
              <span>
                Click copy button to copy with attribution to {authorDisplayName}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
