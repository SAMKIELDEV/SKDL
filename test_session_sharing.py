import aiohttp
import asyncio
import logging
import sys
import os

# Mock settings
class MockSettings:
    MOVIEBOX_API_HOST_V2 = "h5-api.aoneroom.com"

settings = MockSettings()

# From bot/services/moviebox.py
from moviebox_api.v1 import Search, Session, DownloadableTVSeriesFilesDetail, resolve_media_file_to_be_downloaded
from moviebox_api.v1.constants import SubjectType

async def test_session_sharing():
    # Session() in moviebox_api creates an aiohttp session and populates it
    session = Session()
    os.environ["MOVIEBOX_API_HOST_V2"] = settings.MOVIEBOX_API_HOST_V2
    
    # Get a fresh URL. 
    # The BFF call inside DownloadableTVSeriesFilesDetail.get_content_model() 
    # will set cookies in session.session (the underlying aiohttp.ClientSession)
    search = Search(session, query="Breaking Bad", subject_type=SubjectType.TV_SERIES, per_page=1)
    search_results = await search.get_content_model()
    target = search_results.first_item
    detail = DownloadableTVSeriesFilesDetail(session, target)
    downloadable = await detail.get_content_model(season=3, episode=12)
    media_file = resolve_media_file_to_be_downloaded("1080P", downloadable)
    url = str(media_file.url)
    print(f"Fresh URL: {url}")
    
    # NOW: Try to use the SAME underlying session to download it.
    # This ensures identical headers/cookies/IP.
    print("\nTesting with THE SAME aiohttp session used for API (sharing cookies)...")
    
    # moviebox_api.v1.Session.session is the actual aiohttp.ClientSession
    headers = {
        "Referer": "https://h5.aoneroom.com/",
        "Origin": "https://h5.aoneroom.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    async with session.session.get(url, headers=headers) as resp:
        print(f"Status: {resp.status}")
        if resp.status == 200:
            print("✅ SUCCESS! Cookies/Session sharing is mandatory.")
        else:
            text = await resp.text()
            print(f"FAILED Status {resp.status}: {text[:200]}")

if __name__ == "__main__":
    from moviebox_api.v1 import DownloadableMovieFilesDetail
    sys.path.append(os.path.join(os.getcwd(), "bot"))
    asyncio.run(test_session_sharing())
