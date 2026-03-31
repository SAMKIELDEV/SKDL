"""
Groq AI service — sends conversation history to Groq and returns a structured intent dict.
Uses llama-3.3-70b-versatile model.
"""

from __future__ import annotations

import json
import logging

from groq import Groq

from config import settings

logger = logging.getLogger(__name__)

_client = Groq(api_key=settings.GROQ_API_KEY)

SYSTEM_PROMPT = """You are a movie/TV series download assistant bot. Analyze the user's message and return a JSON object with exactly these fields:

{
  "intent": "download_movie" | "download_series" | "clarify" | "chat" | "help",
  "title": string or null,
  "year": integer or null,
  "season": integer or null,
  "episode": integer or null,
  "quality": "best" | "1080p" | "720p" | "480p" or null,
  "clarify_message": string or null,
  "chat_response": string or null
}

Rules:
- If the user clearly wants a movie, set intent to "download_movie" and extract the title.
- If the user wants a specific TV series episode, set intent to "download_series" and extract title, season, episode.
- If the request is ambiguous (e.g. just a show name without episode info), set intent to "clarify" and provide a clarify_message asking for season/episode.
- If the user is just chatting or saying thanks, set intent to "chat" and provide a chat_response.
- If the user asks for help or how to use the bot, set intent to "help".
- Default quality to null (will default to 1080p downstream).
- Return ONLY valid JSON. No markdown, no explanation, just the JSON object."""

FALLBACK_INTENT: dict = {
    "intent": "chat",
    "title": None,
    "year": None,
    "season": None,
    "episode": None,
    "quality": None,
    "clarify_message": None,
    "chat_response": "I didn't quite understand that. Could you try rephrasing? You can ask me to download a movie or TV series episode.",
}


async def parse_intent(history: list[dict[str, str]], user_message: str) -> dict:
    """
    Send conversation history + latest user message to Groq.
    Returns a structured intent dict. Never raises — returns FALLBACK_INTENT on failure.
    """
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    # Add conversation history for context
    for msg in history:
        messages.append({"role": msg["role"], "content": msg["content"]})

    # Add the current user message
    messages.append({"role": "user", "content": user_message})

    try:
        response = _client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.1,
            max_tokens=300,
            response_format={"type": "json_object"},
        )

        raw = response.choices[0].message.content
        if not raw:
            logger.warning("Groq returned empty content")
            return FALLBACK_INTENT.copy()

        parsed = json.loads(raw)

        # Validate required field
        if "intent" not in parsed:
            logger.warning("Groq response missing 'intent' field: %s", raw)
            return FALLBACK_INTENT.copy()

        # Ensure all expected keys exist with defaults
        return {
            "intent": parsed.get("intent", "chat"),
            "title": parsed.get("title"),
            "year": parsed.get("year"),
            "season": parsed.get("season"),
            "episode": parsed.get("episode"),
            "quality": parsed.get("quality"),
            "clarify_message": parsed.get("clarify_message"),
            "chat_response": parsed.get("chat_response"),
        }

    except json.JSONDecodeError as exc:
        logger.error("Groq returned invalid JSON: %s", exc)
        return FALLBACK_INTENT.copy()
    except Exception as exc:
        logger.error("Groq API call failed: %s", exc)
        return FALLBACK_INTENT.copy()
