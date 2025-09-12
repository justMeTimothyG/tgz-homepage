# Coolify Deployment Guide

This guide will help you deploy your static Next.js 15 personal website to production using Coolify.

## 📋 Prerequisites

- Coolify instance running on your server  
- Git repository access from Coolify server
- Domain name configured (optional but recommended)

## 🚀 Quick Start

Since this is now a **static site** (no database required), deployment is straightforward:

### 1. Create New Resource in Coolify

1. **Add new resource** → **Application** → **Docker Compose**
2. **Connect Git repository**: Select your repository
3. **Branch**: `main` (or your preferred branch)
4. **Docker Compose file**: Use the existing `Dockerfile` (no docker-compose.yml needed)

### 2. Configuration

#### Environment Variables

The static site requires minimal environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Runtime environment | `production` |
| `NEXT_TELEMETRY_DISABLED` | Disable Next.js telemetry | `1` |

#### Port Configuration

- **Internal Port**: `3000` (defined in Dockerfile)
- **External Port**: Auto-assigned by Coolify or custom

### 3. Deploy

1. **Save configuration**
2. **Click "Deploy"** 
3. **Monitor build logs** for any issues

## 📁 Content Management

### Adding New Blog Posts

Since the blog uses file-based content:

1. **Create new MDX file** in `/content/blog/`
2. **Add frontmatter** with title, date, excerpt, tags, and `published: true`
3. **Commit and push** to your git repository
4. **Coolify auto-deploys** the new content

Example blog post structure:
```yaml
---
title: "My New Post"
date: "2025-01-12"
excerpt: "A brief description"
tags: ["nextjs", "blog"]
published: true
---

# Content goes here...
```

## ⚡ Performance Features

- **Static Site Generation (SSG)**: All pages pre-rendered at build time
- **No Database**: Eliminates database queries and connection overhead
- **Docker Multi-stage Build**: Optimized production image
- **Turbopack**: Fast development and build times

## 🔍 Troubleshooting

### Build Failures

1. **Check build logs** in Coolify interface
2. **Common issues**:
   - TypeScript errors: Run `npm run lint` locally first
   - Missing content: Ensure `/content/blog/` directory exists with valid MDX files
   - Build cache: Clear Coolify build cache if needed

### Runtime Issues

1. **Application not starting**:
   - Check if port 3000 is correctly configured
   - Verify Dockerfile `CMD` instruction

2. **404 errors**:
   - Check Next.js static file generation
   - Verify blog post frontmatter format

### Performance Optimization

1. **Enable Coolify caching** if available
2. **Monitor build times** - static builds should be fast
3. **Check bundle size** with `npm run build` locally

## 📊 Monitoring

### Health Checks

Coolify can monitor the application health:
- **Endpoint**: `/` (homepage)
- **Expected**: HTTP 200 status
- **Interval**: 30 seconds

### Build Optimization

- **Build time**: Should be under 2 minutes for static site
- **Image size**: Optimized with multi-stage Docker build
- **Incremental builds**: Next.js caches unchanged files

## 🔄 Updates & Maintenance

### Deploying Updates

1. **Push to main branch** - triggers automatic deployment
2. **Monitor deployment** in Coolify logs
3. **Verify live site** after deployment completes

### Content Updates

- **New blog posts**: Just add MDX files and push
- **Content changes**: Edit existing MDX files and push  
- **No database migrations** or schema changes needed

### Rollbacks

If needed, rollback through Coolify:
1. **Application settings** → **Deployments**
2. **Select previous successful deployment**
3. **Click "Redeploy"**

## 🎯 Production Checklist

- [ ] Domain properly configured
- [ ] SSL certificate working
- [ ] All blog posts display correctly
- [ ] Static assets loading (images, CSS, JS)
- [ ] Math expressions rendering (if using KaTeX)
- [ ] Dark mode toggle working
- [ ] Mobile responsiveness verified
- [ ] SEO meta tags present

## 🚨 Troubleshooting Commands

If you need to debug the production build locally:

```bash
# Test production build locally
npm run build
npm run start

# Check for build errors
npm run lint

# Verify content parsing
ls -la content/blog/
```

## 📈 Scaling Considerations

Since this is a static site:
- **High traffic**: Consider adding CDN (Cloudflare, etc.)
- **Multiple regions**: Deploy to multiple Coolify instances
- **Build optimization**: Ensure fast build times for frequent content updates

This simplified deployment eliminates the complexity of database management while maintaining all the essential features of your personal blog.