# Apple Sign In Web Setup Guide

Complete step-by-step guide to implementing Apple Sign In for the Finappo web application.

## Overview

This guide walks through configuring Apple Sign In authentication for your Next.js web application using Firebase Authentication. The setup requires configuration in three places:
1. Apple Developer Console
2. Firebase Console
3. Your Next.js application

**Current Firebase Configuration:**
- Auth Domain: `peppapp-e5a9d.firebaseapp.com`
- Project ID: `peppapp-e5a9d`

---

## Part 1: Apple Developer Console Setup

### Prerequisites
- Active Apple Developer Program membership ($99/year)
- Access to the Apple Developer Console

### Step 1: Create an App ID (if not already created)

1. Log in to [Apple Developer Console](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Select **Identifiers** from the sidebar
4. Click the **+** button to create a new identifier
5. Select **App IDs** and click **Continue**
6. Select **App** as the type and click **Continue**
7. Configure your App ID:
   - **Description:** Finappo iOS App
   - **Bundle ID:** Your iOS app's bundle identifier (e.g., `com.yourcompany.finappo`)
   - **Capabilities:** Check **Sign in with Apple**
8. Click **Continue** and then **Register**

### Step 2: Create a Services ID (Required for Web)

This is the critical step for web authentication.

1. Still in **Identifiers**, click the **+** button again
2. Select **Services IDs** and click **Continue**
3. Configure your Services ID:
   - **Description:** Finappo Web Services
   - **Identifier:** Use a unique identifier (e.g., `com.yourcompany.finappo.web`)
     - This will be your **Client ID** in Firebase
     - Save this value - you'll need it later
   - Check **Sign in with Apple**
4. Click **Continue** and then **Register**

### Step 3: Configure Services ID Domains and Redirect URIs

1. In the Services ID list, click on the Services ID you just created
2. Next to **Sign in with Apple**, click **Configure**
3. Configure the following settings:

   **Primary App ID:**
   - Select the App ID you created in Step 1

   **Website URLs:**
   - **Domains and Subdomains:**
     ```
     peppapp-e5a9d.firebaseapp.com
     ```
     - If you have a custom domain, add it here as well (e.g., `finappo.com`)
     - Do NOT include `https://` or any path
     - Add each domain on a separate line if you have multiple

   - **Return URLs:**
     ```
     https://peppapp-e5a9d.firebaseapp.com/__/auth/handler
     ```
     - This is the Firebase Auth callback URL
     - Format: `https://[YOUR-AUTH-DOMAIN]/__/auth/handler`
     - If you have a custom domain, you may need to add its callback URL too

4. Click **Next**, then **Done**, then **Continue**, and finally **Save**

**Important Notes:**
- The redirect URI must exactly match the format above
- Make sure there are no trailing slashes
- Firebase requires the `/__/auth/handler` path specifically

### Step 4: Create a Private Key (Optional but Recommended)

This step is required if you want to verify tokens server-side or use Sign in with Apple REST API.

1. Navigate to **Keys** in the sidebar
2. Click the **+** button
3. Configure the key:
   - **Key Name:** Finappo Sign in with Apple Key
   - Check **Sign in with Apple**
   - Click **Configure** next to Sign in with Apple
   - Select your Primary App ID
   - Click **Save**
4. Click **Continue**, then **Register**
5. **Download the key file (.p8)** - you can only download this once!
6. Note the **Key ID** displayed - you'll need this

**Save securely:**
- Key ID (e.g., `ABC123DEFG`)
- Team ID (found in the top right of the Apple Developer Console, e.g., `XYZ987WXYZ`)
- The downloaded .p8 file

---

## Part 2: Firebase Console Configuration

### Step 1: Enable Apple Sign In Provider

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **peppapp-e5a9d**
3. Navigate to **Authentication** (in the left sidebar under Build)
4. Click the **Sign-in method** tab
5. In the list of providers, find **Apple** and click on it

### Step 2: Configure Apple Provider Settings

1. Toggle **Enable** to ON

2. **Service ID (Client ID):**
   - Enter the Services ID identifier you created in Apple Developer Console
   - Example: `com.yourcompany.finappo.web`

3. **Team ID (Optional but recommended):**
   - Enter your Apple Developer Team ID
   - Find this in the top-right corner of Apple Developer Console
   - Example: `XYZ987WXYZ`

4. **Key ID (Optional):**
   - Enter the Key ID from Step 4 of Apple setup if you created a key

5. **Private Key (Optional):**
   - If you created a private key, open the .p8 file in a text editor
   - Copy the entire contents (including BEGIN/END lines)
   - Paste into this field

6. Click **Save**

### Step 3: Verify OAuth Redirect Domain

1. Still in the **Sign-in method** tab, scroll down to **Authorized domains**
2. Verify that `peppapp-e5a9d.firebaseapp.com` is listed
3. If you have a custom domain (e.g., `finappo.com` or `app.finappo.com`), add it:
   - Click **Add domain**
   - Enter your domain
   - Click **Add**

---

## Part 3: Next.js Application Setup

### Step 1: Install Required Dependencies

The Firebase SDK should already be installed. Verify you have:

```bash
npm install firebase
# or
yarn add firebase
```

### Step 2: Environment Variables (Optional)

Your current Firebase config has hardcoded values, which is fine for public Firebase config. However, you may want to add these to `.env.local` for better practice:

```env
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAAAqq-js4-AhYSJal5H4iQnRZxDiqyfXU
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=peppapp-e5a9d.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=peppapp-e5a9d
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=peppapp-e5a9d.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=342675200577
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id-here
```

### Step 3: Implement Apple Sign In Button

Create or update your authentication component:

```typescript
// src/components/auth/AppleSignInButton.tsx
'use client';

import { signInWithPopup, OAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useState } from 'react';

export function AppleSignInButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAppleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const provider = new OAuthProvider('apple.com');

      // Optional: Request additional scopes
      provider.addScope('email');
      provider.addScope('name');

      // Optional: Set locale
      provider.setCustomParameters({
        locale: 'en'
      });

      const result = await signInWithPopup(auth, provider);

      // User signed in successfully
      const user = result.user;
      console.log('Apple Sign In successful:', user);

      // The signed-in user info
      // Apple credential from the provider
      const credential = OAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;
      const idToken = credential?.idToken;

      // Handle successful sign in (e.g., redirect to app)

    } catch (err: any) {
      console.error('Apple Sign In error:', err);
      setError(err.message || 'Failed to sign in with Apple');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleAppleSignIn}
        disabled={loading}
        className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-black text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
        {loading ? 'Signing in...' : 'Continue with Apple'}
      </button>

      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}
```

### Step 4: Alternative - Redirect Flow

For a more seamless mobile experience, use redirect instead of popup:

```typescript
import { signInWithRedirect, getRedirectResult, OAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useEffect, useState } from 'react';

export function AppleSignInButtonRedirect() {
  const [loading, setLoading] = useState(false);

  // Check for redirect result on component mount
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User signed in successfully
          console.log('Apple Sign In successful:', result.user);
        }
      } catch (error: any) {
        console.error('Apple Sign In error:', error);
      }
    };

    checkRedirectResult();
  }, []);

  const handleAppleSignIn = async () => {
    setLoading(true);

    try {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');

      await signInWithRedirect(auth, provider);
      // The page will redirect, so no need to set loading to false
    } catch (error: any) {
      console.error('Apple Sign In error:', error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAppleSignIn}
      disabled={loading}
      className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-black text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
      {loading ? 'Redirecting...' : 'Continue with Apple'}
    </button>
  );
}
```

---

## Part 4: Testing

### Local Testing

1. **Start your Next.js development server:**
   ```bash
   npm run dev
   ```

2. **Important:** Apple Sign In ONLY works on authorized domains
   - `localhost` is NOT authorized by default
   - You must test on `peppapp-e5a9d.firebaseapp.com` or your custom domain
   - Deploy to production/staging to test

3. **Alternative for local testing:**
   - Use Firebase Hosting emulators
   - Or set up a tunnel service (ngrok) and add that domain to Apple/Firebase configs

### Production Testing

1. Deploy your application to your production domain
2. Ensure the domain is added to:
   - Apple Developer Console Services ID configuration
   - Firebase Console Authorized domains
3. Clear browser cache and cookies
4. Test the full sign-in flow

### Test Checklist

- [ ] Button appears correctly
- [ ] Clicking button opens Apple Sign In popup/redirect
- [ ] Can authenticate with Apple ID
- [ ] Successfully redirected back to app
- [ ] User information is correctly stored in Firebase Auth
- [ ] User can sign out and sign in again
- [ ] Error handling works for cancelled sign-in
- [ ] Works on Safari (primary Apple browser)
- [ ] Works on Chrome
- [ ] Works on mobile devices

---

## Troubleshooting Common Issues

### Error: "popup_closed_by_user"

**Problem:** User closed the popup before completing sign-in.

**Solution:** This is expected behavior. You can catch this error and handle it gracefully:

```typescript
catch (err: any) {
  if (err.code === 'auth/popup-closed-by-user') {
    // User cancelled - don't show error
    return;
  }
  setError(err.message);
}
```

### Error: "auth/unauthorized-domain"

**Problem:** The domain you're testing on is not authorized.

**Solution:**
1. Add domain to Firebase Console → Authentication → Sign-in method → Authorized domains
2. Add domain to Apple Developer Console → Services ID → Sign in with Apple → Configure → Domains and Subdomains

### Error: "redirect_uri_mismatch"

**Problem:** The redirect URI doesn't match what's configured in Apple Developer Console.

**Solution:**
1. Verify redirect URI in Apple Developer Console exactly matches: `https://[YOUR-AUTH-DOMAIN]/__/auth/handler`
2. Check for typos, trailing slashes, or wrong protocol (https vs http)
3. Wait 5-10 minutes after making changes in Apple Developer Console

### Error: "invalid_client"

**Problem:** Services ID (Client ID) is incorrect or not properly configured.

**Solution:**
1. Double-check Services ID in Firebase Console matches Apple Developer Console
2. Ensure Services ID has "Sign in with Apple" enabled
3. Verify Services ID is properly configured with domains and redirect URIs

### Apple Sign In works on Safari but not Chrome/Firefox

**Problem:** Third-party cookie blocking or cross-site tracking prevention.

**Solution:**
1. Use redirect flow instead of popup flow
2. Ensure your domain is properly configured in both consoles
3. Test in incognito/private mode to rule out extensions

### Name and Email not returned

**Problem:** Apple only returns name and email on FIRST sign-in.

**Solution:**
1. This is Apple's privacy feature - name/email only provided once
2. Store user information when first received
3. To test again, go to Apple ID settings → Security → Apps Using Apple ID → Remove your app
4. Or use different Apple ID for testing

### "localhost" testing doesn't work

**Problem:** Apple Sign In requires authorized domains, localhost is not authorized.

**Solution:**
1. Deploy to Firebase Hosting: `firebase deploy --only hosting`
2. Test on `[project-id].web.app` or `[project-id].firebaseapp.com`
3. Or add your production/staging domain to authorized domains

### Changes not taking effect

**Problem:** Cached configuration or DNS propagation.

**Solution:**
1. Wait 5-10 minutes after making changes in Apple Developer Console
2. Clear browser cache and cookies
3. Try in incognito/private mode
4. Sign out and sign in again to Firebase Console

---

## Security Best Practices

1. **Never expose private keys:**
   - Store .p8 files securely (use environment variables or secret management)
   - Never commit keys to version control
   - Add `.env.local` and `*.p8` to `.gitignore`

2. **Validate tokens server-side:**
   - Always verify Firebase ID tokens on your backend
   - Don't trust client-side authentication alone

3. **Use HTTPS:**
   - Always use HTTPS in production
   - Firebase Hosting provides free SSL

4. **Handle errors gracefully:**
   - Don't expose sensitive error details to users
   - Log errors server-side for debugging

5. **Implement proper session management:**
   - Use Firebase Auth session persistence
   - Implement proper sign-out functionality
   - Handle token expiration

---

## Additional Resources

### Official Documentation

- [Apple Sign In Overview](https://developer.apple.com/sign-in-with-apple/)
- [Apple Services ID Configuration](https://developer.apple.com/help/account/configure-app-capabilities/configure-sign-in-with-apple-for-the-web)
- [Firebase Apple Auth Documentation](https://firebase.google.com/docs/auth/web/apple)
- [Firebase Auth Web Setup](https://firebase.google.com/docs/auth/web/start)

### Apple Developer Resources

- [Apple Developer Console](https://developer.apple.com/account/)
- [Sign in with Apple JS SDK](https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js)
- [Human Interface Guidelines - Sign in with Apple](https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple)

### Firebase Resources

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)
- [Firebase Auth UI Libraries](https://firebase.google.com/docs/auth/web/firebaseui)

### Troubleshooting & Support

- [Firebase Support](https://firebase.google.com/support)
- [Apple Developer Support](https://developer.apple.com/support/)
- [Stack Overflow - Firebase Auth](https://stackoverflow.com/questions/tagged/firebase-authentication)
- [Stack Overflow - Sign in with Apple](https://stackoverflow.com/questions/tagged/sign-in-with-apple)

---

## Next Steps

After completing this setup:

1. **Test thoroughly** on all target browsers and devices
2. **Implement proper user management** (profile creation, data storage)
3. **Add sign-out functionality**
4. **Set up Firebase Security Rules** for Firestore
5. **Consider adding other auth providers** (Google, Email/Password)
6. **Implement protected routes** in your Next.js app
7. **Add analytics** to track sign-in success/failure rates
8. **Create a privacy policy** (required by Apple)
9. **Add account deletion flow** (required by Apple App Review)

---

## Appendix: Quick Reference

### Key URLs You'll Need

```
Firebase Auth Domain: peppapp-e5a9d.firebaseapp.com
Firebase Redirect URI: https://peppapp-e5a9d.firebaseapp.com/__/auth/handler
Apple Developer Console: https://developer.apple.com/account/
Firebase Console: https://console.firebase.google.com/project/peppapp-e5a9d
```

### Configuration Checklist

- [ ] App ID created in Apple Developer Console
- [ ] Services ID created in Apple Developer Console
- [ ] Services ID configured with domain and redirect URI
- [ ] Private key created (optional)
- [ ] Apple provider enabled in Firebase Console
- [ ] Services ID added to Firebase Console
- [ ] Team ID and Key ID added to Firebase (optional)
- [ ] Custom domain added to Firebase authorized domains (if applicable)
- [ ] Apple Sign In button implemented in app
- [ ] Error handling implemented
- [ ] Tested on production domain
- [ ] Privacy policy created and linked

---

**Document Version:** 1.0
**Last Updated:** 2025-10-31
**Firebase Project:** peppapp-e5a9d
