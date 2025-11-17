# codestorywithMIK DSA Platform

A modern web application for tracking Data Structures and Algorithms learning progress, built with Next.js.

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: Shadcn UI, Radix UI
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Application will be available at `http://localhost:3000`

### Build

```bash
npm run build
npm start
```

## Features

- Daily LeetCode problem tracking
- Progress statistics by difficulty level
- Problem categorization by data structure type
- Search and filter functionality
- Dark/Light theme support
- Responsive design

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Main page
│   ├── components/       # React components
│   ├── contexts/         # React context providers
│   └── styles/           # Global styles
└── public/               # Static assets
```

## Deployment

This application can be deployed on Vercel, Netlify, or any platform supporting Next.js.

For Vercel:
1. Push code to GitHub
2. Import repository in Vercel
3. Deploy

## License

MIT License

## Author

codestorywithMIK
