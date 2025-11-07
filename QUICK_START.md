# Quick Start Guide - Contact Form

## What Was Implemented

A complete contact/feedback form system for the Finappo landing page with:

- Premium, Apple-inspired design matching the existing landing page
- Contact form with subject and message fields
- Real-time validation and error handling
- Secure backend email sending (email address hidden from client)
- Beautiful HTML email template
- Navigation menu integration
- Mobile responsive design

## Files Created/Modified

### New Files
- `/src/components/landing/ContactForm.tsx` - Form component
- `/src/app/api/contact/route.ts` - API endpoint for sending emails
- `/.env.local` - Environment variables (secure, not in git)
- `/.env.example` - Environment template
- `/CONTACT_FORM_SETUP.md` - Detailed documentation

### Modified Files
- `/src/app/page.tsx` - Added contact section
- `/src/components/Navigation.tsx` - Added Contact menu item

## Setup in 3 Steps

### 1. Get Resend API Key

Sign up at https://resend.com and get your API key.

### 2. Configure Environment

Edit `.env.local` and add your Resend API key:

```bash
RESEND_API_KEY=re_your_actual_api_key_here
CONTACT_EMAIL=roboxtim@gmail.com
```

### 3. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 and scroll to the bottom to see the contact form.

## Test the Form

1. Open http://localhost:3000
2. Click "Contact" in the navigation menu
3. Fill out:
   - Subject: "Test message" (min 3 chars)
   - Message: "Testing the contact form!" (min 10 chars)
4. Click "Отправить сообщение"
5. You should see a success message
6. Check roboxtim@gmail.com for the email

## Important Security Notes

- The email address `roboxtim@gmail.com` is ONLY stored server-side in `.env.local`
- `.env.local` is in `.gitignore` and will NOT be committed to git
- API keys are never exposed to the client
- All validation happens on both client and server

## Troubleshooting

**"Ошибка конфигурации сервера"**
- Make sure `.env.local` exists
- Verify `CONTACT_EMAIL` is set
- Restart the dev server

**"Не удалось отправить сообщение"**
- Check your Resend API key is valid
- Verify you haven't exceeded rate limits
- Check server console for detailed errors

## Next Steps

For production deployment:

1. Add environment variables in your hosting platform (Vercel/Cloudflare)
2. Deploy the site
3. Test the contact form in production

## Full Documentation

See `CONTACT_FORM_SETUP.md` for complete documentation including:
- Architecture details
- Customization guide
- Deployment instructions
- Troubleshooting
- Future enhancements

---

Implementation complete and ready to use!
