# Production Environment Setup Guide

## Required Environment Variables for Production

To fix the authentication issues in production, you need to set the following environment variables in your Vercel dashboard:

### 1. NextAuth Configuration

```
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secure-secret-key
```

### 2. Database Connection

```
DATABASE_URL=your-production-database-url
```

### 3. Email Configuration (Required for Email Sign-in)

```
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

### 4. GitHub OAuth (Required for GitHub Sign-in)

```
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 5. Lightning Network (Optional)

```
LND_HOST=your-lnd-host
LND_MACAROON=your-lnd-macaroon
```

## Steps to Fix Production Issues:

1. **Go to your Vercel dashboard**
2. **Navigate to your project settings**
3. **Go to the "Environment Variables" section**
4. **Add/Update the following variables:**

### Critical Fixes:

- Set `NEXTAUTH_URL` to your actual production URL (e.g., `https://sovereign.vercel.app`)
- Ensure `DATABASE_URL` points to your production database
- Add all email configuration variables
- Add GitHub OAuth credentials

### Example Production URL:

If your app is deployed at `https://sovereign-kiwihodl.vercel.app`, then:

```
NEXTAUTH_URL=https://sovereign-kiwihodl.vercel.app
```

## Common Issues and Solutions:

### 1. 401 Error on Nostr Callback

- **Cause**: NEXTAUTH_URL mismatch
- **Solution**: Set NEXTAUTH_URL to your exact production domain

### 2. 500 Error on Content Fetching

- **Cause**: Database connection issues
- **Solution**: Ensure DATABASE_URL is correct and database is accessible

### 3. Email Sign-in Not Working

- **Cause**: Missing email configuration
- **Solution**: Add all EMAIL\_\* variables

### 4. GitHub Sign-in Not Working

- **Cause**: Missing GitHub OAuth credentials
- **Solution**: Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET

## After Setting Environment Variables:

1. **Redeploy your application** in Vercel
2. **Test authentication** with different providers
3. **Check the logs** in Vercel dashboard for any remaining errors

## Security Notes:

- Use a strong, unique NEXTAUTH_SECRET
- Never commit environment variables to git
- Use environment-specific values for production vs development
