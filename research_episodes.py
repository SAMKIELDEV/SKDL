import asyncio
import os
import sys
from moviebox_api.v1 import Session, Search, DownloadableTVSeriesFilesDetail
from moviebox_api.v1.constants import SubjectType

async def research_episodes():
    session = Session()
    try:
        search = Search(session, query="Breaking Bad", subject_type=SubjectType.TV_SERIES, per_page=1)
        results = await search.get_content_model()
        if not results.items:
            print("No results")
            return
        
        target = results.first_item
        print(f"Found Series: {target.title} (ID: {target.subjectId})")
        
        detail = DownloadableTVSeriesFilesDetail(session, target)
        # Check what downloadable metadata we can get without season/episode first
        # Usually we need coords, but let's see if we can iterate or list.
        # Actually, let's just try to fetch episode 1 and see if it gives any info about others.
        downloadable = await detail.get_content_model(season=1, episode=1)
        print("Keys in downloadable model:", list(downloadable.model_fields.keys()) if hasattr(downloadable, 'model_fields') else dir(downloadable))
        
    except Exception as e:
        print("Error:", str(e))

if __name__ == "__main__":
    asyncio.run(research_episodes())
