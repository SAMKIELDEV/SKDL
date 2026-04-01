import httpx
import asyncio
import logging
import sys
import os

# Mock settings
class MockSettings:
    MOVIEBOX_API_HOST_V2 = "h5.aoneroom.com"

settings = MockSettings()

# From bot/services/moviebox.py
from moviebox_api.v1 import Search, Session, DownloadableTVSeriesFilesDetail, resolve_media_file_to_be_downloaded
from moviebox_api.v1.constants import SubjectType

async def test_session_sharing_correct_v4():
    session = Session()
    os.environ["MOVIEBOX_API_HOST_V2"] = settings.MOVIEBOX_API_HOST_V2
    
    # Get a fresh URL
    search = Search(session, query="Breaking Bad", subject_type=SubjectType.TV_SERIES, per_page=1)
    search_results = await search.get_content_model()
    target = search_results.first_item
    detail = DownloadableTVSeriesFilesDetail(session, target)
    downloadable = await detail.get_content_model(season=3, episode=12)
    media_file = resolve_media_file_to_be_downloaded("1080P", downloadable)
    url = str(media_file.url)
    print(f"Fresh URL: {url}")
    
    # Inspect session cookies
    print(f"Session Cookies: {session._client.cookies}")
    
    headers = {
        "Referer": "https://h5.aoneroom.com/",
        "Origin": "https://h5.aoneroom.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    client = session._client 
    
    # Test 1: Shared Session
    print("\nTest 1: Shared Session (Cookies: %s)" % client.cookies)
    resp = await client.get(url, headers=headers)
    print(f"Status: {resp.status_code}")
    
    # Test 2: Raw httpx without cookies (pure Referer)
    print("\nTest 2: Raw httpx (no cookies, only Referer)...")
    async with httpx.AsyncClient() as raw_client:
        resp = await raw_client.get(url, headers=headers)
        print(f"Status: {resp.status_code}")

if __name__ == "__main__":
    from moviebox_api.v1 import DownloadableMovieFilesDetail
    sys.path.append(os.path.join(os.getcwd(), "bot"))
    asyncio.run(test_session_sharing_correct_v4())
