"""
subtitle.py — Callback handler for subtitle downloads.
"""

import logging
from aiogram import Router, F
from aiogram.types import CallbackQuery, URLInputFile

from services.moviebox import get_subtitles
from services.opensubtitles import search_subtitles, download_subtitle, find_best_match

logger = logging.getLogger(__name__)
router = Router()

@router.callback_query(F.data.startswith("sb:"))
async def handle_subtitle_callback(callback: CallbackQuery):
    """
    Process subtitle download request.
    Data format: sb:{is_series}:{subject_id}:{imdb_id}:{sn}:{ep}
    """
    await callback.answer("🔍 Searching for subtitles...")
    
    try:
        parts = callback.data.split(":")
        is_series = parts[1] == "1"
        subject_id = parts[2]
        imdb_id = parts[3] if parts[3] != "0" else None
        season = int(parts[4])
        episode = int(parts[5])

        # 1. Try MovieBox first
        result = await get_subtitles(subject_id, is_series, season, episode)
        
        if result:
            await callback.message.answer_document(
                URLInputFile(result["subtitle_url"], filename=result["file_name"]),
                caption="📥 Subtitles via **MovieBox**"
            )
            return

        # 2. Fallback to OpenSubtitles
        # Search by IMDb ID if available, otherwise we'd need the title (not in callback)
        # For now, if no IMDb ID, we can't search OpenSubtitles easily without passing title in callback
        # (Callback data is limited to 64 bytes)
        
        if imdb_id:
            os_subs = await search_subtitles(imdb_id=f"tt{imdb_id}")
            best = find_best_match(os_subs)
            
            if best:
                file_id = best["attributes"]["files"][0]["file_id"]
                download_res = await download_subtitle(file_id)
                
                if download_res and download_res.get("link"):
                    file_name = download_res.get("file_name", f"opensubtitles_{file_id}.srt")
                    await callback.message.answer_document(
                        URLInputFile(download_res["link"], filename=file_name),
                        caption="📥 Subtitles via **OpenSubtitles**"
                    )
                    return

        await callback.message.answer("❌ Sorry, no English subtitles found for this title.")

    except Exception as exc:
        logger.error("Subtitle callback failed: %s", exc)
        await callback.message.answer("❌ Subtitle retrieval failed. Please try again later.")
