# 🚀 Vercel Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free)
- OpenRouter API key

## Step 1: Push to GitHub

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Retro Anime Terminal"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/retro-anime-terminal.git

# Push to GitHub
git push -u origin main
```

## Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com) and sign in**
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure project:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## Step 3: Set Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add these variables:

| Name | Value | Environment |
|------|-------|-------------|
| `OPENROUTER_API_KEY` | `sk-or-v1-...` | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |

## Step 4: Deploy

Click **Deploy** and wait for the build to complete.

## Step 5: Add Your QR Code (Optional)

1. Replace `public/donation-qr.png` with your actual QR code image
2. Commit and push the changes
3. Vercel will automatically redeploy

## Troubleshooting

### Build Errors
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify environment variables are set correctly

### API Errors
- Check function logs in Vercel dashboard
- Verify OpenRouter API key is valid
- Check function timeout (set to 30s in vercel.json)

### 404 Errors
- Ensure `vercel.json` rewrites are configured correctly
- Check that API endpoints match the file structure

## Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS records as instructed

## Performance Tips

- The app uses code splitting for optimal loading
- Static assets are cached automatically
- API functions are serverless and scale automatically

Your retro anime terminal is now live! 🎌✨
