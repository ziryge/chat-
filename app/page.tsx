'use client';

import { useState, useEffect } from 'react';
import { Flame as FlameIcon } from 'lucide-react';
import { PostCard } from '@/components/post-card';
import { Toolbar } from '@/component/toolbar';
import { Sidebar } from '@/components/sidebar';
import { Post } from '@/lib/types';

export default function Home() {
  const [activeSort, setActiveSort] = useState('newest');
  const [activeCategory, setActiveCategory] = useState('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [activeSort, activeCategory]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const url = `/api/posts?sort=${activeSort}&category=${activeCategory}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="max-w-3xl mx-auto">
          {/* Hero Section */}
          <div className="p-6 bg-muted/30 border-b">
            <div className="flex items-center gap-2 mb-2">
              <FlameIcon className="h-5 w-5" />
              <span className="text-sm font-medium text-muted-foreground">Trending Now</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome to Devsquare
            </h1>
            <p className="text-muted-foreground">
              Where developers share knowledge, code, and connect. Join the community today!
            </p>
          </div>

          {/* Toolbar */}
          <Toolbar
            activeSort={activeSort}
            activeCategory={activeCategory}
            onSortChange={setActiveSort}
            onCategoryChange={setActiveCategory}
          />

          {/* Post Feed */}
          <div className="p-4 space-y-3">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {activeCategory === 'all' 
                    ? "No posts yet. Be the first to create one!" 
                    : `No posts in ${activeCategory} category`}
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard key={post.id} post={post} variant="compact" />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - For Additional Info */}
      <aside className="hidden xl:block w-80 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto border-l bg-background">
        <div className="p-4">
          <div className="text-sm text-muted-foreground">
            Welcome to the community. Browse posts, engage in discussions, and share your knowledge.
          </div>
        </div>
      </aside>
    </div>
  );
}
