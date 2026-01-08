import { Post, User, Comment, Badge, TechTag, PostCategory } from './types';

export const mockBadges: Badge[] = [
  {
    id: '1',
    name: 'Code Ninja',
    icon: '🥷',
    description: 'Posted 50+ code snippets',
    awardedAt: new Date('2025-12-01'),
    level: 'gold'
  },
  {
    id: '2',
    name: 'Helpful Hero',
    icon: '🦸',
    description: 'Answered 100+ questions',
    awardedAt: new Date('2025-11-15'),
    level: 'platinum'
  },
  {
    id: '3',
    name: 'Bug Hunter',
    icon: '🐛',
    description: 'Found and fixed 20+ bugs',
    awardedAt: new Date('2025-10-20'),
    level: 'silver'
  }
];

export const techTags: TechTag[] = [
  { name: 'JavaScript', icon: '⚡', popularity: 95 },
  { name: 'TypeScript', icon: '📘', popularity: 92 },
  { name: 'React', icon: '⚛️', popularity: 88 },
  { name: 'Python', icon: '🐍', popularity: 85 },
  { name: 'Node.js', icon: '💚', popularity: 82 },
  { name: 'Next.js', icon: '▲', popularity: 78 },
  { name: 'Go', icon: '🔷', popularity: 65 },
  { name: 'Rust', icon: '🦀', popularity: 60 },
  { name: 'Vue', icon: '💚', popularity: 55 },
  { name: 'Docker', icon: '🐳', popularity: 72 },
];

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'devmaster',
    displayName: 'Dev Master',
    avatar: 'https://ui-avatars.com/api/?name=Dev+Master&background=8b5cf6&color=fff',
    bio: 'Full-stack developer with 10 years of experience. Love teaching and sharing knowledge.',
    reputation: 15000,
    badges: mockBadges,
    techStack: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python'],
    joinedAt: new Date('2023-01-15'),
    posts: 156,
    comments: 723
  },
  {
    id: '2',
    username: 'codewizard',
    displayName: 'Code Wizard',
    avatar: 'https://ui-avatars.com/api/?name=Code+Wizard&background=06b6d4&color=fff',
    bio: 'Open source enthusiast. Building the future, one commit at a time.',
    reputation: 12500,
    badges: [mockBadges[1]],
    techStack: ['TypeScript', 'React', 'Go', 'Docker'],
    joinedAt: new Date('2023-03-20'),
    posts: 98,
    comments: 456
  },
  {
    id: '3',
    username: 'ninjaCoder',
    displayName: 'Ninja Coder',
    avatar: 'https://ui-avatars.com/api/?name=Ninja+Coder&background=ec4899&color=fff',
    bio: 'Backend specialist. Database optimization is my jam.',
    reputation: 8900,
    badges: [mockBadges[2]],
    techStack: ['Python', 'Go', 'PostgreSQL', 'Redis'],
    joinedAt: new Date('2023-06-10'),
    posts: 67,
    comments: 234
  },
  {
    id: '4',
    username: 'byteRider',
    displayName: 'Byte Rider',
    avatar: 'https://ui-avatars.com/api/?name=Byte+Rider&background=f59e0b&color=fff',
    bio: 'Flutter developer and mobile enthusiast.',
    reputation: 7200,
    badges: [mockBadges[2]],
    techStack: ['Dart', 'Flutter', 'Firebase'],
    joinedAt: new Date('2023-08-05'),
    posts: 45,
    comments: 189
  },
];

export const mockComments: Comment[] = [
  {
    id: 'c1',
    author: mockUsers[1],
    content: 'Great explanation! I would also suggest looking into useTransition hook for better UX with large data sets.',
    votes: 24,
    createdAt: new Date('2026-01-06T10:30:00'),
    replies: [
      {
        id: 'c2',
        author: mockUsers[2],
        content: 'Thanks! The useTransition tip is gold. 👏',
        votes: 8,
        createdAt: new Date('2026-01-06T11:15:00'),
      }
    ]
  },
  {
    id: 'c3',
    author: mockUsers[3],
    content: 'This helped me solve a similar issue. Here\'s a simplified version I ended up with:',
    votes: 15,
    createdAt: new Date('2026-01-06T12:00:00'),
    codeSnippet: {
      language: 'javascript',
      code: `const optimizedFetch = async (urls) => {
  const results = await Promise.allSettled(
    urls.map(url => fetch(url).then(r => r.json()))
  );
  return results.filter(r => r.status === 'fulfilled').map(r => r.value);
};`
    }
  },
  {
    id: 'c4',
    author: mockUsers[0],
    content: 'Excellent solution! Consider adding error boundaries and retry logic.',
    votes: 31,
    createdAt: new Date('2026-01-06T14:20:00'),
  }
];

export const mockPosts: Post[] = [
  {
    id: '1',
    author: mockUsers[0],
    title: 'The Art of Optimizing React Performance: A Deep Dive',
    content: 'After years of building React applications, I\'ve compiled the most impactful performance optimizations. In this post, I\'ll share practical techniques that can significantly improve your app\'s performance.\n\nKey takeaways:\n\n1. **Memoization Done Right** - Learn when and how to use useMemo and useMemo effectively\n2. **Code Splitting Strategies** - Dynamic imports and route-based splitting\n3. **Virtual scrolling for Large Lists** - When to implement it yourself vs using libraries\n\nLet\'s start with memoization...',
    codeSnippet: {
      language: 'typescript',
      code: `import { memo, useMemo, useCallback } from 'react';

interface ExpensiveComponentProps {
  data: DataItem[];
  onItemClick: (id: string) => void;
}

// ✅ Good: Proper memoization
const OptimizedList = memo(function OptimizedList({ data, onItemClick }: ExpensiveComponentProps) {
  const sortedData = useMemo(
    () => [...data].sort((a, b) => a.value - b.value),
    [data]
  );

  const handleClick = useCallback(
    (id: string) => onItemClick(id),
    [onItemClick]
  );

  return (
    <ul>
      {sortedData.map(item => (
        <Item key={item.id} item={item} onClick={handleClick} />
      ))}
    </ul>
  );
});`
    },
    tags: ['React', '性能优化', 'TypeScript', '前端'],
    votes: 342,
    comments: mockComments,
    createdAt: new Date('2026-01-05T09:00:00'),
    updatedAt: new Date('2026-01-05T09:00:00'),
    category: 'tutorial'
  },
  {
    id: '2',
    author: mockUsers[1],
    title: 'Why I Switched from REST to GraphQL and Never Looked Back',
    content: 'GraphQL changed how I think about API design. The flexibility it provides is unmatched. Here\'s my journey from REST skeptic to GraphQL advocate.',
    tags: ['GraphQL', 'API设计', '后端', '架构'],
    votes: 218,
    comments: [mockComments[2]],
    createdAt: new Date('2026-01-05T14:30:00'),
    updatedAt: new Date('2026-01-05T14:30:00'),
    category: 'discussion'
  },
  {
    id: '3',
    author: mockUsers[2],
    title: 'Help: PostgreSQL Query Optimization for Large Dataset',
    content: 'I have a table with 50M+ records and a query that takes 12+ seconds. Need help optimizing this. I\'ve already added indexes but it\'s still slow.',
    codeSnippet: {
      language: 'sql',
      code: `SELECT u.id, u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.status = 'completed'
  AND o.created_at >= '2026-01-01'
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 10;`
    },
    tags: ['PostgreSQL', 'SQL优化', '数据库', '性能'],
    votes: 89,
    comments: [mockComments[0]],
    createdAt: new Date('2026-01-06T08:00:00'),
    updatedAt: new Date('2026-01-06T08:00:00'),
    category: 'help'
  },
  {
    id: '4',
    author: mockUsers[3],
    title: 'Showcase: Just Released My First Open Source Flutter App',
    content: 'After 6 months of work, I finally published my first open source Flutter project! It\'s a task management app with some unique features. Would love to get feedback from the community.',
    tags: ['Flutter', '开源', '移动开发', 'Dart'],
    votes: 156,
    comments: [],
    createdAt: new Date('2026-01-06T16:00:00'),
    updatedAt: new Date('2026-01-06T16:00:00'),
    category: 'showcase'
  },
  {
    id: '5',
    author: mockUsers[0],
    title: 'Rust vs Go: Which Should You Choose in 2026?',
    content: 'Both Rust and Go have their strengths. I\'ve used both extensively and here\'s my honest comparison based on real-world projects.',
    tags: ['Rust', 'Go', '后端', '语言对比'],
    votes: 267,
    comments: [mockComments[0], mockComments[1]],
    createdAt: new Date('2026-01-06T18:30:00'),
    updatedAt: new Date('2026-01-06T18:30:00'),
    category: 'discussion'
  },
  {
    id: '6',
    author: mockUsers[1],
    title: '[HIRING] Senior Full-Stack Engineer - Remote',
    content: 'We are looking for a senior full-stack engineer to join our growing team. Remote-first company with competitive salary and benefits.',
    tags: ['招聘', '远程工作', 'Full-Stack'],
    votes: 78,
    comments: [],
    createdAt: new Date('2026-01-07T09:00:00'),
    updatedAt: new Date('2026-01-07T09:00:00'),
    category: 'hiring'
  },
];
