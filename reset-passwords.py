#!/usr/bin/env python3
"""
Reset all member passwords to password123
Excludes secretary@cityuniversityclub.co.uk (admin account)
"""

import requests

SUPABASE_URL = "https://myfoyoyjtkqthjjvabmn.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15Zm95b3lqdGtxdGhqanZhYm1uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIwMjk0MCwiZXhwIjoyMDg3Nzc4OTQwfQ.6KeM30VOjJLg0MJXq8gR6OjAgV_UrQDIB87wBobFZjA"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

def reset_passwords():
    print("🔧 Resetting all member passwords to 'password123'...\n")
    
    # Get all members except secretary
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/members?select=email,full_name&is_active=eq.true&email=neq.secretary@cityuniversityclub.co.uk",
        headers=headers
    )
    
    members = response.json()
    print(f"Found {len(members)} members to update\n")
    
    success = 0
    failed = 0
    
    for member in members:
        email = member['email']
        name = member.get('full_name', 'Unknown')
        
        # Update password
        update_response = requests.patch(
            f"{SUPABASE_URL}/rest/v1/members?email=eq.{email}",
            headers=headers,
            json={"password_hash": "password123"}
        )
        
        if update_response.status_code in [200, 204]:
            print(f"✅ {email}")
            success += 1
        else:
            print(f"❌ {email}: {update_response.text}")
            failed += 1
    
    print(f"\n{'='*60}")
    print(f"✅ Success: {success}")
    print(f"❌ Failed: {failed}")
    print(f"{'='*60}")
    print(f"\n📝 All members can now login with:")
    print(f"   Password: password123")
    print(f"   (Use their registered email address)")

if __name__ == "__main__":
    reset_passwords()
