#!/usr/bin/env python3
"""Simple wrapper to start Flask app with better error handling"""
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    print("[Startup] Loading environment variables...")
    from dotenv import load_dotenv
    load_dotenv()
    
    print("[Startup] Checking Supabase credentials...")
    supabase_url = os.getenv('https://vtdfbkgaiotlpnxwrzsi.supabase.co') or os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('sb_publishable_1i0v9JCPC4JJ-r8frvGVsg_Bih-whUw') or os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    
    if not supabase_url or not supabase_key:
        print("[ERROR] Supabase credentials not found!")
        print(f"  SUPABASE_URL: {supabase_url}")
        print(f"  SUPABASE_ANON_KEY: {supabase_key}")
        sys.exit(1)
    
    print("[Startup] Starting Flask app...")
    from app import app
    
    print("[SUCCESS] Flask app started on http://localhost:5000")
    print("[INFO] Available endpoints:")
    print("  - GET  /api/health")
    print("  - GET  /api/news?category=general&country=us&page=1")
    print("  - POST /api/summarize")
    print("  - GET  /api/preferences")
    print("  - POST /api/preferences")
    print("  - GET  /api/saved-articles")
    print("  - POST /api/saved-articles")
    print("  - DELETE /api/saved-articles/<id>")
    
    app.run(debug=True, port=5000, use_reloader=False)
    
except Exception as e:
    print(f"[ERROR] Failed to start Flask app: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
