# Scent House Marketplace

The C2C marketplace of **Scent House**, the Italian community for niche perfume enthusiasts. Members buy and sell pre-owned, full-size niche bottles chosen from a curated catalogue. Scent House guarantees authenticity (specialist verification) and secure payment (escrow). The interface is in Italian.

## What's live

| Route | Screen |
| --- | --- |
| `/` | Marketplace home — featured, verified, recently listed, families |
| `/cerca` | Search with filters (brand, family, note, price, fill level, verified only, with box) |
| `/annunci/:id` | Listing page with gallery, trust badges, seller profile, messaging and checkout summary |
| `/vendi` | Step-by-step sell flow enforcing the listing rules, with pricing guidance |
| `/ordini` | Orders, buying and selling |
| `/ordini/SH-24817` | Order page with escrow and verification timeline, verification outcomes, disputes with photos |
| `/area-personale` | Seller level and limits, my listings with editorial status, wishlist with alerts, wardrobe with barcode scan |
| `/richieste` | Community requests for rare or discontinued bottles |

Business rules follow the project document (chapters 4.4, 5 and 7): seller commission 8%, buyer protection 0,70 € + 5%, verification 20 € triggered by risk (value, brand, seller level), 48-hour window after delivery, decants excluded.

Data is currently realistic sample data in `src/lib/fixtures.ts`.

## Tech

- TanStack Start (React 19, TanStack Router) on Netlify
- Tailwind CSS 4 + shadcn/ui (Radix) components
- Netlify Image CDN for product photography
- Planned: Netlify Database (Postgres + Drizzle), Netlify Identity, Netlify Blobs, Stripe Connect, scheduled functions

## Run locally

```bash
pnpm install
netlify dev        # or: pnpm dev (Vite on :3000)
```

`netlify dev` is recommended so the Image CDN (`/.netlify/images`) works locally.

## Roadmap

See [PLAN.md](PLAN.md). Next up: data model and catalogue, accounts and roles, listing moderation, Stripe Connect escrow, shipping and verification operations, disputes, member features and the admin dashboard.
