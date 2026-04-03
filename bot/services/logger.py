"""
logger.py — Async logging service for bot events.
Writes to the `bot_logs` table in Supabase.
"""

import logging
import asyncio
from datetime import datetime, timezone
from services.supabase import _client

logger = logging.getLogger(__name__)

async def _do_log_event(
    user_id: int,
    username: str | None,
    display_name: str | None,
    action: str,
    query: str | None = None,
    result_title: str | None = None,
    result_found: bool = False,
    error_message: str | None = None,
    duration_ms: int | None = None,
):
    """Internal implementation of logging a row to Supabase."""
    row = {
        "user_id": user_id,
        "username": username,
        "display_name": display_name,
        "action": action,
        "query": query,
        "result_title": result_title,
        "result_found": result_found,
        "error_message": error_message,
        "duration_ms": duration_ms,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    try:
        _client.table("bot_logs").insert(row).execute()
    except Exception as exc:
        # Never raise or block the bot — just log to console
        logger.error("Failed to write to bot_logs: %s", exc)

def log_event(
    user_id: int,
    username: str | None,
    display_name: str | None,
    action: str,
    query: str | None = None,
    result_title: str | None = None,
    result_found: bool = False,
    error_message: str | None = None,
    duration_ms: int | None = None,
):
    """
    Fire-and-forget logging of a bot event.
    Wraps the async DB call in a task so it doesn't block.
    """
    asyncio.create_task(
        _do_log_event(
            user_id=user_id,
            username=username,
            display_name=display_name,
            action=action,
            query=query,
            result_title=result_title,
            result_found=result_found,
            error_message=error_message,
            duration_ms=duration_ms
        )
    )
