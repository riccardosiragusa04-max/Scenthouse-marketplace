# Scent House Marketplace — Roadmap

The marketplace is a trust-first C2C section of the Scent House site. It is being built in self-contained milestones, starting with the product surface people see and click, then layering in data, accounts, payments and operations.

Platform choices: TanStack Start on Netlify, **Netlify Database** (Postgres + Drizzle) for all records, **Netlify Identity** for accounts and roles, **Netlify Blobs** for bottle photos and dispute evidence, **Stripe Connect** (separate charges and transfers) for escrow, and **Netlify scheduled functions** for timed jobs. These replace the Supabase suggestion one-for-one (auth, database, storage) while keeping everything on one platform.

All stub data currently lives in `src/lib/fixtures.ts`. Each milestone replaces part of that module with real loaders/server functions, keeping the UI unchanged.

---

## ✅ Milestone 1 — Product surface (done)
- Shared Scent House header (community bar: Magazine, Forum, Marketplace, Area membri) and footer, Italian copy, editorial design system (Cormorant Garamond + Instrument Sans, ivory/ink/bronze/sage palette).
- Marketplace home: hero, trust pillars, featured, verified, recently listed, families, sell CTA.
- Search with URL-driven filters: brand, family, note, max price, min fill level, verified only, with box, sorting; empty state with "save search".
- Listing page: 4-angle gallery, trust badges, fill meter, escrow/verification/shipping assurances, seller stats and reviews, wishlist toggle, in-listing messaging with contact-detail warning, checkout summary (optional verification toggle, fees, total).
- Sell flow (5 steps): catalogue picker + "request a perfume", full-size confirmation, fill ≥ 50% block, condition, storage, 4 mandatory photos + optional box/receipt, batch code, pricing guidance scaled to fill, commission/earnings preview, mandatory-verification notice, moderation confirmation.
- Orders: buying/selling tabs and an order page with escrow + verification timeline, per-leg tracking, dispute dialog.

## ✅ Milestone 1b — Alignment with the project document (done)
- Fees from ch. 7: seller 8%, buyer protection 0,70 € + 5%, verification 20 € flat, every line shown separately at checkout.
- Risk-based verification (ch. 4.4): value > 150 €, counterfeited brand, new seller — two of three make it automatic; otherwise the buyer can request it.
- Seller levels Nuovo / Affidabile / Esperto with limits on value and active listings; onboarding checks shown in the sell flow.
- Sell flow (ch. 5.1): wardrobe / barcode / manual catalogue link, four mandatory photos (lotto, livello, confezione, erogatore) with silhouettes, ml estimate to confirm, closed questions, price range with explanation, editorial review status.
- Decants excluded, partly used and sealed bottles accepted. 48-hour window after delivery, automatic release.
- Order page: verification outcomes (fake → refund and suspension; non-conforming → buyer chooses), dispute with opening photos.
- Home with search bar, community requests and editorial blocks; registration asked only at checkout.
- New `/area-personale` (level, listings with editorial notes, wishlist alerts, wardrobe) and `/richieste`.
- Logo mark (bottle with pitched-roof cap) used as verification seal; single metallic accent.
- Open points from the document: receipt among listing documents (kept optional), launch promo (seller commission zero for 3 months) and the seller subscription from 2029 are not modelled yet.

## Milestone 2 — Data model & catalogue
- Drizzle schema in `db/schema.ts`: `catalogue_entries`, `catalogue_requests`, `listings`, `listing_photos`, `members`, `orders`, `order_legs` (shipments), `verifications`, `disputes`, `dispute_messages`, `reviews`, `wishlist_items`, `collection_items`, `saved_searches`, `conversations`, `messages`, `notifications`, `platform_settings` (single row: seller commission %, buyer protection fixed + %, verification fee, high-value threshold, dispute window hours, min fill %, min photos, seller level limits, high-risk brands).
- Seed the catalogue; swap fixtures for loaders/server functions on home, search, listing pages.
- Search query pushed to SQL (filters, sorting, pagination).

## Milestone 3 — Accounts & roles
- Netlify Identity sign-up with email verification; roles `member`, `specialist`, `admin` in app metadata.
- Seller onboarding gate: identity verification and payout method via Stripe Connect Express onboarding before the first listing can be submitted.
- Protected routes: sell flow, orders, messages, wishlist, specialist and admin dashboards.
- Public member profile: sales completed, verification results, reviews.

## Milestone 4 — Listing submission & moderation
- Photo uploads to Netlify Blobs (served via Image CDN), server-side validation of every listing rule (fill ≥ min, full size, min photos, required fields).
- Listings saved as `pending_review`; specialist dashboard **moderation queue** to approve/reject with notes; publishing on approval.
- Catalogue requests flow to the admin queue.

## Milestone 5 — Checkout & escrow (Stripe Connect)
- Checkout page; PaymentIntent on the platform account (separate charges and transfers), fees from `platform_settings`.
- Mandatory verification above threshold; optional verification add-on below it.
- Webhooks for payment status; funds held until receipt confirmation.
- Scheduled function: auto-release transfer after N days with no open dispute.

## Milestone 6 — Shipping & verification operations
- Courier integration that accepts perfumes (flammable liquids) for prepaid labels and tracking; packaging instructions in the seller's order view.
- Legs: seller → buyer, or seller → Scent House lab → buyer; tracking per leg.
- Specialist dashboard **verification queue**: checklist, notes, photos, approve/reject. Rejection triggers a full refund and return label to the seller.
- Verification outcome shown on the order page and counted on the seller profile.

## Milestone 7 — Disputes
- Buyer opens a dispute within the configurable window (reasons: not as described, lower fill, damage, suspected fake).
- Evidence thread with photos and messages from both parties; funds frozen.
- Admin resolution: release, partial or full refund, return.

## Milestone 8 — Member features
- Wishlist with alerts when a wishlisted perfume is listed.
- Personal collection; "Vendi questo" deep-links into `/vendi?catalogo=<id>` (already supported by the sell flow).
- Saved searches with notifications (email + in-app).
- Messaging tied to a listing, with server-side masking of phone numbers, emails, links and IBANs.
- Two-way reviews after each completed order.

## Milestone 9 — Admin dashboard
- Catalogue management (add/remove entries, review requests).
- Users (roles, suspensions, identity status).
- Settings editor for commission, fees, thresholds and time windows — nothing hard-coded.
- Dispute resolution console and order overview.

## Milestone 10 — Polish & launch
- Transactional emails, SEO and structured data for listings, accessibility pass, analytics, legal pages (terms of sale, consumer rules for C2C in Italy).
