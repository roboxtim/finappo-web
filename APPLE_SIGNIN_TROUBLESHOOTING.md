# Apple Sign In Troubleshooting - HTTP ERROR 500

## Error: "appleid.apple.com is currently unable to handle this request. HTTP ERROR 500"

This error occurs when Apple's servers reject your authentication request. Here's how to fix it:

---

## Solution Checklist

### ✅ Step 1: Create and Configure Services ID in Apple Developer Console

**This is the MOST COMMON issue!**

1. Go to [Apple Developer Console](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles** → **Identifiers**
3. Click the **+** button to create a new identifier
4. Select **Services IDs** (NOT App IDs!) and click Continue

#### Configure Services ID:
- **Description**: `Finappo Web Services`
- **Identifier**: `com.yourcompany.finappo.web` (use your own bundle identifier)
  - **IMPORTANT**: Save this identifier - you'll need it for Firebase!
- **Check** the box for "Sign in with Apple"
- Click Continue → Register

#### Configure Web Authentication:
1. Click on your newly created Services ID
2. Click **Configure** next to "Sign in with Apple"
3. Set the following:

   **Primary App ID**: Select your iOS App ID (if you have one)

   **Domains and Subdomains** (one per line, NO https://):
   ```
   peppapp-e5a9d.firebaseapp.com
   ```
   If you have a custom domain, add it here too (e.g., `finappo.com`)

   **Return URLs** (CRITICAL - must be exact!):
   ```
   https://peppapp-e5a9d.firebaseapp.com/__/auth/handler
   ```

   ⚠️ **IMPORTANT**:
   - Must start with `https://`
   - Must end with `/__/auth/handler`
   - NO trailing slashes
   - Must match your Firebase Auth Domain exactly

4. Click **Next** → **Done** → **Continue** → **Save**
5. **Wait 5-10 minutes** for Apple's servers to propagate the changes

---

### ✅ Step 2: Enable Apple Provider in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/peppapp-e5a9d)
2. Click **Authentication** in the left sidebar
3. Click the **Sign-in method** tab
4. Find **Apple** in the list and click on it
5. Toggle **Enable** to ON

#### Required Configuration:
- **Service ID (Client ID)**:
  - Enter the Services ID identifier you created in Step 1
  - Example: `com.yourcompany.finappo.web`
  - ⚠️ This MUST match exactly what you created in Apple Developer Console

#### Optional (but recommended):
- **Team ID**:
  - Find this in the top-right corner of Apple Developer Console
  - Example: `ABC123XYZ`
- **Key ID** and **Private Key**:
  - Only needed if you created a private key in Apple Developer Console
  - Not required for basic Sign in with Apple

6. Click **Save**

---

### ✅ Step 3: Verify Authorized Domains

Still in Firebase Console → Authentication → Sign-in method:

1. Scroll down to **Authorized domains**
2. Verify these domains are listed:
   - `peppapp-e5a9d.firebaseapp.com` ✓
   - `localhost` (for local development with other providers)
   - Your custom domain (if you have one)

3. If missing, click **Add domain** and add them

---

### ✅ Step 4: Test on the Correct Domain

**CRITICAL**: Apple Sign In DOES NOT work on `localhost`!

#### Where to test:
1. **Firebase Hosting** (recommended):
   ```bash
   npm run build
   firebase deploy --only hosting
   ```
   Test on: `https://peppapp-e5a9d.web.app` or `https://peppapp-e5a9d.firebaseapp.com`

2. **Production domain** (if configured)

3. **Cloudflare deployment** (if using):
   ```bash
   npm run deploy
   ```

#### Test in browser:
- Open the deployed URL in a browser
- Click "Continue with Apple"
- You should see Apple's sign-in popup/redirect
- After signing in, you should be redirected back to your app

---

## Common Error Messages and Solutions

### "redirect_uri_mismatch"
**Problem**: The redirect URI doesn't match what's in Apple Developer Console.

**Solution**:
1. Go to Apple Developer Console → Services ID → Configure
2. Verify Return URLs exactly matches: `https://peppapp-e5a9d.firebaseapp.com/__/auth/handler`
3. Check for typos, extra spaces, or trailing slashes
4. Wait 5-10 minutes after making changes

### "invalid_client"
**Problem**: Services ID is incorrect or not properly configured.

**Solution**:
1. Double-check Services ID in Firebase Console matches Apple Developer Console
2. Ensure Services ID has "Sign in with Apple" enabled
3. Verify Services ID is configured with domains and redirect URIs
4. Try creating a new Services ID if the issue persists

### "auth/unauthorized-domain"
**Problem**: The domain you're testing on is not authorized.

**Solution**:
1. Add domain to Firebase Console → Authentication → Authorized domains
2. Add domain to Apple Developer Console → Services ID → Domains and Subdomains
3. Wait a few minutes for changes to propagate

### Still seeing HTTP 500 on localhost
**This is expected!** Apple Sign In doesn't work on localhost.
- Deploy to Firebase Hosting or your production domain to test
- Use Google Sign In for local development testing

---

## Quick Diagnostic Steps

Run through this checklist:

1. ☐ Services ID created in Apple Developer Console
2. ☐ Services ID has "Sign in with Apple" enabled
3. ☐ Services ID configured with correct domain: `peppapp-e5a9d.firebaseapp.com`
4. ☐ Services ID configured with correct Return URL: `https://peppapp-e5a9d.firebaseapp.com/__/auth/handler`
5. ☐ Waited 5-10 minutes after Apple configuration changes
6. ☐ Apple provider enabled in Firebase Console
7. ☐ Services ID added to Firebase Console (matches Apple exactly)
8. ☐ Testing on deployed domain (NOT localhost)
9. ☐ Cleared browser cache and cookies
10. ☐ Tried in incognito/private mode

---

## Your Current Configuration

**Firebase Project**: `peppapp-e5a9d`
**Auth Domain**: `peppapp-e5a9d.firebaseapp.com`
**Required Redirect URI**: `https://peppapp-e5a9d.firebaseapp.com/__/auth/handler`

---

## Deployment Commands

### Deploy to Firebase Hosting:
```bash
cd /Users/sabtim/Sites/finappo/finappo-web
npm run build
firebase deploy --only hosting
```

### Deploy to Cloudflare:
```bash
cd /Users/sabtim/Sites/finappo/finappo-web
npm run deploy
```

---

## Still Having Issues?

1. **Check browser console** for detailed error messages:
   - Open DevTools (F12)
   - Go to Console tab
   - Look for Firebase or Apple-related errors

2. **Check Apple System Status**: https://developer.apple.com/system-status/
   - Verify "Sign in with Apple" is operational

3. **Try a different Apple ID** for testing

4. **Revoke app access**:
   - Go to https://appleid.apple.com/
   - Account Settings → Security → Apps Using Apple ID
   - Remove Finappo
   - Try signing in again

5. **Contact support**:
   - Firebase Support: https://firebase.google.com/support
   - Apple Developer Support: https://developer.apple.com/support/

---

## Additional Resources

- [Apple Sign In for Web Documentation](https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js)
- [Firebase Apple Authentication](https://firebase.google.com/docs/auth/web/apple)
- [Services ID Configuration Guide](https://developer.apple.com/help/account/configure-app-capabilities/configure-sign-in-with-apple-for-the-web)

---

**Last Updated**: 2025-11-04
**Status**: Troubleshooting Guide
