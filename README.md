## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Supabase Google Auth

1. Create a Supabase project and open **Authentication → URL Configuration**. Set the **Site URL** to your local or deployed domain (e.g. `http://localhost:3000`) so Supabase can redirect the browser after sign-in.
2. In **Authentication → Providers → Google**, enable the provider and paste your Google OAuth client ID/secret. Inside Google Cloud Console, add `https://<your-project-ref>.supabase.co/auth/v1/callback` to the authorized redirect URIs (Supabase shows the exact value in the provider settings).
3. Add the following variables to `.env.local` (create the file if it does not exist):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-from-supabase>
# Optional: override the post-login redirect (falls back to current origin).
NEXT_PUBLIC_SUPABASE_REDIRECT_URL=http://localhost:3000
```

Restart `npm run dev` after editing environment variables.

When you click **Log in with Google** on `/login`, the browser will be redirected to Supabase for OAuth and then back to the app.
