# Devsquare 🎮

A developer-focused social media platform with real user authentication and persistent data storage.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css)

## ✨ Features

### Authentication & Persistence

- **User Registration**: Sign up with username only (no email required)
- **Secure Authentication**: SHA-256 password hashing with salt
- **Session Management**: Persistent login sessions stored server-side
- **Persistent Storage**: All data saved to JSON files

### Core Social Features

- **Create Posts**: Share content with categories (Discussion, Question, Showcase, Tutorial, Help, Hiring, Open Source)
- **Voting System**: Upvote/downvote posts and comments
- **Threaded Comments**: Add comments and replies to posts
- **Tags**: Add tags to posts for easy discovery
- **Code Snippets**: Include code with syntax highlighting support

### Developer-Focused Features

- **Code Syntax Highlighting** - Share and discuss code directly in posts
- **Developer Badges** - Earn exclusive badges (Code Ninja 🥷, Bug Hunter 🐛, Helpful Hero 🦸)
- **Reputation System** - Build reputation through quality contributions (ready for implementation)
- **Tech Stack Profiles** - Showcase your skills and technologies
- **Post Categories** - Tutorial, Question, Showcase, Help, Hiring, Discussion, Open Source

### UI/UX

- **Responsive Design** - Works on all devices
- **Dark Mode** - Beautiful dark theme by default
- **Real-time Updates** - Vote counts update immediately

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **Icons**: Lucide React
- **UI Components**: Custom shadcn/ui-inspired components
- **Code Highlighting**: React Syntax Highlighter

## 📦 Project Structure

```
chess/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles and theme
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── posts/[id]/        # Post detail pages
├── components/            # React components
│   ├── navigation.tsx     # Main navigation
│   ├── sidebar.tsx        # Left sidebar
│   ├── post-card.tsx      # Post card component
│   └── comment-section.tsx # Comments component
├── ui/                    # Reusable UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   └── avatar.tsx
├── lib/                   # Utility functions
│   ├── types.ts          # TypeScript interfaces
│   ├── utils.ts          # Helper functions
│   └── mock-data.ts      # Sample data
└── component/            # Toolbar component
    └── toolbar.tsx
```

## 🛠️ Installation

### Prerequisites

- Node.js 18+ (You have v22.13.1 installed ✓)
- npm (needs to be installed)
- A modern web browser

### Setup

1. **Install npm** (Since Node.js is installed but npm isn't):

```bash
# On Ubuntu/Debian
sudo apt-get install npm

# On Arch Linux
sudo pacman -S npm

# On Fedora
sudo dnf install npm

# Or using Node version manager
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts
```

2. **Install dependencies**:

```bash
npm install
```

3. **Run the development server**:

```bash
npm run dev
```

4. **Open your browser** and navigate to `http://localhost:3000`

## 🎨 Key Pages

### Home Page (`/`)
- Feed of posts with voting
- Filter by Hot, New, Top
- Filter by category
- Trending sidebar
- Community stats

### Post Detail (`/posts/[id]`)
- Full post content
- Code syntax highlighting
- Threaded comments
- Voting and actions

## 🧩 Unique Elements

### Developer Badges System
- **Code Ninja** 🥷 - Posted 50+ code snippets (Gold)
- **Helpful Hero** 🦸 - Answered 100+ questions (Platinum)
- **Bug Hunter** 🐛 - Found and fixed 20+ bugs (Silver)

### Post Categories
- 📚 **Tutorial** - In-depth guides and learning resources
- ❓ **Question** - Asking for help or advice
- 🎉 **Showcase** - Share your projects
- 💬 **Discussion** - General developer topics
- 🆘 **Help** - Urgent assistance needed
- 💼 **Hiring** - Job postings
- 🌟 **Open Source** - Share and discuss open-source projects

### Tech Stacks
JavaScript, TypeScript, React, Python, Node.js, Next.js, Go, Rust, Vue, Docker, and more!

## 🎯 Future Enhancements

- [ ] Real database backend (PostgreSQL/MySQL)
- [ ] User authentication (Auth.js, Clerk, or NextAuth)
- [ ] Real-time websocket updates
- [ ] Advanced search with filters
- [ ] Code execution in browser
- [ ] IDE-like code editor
- [ ] Mobile app (React Native)
- [ ] API for third-party integrations
- [ ] Notifications system
- [ ] User following and messaging

## 📝 Demo Data

The app currently uses mock data to demonstrate functionality:
- 6 sample posts with code snippets
- 4 developer profiles with badges
- Multiple comments and replies
- 10 popular tech stack tags

## 🌐 Deployment

Ready to deploy! Compatible with:
- Vercel (recommended)
- Netlify
- Railway
- Digital Ocean
- AWS Amplify

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Submit bugs and feature requests
- Create pull requests
- Share ideas and improvements
- Help write documentation

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🙏 Credits

Built with modern web technologies and inspired by the developer community's needs.

---

**Devsquare** - Where developers connect, learn, and grow together! 🚀
