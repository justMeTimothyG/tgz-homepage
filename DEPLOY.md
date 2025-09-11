# Coolify Deployment Guide

This guide will help you deploy your Next.js 15 personal website to production using Coolify.

## 📋 Prerequisites

- Coolify instance running on your server
- Git repository access from Coolify server
- Domain name configured (optional but recommended)

## 🏗️ Architecture Decision: Database Setup

You have **two options** for PostgreSQL in Coolify:

### Option A: Separate PostgreSQL Resource (Recommended)
**✅ Pros:**
- Better resource isolation
- Independent scaling and backups
- Easier database management and monitoring
- Can be shared across multiple applications
- Better security isolation

**❌ Cons:**
- Requires managing two separate services
- Need to configure network connectivity

### Option B: Docker Compose with Embedded PostgreSQL
**✅ Pros:**
- Single service deployment
- Simplified setup
- Everything in one place

**❌ Cons:**
- Coupled application and database lifecycle
- Harder to backup/restore database independently
- Less flexible scaling options

**Recommendation:** Use **Option A** for production deployments.

---

## 🚀 Deployment Steps

### 1. Prepare Your Repository

Ensure these files are in your repository root:
- ✅ `Dockerfile` (created)
- ✅ `.dockerignore` (created) 
- ✅ `docker-compose.yml` (existing)
- ✅ Database migrations in `/drizzle/` (existing)

### 2. Option A: Deploy with Separate PostgreSQL Resource

#### Step 2A.1: Create PostgreSQL Database Resource

1. In Coolify dashboard, click **"+ New Resource"**
2. Select **"Database"** → **"PostgreSQL"**
3. Configure the database:
   ```
   Name: tgz-lol-postgres
   Version: 16
   Database Name: tgz_lol
   Username: postgres  
   Password: [generate secure password]
   Port: 5432
   ```
4. Click **"Deploy"**
5. **Note the internal connection URL** (will be something like `postgresql://postgres:password@tgz-lol-postgres:5432/tgz_lol`)

#### Step 2A.2: Deploy Next.js Application

1. Click **"+ New Resource"** → **"Application"**
2. Connect your Git repository
3. Set **Build Pack** to **"Docker"**
4. Configure **Environment Variables**:
   ```env
   DATABASE_URL=postgresql://postgres:[PASSWORD]@tgz-lol-postgres:5432/tgz_lol
   BETTER_AUTH_SECRET=[generate-32-char-random-string]
   BETTER_AUTH_URL=https://yourdomain.com
   NODE_ENV=production
   NEXT_TELEMETRY_DISABLED=1
   ```
5. Set **Port** to `3000`
6. **Advanced Settings**:
   - Health Check Path: `/api/health` (you might want to create this endpoint)
   - Build Command: `npm run build`
   - Start Command: `node server.js`

#### Step 2A.3: Run Database Migrations

After deployment, run migrations:
1. Go to your application in Coolify
2. Open **"Terminal"** or use **"Execute Command"**
3. Run: `npm run drizzle:migrate`

### 3. Option B: Deploy with Docker Compose

#### Step 3.1: Update docker-compose.yml for Production

Create a production docker-compose.yml:

```yaml
version: '3.8'

services:
  app:
    build: .
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - BETTER_AUTH_URL=${BETTER_AUTH_URL}
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "3000:3000"
    networks:
      - app-network

  postgres:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB:-tgz_lol}
    volumes:
      - pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-tgz_lol}"]
      interval: 5s
      timeout: 5s
      retries: 10
    networks:
      - app-network

volumes:
  pg_data:

networks:
  app-network:
    driver: bridge
```

#### Step 3.2: Deploy with Docker Compose

1. In Coolify: **"+ New Resource"** → **"Application"**
2. Connect your Git repository
3. Set **Build Pack** to **"Docker Compose"**
4. Configure **Environment Variables**:
   ```env
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=[secure-password]
   POSTGRES_DB=tgz_lol
   BETTER_AUTH_SECRET=[generate-32-char-random-string]
   BETTER_AUTH_URL=https://yourdomain.com
   ```
5. Set **Port** to `3000`

---

## 🔧 Configuration Details

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `BETTER_AUTH_SECRET` | Secret for auth sessions (32+ chars) | `your-super-secret-key-32-characters-long` |
| `BETTER_AUTH_URL` | Your application URL | `https://yourdomain.com` |
| `NODE_ENV` | Node environment | `production` |
| `NEXT_TELEMETRY_DISABLED` | Disable Next.js telemetry | `1` |

### Generating Secure Secrets

```bash
# Generate BETTER_AUTH_SECRET (32 characters)
openssl rand -hex 16

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

## 📊 Post-Deployment Checklist

### 1. Verify Database Connection
- [ ] Application starts without database errors
- [ ] Database migrations completed successfully
- [ ] Database contains expected tables

### 2. Check Application Health
- [ ] Homepage loads correctly
- [ ] Admin routes work (`/admin`)
- [ ] API endpoints respond (`/api/posts`)
- [ ] Authentication flow works

### 3. Performance Verification
- [ ] Build completed successfully
- [ ] Static assets loading
- [ ] No console errors in browser
- [ ] Reasonable loading times

### 4. Security Check
- [ ] HTTPS configured (if using custom domain)
- [ ] Environment variables not exposed
- [ ] Admin authentication working
- [ ] Database not publicly accessible

## 🐛 Troubleshooting

### Common Issues

#### Build Fails
- **Issue**: npm install fails
- **Solution**: Check Node.js version, ensure package.json is committed

#### Database Connection Errors
- **Issue**: `ECONNREFUSED` or timeout errors
- **Solutions**:
  - Verify `DATABASE_URL` format
  - Check if PostgreSQL service is running
  - Ensure network connectivity between services

#### Authentication Not Working
- **Issue**: Auth redirects fail
- **Solutions**:
  - Verify `BETTER_AUTH_URL` matches your domain
  - Check `BETTER_AUTH_SECRET` is set correctly
  - Ensure HTTPS for production domains

#### Migration Errors
- **Issue**: Migrations fail to run
- **Solutions**:
  ```bash
  # Connect to your application container
  npm run drizzle:generate  # If schema changed
  npm run drizzle:migrate   # Apply migrations
  ```

### Logs and Debugging

Access logs in Coolify:
1. Go to your application → **"Logs"**
2. Check both **Application** and **Build** logs
3. For database issues, check PostgreSQL resource logs

## 🔄 Updates and Maintenance

### Deploying Updates
1. Push changes to your Git repository
2. Coolify will automatically trigger deployment
3. Monitor logs for any issues
4. Run new migrations if database schema changed

### Database Backups
For **Option A** (separate PostgreSQL):
- Use Coolify's built-in backup features
- Access via **Database Resource** → **"Backups"**

For **Option B** (Docker Compose):
- Set up manual backup scripts
- Consider using pg_dump in scheduled tasks

## 📈 Scaling Considerations

### Horizontal Scaling
- Database should be separate (Option A) for multiple app instances
- Consider Redis for session storage if scaling beyond single instance
- Use CDN for static assets

### Performance Optimization
- Enable Next.js compression
- Configure proper caching headers
- Consider implementing health check endpoint at `/api/health`

---

## 🎯 Next Steps

After successful deployment:
1. **Configure Domain**: Set up your custom domain in Coolify
2. **SSL Certificate**: Enable automatic SSL via Let's Encrypt
3. **Monitoring**: Set up uptime monitoring and alerts
4. **Backups**: Configure automated database backups
5. **Analytics**: Consider adding privacy-focused analytics (Plausible)

---

**Questions or Issues?** 
- Check Coolify logs first
- Verify all environment variables are set correctly  
- Ensure database migrations completed successfully