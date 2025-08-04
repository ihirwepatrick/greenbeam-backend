# Supabase Setup Guide - Fix RLS Policy Issues

## The Problem

You're getting this error:
```
new row violates row-level security policy
```

This happens because Supabase has Row Level Security (RLS) enabled on the storage bucket, but no policies are configured to allow uploads.

## Solution Steps

### 1. Access Supabase Dashboard

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project

### 2. Create Storage Bucket

1. Go to **Storage** in the left sidebar
2. Click **Create a new bucket**
3. Enter bucket name: `greenbeam`
4. Set **Public bucket** to **ON** (this is important!)
5. Click **Create bucket**

### 3. Configure RLS Policies

#### Option A: Disable RLS (Recommended for Public Buckets)

1. Go to **Storage** → **Policies**
2. Find your `greenbeam` bucket
3. Click the toggle to **disable RLS** for this bucket
4. This allows public access to upload and download files

#### Option B: Create RLS Policies (If you want to keep RLS enabled)

1. Go to **Storage** → **Policies**
2. Click **New Policy**
3. Create these policies:

**Policy 1: Allow Public Uploads**
```sql
-- Policy name: Allow public uploads
-- Target roles: public
-- Using expression: true
```

**Policy 2: Allow Public Downloads**
```sql
-- Policy name: Allow public downloads  
-- Target roles: public
-- Using expression: true
```

**Policy 3: Allow Public Deletes**
```sql
-- Policy name: Allow public deletes
-- Target roles: public
-- Using expression: true
```

### 4. Alternative: Use Service Role Key

If you want to keep RLS enabled but bypass it for your API:

1. Go to **Settings** → **API**
2. Copy the **service_role** key (not the anon key)
3. Update your `.env` file:

```env
# Use service role key instead of anon key
SUPABASE_ANON_KEY=your_service_role_key_here
```

**⚠️ Warning:** Service role keys bypass all RLS policies, so use them carefully.

### 5. Test the Setup

Create a simple test endpoint to verify bucket access:

```javascript
// Add this to your routes for testing
router.get('/test-storage', async (req, res) => {
  try {
    const { SupabaseService } = require('../config/supabase');
    const result = await SupabaseService.checkBucketAccess();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Quick Fix (Recommended)

The easiest solution is to:

1. **Make the bucket public** (disable RLS)
2. **Use the anon key** (not service role)

This allows:
- ✅ Public uploads
- ✅ Public downloads  
- ✅ Public deletes
- ✅ No complex policies needed

## Environment Variables

Make sure your `.env` file has:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

## Troubleshooting

### Error: "Bucket not found"
- Create the bucket named exactly `greenbeam`
- Check the bucket name in your code matches

### Error: "Access denied"
- Make sure the bucket is public
- Or create proper RLS policies
- Or use service role key

### Error: "Invalid API key"
- Check your Supabase URL and API key
- Make sure you're using the correct key (anon vs service role)

### Error: "CORS policy"
- Go to **Settings** → **API**
- Add your domain to CORS origins
- Or use `*` for development (not recommended for production)

## Security Considerations

### For Development:
- Public bucket with RLS disabled is fine
- Use anon key

### For Production:
- Consider enabling RLS with proper policies
- Use service role key only if necessary
- Implement proper authentication
- Set up CORS properly

## Testing Your Setup

1. **Test bucket access:**
   ```bash
   curl http://localhost:3000/api/v1/test-storage
   ```

2. **Test file upload:**
   - Use Postman to create a product with images
   - Check if files appear in Supabase dashboard

3. **Test file access:**
   - Copy image URL from response
   - Open in browser to verify it loads

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| RLS policy violation | Disable RLS or create policies |
| Bucket not found | Create bucket named `greenbeam` |
| Invalid API key | Check URL and key in `.env` |
| CORS error | Add domain to CORS origins |
| File too large | Check file size limits |

## Next Steps

After fixing the RLS issue:

1. Test product creation with images
2. Verify images are uploaded to Supabase
3. Check image URLs are accessible
4. Test product updates and deletions
5. Monitor storage usage in Supabase dashboard

## Support

If you're still having issues:

1. Check Supabase logs in dashboard
2. Verify bucket permissions
3. Test with a simple file upload first
4. Check network connectivity
5. Review Supabase documentation 