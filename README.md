# ShopOS

A clean, real-time shop operations dashboard built with **Next.js 15**, **Supabase**, and **Tailwind CSS 4**. Designed for salons, barbershops, and service-based businesses to manage daily sales, expenses, staff, and services.

## Features

- **Role-based login** — Owner and Front Desk roles with a dropdown selector
- **Owner Dashboard** — Full control: overview KPIs, catalog, expenses, staff performance, services
- **Front Desk Dashboard** — Streamlined view for logging and editing sales
- **Real-time financials** — Revenue, expenses, and profit computed dynamically from the database
- **Staff performance tracking** — Daily customer count and revenue per staff member
- **Supabase Auth** — Secure email/password authentication with middleware route protection
- **Row Level Security** — Restrictive RLS policies on every table

## Tech Stack

| Layer         | Technology                    |
|---------------|-------------------------------|
| Framework     | Next.js 15 (App Router)       |
| Language      | TypeScript                    |
| Database      | Supabase (PostgreSQL)         |
| Auth          | Supabase Auth + SSR Middleware|
| Styling       | Tailwind CSS 4                |
| Animations    | Motion (Framer Motion)        |
| Icons         | Lucide React                  |

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd shopOS
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your **Project URL** and **Anon Key** from Settings → API
3. Create a `.env` file (see `.env.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

4. Run the SQL in `supabase-schema.sql` via the Supabase SQL Editor
5. Create two auth users in Authentication → Users → Add User:
   - `owner@shopos.com` (with a password)
   - `frontdesk@shopos.com` (with a password)
6. Promote the owner by running in the SQL Editor:

```sql
UPDATE public.profiles SET role = 'owner' WHERE id = '<owner-user-uuid>';
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in.

## Project Structure

```
shopOS/
├── app/
│   ├── layout.tsx          # Root layout (fonts, metadata)
│   ├── page.tsx            # Redirects to /login
│   ├── globals.css         # Tailwind theme config
│   ├── login/page.tsx      # Login with role selector
│   ├── owner/page.tsx      # Owner dashboard (all tabs)
│   └── front-desk/page.tsx # Front desk dashboard
├── hooks/
│   ├── useShopData.ts      # Central data hook (Supabase CRUD + computed KPIs)
│   └── use-mobile.ts       # Mobile breakpoint detection
├── lib/
│   ├── supabaseClient.ts   # Browser-side Supabase client
│   ├── supabaseServer.ts   # Server-side Supabase client (middleware)
│   └── utils.ts            # Tailwind class merge utility
├── middleware.ts            # Auth guard + role-based route protection
├── supabase-schema.sql     # Complete database schema with RLS + seed data
├── .env.example            # Environment variable template
└── package.json
```

## License

Private project.
