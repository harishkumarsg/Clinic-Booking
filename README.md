# Skin Clinic - Appointment Booking System

A modern, fully-responsive appointment booking system for a dermatology clinic built with Next.js 16, React 19, TypeScript, Tailwind CSS, and Framer Motion.

## Features

✅ **3-Step Booking Flow** - Service → Date/Time → Confirmation
✅ **Smart Calendar** - Full-month view with availability indicators
✅ **Time Slots** - 13 slots per day grouped by period (morning/afternoon/evening)
✅ **Google Sign-In** - OAuth integration with auto-form prefilling
✅ **Form Validation** - Real-time validation with helpful error messages
✅ **Responsive Design** - Mobile, tablet, and desktop optimized
✅ **Smooth Animations** - Framer Motion transitions throughout
✅ **Accessibility** - WCAG AA compliant with keyboard navigation
✅ **Beautiful UI** - Custom brand colors with modern design
✅ **Success Celebration** - Animated confirmation with confetti

## Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Open http://localhost:3000
```

## Project Structure

```
app/
  ├── layout.tsx           # Root layout with fonts
  ├── globals.css          # Brand colors & typography
  └── page.tsx             # Entry point

components/
  ├── booking/             # Main booking components
  │   ├── BookingShell.tsx       # Main orchestrator
  │   ├── HeroScreen.tsx         # Landing screen
  │   ├── AppointmentSidebar.tsx # Desktop sidebar
  │   ├── ConfirmationScreen.tsx # Success screen
  │   └── steps/                 # 3-step flow
  │       ├── Step1Service.tsx
  │       ├── Step2DateTime.tsx
  │       └── Step3Confirm.tsx
  └── ui/                  # Reusable UI components
      ├── ServiceCard.tsx
      ├── CalendarPicker.tsx
      ├── SlotGrid.tsx
      ├── GoogleSignInButton.tsx
      └── ...

lib/
  ├── types/booking.ts     # TypeScript interfaces
  ├── data/mockData.ts     # Mock doctor & services
  └── utils/
      ├── accessibility.ts # a11y helpers
      └── ...

hooks/
  └── useBookingState.ts   # State management
```

## Tech Stack

- **Frontend Framework:** Next.js 16 with App Router
- **UI Library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4 + Custom Theme
- **Animations:** Framer Motion 11
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React
- **Fonts:** DM Sans (body) + Playfair Display (headings)

## Brand Colors

| Color | Code | Usage |
|-------|------|-------|
| Primary Teal | `#0D7377` | Buttons, CTAs |
| Light Teal | `#14A085` | Hover states |
| Cream | `#F7F5F0` | Background |
| Charcoal | `#1C2B33` | Headings |
| Slate | `#4A6572` | Body text |
| Sage | `#E8F3EF` | Cards |
| Amber | `#F5A623` | Accents |
| Success | `#2ECC71` | Confirmations |

## Booking Flow

### Step 1: Service Selection
Choose from 6 services:
- Acne Treatment
- Anti-Aging & Wrinkles
- Skin Pigmentation
- Laser Hair Removal
- Chemical Peels
- General Consultation

### Step 2: Date & Time
- Full-month calendar picker
- 13 time slots per day
- Grouped by period (Morning/Afternoon/Evening)
- Availability indicators

### Step 3: Confirmation
- Google Sign-In
- Patient form with validation
- Auto-prefilled fields from Google
- Appointment summary

### Success
- Celebration animation
- Booking details
- Share options (Calendar, WhatsApp)
- Booking ID

## Mock Data

The system uses realistic mock data:

- **Doctor:** Dr. Sindhu Ragavi, 12+ years experience, 4.9 rating (847 reviews)
- **Clinic:** Velachery, Chennai
- **Services:** 6 with varying prices and durations
- **Slots:** 13 per day, ~30% randomly booked
- **Calendar:** No Sundays, future dates only

## Responsive Breakpoints

```css
Mobile:   < 768px   (1 column, collapsible bar)
Tablet:   768-1024px (flexible layouts)
Desktop:  > 1024px  (sidebar + main content)
```

## Accessibility Features

- ♿ WCAG AA compliant
- ⌨️ Keyboard navigation (Tab, Arrow keys)
- 🎯 Focus management with visible rings
- 📢 Screen reader announcements
- 🏷️ Semantic HTML & ARIA labels
- 📋 Form error announcements

## Environment Variables

No environment variables required for V1. For production:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
DATABASE_URL=your_database_url
SMTP_PASSWORD=your_email_password
```

## Future Enhancements

- Backend API integration
- Database storage (Supabase/PostgreSQL)
- Email & SMS notifications
- Payment processing
- Admin dashboard
- Multi-language support
- Analytics integration
- Real image optimization

## Performance

- ✅ GPU-accelerated animations
- ✅ Optimized re-renders
- ✅ No unnecessary subscriptions
- ✅ Lazy-loadable components
- ✅ Mobile-first approach

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Build & Deploy

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Deploy to Vercel
vercel deploy
```

## Learn More

- [Next.js Documentation](https://nextjs.org)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [React Hook Form](https://react-hook-form.com)

## License

© 2024 Dr. Sindhu's Clinic. All rights reserved.

---

**Built with ❤️ for better patient experiences**
