'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Filter, Clock, TrendingUp, BookOpen, Code, MessageSquare, Briefcase, Tag, Flame } from 'lucide-react';
import { Button } from '@/ui/button';

const sortOptions = [
  { id: 'newest', label: 'Newest', icon: Clock },
  { id: 'oldest', label: 'Oldest', icon: Clock },
  { id: 'popular', label: 'Popular', icon: TrendingUp },
];

const categoryOptions = [
  { id: 'all', label: 'All', icon: Tag },
  { id: 'discussion', label: 'Discussion', icon: MessageSquare },
  { id: 'tutorial', label: 'Tutorial', icon: BookOpen },
  { id: 'showcase', label: 'Showcase', icon: Code },
  { id: 'question', label: 'Question', icon: MessageSquare },
  { id: 'help', label: 'Help', icon: Briefcase },
  { id: 'hiring', label: 'Hiring', icon: Briefcase },
  { id: 'opensource', label: 'Open Source', icon: Code },
];

interface ToolbarProps {
  activeSort?: string;
  activeCategory?: string;
  onSortChange?: (sort: string) => void;
  onCategoryChange?: (category: string) => void;
}

export function Toolbar({ activeSort = 'hot', activeCategory = 'all', onSortChange, onCategoryChange }: ToolbarProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="border-b bg-card/50 backdrop-blur sticky top-16 z-40">
      <div className="container max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Sort Options */}
          <div className="flex items-center gap-1">
            {sortOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.id}
                  variant={activeSort === option.id ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                  onClick={() => onSortChange?.(option.id)}
                >
                  <Icon className="h-4 w-4" />
                  {option.label}
                </Button>
              );
            })}
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>

            {showFilters && (
              <div className="flex items-center gap-1">
                {categoryOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.id}
                      variant={activeCategory === option.id ? 'secondary' : 'ghost'}
                      size="sm"
                      className="gap-2"
                      onClick={() => onCategoryChange?.(option.id)}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden md:inline">{option.label}</span>
                    </Button>
                  );
                })}
              </div>
            )}

            {/* Tech Tags Dropdown */}
            <div className="relative group">
              <Button variant="ghost" size="sm" className="gap-2">
                <Tag className="h-4 w-4" />
                <span className="hidden sm:inline">Tech Stack</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
