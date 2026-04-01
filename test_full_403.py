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

async def test_full_html():
    session = Session()
    os.environ["MOVIEBOX_API_HOST_V2"] = settings.MOVIEBOX_API_HOST_V2
    
    # Get a fresh URL
    search = Search(session, query="Oppenheimer", subject_type=SubjectType.MOVIES, per_page=1)
    search_results = await search.get_content_model()
    target = search_results.first_item
    detail = DownloadableMovieFilesDetail(session, target)
    downloadable = await detail.get_content_model()
    media_file = resolve_media_file_to_be_downloaded("1080P", downloadable)
    url = str(media_file.url)
    print(f"Fresh URL: {url}")
    
    headers = {
        "Referer": "https://h5.aoneroom.com/",
        "Origin": "https://h5.aoneroom.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=headers)
        print(f"Status: {resp.status_code}")
        print("\nFull Body:")
        print(resp.text)

if __name__ == "__main__":
    from moviebox_api.v1 import DownloadableMovieFilesDetail
    sys.path.append(os.path.join(os.getcwd(), "bot"))
    asyncio.run(test_full_html())
