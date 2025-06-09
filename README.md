# Freestyle Chat App

First, install dependencies:

```bash
bun install
```

Then, create .env file and fill in the following variables:

```env
// for jwt
JWT_SECRET=
NODE_ENV="development"

//for nodemailer
GMAIL_USER=
GOOGLE_APP_PASS=

// for supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=

// for getstream.io
STREAM_API_KEY=
STREAM_SECRET=
```

Finally, start Bun's full stack dev server with:

```bash
bun run dev
```
