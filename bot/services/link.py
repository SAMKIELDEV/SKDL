"""
Link service — generates short IDs and builds redirect URLs.
Uses nanoid for collision-resistant, URL-safe IDs.
"""

from __future__ import annotations

from nanoid import generate

from config import settings

# Simplified lowercase alphabet for case-insensitive DBs
_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz"
_ID_LENGTH = 8


def generate_id() -> str:
    """Generate a short, URL-safe nanoid."""
    return generate(_ALPHABET, _ID_LENGTH)


def build_url(link_id: str) -> str:
    """Build a full redirect URL from a link ID."""
    base = settings.LINK_BASE_URL.rstrip("/")
    return f"{base}/{link_id}"
