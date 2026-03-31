# MovieBox Bot

A Telegram bot (`@SK_DLBOT`) that lets you request movies and TV series in plain English, powered by Groq AI. Delivers files directly in chat and generates temporary download links at `movies.samkiel.dev`.

---

## Services

| Service | Description | Location |
|---|---|---|
| `bot/` | Python aiogram Telegram bot | Railway |
| `web/` | Next.js link redirect server | Railway |

---

## Stack

- **Bot:** Python 3.11, aiogram 3.x, Groq API, moviebox-api, Supabase
- **Web:** Next.js 14 (App Router), Supabase, TypeScript
- **DB:** Supabase (Postgres)
- **Hosting:** Railway (both services)
- **Domain:** movies.samkiel.dev

---

## How It Works

1. User messages `@SK_DLBOT` in plain English
2. Groq parses the intent and extracts title, quality, season/episode
3. Bot fetches content via moviebox-api
4. Bot sends the file (if under 2GB) + a short link (`movies.samkiel.dev/[id]`)
5. Link redirects to CDN URL for 6 hours, then shows an expired page

---

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- A Supabase project
- A Groq API key (free at console.groq.com)
- A Telegram bot token from @BotFather

---

### 1. Clone

```bash
git clone https://github.com/samkiell/moviebox-bot.git
cd moviebox-bot
```

---

### 2. Supabase Setup

Run this in your Supabase SQL editor:

```sql
create table media (
  id            text primary key,
  title         text not null,
  cdn_url       text not null,
  type          text not null check (type in ('movie', 'series')),
  quality       text default '1080p',
  season        integer null,
  episode       integer null,
  requested_by  bigint null,
  requested_at  timestamptz default now(),
  expires_at    timestamptz not null
);
```

---

### 3. Bot Setup

```bash
cd bot
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# fill in .env values
python main.py
```

---

### 4. Web Setup

```bash
cd web
npm install
cp .env.example .env.local
# fill in .env.local values
npm run dev
```

Web runs at `http://localhost:3000`

---

## Environment Variables

### Bot (`bot/.env`)

```
TELEGRAM_BOT_TOKEN=
SUPABASE_URL=
SUPABASE_KEY=
GROQ_API_KEY=
LINK_BASE_URL=https://movies.samkiel.dev
CDN_TTL_HOURS=6
MOVIEBOX_API_HOST_V2=h5-api.aoneroom.com
```

### Web (`web/.env.local`)

```
SUPABASE_URL=
SUPABASE_KEY=
NEXT_PUBLIC_BOT_USERNAME=SK_DLBOT
```

---

## Deployment (Railway)

Both services deploy from this monorepo as separate Railway services.

**Bot service:**
- Root directory: `bot`
- Start command: `python main.py`
- Add env vars from `bot/.env.example`

**Web service:**
- Root directory: `web`
- Start command: `npm run build && npm start`
- Add env vars from `web/.env.example`
- Add custom domain: `movies.samkiel.dev`

---

## Bot Usage

No commands needed — just talk to it:

```
"I want to watch Avatar"
"Download Breaking Bad season 2 episode 3"
"Get me Inception in 720p"
"The dark knight"
```

Slash commands (fallback):
```
/start         — welcome message
/movie <title> — request a movie
/series <title> <season> <episode> — request an episode
/status        — health check
```

---

## Project Structure

```
moviebox-bot/
  bot/
    main.py              # entry point, bot init
    config.py            # env var loading
    requirements.txt
    .env.example
    handlers/
      start.py           # /start, /status
      movie.py           # /movie command handler
      series.py          # /series command handler
      message.py         # all text messages → Groq → intent router
    services/
      moviebox.py        # wraps moviebox-api, extracts CDN URLs
      supabase.py        # read/write media table
      link.py            # ID generation, link building
      groq_service.py    # Groq intent parsing
      session.py         # in-memory per-user conversation history
  web/
    app/
      [id]/page.tsx      # redirect or expired page
      not-found.tsx      # 404 page
      layout.tsx
      page.tsx           # root redirect to bot
    lib/
      supabase.ts        # supabase client
    .env.example
    package.json
```

---

## License

Personal project. Not affiliated with moviebox.ph.
