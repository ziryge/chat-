'use client';

import { useState } from 'react';
import { Play, RotateCcw, Copy, Check, Settings, Download, Upload, Code2, Terminal } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { CodePreview, CodeLanguage } from '@/components/code-preview';

const LANGUAGES: CodeLanguage[] = [
  'javascript', 'typescript', 'python', 'rust', 'go', 'java', 'c++', 'php', 'ruby', 'go'
];

const DEFAULT_CODE = {
  javascript: `// JavaScript Example
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log('Fibonacci(10):', fibonacci(10));`,
  typescript: `// TypeScript Example
interface User {
  id: number;
  name: string;
  email: string;
}

function greetUser(user: User): string {
  return \`Hello, \${user.name}!\`;
}

const user: User = { id: 1, name: 'John', email: 'john@example.com' };
console.log(greetUser(user));`,
  python: `# Python Example
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

if __name__ == "__main__":
    print(f"Fibonacci(10): {fibonacci(10)}")`,
  rust: `// Rust Example
fn fibonacci(n: u64) -> u64 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

fn main() {
    println!("Fibonacci(10): {}", fibonacci(10));
}`,
  go: `// Go Example
package main

import "fmt"

func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}

func main() {
    fmt.Printf("Fibonacci(10): %d\\n", fibonacci(10))
}`,
  java: `// Java Example
public class Main {
    public static int fibonacci(int n) {
        if (n <= 1) {
            return n;
        }
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
    
    public static void main(String[] args) {
        System.out.println("Fibonacci(10): " + fibonacci(10));
    }
}`,
};

interface CodePlaygroundProps {
  language?: CodeLanguage;
  code?: string;
  readOnly?: boolean;
  onCodeChange?: (code: string) => void;
  showOutputPanel?: boolean;
}

export function CodePlayground({
  language = 'javascript',
  code: initialCode,
  readOnly = false,
  onCodeChange,
  showOutputPanel = true,
}: CodePlaygroundProps) {
  const [currentLanguage, setCurrentLanguage] = useState<CodeLanguage>(language);
  const [code, setCode] = useState(initialCode || DEFAULT_CODE[language]);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLanguageChange = (lang: CodeLanguage) => {
    setCurrentLanguage(lang);
    setCode(DEFAULT_CODE[lang] || '');
    setOutput('');
    onCodeChange?.(DEFAULT_CODE[lang] || '');
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const handleRun = async () => {
    if (readOnly) return;
    
    setIsRunning(true);
    setOutput('Running...');

    // Simulate code execution
    setTimeout(() => {
      try {
        // This is a simplified runner
        // In production, you'd use a sandboxed environment
        if (currentLanguage === 'javascript' || currentLanguage === 'typescript') {
          const logOutput: string[] = [];
          const originalLog = console.log;
          
          console.log = (...args: any[]) => {
            logOutput.push(args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' '));
          };

          // Safe evaluation (not for production!)
          // In production, use Web Worker or server-side execution
          const result = eval(code);
          
          console.log = originalLog;
          
          if (logOutput.length > 0) {
            setOutput(logOutput.join('\n'));
          } else if (result !== undefined) {
            setOutput(String(result));
          } else {
            setOutput('Code executed successfully (no output)');
          }
        } else {
          setOutput(`⚠️ Execution for ${currentLanguage} is not supported in this browser-based playground.\n\nFor a full-featured code playground, integrate with services like:\n- CodeSandbox\n- StackBlitz\n- Repl.it\n- JDoodle\n- Paiza\n- Compiler Explorer`);
        }
      } catch (error) {
        setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsRunning(false);
      }
    }, 500);
  };

  const handleReset = () => {
    const defaultCode = DEFAULT_CODE[currentLanguage] || '';
    setCode(defaultCode);
    setOutput('');
    onCodeChange?.(defaultCode);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const extensions: Record<CodeLanguage, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      rust: 'rs',
      go: 'go',
      java: 'java',
      'c++': 'cpp',
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
    };

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${extensions[currentLanguage] || 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          Code Playground
        </CardTitle>
        <div className="flex items-center gap-2">
          <select
            value={currentLanguage}
            onChange={(e) => handleLanguageChange(e.target.value as CodeLanguage)}
            className="h-8 text-sm rounded-md border border-input bg-background px-3 py-1"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          {!readOnly && (
            <>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleReset} title="Reset">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleDownload} title="Download">
                <Download className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CodePreview
          code={code}
          language={currentLanguage}
          showLanguageSelector={false}
          showCopyButton={false}
          editable={!readOnly}
          onCodeChange={handleCodeChange}
          onLanguageChange={handleLanguageChange}
          placeholder="// Start typing your code here..."
        />

        {!readOnly && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRun}
                disabled={isRunning}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                {isRunning ? 'Running...' : 'Run Code'}
              </Button>
              <Button variant="outline" onClick={handleCopy} className="gap-2">
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            {showOutputPanel && output && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOutput('')}
              >
                Clear Output
              </Button>
            )}
          </div>
        )}

        {showOutputPanel && output && (
          <div className="rounded-lg border bg-[#1e1e1e] p-4">
            <div className="flex items-center gap-2 mb-2 border-b border-[#333] pb-2">
              <Terminal className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Output</span>
            </div>
            <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">
              {output}
            </pre>
          </div>
        )}

        {!readOnly && (
          <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
            <p className="font-medium mb-1">💡 Pro Tips:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Type directly in the editor above - syntax highlighting updates in real-time</li>
              <li>Supports JavaScript/TypeScript execution in the browser</li>
              <li>For other languages, copy code and run in your local environment</li>
              <li>Download your code to save it locally</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
