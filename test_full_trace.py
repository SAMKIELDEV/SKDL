import asyncio
import os
import sys
import traceback

# Add bot directory to path to import services correctly
bot_dir = os.path.join(os.getcwd(), "bot")
sys.path.append(bot_dir)

from services.supabase import save_media, _client
from services.link import generate_id, build_url

async def test_full_trace():
    print("--- Starting Detailed Flow Test ---")
    
    link_id = generate_id()
    print(f"Generated Link ID: {link_id}")
    
    row = {
        "id": link_id,
        "title": "Test Movie — SKDL",
        "cdn_url": "https://bcdnxw.hakunaymatata.com/resource/test.mp4",
        "type": "movie",
        "quality": "1080p",
        "requested_by": 12345,
        "expires_at": "2026-04-01T12:00:00Z",
        "subject_id": "2518237873669820192"
    }
    
    try:
        print(f"Attempting insert into 'media'...")
        # Use execute() and check for errors
        response = _client.table("media").insert(row).execute()
        print(f"✅ SUCCESS! Response data: {response.data}")
        
        # Now try to fetch it back immediately
        print(f"Attempting to fetch it back...")
        check = _client.table("media").select("*").eq("id", link_id).execute()
        if check.data:
            print(f"✅ Found it! {check.data}")
            url = build_url(link_id)
            print(f"\n👉 TEST THIS URL: {url}")
        else:
            print("❌ Found nothing in DB after insert.")
            
    except Exception:
        print("❌ EXCEPTION CAUGHT:")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_full_trace())
