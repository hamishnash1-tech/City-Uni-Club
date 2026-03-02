#!/usr/bin/env python3
"""
Upload contacts from CSV to Supabase members table
"""

import csv
import requests
import json
from datetime import datetime

# Supabase configuration
SUPABASE_URL = "https://myfoyoyjtkqthjjvabmn.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15Zm95b3lqdGtxdGhqanZhYm1uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIwMjk0MCwiZXhwIjoyMDg3Nzc4OTQwfQ.6KeM30VOjJLg0MJXq8gR6OjAgV_UrQDIB87wBobFZjA"

# Headers for Supabase API
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates"  # Avoid duplicates
}

def read_contacts(csv_path):
    """Read contacts from CSV file"""
    contacts = []
    
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        # Read CSV with BOM encoding
        reader = csv.DictReader(f)
        
        for row in reader:
            email = row.get('Email 1', '').strip()
            if not email:
                email = row.get('Email 2', '').strip()
            
            if email and '@' in email:
                first_name = row.get('First Name', '').strip()
                last_name = row.get('Last Name', '').strip()
                phone = row.get('Phone 1', '').strip()
                
                # Clean phone number
                if phone.startswith("'"):
                    phone = phone[1:]
                
                full_name = f"{first_name} {last_name}".strip()
                if not full_name:
                    # Use email prefix as name
                    full_name = email.split('@')[0].title()
                    first_name = full_name.split()[0] if full_name else ""
                
                contacts.append({
                    'email': email,
                    'full_name': full_name,
                    'first_name': first_name or full_name,
                    'phone_number': phone or None
                })
    
    return contacts

def upload_to_supabase(contacts):
    """Upload contacts to Supabase members table"""
    print(f"📊 Uploading {len(contacts)} contacts to Supabase...")
    print()
    
    success_count = 0
    error_count = 0
    skipped_count = 0
    
    for i, contact in enumerate(contacts, 1):
        # Create member record with default password
        member_data = {
            "email": contact['email'],
            "password_hash": "password123",  # Default password
            "full_name": contact['full_name'],
            "first_name": contact['first_name'],
            "membership_number": f"CUC-2024-{str(i).zfill(4)}",
            "membership_type": "Full Membership",
            "member_since": datetime.now().strftime("%Y-%m-%d"),
            "member_until": "2026-12-31",
            "phone_number": contact['phone_number'],
            "is_active": True
        }
        
        try:
            # Insert into members table
            response = requests.post(
                f"{SUPABASE_URL}/rest/v1/members",
                headers=headers,
                json=member_data
            )
            
            if response.status_code in [200, 201, 204]:
                print(f"✅ [{i}/{len(contacts)}] Added: {contact['email']}")
                success_count += 1
            elif response.status_code == 409:
                print(f"⚠️  [{i}/{len(contacts)}] Skipped (exists): {contact['email']}")
                skipped_count += 1
            else:
                print(f"❌ [{i}/{len(contacts)}] Error: {contact['email']} - {response.text}")
                error_count += 1
                
        except Exception as e:
            print(f"❌ [{i}/{len(contacts)}] Exception: {contact['email']} - {str(e)}")
            error_count += 1
    
    print()
    print("=" * 60)
    print(f"✅ Upload Complete!")
    print(f"   Success: {success_count}")
    print(f"   Skipped: {skipped_count}")
    print(f"   Errors: {error_count}")
    print("=" * 60)
    print()
    print("📝 All members have been set with default password: password123")
    print("   They can change it after logging in.")

def main():
    csv_path = "/Users/hamishnash/Downloads/contacts.csv"
    
    print("📋 Reading contacts from CSV...")
    contacts = read_contacts(csv_path)
    
    if not contacts:
        print("❌ No valid email addresses found in CSV")
        return
    
    print(f"✅ Found {len(contacts)} valid email addresses")
    print()
    
    # Show first few contacts
    print("Sample contacts:")
    for i, contact in enumerate(contacts[:5], 1):
        print(f"  {i}. {contact['email']} - {contact['full_name']}")
    print()
    
    # Confirm upload
    response = input(f"Upload {len(contacts)} contacts to Supabase? (y/n): ")
    if response.lower() != 'y':
        print("❌ Upload cancelled")
        return
    
    print()
    upload_to_supabase(contacts)

if __name__ == "__main__":
    main()
