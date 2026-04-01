import asyncio
import os
import sys

# Add bot directory to path to import services correctly
bot_dir = os.path.join(os.getcwd(), "bot")
sys.path.append(bot_dir)

# Now we can import from the bot services
from services.supabase import save_media
from services.link import generate_id, build_url

async def test_full_flow():
    print("--- Starting Full Flow Test ---")
    
    # 1. Generate ID
    link_id = generate_id()
    print(f"Generated Link ID: {link_id}")
    
    # 2. Save Media (Mock data)
    title = "Test Movie — SKDL"
    cdn_url = "https://bcdnxw.hakunaymatata.com/resource/test.mp4"
    result = await save_media(
        link_id=link_id,
        title=title,
        cdn_url=cdn_url,
        media_type="movie",
        quality="1080p",
        requested_by=12345,
        subject_id="2518237873669820192" # Random valid subject_id
    )
    
    if result:
        print(f"✅ Successfully saved to Supabase!")
        print(f"Response data: {result}")
        
        # 3. Build URL
        url = build_url(link_id)
        print(f"\n👉 OPEN THIS IN YOUR BROWSER:")
        print(url)
        print("\nIf it still says 'Link not found', check the terminal running 'npm run dev' for Supabase error logs.")
    else:
        print("❌ Failed to save to Supabase. Check bot/.env credentials.")

if __name__ == "__main__":
    asyncio.run(test_full_flow())
