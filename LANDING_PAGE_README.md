# Finappo Landing Page

A beautiful, minimal, Apple-inspired landing page for the Finappo iOS app.

## Live Preview

Development: http://localhost:3000

## Project Structure

```
/Users/sabtim/Sites/finappo/finappo-web/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main landing page (COMPLETE)
│   │   ├── globals.css           # Global styles with Apple-style fonts
│   │   └── layout.tsx            # Root layout
│   └── components/
│       └── landing/
│           ├── AppStoreButton.tsx    # Reusable App Store button
│           └── FeatureCard.tsx       # Feature card component
└── public/
    └── logo.png                  # Finappo logo (blue wallet icon)
```

## Current Status

✅ **COMPLETE** - Production-ready landing page with:
- Hero section with gradient background
- Animated feature cards (6 features)
- Screenshot gallery placeholders (3 mockups)
- Download CTA section
- Professional footer
- Smooth scroll animations
- Fully responsive design

## Adding Screenshots

### Hero Section Screenshot

**Location:** `/Users/sabtim/Sites/finappo/finappo-web/src/app/page.tsx` (Lines 181-214)

**Steps:**
1. Export screenshot from iOS simulator (PNG format, ideally 1170x2532px for iPhone 14 Pro)
2. Place screenshot in `/Users/sabtim/Sites/finappo/finappo-web/public/screenshots/hero.png`
3. Replace the entire placeholder `<div>` (lines 183-214) with:

```tsx
<div className="relative aspect-[9/19] bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] p-3 shadow-2xl shadow-blue-500/20 border border-gray-700">
  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
    <Image
      src="/screenshots/hero.png"
      alt="Finappo App Screenshot"
      fill
      className="object-cover"
      priority
    />
  </div>
  {/* Notch */}
  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-3xl z-20" />
</div>
```

### Screenshot Gallery (3 Screenshots)

**Location:** `/Users/sabtim/Sites/finappo/finappo-web/src/app/page.tsx` (Lines 435-463)

**Steps:**
1. Export 3 screenshots showing different features (Categories, Transactions, Analytics)
2. Place in `/Users/sabtim/Sites/finappo/finappo-web/public/screenshots/`:
   - `screen-1.png` (e.g., Categories view)
   - `screen-2.png` (e.g., Transaction list)
   - `screen-3.png` (e.g., Analytics/Charts)
3. Replace the map function (lines 436-462) with:

```tsx
{[
  { src: '/screenshots/screen-1.png', alt: 'Smart Categories' },
  { src: '/screenshots/screen-2.png', alt: 'Transactions' },
  { src: '/screenshots/screen-3.png', alt: 'Analytics' },
].map((screen, i) => (
  <motion.div
    key={i}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{
      duration: 0.6,
      delay: i * 0.1,
      ease: [0.16, 1, 0.3, 1],
    }}
    className="relative aspect-[9/19] bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] p-2.5 shadow-2xl"
  >
    <div className="w-full h-full rounded-[2rem] overflow-hidden relative">
      <Image
        src={screen.src}
        alt={screen.alt}
        fill
        className="object-cover"
      />
    </div>
    {/* Notch */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-2xl z-20" />
  </motion.div>
))}
```

## Design System

### Colors
- **Primary Blue:** `#007AFF` (iOS blue)
- **Background Gradient:** `#F5F8FF` → white
- **Text:**
  - Headings: `text-gray-900`
  - Body: `text-gray-600`
  - Muted: `text-gray-500`

### Typography
- **Font:** Apple system font stack (`-apple-system, BlinkMacSystemFont`)
- **Headings:** Bold, tight tracking, 4xl to 7xl
- **Body:** Regular, relaxed leading, xl to 2xl

### Spacing
- **Sections:** `py-24 lg:py-32` (generous vertical padding)
- **Containers:** `max-w-7xl mx-auto px-6 lg:px-8`
- **Cards:** `p-8 lg:p-10` with `gap-6 lg:gap-8`

### Border Radius
- **Cards:** `rounded-3xl` (24px)
- **Buttons:** `rounded-2xl` (16px)
- **iPhone mockup:** `rounded-[3rem]` (48px)

### Shadows
- **Subtle:** `shadow-sm shadow-gray-200/50`
- **Medium:** `shadow-lg shadow-blue-500/30`
- **Heavy:** `shadow-2xl shadow-blue-500/20`

### Animations
All animations use Framer Motion with Apple-style spring easing:
- **Curve:** `[0.16, 1, 0.3, 1]` (ease-out expo)
- **Duration:** 0.6s - 1s
- **Delays:** Staggered by 0.1s for sequential elements

## Features Implemented

### 1. Hero Section
- Large gradient background (blue to white)
- Animated badge ("Now available on iOS")
- Bold headline with gradient accent
- Primary and secondary CTAs
- Trust indicators (Free, Secure, Family)
- iPhone mockup with floating gradient elements

### 2. Features Section
6 feature cards with:
- **Smart Categories** (blue/cyan gradient)
- **Family Sharing** (purple/pink gradient)
- **Visual Analytics** (orange/red gradient)
- **Quick Transactions** (green/emerald gradient)
- **Recurring Budgets** (indigo/purple gradient)
- **Real-time Sync** (cyan/blue gradient)

### 3. Screenshot Gallery
- 3-column grid (stacks on mobile)
- iPhone mockup frames with notches
- Scroll-triggered fade-in animations

### 4. Download CTA
- Blue gradient background with pattern
- Large App Store button
- Trust messaging

### 5. Footer
- Logo and copyright
- Navigation links
- Clean, minimal layout

## Accessibility

- Semantic HTML5 elements
- ARIA labels on links
- Focus visible states (iOS blue outline)
- Smooth scroll behavior
- Keyboard navigation support

## Responsive Breakpoints

- **Mobile:** Default (< 768px)
- **Tablet:** `md:` (≥ 768px)
- **Desktop:** `lg:` (≥ 1024px)

## Performance Optimizations

- Next.js Image component for automatic optimization
- Priority loading for hero image and logo
- Lazy loading for below-fold content
- Motion animations use `whileInView` with `once: true`

## Next Steps

1. **Add real screenshots** (see instructions above)
2. **Update App Store link** in Download CTA section (line 498):
   ```tsx
   href="https://apps.apple.com/app/your-app-id"
   ```
3. **Add Privacy & Support pages** (footer links at lines 553-556)
4. **Optional: Add analytics** (Google Analytics, Plausible, etc.)
5. **Deploy to production** (Cloudflare Pages already configured)

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare Pages
npm run deploy

# Type checking
npm run check
```

## Files Modified/Created

### Created:
- `/Users/sabtim/Sites/finappo/finappo-web/src/components/landing/AppStoreButton.tsx`
- `/Users/sabtim/Sites/finappo/finappo-web/src/components/landing/FeatureCard.tsx`

### Updated:
- `/Users/sabtim/Sites/finappo/finappo-web/src/app/page.tsx` (complete rewrite)
- `/Users/sabtim/Sites/finappo/finappo-web/src/app/globals.css` (Apple-style fonts & scrollbar)

## Support

For questions or issues, refer to the comments in the code. All placeholder areas are clearly marked with:
```tsx
{/* USER WILL ADD SCREENSHOT HERE */}
```

---

**Status:** Ready for screenshots and deployment
**Quality:** Production-ready
**Design:** Apple-inspired, minimal, premium
