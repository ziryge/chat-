import { CreatePost } from '@/components/post/create-post';
import { redirect } from 'next/navigation';

export default function NewPostPage() {
  // Check if user is authenticated on the server
  // For simplicity, we'll let the component handle the auth check
  
  return (
    <div className="min-h-screen bg-background p-4 pt-14">
      <div className="max-w-3xl mx-auto pt-2">
        <CreatePost />
      </div>
    </div>
  );
}
