# 🚀 Free Deployment Guide for CareerAI

## Prerequisites
- GitHub account (free)
- Supabase account (free tier - https://supabase.com)
- Vercel account (free tier - https://vercel.com)

---

## 📋 Step-by-Step Deployment

### 1. Setup Supabase (Backend & Database)

#### A. Create Supabase Project
1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Choose organization and set:
   - **Project name**: careerai
   - **Database password**: (save this securely)
   - **Region**: Choose closest to your users
4. Wait for project creation (~2 minutes)

#### B. Get Supabase Credentials
1. In your project dashboard, go to **Settings > API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **Project ID** (in URL or Settings > General)

#### C. Setup Database Schema
1. Go to **SQL Editor** in Supabase dashboard
2. Click "New Query"
3. Copy contents from `supabase/migrations/20250101000000_initial_schema.sql`
4. Paste and click "Run"
5. Verify tables created in **Table Editor**

#### D. Deploy Edge Functions
1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-id
   ```

4. Deploy functions:
   ```bash
   supabase functions deploy analyze-resume
   supabase functions deploy optimize-resume
   supabase functions deploy generate-interview-questions
   supabase functions deploy analyze-interview-response
   ```

#### E. Enable Email Auth
1. Go to **Authentication > Providers**
2. Enable **Email** provider
3. Disable email confirmations (for easier testing):
   - Go to **Authentication > URL Configuration**
   - Set **Site URL** to `http://localhost:3000` (update after Vercel deployment)

---

### 2. Setup GitHub Repository

#### A. Push Code to GitHub
```bash
# Initialize git (if not already done)
git init

# Add files
git add .

# Commit
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/careerai.git
git branch -M main
git push -u origin main
```

#### B. Add GitHub Secrets
1. Go to your GitHub repository
2. Navigate to **Settings > Secrets and variables > Actions**
3. Click "New repository secret" and add:
   - `SUPABASE_PROJECT_REF`: Your project ID
   - `SUPABASE_ACCESS_TOKEN`: From Supabase dashboard > Settings > API > Generate new token
   - `VITE_SUPABASE_URL`: Your project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: Your anon key
   - `VERCEL_TOKEN`: (will add after Vercel setup)

---

### 3. Setup Vercel (Frontend Hosting)

#### A. Create Vercel Project
1. Go to https://vercel.com and sign up/login with GitHub
2. Click "Add New..." > "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### B. Add Environment Variables
In Vercel project settings:
1. Go to **Settings > Environment Variables**
2. Add these variables (for Production, Preview, Development):
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   VITE_SUPABASE_PROJECT_ID=your-project-id
   ```

#### C. Get Vercel Token
1. Go to **Settings > Tokens**
2. Create new token (select appropriate scope)
3. Copy token and add to GitHub Secrets as `VERCEL_TOKEN`

#### D. Deploy
1. Click "Deploy" in Vercel
2. Wait for build to complete
3. Visit your live site: `https://your-app.vercel.app`

---

### 4. Update Supabase Auth Settings

1. In Supabase dashboard, go to **Authentication > URL Configuration**
2. Update **Site URL** to your Vercel URL: `https://your-app.vercel.app`
3. Add Vercel URL to **Redirect URLs**

---

### 5. Enable CI/CD

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically:
- Deploy Supabase functions on push to main
- Build and deploy frontend to Vercel
- Run linting and build tests

**Trigger deployment**: Push to main branch
```bash
git add .
git commit -m "Update feature"
git push origin main
```

---

## 🎉 Verification Checklist

- [ ] Supabase project created with correct region
- [ ] Database schema deployed successfully
- [ ] All 4 edge functions deployed
- [ ] GitHub repository created and pushed
- [ ] GitHub secrets configured
- [ ] Vercel project created and connected
- [ ] Environment variables set in Vercel
- [ ] Frontend deployed and accessible
- [ ] Can sign up new user
- [ ] Can login with existing user
- [ ] Resume builder loads correctly
- [ ] Mock interview generates questions
- [ ] CI/CD pipeline runs successfully

---

## 💰 Cost Breakdown (Monthly)

| Service | Free Tier Limits | Cost |
|---------|------------------|------|
| **Supabase** | 500MB database, 2GB bandwidth, 50k monthly active users | $0 |
| **Vercel** | 100GB bandwidth, unlimited deploys | $0 |
| **GitHub Actions** | 2000 minutes/month | $0 |
| **Total** | | **$0** |

---

## 🔧 Troubleshooting

### Build Fails on Vercel
- Check environment variables are set correctly
- Ensure `VITE_` prefix on all env vars
- Check build logs for specific errors

### Supabase Functions Not Working
- Verify functions are deployed: `supabase functions list`
- Check function logs in Supabase dashboard
- Ensure JWT verification is working (user is authenticated)

### Database Connection Issues
- Verify RLS policies are created
- Check user authentication status
- Review Supabase logs in dashboard

### CI/CD Pipeline Fails
- Verify all GitHub secrets are set
- Check Actions logs for specific errors
- Ensure Supabase CLI is properly configured

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Documentation](https://vitejs.dev/)

---

## 🆘 Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Review logs in Vercel/Supabase dashboards
3. Check GitHub Actions logs
4. Open an issue on GitHub repository

---

## 🔄 Updates and Maintenance

### Updating Edge Functions
```bash
supabase functions deploy function-name --project-ref your-project-id
```

### Updating Frontend
Simply push to main branch - CI/CD will handle deployment

### Database Migrations
1. Create new migration file in `supabase/migrations/`
2. Run: `supabase db push`

---

## 🎯 Next Steps

1. **Custom Domain**: Add custom domain in Vercel (free with their DNS)
2. **Analytics**: Add Vercel Analytics (free tier available)
3. **Monitoring**: Setup Supabase logging and monitoring
4. **Performance**: Enable Vercel Edge Functions if needed
5. **SEO**: Add meta tags and sitemap

Happy Deploying! 🚀