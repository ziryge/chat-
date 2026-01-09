import { CodePlayground } from '@/components/code-playground';

export default function CodePlaygroundPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Code Playground</h1>
          <p className="text-muted-foreground">
            Write, test, and share your code snippets with real-time syntax highlighting
          </p>
        </div>
        
        <CodePlayground showOutputPanel={true} />
      </div>
    </div>
  );
}
