'use client';

import { useState } from 'react';
import { Code2, X, Eye, Edit } from 'lucide-react';
import { Button } from '@/ui/button';
import { CodePreview } from '@/components/code-preview';

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'rust', 'go', 'java', 'c++', 'c#', 'php', 'ruby', 'swift', 'kotlin', 'sql', 'html', 'css', 'json', 'bash', 'yaml', 'markdown', 'dockerfile'
] as const;

export type CodeLanguage = typeof LANGUAGES[number];

interface CodeEditorProps {
  isOpen: boolean;
  onToggle: () => void;
  onCodeSubmit: (codeSnippet: { language: string; code: string }) => void;
  initialLanguage?: string;
  initialCode?: string;
}

export function CodeEditor({
  isOpen,
  onToggle,
  onCodeSubmit,
  initialLanguage = 'javascript',
  initialCode = '',
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState<CodeLanguage>(initialLanguage as CodeLanguage);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  const handleSubmit = () => {
    if (code.trim()) {
      onCodeSubmit({
        language,
        code: code.trim(),
      });
      setCode('');
      onToggle();
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="gap-2"
      >
        <Code2 className="h-4 w-4" />
        Add Code Snippet
      </Button>
    );
  }

  return (
    <div className="mt-3 space-y-3 p-4 border rounded-lg bg-muted/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4" />
          <span className="text-sm font-medium">Code Snippet</span>
        </div>
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center border rounded-md overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`px-2 py-1 text-xs flex items-center gap-1 transition-colors ${
                viewMode === 'edit' ? 'bg-background' : 'bg-transparent'
              }`}
            >
              <Edit className="h-3 w-3" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-2 py-1 text-xs flex items-center gap-1 transition-colors ${
                viewMode === 'preview' ? 'bg-background' : 'bg-transparent'
              }`}
            >
              <Eye className="h-3 w-3" />
              Preview
            </button>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => {
              setCode('');
              onToggle();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Language selector */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium">Language:</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as CodeLanguage)}
          className="flex-1 h-8 text-sm rounded-md border border-input bg-background px-2 py-1.5 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      {/* Code Input/Preview */}
      {viewMode === 'edit' ? (
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="// Type or paste your code here..."
          className="w-full min-h-[200px] p-3 bg-[#1e1e1e] text-sm font-mono text-foreground rounded-md border focus:outline-none focus:ring-2 focus:ring-ring resize-y"
          spellCheck={false}
          rows={8}
        />
      ) : (
        <CodePreview
          code={code}
          language={language}
          showLanguageSelector={false}
          showCopyButton={true}
          editable={false}
          placeholder="// Type your code here to see the preview..."
        />
      )}

      {/* Live preview hint */}
      {viewMode === 'edit' && (
        <p className="text-xs text-muted-foreground">
          💡 Toggle to "Preview" tab to see your code with syntax highlighting
        </p>
      )}

      {/* Submit button */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setCode('');
            setViewMode('edit');
            onToggle();
          }}
        >
          Cancel
        </Button>
        <Button size="sm" onClick={handleSubmit} disabled={!code.trim()}>
          Add Code
        </Button>
      </div>
    </div>
  );
}
