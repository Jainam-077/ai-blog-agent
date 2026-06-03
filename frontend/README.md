# AI Blog Writing Agent

A production-ready AI SaaS dashboard for SEO blog generation, built with **Next.js 14**, **TypeScript**, and **Claude AI** (Anthropic).

---

## 🗂 Project Structure

```
ai-blog-writing-agent/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── generate/
│   │   │       └── route.ts          # Server-side Anthropic API route
│   │   ├── layout.tsx                # Root layout + metadata
│   │   └── page.tsx                  # Main dashboard page
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx           # Left history panel
│   │   │   └── Navbar.tsx            # Top navigation bar
│   │   ├── blog/
│   │   │   ├── BlogInput.tsx         # Topic input form
│   │   │   ├── BlogOutput.tsx        # Full output assembler
│   │   │   ├── BlogContent.tsx       # Editable blog body + typewriter
│   │   │   ├── TableOfContents.tsx   # TOC display
│   │   │   └── ExportPanel.tsx       # TXT / MD / HTML export
│   │   ├── seo/
│   │   │   └── SEOPanel.tsx          # Meta title, description, keywords
│   │   └── ui/
│   │       ├── Icons.tsx             # All SVG icons
│   │       └── SkeletonLoader.tsx    # Shimmer loading skeleton
│   │
│   ├── hooks/
│   │   ├── useTypewriter.ts          # Typewriter animation hook
│   │   └── useBlogHistory.ts         # History state management
│   │
│   ├── services/
│   │   └── blogService.ts            # Frontend API call layer
│   │
│   ├── lib/
│   │   ├── constants.ts              # System prompt, history seed, config
│   │   ├── parseMd.ts                # Markdown → HTML parser
│   │   └── exportUtils.ts            # TXT / MD / HTML export helpers
│   │
│   ├── types/
│   │   └── index.ts                  # TypeScript interfaces
│   │
│   └── styles/
│       └── globals.css               # Global CSS, design tokens, animations
│
├── public/                           # Static assets
├── .env.local.example                # Environment variable template
├── next.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Get your key at [console.anthropic.com](https://console.anthropic.com).

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🏗 Build for Production

```bash
npm run build
npm start
```

---

## ✅ Features (per PDF Checklist)

| Day | Feature | Status |
|-----|---------|--------|
| Day 3  | Next.js project structure          | ✅ |
| Day 4  | Clean component architecture        | ✅ |
| Day 5  | Blog topic input form + validation  | ✅ |
| Day 6  | Secure API route (server-side key)  | ✅ |
| Day 7  | Blog preview display                | ✅ |
| Day 8  | SEO metadata panel + keywords       | ✅ |
| Day 9  | Export: TXT, Markdown, HTML         | ✅ |
| Day 10 | Editable blog content area          | ✅ |
| Day 11 | Skeleton loader, smooth UX          | ✅ |
| Day 12 | Navbar, sidebar, icons, typography  | ✅ |
| Day 13 | Error handling + fallback UI        | ✅ |
| Day 14 | Production build ready              | ✅ |

---

## 🎨 Design

- **Heading font:** Playfair Display 900
- **Body font:** DM Sans 300/400/500/600
- **Colors:** Black `#0a0a0a`, White `#fff`, Background `#F7F7F5`
- **Style:** Minimal editorial SaaS dashboard

---

## 🔑 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **AI:** Anthropic Claude (claude-sonnet-4-20250514)
- **Styling:** CSS custom properties (no Tailwind)
- **Fonts:** Google Fonts (Playfair Display + DM Sans)
