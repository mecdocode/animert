# Vercel Deployment Setup Guide

## Critical Steps to Fix Production Issues

### 1. Environment Variables Setup

**IMPORTANT**: You need to set up your OpenRouter API key in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variable:
   - **Name**: `OPENROUTER_API_KEY`
   - **Value**: Your actual OpenRouter API key (get it from https://openrouter.ai/)
   - **Environments**: Select Production, Preview, and Development

### 2. Get OpenRouter API Key

1. Visit https://openrouter.ai/
2. Sign up or log in
3. Go to your API Keys section
4. Create a new API key
5. Copy the key and add it to Vercel environment variables

### 3. Deploy the Fixed Code

After setting up the environment variables:

1. Commit and push your changes:
   ```bash
   git add .
   git commit -m "Fix API routing and error handling for production"
   git push
   ```

2. Vercel will automatically redeploy

### 4. Test the Deployment

1. Visit your deployed site
2. Try generating recommendations
3. The API should now work properly

## What Was Fixed

### API Route Issues (404/503 errors):
- ✅ Fixed `vercel.json` configuration for proper serverless function routing
- ✅ Added proper CORS headers and preflight handling
- ✅ Added environment variable validation
- ✅ Improved error handling with specific error types

### Donation Modal Issues:
- ✅ Added backdrop click to close modal
- ✅ Added Escape key support to close modal
- ✅ Improved accessibility with focus management
- ✅ Added proper event cleanup

### Frontend Error Handling:
- ✅ Added request timeout handling (45 seconds)
- ✅ Better error message parsing from API responses
- ✅ Specific error handling for different failure types
- ✅ Network error detection and user-friendly messages

## Troubleshooting

If you still get errors after deployment:

1. **Check Vercel Function Logs**:
   - Go to your Vercel dashboard
   - Click on your project
   - Go to "Functions" tab
   - Check the logs for any errors

2. **Verify Environment Variables**:
   - Ensure `OPENROUTER_API_KEY` is set correctly
   - Make sure it's enabled for Production environment

3. **Test API Endpoint Directly**:
   - Visit `https://your-app.vercel.app/api/recommendations` (GET request)
   - Should return a health check response

## API Endpoints

- **GET** `/api/recommendations` - Health check
- **POST** `/api/recommendations` - Get anime recommendations

## Support

If you continue to have issues, check:
1. Vercel function logs
2. Browser console for detailed error messages
3. Network tab to see the actual API responses
