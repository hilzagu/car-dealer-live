# AutoPrime — Car Dealer Ecommerce

Vite + React + Supabase (Google Auth + Postgres) + Paystack checkout + Mailgun receipts.

## 1. Supabase setup
1. Create project at supabase.com → copy URL + anon key into `.env` (see `.env.example`).
2. SQL editor → run `supabase/schema.sql`.
3. Auth → Providers → enable **Google**:
   - Google Cloud Console → OAuth client → Authorized redirect: `https://<project>.supabase.co/auth/v1/callback`
   - Paste Client ID/Secret into Supabase.
4. Auth → URL config → Site URL = `http://localhost:5173` (prod: your domain).

## 2. Paystack setup
1. paystack.com → get **public** + **secret** keys (test mode first).
2. Frontend `.env`: `VITE_PAYSTACK_PUBLIC_KEY=pk_test_...`
3. Backend: `PAYSTACK_SECRET_KEY=sk_test_...` in env (server reads root `.env`).

## 3. Mailgun setup
1. Mailgun → add domain (or sandbox) → get API key.
2. Backend env: `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_FROM_EMAIL`.
3. Without keys the server logs instead of sending (safe dev mode).

## 4. Run
```bash
cd car-dealer-shop
npm install
cp .env.example .env   # then fill keys
npm run dev            # frontend :5173
npm run server         # backend :4242 (second terminal)
```

## Flow
- Browse `/inventory` → vehicle page → Add to cart → `/checkout`.
- Checkout creates `orders` row (status=pending), opens Paystack popup, verifies via `/api/paystack/verify/:ref`, marks `paid`, sends Mailgun receipt.
- Test-drive form creates `test_drives` row + Mailgun confirmation.
- `/dashboard` = my orders, `/admin` = add vehicle.

## Notes
- Prices stored in **kobo** (Paystack requirement).
- Never expose `PAYSTACK_SECRET_KEY` or `MAILGUN_API_KEY` with `VITE_` prefix.
- Tighten RLS `admin manage vehicles` policy to check an admin flag before production.
