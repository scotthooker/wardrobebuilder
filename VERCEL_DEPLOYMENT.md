# Vercel Deployment Guide

This guide walks you through deploying the Wardrobe Builder to Vercel with serverless functions.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **PostgreSQL Database**: You'll need an external PostgreSQL database (recommended: Neon.tech free tier)
3. **OpenRouter API Key**: Get from [openrouter.ai/keys](https://openrouter.ai/keys)

## Step 1: Set Up PostgreSQL Database (Neon.tech)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string (looks like: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb`)
4. Run the database initialization:

```bash
# Connect to your Neon database and run the schema
psql "YOUR_NEON_CONNECTION_STRING" -f server/init.sql

# Import materials data
# Update .env with your Neon DATABASE_URL first
node server/importMaterials.js
```

## Step 2: Connect GitHub to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your GitHub repository: `scotthooker/wardrobebuilder`
4. Vercel will auto-detect the framework (Vite)

## Step 3: Configure Environment Variables

In Vercel project settings, add these environment variables:

### Required Variables

```
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb
OPENROUTER_API_KEY=sk-or-v1-your-key-here
NODE_ENV=production
```

### Optional Variables

```
VITE_API_URL=/api
```

**Important**: Vercel automatically makes `VITE_*` variables available to the frontend build.

## Step 4: Configure Build Settings

Vercel should auto-detect these settings, but verify:

- **Framework Preset**: Vite
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Step 5: Deploy

1. Click "Deploy" in Vercel dashboard
2. Wait for the build to complete (2-3 minutes)
3. Your app will be live at: `https://your-project.vercel.app`

## Post-Deployment

### Test the API

```bash
# Check health endpoint
curl https://your-project.vercel.app/api/health

# Test materials endpoint
curl https://your-project.vercel.app/api/materials/sheet-goods
```

### Upload Existing Images

The AI-generated images in `public/generated_images/` will be deployed with the static build. No additional setup needed.

### Generate New Images

New images generated through the app will be:
1. Saved to Vercel's `/tmp` directory (temporary)
2. **Limitation**: Vercel serverless functions have a 250MB deployment size limit
3. **Recommendation**: Use external storage (Cloudinary, AWS S3) for production

## Architecture on Vercel

```
Vercel Deployment:
├── Static Frontend (Vite build)
│   └── Served from CDN
├── API Routes (Serverless Functions)
│   ├── /api/health
│   ├── /api/materials/sheet-goods
│   ├── /api/builds
│   ├── /api/generate-prompt
│   └── /api/generate-image
└── External Services
    ├── Neon PostgreSQL (database)
    └── OpenRouter API (AI image generation)
```

## Known Limitations

1. **Image Storage**: Generated images stored in `/tmp` are ephemeral (deleted after function execution)
2. **Cold Starts**: Serverless functions may have 1-2 second cold start delay
3. **Execution Time**: Maximum 10 seconds per serverless function (60s on Pro plan)
4. **File Size**: 250MB deployment size limit

## Recommended Improvements for Production

### 1. External Image Storage

Use Cloudinary or AWS S3 for persistent image storage:

```bash
npm install cloudinary
```

Update `server/imageGeneration.js`:

```javascript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload to Cloudinary instead of local filesystem
const uploadResult = await cloudinary.uploader.upload(base64Image, {
  folder: 'wardrobe-builds',
  public_id: `build_${buildId}_${timestamp}`
});
```

### 2. Database Connection Pooling

For better performance, use connection pooling:

```bash
npm install @neondatabase/serverless
```

Update `server/db.js`:

```javascript
import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
```

### 3. Environment-Specific Configuration

Update `.env.example`:

```env
# Production (Vercel)
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb
OPENROUTER_API_KEY=sk-or-v1-your-key-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=production
```

## Troubleshooting

### Build Fails

```bash
# Check build logs in Vercel dashboard
# Common issues:
# - Missing environment variables
# - Package installation errors
# - Build timeout (increase in project settings)
```

### Database Connection Errors

```bash
# Verify DATABASE_URL is correct
# Check Neon database is active
# Ensure IP allowlist includes Vercel IPs (Neon allows all by default)
```

### API Returns 500 Errors

```bash
# Check Vercel function logs
# Verify all environment variables are set
# Test database connection manually
```

### Images Not Loading

```bash
# Static images in public/ should work
# Generated images need external storage (see recommendations above)
```

## Monitoring

### View Logs

1. Go to Vercel Dashboard > Your Project
2. Click "Functions" tab
3. Select a function to view logs
4. Real-time logging available

### Performance

- Monitor API response times in Vercel Analytics
- Check function execution duration
- Watch for cold start patterns

## Costs

### Free Tier Includes
- 100GB bandwidth
- 6000 build minutes
- 100GB-hours serverless function execution
- Unlimited static deployments

### Paid Plans
- Pro: $20/month (longer function timeouts, more bandwidth)
- Enterprise: Custom pricing

## Next Steps

1. **Custom Domain**: Add your domain in Vercel project settings
2. **Analytics**: Enable Vercel Analytics for performance insights
3. **Edge Functions**: Consider Edge Functions for lower latency
4. **Caching**: Add caching headers for static assets

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Neon Docs**: [neon.tech/docs](https://neon.tech/docs)
- **Issues**: [github.com/scotthooker/wardrobebuilder/issues](https://github.com/scotthooker/wardrobebuilder/issues)
