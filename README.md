# A & Z — Wedding E-Invite

A personalised wedding invitation web app for Anis & Zafran, built with Next.js 14. Guests receive a link, RSVP, leave wishes, and browse a gift registry — all in one place. A private admin dashboard lets the couple manage everything in real time.

---

## Features

### Guest-facing
- **Digital invitation** — animated landing page with event details
- **RSVP form** — name, mobile, attendance, plus-ones, with honeypot bot protection
- **Check RSVP** — guests look up their own submission by mobile number
- **Gift registry** — browse items with reserve/unreserve flow; reserved items are visibly locked
- **Wishes & messages** — guests leave a congratulatory note
- **Ref tracking** — `?ref=` URL param records which invite link brought a guest

### Admin dashboard (`/dashboard`)
- **Overview** — live countdown to wedding day, RSVP stats, and preview tables
- **Guest list** — full RSVP table with search, ref filter, relation filter, and editable relation tags (Core Families, Families, Friends, Colleagues, Wedding Connections)
- **Registry** — add / edit / delete items; assign or clear reservations manually
- **Wishes** — read and delete messages
- **Session-protected** — all admin routes require authentication via [better-auth](https://www.better-auth.com/)

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | CSS Modules |
| ORM | Prisma 6 |
| Database | PostgreSQL |
| Auth | better-auth 1.5 |
| Deployment | Vercel (recommended) |

---

## Project structure

```
app/
├── page.tsx                  # Invitation landing page
├── layout.tsx
├── dashboard/                # Admin dashboard (session-gated)
├── registry/                 # Public gift registry
├── sign-in/                  # Auth page
└── api/
    ├── rsvp/                 # RSVP CRUD
    ├── registry/             # Registry items CRUD
    │   └── reservations/     # Reservation create / clear
    └── wishes/               # Wishes CRUD

components/
└── InvitationContent.tsx     # Main invitation UI with RSVP & wishes

prisma/
└── schema.prisma             # DB schema

lib/
├── prisma.ts                 # Prisma client singleton
├── auth.ts                   # better-auth server config
└── auth-client.ts            # better-auth client config
```

---

## Getting started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (local or hosted — [Neon](https://neon.tech), [Supabase](https://supabase.com), etc.)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd e-invite
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# better-auth secret (generate with: openssl rand -hex 32)
BETTER_AUTH_SECRET="your-secret-here"

# Public base URL of your app
BETTER_AUTH_URL="http://localhost:3000"
```

### 3. Set up the database

```bash
# Apply all migrations
npx prisma migrate deploy

# (Development only) create and apply a new migration
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate
```

### 4. Create an admin account

Use the sign-up flow at `/sign-in`, or seed directly via Prisma Studio:

```bash
npx prisma studio
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## API overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/rsvp?mobile=` | Public | Look up a single RSVP |
| `POST` | `/api/rsvp` | Public | Submit / update an RSVP |
| `GET` | `/api/rsvp` | Admin | Fetch all RSVPs |
| `PATCH` | `/api/rsvp` | Admin | Update relation tag |
| `GET` | `/api/registry` | Public (limited) / Admin (full) | List registry items |
| `POST` | `/api/registry` | Admin | Add a registry item |
| `PUT` | `/api/registry` | Admin | Edit a registry item |
| `DELETE` | `/api/registry` | Admin | Delete a registry item |
| `GET` | `/api/registry/reservations?mobile=` | Public | Check reservations by mobile |
| `GET` | `/api/registry/reservations?itemId=` | Public | Get interest count for an item |
| `POST` | `/api/registry/reservations` | Public | Reserve a gift |
| `DELETE` | `/api/registry/reservations` | Admin | Clear a reservation |
| `GET` | `/api/wishes` | Public | Fetch all wishes |
| `POST` | `/api/wishes` | Public | Submit a wish |
| `DELETE` | `/api/wishes` | Admin | Delete a wish |

> **Data privacy**: `GET /api/registry` returns reservation details (who reserved each item) only for authenticated admin sessions. Public responses include `reserved: boolean` only.

---

## Sharing & SEO

The invite is sent by WhatsApp and Instagram DM, so the link preview is a
first-class feature rather than an afterthought.

| File | Role |
|---|---|
| `app/opengraph-image.jpg` | 1200×630 preview card — generated, committed |
| `app/opengraph-image.alt.txt` | its alt text (**no trailing newline** — Next doesn't trim it) |
| `scripts/build-og-image.py` | regenerates the card from `public/hero-sunflower-field.png` + `public/wedding-lockup.png` |
| `scripts/build-icons.py` | regenerates `app/icon.png` and `app/apple-icon.png` from the A&Z monogram |

Both scripts are run by hand (`python3 scripts/build-og-image.py`), like the
Elementor exports in `public/` — they are not part of `npm run build`. They need
Pillow and nothing else.

The tab icon trims the monogram's trailing swash and thickens the strokes
before downscaling. Both moves are needed: downscaled whole, the mark keeps
0% solid ink at 16px and is pure antialiasing haze. The iOS icon keeps the
mark entire, since at 180px the swash survives.

The preview uses Next's `opengraph-image` file convention rather than a manual
`openGraph.images` entry, which buys three things: real `og:image:width`/`height`
(WhatsApp and Facebook use them to pick the large card over a small thumbnail), a
content hash on the URL that busts WhatsApp's per-URL cache — it has no purge
tool — and `twitter:card` for free.

### Why robots.txt is permissive while every page is `noindex`

**Do not add `Disallow: /` to `app/robots.ts`.** It looks like the way to keep
the invite private, and it breaks two things at once:

1. `facebookexternalhit` serves Facebook **and Instagram** DM previews, and it
   honours robots.txt. Disallowing kills the previews the site is shared with.
2. Google never fetches a URL it's disallowed from, so it would never see the
   `noindex` tag — and the bare URL could still get listed. Blocking the crawl
   and noindexing are mutually exclusive.

Privacy comes from `metadata.robots` in `app/layout.tsx` instead, which Google
honours and social scrapers ignore — exactly the split we want. It matters here
because the page prints a bank account number and four family mobile numbers.

`/api/` is the one exception: it's disallowed in robots.txt *and* sent
`X-Robots-Tag: noindex` from `next.config.js`, since JSON has no `<head>` to
carry a meta tag and `GET /api/wishes` returns guest names.

### Testing a preview

- **Facebook / Instagram** — [Sharing Debugger](https://developers.facebook.com/tools/debug/) → paste the URL → **Scrape Again**. Same crawler and cache as IG.
- **WhatsApp** — send the link to yourself in "Message yourself". It caches per-URL with no purge, so append a throwaway `?t=2` while iterating.

---

## Deployment

### Vercel (recommended)

1. Push to GitHub and import the repo in [Vercel](https://vercel.com)
2. Add the environment variables in the Vercel project settings
3. Set the build command to run Prisma generate before the Next.js build:
   ```
   npx prisma generate && next build
   ```

---

## License

Personal project — all rights reserved.
