# Vercel Deployment Guide

## Prerequisites
- Node.js 18+ installed
- Vercel account
- GitHub repository (recommended)

## Deployment Steps

### 1. Install Vercel CLI (optional)
```bash
npm i -g vercel
```

### 2. Build the project locally (to test)
```bash
npm run build:prod
```

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
vercel
```

#### Option B: Using Vercel Dashboard
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will automatically detect the Angular project
6. Click "Deploy"

## Configuration Files

### `vercel.json`
- Configures build settings for Angular SSR
- Routes all requests to the server
- Handles static assets properly

### `.vercelignore`
- Excludes unnecessary files from deployment
- Reduces build size and improves deployment speed

## Environment Variables
No environment variables are required for this portfolio project.

## Build Process
1. Vercel runs `npm install`
2. Builds the project with `npm run build:prod`
3. Deploys both server and static assets
4. Configures routing for SSR

## Post-Deployment
- Test all routes: `/`, `/projects`, `/contact`, `/about`
- Verify theme switching works
- Check admin panel functionality
- Test responsive design on mobile

## Troubleshooting

### Build Issues
- Ensure all dependencies are installed
- Check Angular version compatibility
- Verify TypeScript configuration

### Runtime Issues
- Check server logs in Vercel dashboard
- Verify SSR configuration
- Test routing configuration

### Performance
- Enable caching in Vercel dashboard
- Optimize images and assets
- Monitor build times

## Custom Domain (Optional)
1. Go to Vercel dashboard
2. Select your project
3. Go to "Domains" tab
4. Add your custom domain
5. Update DNS settings as instructed
