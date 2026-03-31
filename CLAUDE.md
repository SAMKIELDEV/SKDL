# CLAUDE.md — Instructions for Claude Code

This file is the source of truth for all development decisions on this project.
Read this fully before writing any code. Do not deviate from these instructions.

---

## What This Project Is

A two-service monorepo:
1. `bot/` — Python Telegram bot (`@SK_DLBOT`) using aiogram 3.x and Groq AI
2. `web/` — Next.js 14 link redirect server deployed at `movies.samkiel.dev`

Full spec is in `PRD.md`. Read it.

---

## Absolute Rules

- **Never use Flask or FastAPI** in the bot service. The bot is aiogram only.
- **Never use `python-telegram-bot` library.** Use `aiogram` 3.x only.
- **Never use Pages Router in Next.js.** App Router only.
- **Never use `any` type in TypeScript** unless absolutely unavoidable.
- **Never create files outside the defined folder structure** without a clear reason.
- **Never hardcode secrets.** All secrets come from environment variables via `config.py` (bot) or `.env.local` (web).
- **Never add dependencies not in this list** without asking first.
- **Always handle errors.** Every async call must have try/except (Python) or try/catch (TS).
- **Keep changes scoped.** If asked to fix one thing, fix only that thing.

---

## Bot — Python Conventions

### Approved dependencies only:
```
aiogram==3.x
groq
supabase
python-dotenv
nanoid
moviebox-api
httpx
```

### Config pattern:
All env vars loaded in `config.py` using `python-dotenv`. Imported everywhere as:
```python
from config import settings
```

`config.py` must use a `Settings` dataclass or simple namespace — not scattered `os.getenv()` calls throughout the codebase.

### File structure — do not change this:
```
bot/
  main.py              # bot init, register routers, start polling
  config.py            # all env vars in one place
  requirements.txt
  .env.example
  handlers/
    start.py           # /start and /status commands
    movie.py           # /movie <title> command
    series.py          # /series <title> <season> <episode> command
    message.py         # catches all non-command text → routes through Groq
  services/
    moviebox.py        # interfaces with moviebox-api, returns CDN URL + metadata
    supabase.py        # all DB reads and writes
    link.py            # nanoid generation, link building
    groq_service.py    # Groq API call, returns parsed intent dict
    session.py         # in-memory dict keyed by telegram user_id
```

### aiogram patterns to follow:
```python
# Router pattern — each handler file creates its own router
from aiogram import Router
router = Router()

# Register in main.py
from handlers import start, movie, series, message
dp.include_router(start.router)
dp.include_router(movie.router)
dp.include_router(series.router)
dp.include_router(message.router)  # message.router must be LAST
```

### Groq intent schema — always return this shape:
```python
{
  "intent": "download_movie" | "download_series" | "clarify" | "chat" | "help",
  "title": str | None,
  "year": int | None,
  "season": int | None,
  "episode": int | None,
  "quality": "best" | "1080p" | "720p" | "480p" | None,
  "clarify_message": str | None,
  "chat_response": str | None
}
```

If Groq returns malformed JSON, catch the error and reply with a fallback message. Never crash.

### Session management:
```python
# session.py — in-memory only for MVP
sessions: dict[int, list] = {}
MAX_HISTORY = 10
```
Clear session after successful download or on `/start`.

### moviebox.py — critical note:
The `moviebox-api` library is designed to download files, not just return URLs.
The goal is to intercept the CDN URL BEFORE the download completes.

Investigate `moviebox_api.v1` internals specifically:
- `MovieAuto` class
- `Downloader` class
- Look for where the stream/CDN URL is resolved before bytes are written to disk

The `moviebox.py` service should expose:
```python
async def get_movie(title: str, quality: str = "1080p") -> dict:
    # returns { cdn_url, title, year, quality }

async def get_episode(title: str, season: int, episode: int, quality: str = "1080p") -> dict:
    # returns { cdn_url, title, season, episode, quality }
```

If CDN URL interception is not possible cleanly, download to a temp file, upload to Telegram, then delete. Document which approach was used with a comment.

### Delivery logic (in handlers):
```python
# Always save to DB and generate link first
# Then attempt file upload
# If upload fails or file > 2GB, send link only
# Always send the link regardless
```

### Message format for bot replies:
```
🎬 {title} ({year})        # for movies
📺 {title} S{season}E{episode}  # for series
Quality: {quality}

📥 movies.samkiel.dev/{id}
⏳ Link expires in 6 hours
```

---

## Web — Next.js Conventions

### Stack:
- Next.js 14, App Router, TypeScript
- Supabase JS client (`@supabase/supabase-js`)
- Tailwind CSS for styling
- No UI component library (keep it minimal)

### File structure — do not change this:
```
web/
  app/
    [id]/
      page.tsx      # dynamic route — redirect or expired UI
    not-found.tsx   # 404 page
    layout.tsx      # root layout
    page.tsx        # root page — redirects to t.me/SK_DLBOT
  lib/
    supabase.ts     # createClient() export
  .env.example
  package.json
  tailwind.config.ts
  tsconfig.json
```

### The `[id]` route — exact logic:
```typescript
// app/[id]/page.tsx
// This is a server component
// 1. Get id from params
// 2. Query Supabase media table by id
// 3. If no row: notFound()
// 4. If expires_at < now: render <ExpiredPage title={data.title} />
// 5. If valid: redirect(data.cdn_url) — use Next.js redirect()
```

### Supabase client:
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
)
```

### Styling rules:
- Dark background (`#0f0f0f` or `bg-zinc-950`)
- White/gray text
- Minimal — expired page needs: title, message, one CTA button
- No animations, no heavy UI
- Mobile first

### Expired page copy:
```
Title of movie/series
"This download link has expired."
[Request again on Telegram] → https://t.me/SK_DLBOT
```

### 404 page copy:
```
"Link not found."
[Go to bot] → https://t.me/SK_DLBOT
```

### Root page (`app/page.tsx`):
Redirect immediately to `https://t.me/SK_DLBOT`

---

## Database

### Supabase table: `media`
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

The table must already exist. Do not write migration files — the table is created manually in Supabase dashboard.

---

## What To Build First (Order)

Follow this order exactly:

1. `bot/config.py` — env var loading
2. `bot/services/session.py` — in-memory session store
3. `bot/services/groq_service.py` — Groq intent parsing
4. `bot/services/link.py` — nanoid + URL builder
5. `bot/services/supabase.py` — DB save and lookup
6. `bot/services/moviebox.py` — CDN URL extraction (investigate internals first)
7. `bot/handlers/start.py` — /start and /status
8. `bot/handlers/message.py` — main message router
9. `bot/handlers/movie.py` — /movie command
10. `bot/handlers/series.py` — /series command
11. `bot/main.py` — wire everything together
12. `bot/requirements.txt` and `bot/.env.example`
13. `web/lib/supabase.ts`
14. `web/app/[id]/page.tsx`
15. `web/app/not-found.tsx`
16. `web/app/page.tsx`
17. `web/app/layout.tsx`
18. `web/.env.example` and `web/package.json`

---

## Do Not

- Do not add Redis (not in MVP scope)
- Do not add rate limiting (not in MVP scope)
- Do not add a web dashboard
- Do not add user authentication
- Do not add subtitle language selection (default English always)
- Do not use webhooks for the bot (use polling for MVP)
- Do not use `next/image` for external images (not needed)
- Do not add a public REST API (future scope)
- Do not install packages outside the approved list without flagging it

---

## When In Doubt

- Check `PRD.md` for feature scope
- Check this file for implementation decisions
- Ask before adding anything not specified here
