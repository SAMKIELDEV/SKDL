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

async def test_referers():
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
    
    referer_list = [
        "https://h5.aoneroom.com/",
        f"https://h5.aoneroom.com/movies/{target.subjectId}",
        f"https://h5.aoneroom.com/play/{target.subjectId}",
    ]
    
    async with aiohttp.ClientSession() as client:
        for ref in referer_list:
            headers = {
                "Referer": ref,
                "Origin": "https://h5.aoneroom.com",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
            print(f"\nTesting with Referer: {ref}...")
            async with client.get(url, headers=headers) as resp:
                print(f"Status: {resp.status}")
                if resp.status == 200:
                    print(f"✅ SUCCESS with Referer: {ref}")
                else:
                    text = await resp.text()
                    print(f"FAILED Status {resp.status}")

if __name__ == "__main__":
    from moviebox_api.v1 import DownloadableMovieFilesDetail
    sys.path.append(os.path.join(os.getcwd(), "bot"))
    asyncio.run(test_referers())
