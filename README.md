# Mandalay Morning Star — Weekly Meal Plan (Next.js + Supabase + Stripe)

A modern, mobile-responsive full-stack web app for Mandalay Morning Star's weekly Burmese meal plan subscription service across Los Angeles County, Orange County, and Irvine. Built with **Next.js (App Router)**, **Supabase** for authentication/database, and **Stripe** for subscription billing.

## Features
- **Landing page** with the default weekly plan, customization options (No Pork, Beef/Goat upgrade, Vegetarian), and cutoff reminders.
- **Supabase Auth** supporting email/password and passwordless magic links.
- **Subscriptions** stored in Supabase with customization type, commitment tracking, and delivery windows.
- **Stripe Checkout** for the base plan plus invoice items for Beef/Goat upgrades; Billing Portal link for payment management.
- **User dashboard** to view upcoming deliveries, update customization before cutoff, and cancel after the minimum commitment.
- **Admin dashboard** to group subscriptions by customization, generate delivery manifests, and track add-on revenue.
- **Scheduled job helpers** for cutoff locking, Sunday manifest generation, and weekly rollovers.

## Getting started
1. Install dependencies
   ```bash
   npm install
   ```
2. Add environment variables
   ```bash
   cp .env.example .env.local
   # Populate Supabase + Stripe keys and site URL
   ```
3. Run the dev server
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000).

## Environment variables
See `.env.example` for all required keys:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`, `STRIPE_BEEF_GOAT_PRICE_ID`
- `NEXT_PUBLIC_SITE_URL`

## Database schema (Supabase/Postgres)
Supabase migration file: `supabase/migrations/0001_init.sql`
- `users` with profile fields (name, phone, email)
- `addresses` with default address flag
- `subscriptions` with status, customization type, stripe_subscription_id, delivery tracking
- `orders` and `order_items` for weekly deliveries
- `payments` for Stripe invoices/payment intents
- `cutoff_windows` for Friday 3 PM PT enforcement

## API routes (Next.js App Router)
- `POST /api/subscriptions/create` — create Supabase subscription + Stripe Checkout session; generates initial order/items.
- `POST /api/subscriptions/update` — change customization before cutoff.
- `POST /api/subscriptions/cancel` — cancel after minimum commitment; cancels Stripe subscription at period end.
- `POST /api/stripe/webhook` — handles `checkout.session.completed` and `invoice.payment_succeeded`.

## Utility functions
- `lib/dates.js` — `getNextSundayPT`, `getUpcomingWindow`, cutoff checks, PT formatting.
- `lib/orders.js` — build default order items per customization.
- `lib/schedules.js` — helpers for cutoff locking, manifest generation, and weekly rollover.

## Dashboards
- `app/dashboard` — subscriber view with upcoming delivery, customization changes, commitment tracker, and billing portal link.
- `app/admin` — operational view with subscription grouping, delivery manifest preview, and add-on revenue tracking.

## Styling
- Tailwind CSS with a glassmorphism-inspired UI and brand accent colors.

## Notes
- Stripe webhooks require the raw request body; set `STRIPE_WEBHOOK_SECRET` and use the provided route for local testing via the Stripe CLI.
- Supabase Row Level Security should be configured per table according to your auth model.
