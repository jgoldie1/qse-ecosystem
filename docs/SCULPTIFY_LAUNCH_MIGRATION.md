# SculptifyLTD — Launch & Migration Runbook

## Architecture
- Frontend/PWA: `apps/sculptify-web/public`
- Database/Auth: existing Supabase project
- Owner login: passwordless email magic link
- Owner email: configured in Supabase `sculptify_site_settings.owner_email`
- HoloGPT: customer-facing concierge, always branded "Powered by Stubbs AI"
- AI provider: switchable behind Stubbs AI
- Payments: product/service checkout URLs can point to Stripe Checkout/Payment Links
- Domain: no business data is stored in the domain or web host

## Why domain/host migration is easy
All frontend asset URLs and the PWA manifest/service worker use relative paths. The database remains in Supabase. Moving the site therefore does not move bookings, FAQs, services, courses, products, or provider applications.

## New host launch
1. Deploy the repository.
2. Serve `apps/sculptify-web/public` at either the site root or `/sculptify/`.
3. Keep HTTPS enabled (required for PWA service workers outside localhost).
4. Point the domain DNS to the new host.
5. In Supabase Auth URL Configuration, add the final HTTPS URL to the allowed redirect URLs for the owner magic-link login.
6. Open the site from the owner's email magic link and verify Owner Studio.
7. Add the final website URL, business phone, and any Stripe checkout URLs from Owner Studio/database.
8. Test booking, provider application, store, HoloGPT, and Add to Home Screen.

## 48-hour expectation
The application deploy itself should normally be much faster than 48 hours once the host is connected. DNS nameserver or record changes can take time to propagate across networks; plan up to 48 hours for that edge case, while many changes resolve sooner.

## Migration checklist
- Export a copy of the repository/commit SHA.
- Keep the same Supabase project if only the domain/host changes.
- Do not copy server-only AI or Stripe secrets into browser JavaScript.
- Configure AI provider secrets only in the server/host environment.
- Configure Stripe secret/webhook keys only in server/host secrets.
- Update Supabase Auth allowed redirect URLs after every domain change.
- Update the PWA name/logo only when branding changes, not for a domain move.
- Test iPhone Safari: Share -> Add to Home Screen.
- Test Android/Chrome: Install app / Add to Home screen.
- Verify SSL/HTTPS before enabling paid advertising.

## Sculptify data isolated in Supabase
- sculptify_admins
- sculptify_site_settings
- sculptify_services
- sculptify_faqs
- sculptify_courses
- sculptify_products
- sculptify_bookings
- sculptify_provider_applications

Row Level Security is enabled. Public users can read active catalog content and submit bookings/provider applications; owner/admin writes require authenticated Sculptify admin access.

## Payments
The storefront supports a `checkout_url` per product. Add a Stripe Payment Link or server-generated Stripe Checkout URL. No Stripe secret key belongs in the browser or repository.

## AI
Customers see **HoloGPT — Powered by Stubbs AI**. The existing Stubbs AI provider router can use Gemini, OpenAI, Anthropic, then a local fallback according to server environment settings. This lets the provider change without changing the Sculptify brand.
