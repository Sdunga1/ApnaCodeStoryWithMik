# Migration Guide: Vite to Next.js

## Overview

This project has been migrated from Vite + React to Next.js 14 with App Router.

## Key Changes

### Project Structure

**Before (Vite)**:
- Entry point: `src/main.tsx`
- Routing: State-based
- Build tool: Vite

**After (Next.js)**:
- Entry point: `src/app/page.tsx`
- Routing: File-based (App Router)
- Build tool: Next.js

### Component Updates

All components using React hooks now include the `'use client'` directive at the top of the file. This is required for Next.js App Router when using client-side features.

### Configuration Files

**New Files**:
- `next.config.js` - Next.js configuration
- `src/app/layout.tsx` - Root layout wrapper
- `src/app/page.tsx` - Main application page

**Updated Files**:
- `package.json` - Dependencies changed from Vite to Next.js
- `tsconfig.json` - Updated for Next.js
- `tailwind.config.js` - Updated paths for Next.js

**Removed Files**:
- `vite.config.ts` - No longer needed
- `index.html` - Next.js generates this automatically
- `src/main.tsx` - Replaced by App Router
- `src/App.tsx` - Logic moved to `src/app/page.tsx`

### Image Handling

Images moved from `src/assets/` to `public/` directory and updated to use Next.js Image component for optimization.

### Dependencies

Key additions:
- `next` - Next.js framework
- `@types/react` - React type definitions
- `@types/react-dom` - React DOM type definitions

Removed:
- `vite` - Vite bundler
- `@vitejs/plugin-react-swc` - Vite React plugin

## Running the Application

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## Benefits of Migration

1. **SEO Optimization** - Better search engine visibility
2. **Image Optimization** - Automatic image optimization
3. **Performance** - Improved loading times
4. **Deployment** - Simplified deployment process
5. **Scalability** - Ready for API routes and server components

## Breaking Changes

None. All existing features and functionality have been preserved.

## Notes

The application maintains complete feature parity with the previous Vite version while gaining the benefits of Next.js infrastructure.
