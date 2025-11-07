# Contact Form Implementation Guide

This document explains the contact form implementation for the Finappo landing page.

## Overview

A premium, Apple-inspired contact form has been added to the landing page. The form allows users to send feedback and inquiries, with emails being sent to a secure backend endpoint.

## Features

- Clean, minimal design matching the existing landing page aesthetic
- Real-time form validation with user-friendly error messages
- Subject and message fields with character limits
- Smooth animations and transitions using Framer Motion
- Loading states during submission
- Success/error feedback messages
- Responsive design (mobile and desktop)
- Email address hidden from client-side code (secure backend implementation)

## Architecture

### Frontend Components

**Location:** `/Users/sabtim/Sites/finappo/finappo-web/src/components/landing/ContactForm.tsx`

The ContactForm component handles:
- Form state management
- Client-side validation (3-200 chars for subject, 10-5000 chars for message)
- Visual feedback for errors and success states
- Form submission to API endpoint

### Backend API Route

**Location:** `/Users/sabtim/Sites/finappo/finappo-web/src/app/api/contact/route.ts`

The API endpoint handles:
- Request validation
- Secure email sending via Resend service
- Beautiful HTML email formatting
- Error handling and responses

### Landing Page Integration

**Location:** `/Users/sabtim/Sites/finappo/finappo-web/src/app/page.tsx`

Added a new contact section before the footer with:
- Section heading and description
- Animated card container for the form
- Smooth scroll behavior from navigation

### Navigation Updates

**Location:** `/Users/sabtim/Sites/finappo/finappo-web/src/components/Navigation.tsx`

Added "Contact" links to:
- Desktop navigation menu
- Mobile navigation menu
- Footer links (in page.tsx)

## Setup Instructions

### 1. Install Dependencies

The Resend package has already been installed:

```bash
npm install resend
```

### 2. Get a Resend API Key

1. Sign up for a free account at https://resend.com
2. Navigate to API Keys section
3. Create a new API key
4. Copy the API key

### 3. Configure Environment Variables

Update the `.env.local` file with your Resend API key:

```bash
# .env.local
RESEND_API_KEY=re_your_actual_api_key_here
CONTACT_EMAIL=roboxtim@gmail.com
```

**Important Security Notes:**
- The `.env.local` file is already in `.gitignore` and will NOT be committed to git
- The email address (`CONTACT_EMAIL`) is only accessible on the server-side
- Never expose API keys or email addresses in client-side code
- An `.env.example` file has been created as a template

### 4. Start the Development Server

```bash
npm run dev
```

The site will be available at http://localhost:3000

### 5. Test the Contact Form

1. Navigate to the landing page
2. Click "Contact" in the navigation menu (or scroll to bottom)
3. Fill out the form with:
   - Subject: At least 3 characters
   - Message: At least 10 characters
4. Click "Отправить сообщение" (Send Message)
5. Check for success message
6. Verify email arrival at roboxtim@gmail.com

## Email Template

The email sent to roboxtim@gmail.com includes:

- Beautiful HTML formatting with gradients and proper spacing
- Subject line: "Новое сообщение: [user's subject]"
- User's message displayed in a styled card
- Timestamp of when the message was received
- Professional footer with Finappo branding

## Validation Rules

### Subject Field (Тема письма)
- Minimum: 3 characters
- Maximum: 200 characters
- Required field

### Message Field (Сообщение)
- Minimum: 10 characters
- Maximum: 5000 characters
- Required field
- Character counter displayed

## Error Handling

The form handles various error scenarios:

1. **Validation Errors**: Real-time feedback with red borders and error messages
2. **Network Errors**: User-friendly message: "Ошибка сети. Пожалуйста, попробуйте еще раз."
3. **Server Errors**: Generic error message to avoid exposing technical details
4. **API Configuration Errors**: Logged server-side, user sees generic error

## Design Philosophy

The contact form follows Apple's design principles:

1. **Clarity**: Clear labels, obvious actions, easy-to-read typography
2. **Depth**: Subtle shadows, layered backgrounds, sense of depth
3. **Focus**: Minimal distractions, attention on the task
4. **Hierarchy**: Clear visual hierarchy from heading to form to button
5. **Motion**: Smooth, intentional animations that feel natural

## File Structure

```
finappo-web/
├── .env.local                              # Environment variables (not in git)
├── .env.example                            # Environment template
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── contact/
│   │   │       └── route.ts               # Backend API endpoint
│   │   └── page.tsx                        # Landing page (contact section added)
│   └── components/
│       ├── Navigation.tsx                  # Updated with Contact link
│       └── landing/
│           └── ContactForm.tsx            # Form component
```

## Customization

### Change Recipient Email

Update the `CONTACT_EMAIL` variable in `.env.local`:

```bash
CONTACT_EMAIL=your-new-email@example.com
```

### Change Email Template

Edit the HTML template in `/src/app/api/contact/route.ts` (line 56+)

### Change Validation Rules

Update validation logic in:
- Backend: `/src/app/api/contact/route.ts` (lines 18-33)
- Frontend: `/src/components/landing/ContactForm.tsx` (lines 25-36)

### Change Form Text (Internationalization)

The form currently uses Russian text. To change to English or other languages:

1. Update labels in `ContactForm.tsx`
2. Update section heading/description in `page.tsx`
3. Update email template in `route.ts`
4. Update navigation link text in `Navigation.tsx`

## Deployment

### Vercel / Cloudflare Pages

1. Add environment variables in the deployment platform:
   - `RESEND_API_KEY`
   - `CONTACT_EMAIL`

2. Deploy the site

3. Test the contact form in production

### Important Notes

- Environment variables are automatically loaded by Next.js
- API routes work out-of-the-box on Vercel and most Next.js hosting platforms
- Ensure the hosting platform supports Next.js API routes (serverless functions)

## Troubleshooting

### "Ошибка конфигурации сервера"

**Cause:** `CONTACT_EMAIL` environment variable is not set

**Solution:**
1. Check `.env.local` file exists
2. Verify `CONTACT_EMAIL=roboxtim@gmail.com` is set
3. Restart the dev server

### "Не удалось отправить сообщение"

**Cause:** Resend API error (invalid API key, rate limit, etc.)

**Solution:**
1. Check `RESEND_API_KEY` is valid
2. Verify you haven't exceeded Resend's free tier limits
3. Check browser console and server logs for detailed error

### Emails not arriving

**Possible Causes:**
1. Check spam folder
2. Verify `CONTACT_EMAIL` is correct
3. Ensure Resend account is verified
4. Check Resend dashboard for delivery status

### Form not submitting

**Debug Steps:**
1. Open browser DevTools Network tab
2. Submit the form
3. Check for `/api/contact` request
4. Review request/response details
5. Check server console logs

## Security Considerations

- Email address is stored server-side only
- API key never exposed to client
- Input validation on both client and server
- No sensitive data stored in browser
- Protection against XSS through React's built-in escaping
- Rate limiting recommended for production (not implemented yet)

## Future Enhancements

Potential improvements:

1. **Rate Limiting**: Prevent spam by limiting submissions per IP
2. **CAPTCHA**: Add reCAPTCHA or hCaptcha for bot prevention
3. **Email Field**: Add optional email field for replies
4. **File Attachments**: Allow users to attach screenshots
5. **Categories**: Add dropdown for inquiry type (Bug, Feature, Question, etc.)
6. **Auto-reply**: Send confirmation email to user
7. **Admin Dashboard**: View/manage submissions in a backend panel
8. **Analytics**: Track form submission rates and success/error rates

## Resources

- [Resend Documentation](https://resend.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)
- [Framer Motion](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Support

For issues or questions about this implementation:
1. Check this documentation first
2. Review error messages in browser console
3. Check server logs for API errors
4. Verify environment variables are set correctly

---

**Implementation Date:** 2025-11-07
**Developer:** Claude (Anthropic)
**Technology Stack:** Next.js 15, React 19, TypeScript, Resend, Tailwind CSS, Framer Motion
