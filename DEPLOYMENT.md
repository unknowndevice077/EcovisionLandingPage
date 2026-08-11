# Vercel Deployment Guide

## Replacing Videos & Photos

Every media path lives in one place: `app/styles.ts` → the `ASSETS` object. To swap in
new footage or team photos:

1. Drop the file into `public/` (e.g. `public/TheftDetection.mp4`).
2. Point the matching `ASSETS` entry at it (e.g. `THEFT_FEED: "/TheftDetection.mp4"`).
3. Leave an entry as `""` to show the built-in "SETUP REQUIRED" placeholder instead of
   a broken video/image tag — nothing crashes if footage isn't ready yet.

You can also point an entry at a full `https://` URL (Vercel Blob, S3, Cloudinary, etc.)
instead of a local file — useful once videos are hosted externally.

**Keep videos web-sized.** Raw phone/camera exports (1080p120, ~100 Mbps) are 300MB+
each — GitHub hard-rejects any file over 100MB, and multi-hundred-MB assets will make
the build slow and the page unusable for visitors. Re-encode before dropping a video in:

```bash
ffmpeg -i input.mp4 -vf "scale=1280:-2,fps=30" -c:v libx264 -preset medium -crf 25 -an -movflags +faststart output.mp4
```

This targets 720p/30fps H.264 with audio stripped (the site's videos are always muted
background loops) — typically a few MB instead of hundreds. A poster image at the same
path with a `.jpg` extension (e.g. `AssaultDetected.jpg` next to `AssaultDetected.mp4`)
is shown while the video loads; grab one with:

```bash
ffmpeg -ss 2 -i output.mp4 -frames:v 1 -update 1 -q:v 4 output.jpg
```

## Quick Start

1. **Connect your repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js and configure it

2. **Environment Variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add `NEXT_PUBLIC_PYTHON_BACKEND_URL` pointing to your Python backend service
   - Example: `https://your-python-backend.onrender.com`

3. **Deploy**
   - Push changes to main branch or click "Deploy" in Vercel dashboard

## Python Backend Setup

Since Vercel is a Node.js hosting platform, your Python backend (`predict.py`) cannot run on Vercel's serverless functions directly. You have two options:

### Option 1: Host Python Backend Separately (Recommended)
Host your Python backend on a separate service:
- **Render** (Free tier available) - [render.com](https://render.com)
- **Railway** - [railway.app](https://railway.app)
- **Heroku** - [heroku.com](https://heroku.com)
- **AWS Lambda** with a handler wrapper

Then set `NEXT_PUBLIC_PYTHON_BACKEND_URL` to your hosted backend URL.

### Option 2: Use Vercel AI SDK or Edge Functions
Rewrite your Python logic in Node.js/TypeScript and use Vercel's serverless functions or Edge Runtime.

## Files Modified for Deployment

- `.vercelignore` - Excludes Python files from Vercel build
- `vercel.json` - Vercel configuration (auto-detected, this is optional)
- `.env.example` - Template for environment variables

## Troubleshooting

- **Python backend connection fails**: Ensure your backend URL is publicly accessible
- **Build fails**: Check that all dependencies in `package.json` are properly specified
- **Large file uploads fail**: Python backend may have request size limits

## Build Information

- **Framework**: Next.js 16.2.6
- **Runtime**: Node.js 20.x
- **Build Command**: `next build`
- **Start Command**: `next start` (Vercel handles this automatically)
