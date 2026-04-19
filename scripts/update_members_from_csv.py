#!/usr/bin/env python3
"""
Database update script - syncs members from CSV to Supabase
CSV is the authoritative source
"""

import csv
import json
import re
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import os
from pathlib import Path

# Configuration
CSV_PATH = Path("/Users/anandsrivastava/Downloads/Memberdatabaseapr26.csv")
SUPABASE_URL = os.getenv("SUPABASE_URL", "http://localhost:8000")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# Membership type mapping from CSV to database
MEMBERSHIP_TYPE_MAP = {
    "Country": "Full Membership",
    "country": "Full Membership",
    "Overseas": "Full Membership",
    "overseas": "Full Membership",
    "Overseas/over 70": "Full Membership",
    "Overseas/ over 70": "Full Membership",
    "Overseas Spousal": "Full Membership",
    "Overseas/under 35": "Full Membership",
    "70 and over": "Full Membership",
    "70 and over+overseas": "Full Membership",
    "70 and Over Overseas": "Full Membership",
    "70 & over overseas": "Full Membership",
    "Full 32 to 59": "Full Membership",
    "full 32 to 59": "Full Membership",
    "Full Membership": "Full Membership",
    "Under 32": "Junior Membership",
    "Under 35": "Junior Membership",
    "under 32": "Junior Membership",
    "U32": "Junior Membership",
    "Under32": "Junior Membership",
    "60 to 64": "Full Membership",
    "65 to69": "Full Membership",
    "65 to 69": "Full Membership",
    "Retired 65 to 69": "Full Membership",
    "Retired 65 to69": "Full Membership",
    "Group": "Corporate Membership",
    "Spousal": "Full Membership",
    "Old Stoics": "Full Membership",
    "Honorary": "Senior Membership",
    "2026 country": "Full Membership",
    "Changing to Country March": "Full Membership",
    "Oveerseas": "Full Membership",
    "Overseas          ": "Full Membership",
}


class MemberCSVProcessor:
    def __init__(self):
        self.csv_data = []
        self.next_tba_number = None
        self.existing_db_ids = set()

    def load_csv(self) -> List[Dict]:
        """Load and parse CSV file"""
        print(f"Loading CSV from {CSV_PATH}")
        members = []

        with open(CSV_PATH, 'r', encoding='utf-8-sig') as f:  # utf-8-sig handles BOM
            reader = csv.DictReader(f)
            for idx, row in enumerate(reader, start=2):  # Start at 2 (header is row 1)
                if not any(row.values()):  # Skip empty rows
                    continue
                members.append(row)

        print(f"Loaded {len(members)} members from CSV")
        if members:
            print(f"Sample columns: {list(members[0].keys())}")
        return members

    def clean_date(self, date_str: Optional[str]) -> Optional[str]:
        """Convert DD/MM/YYYY to YYYY-MM-DD"""
        if not date_str or date_str.strip() == "":
            return None

        # Fix obvious typos
        date_str = date_str.strip()
        if date_str == "23/10/20225":
            date_str = "23/10/2025"
        if date_str == "28/112025":
            date_str = "28/11/2025"
        if date_str == "23/10/20225":
            date_str = "23/10/2025"

        try:
            dt = datetime.strptime(date_str, "%d/%m/%Y")
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            print(f"  WARNING: Invalid date format: {date_str}")
            return None

    def clean_email(self, email: str) -> Optional[str]:
        """Clean email addresses"""
        if not email:
            return None
        email = email.strip().rstrip(',')
        if "@" not in email or email == "nan":
            return None
        return email

    def clean_phone(self, phone: str) -> Optional[str]:
        """Clean phone numbers"""
        if not phone or phone.strip() == "":
            return None
        phone = phone.strip()
        if phone in ("nan", "PHONE", ""):
            return None
        # Remove common formatting but keep the number
        return phone

    def clean_name(self, name: str) -> str:
        """Clean names - remove extra spaces, fix formatting"""
        if not name:
            return ""
        name = name.strip()
        # Remove extra spaces
        name = re.sub(r'\s+', ' ', name)
        return name

    def map_membership_type(self, csv_type: str) -> str:
        """Map CSV membership type to database type"""
        if not csv_type:
            return "Full Membership"

        mapped = MEMBERSHIP_TYPE_MAP.get(csv_type.strip())
        if mapped:
            return mapped

        print(f"  WARNING: Unknown membership type '{csv_type}' - using Full Membership")
        return "Full Membership"

    def get_next_tba_number(self, max_member_number: int) -> int:
        """Get next available membership number for tba entries"""
        # Convert membership_number to int for comparison
        try:
            max_num = int(max_member_number)
        except (ValueError, TypeError):
            max_num = 500
        return max_num + 1

    def process_csv_data(self, members: List[Dict]) -> Tuple[List[Dict], List[str]]:
        """Process CSV data and return formatted members and issues"""
        processed = []
        issues = []
        max_member_number = 0

        # Debug: check actual column names
        if members:
            actual_cols = list(members[0].keys())
            print(f"CSV columns: {actual_cols}")

        for idx, member in enumerate(members, start=2):
            # Handle BOM and various column name possibilities
            member_no = (member.get("Mem nO") or member.get(" Mem nO") or "").strip() or "tba"
            firstname = self.clean_name(member.get("Firstname", ""))
            lastname = self.clean_name(member.get("Lastname", ""))
            email = self.clean_email(member.get("1st E Mail", ""))
            phone = self.clean_phone(member.get("MobilePhone", ""))
            date_joined = self.clean_date(member.get("Date Joined", ""))
            membership_type = self.map_membership_type(member.get("Membership Type", ""))
            title = member.get(" ", "").strip()  # Title field

            # Validate required fields
            if not email:
                issues.append(f"Row {idx}: Missing email for {firstname} {lastname}")
                continue

            if not firstname or not lastname:
                issues.append(f"Row {idx}: Missing name for {email}")
                continue

            # Track max member number for tba assignment
            if member_no != "tba":
                try:
                    num = int(member_no.lstrip('0') or '0')
                    max_member_number = max(max_member_number, num)
                except (ValueError, TypeError):
                    pass

            # Handle tba entries
            if member_no == "tba":
                max_member_number += 1
                member_no = str(max_member_number)
                print(f"  Row {idx}: Assigned TBA member {firstname} {lastname} number {member_no}")

            # Default member_since if not provided
            if not date_joined:
                date_joined = "2026-02-28"
                issues.append(f"Row {idx}: No join date for {firstname} {lastname} - using 2026-02-28")

            processed.append({
                "csv_row": idx,
                "membership_number": str(member_no),
                "first_name": firstname,
                "last_name": lastname,
                "full_name": f"{firstname} {lastname}",
                "email": email.lower(),
                "phone_number": phone,
                "membership_type": membership_type,
                "member_since": date_joined,
                "member_until": "2026-12-31",  # Default
                "is_active": True,
                "title": title,
            })

        return processed, issues

    def generate_update_sql(self, members: List[Dict]) -> str:
        """Generate SQL for upserting members"""
        # This would be actual SQL or API calls
        # For now, output the mapping for review
        print(f"\n{'='*80}")
        print("MEMBER UPDATE MAPPING")
        print(f"{'='*80}\n")

        for member in members[:10]:  # Show first 10
            print(f"CSV Row {member['csv_row']}: {member['full_name']}")
            print(f"  Membership #: {member['membership_number']}")
            print(f"  Email: {member['email']}")
            print(f"  Phone: {member['phone_number']}")
            print(f"  Type: {member['membership_type']}")
            print(f"  Member Since: {member['member_since']}")
            print()

        print(f"... ({len(members) - 10} more members)")
        print(f"\n{'='*80}\n")

        return json.dumps(members, indent=2)


def main():
    processor = MemberCSVProcessor()

    # Load CSV
    csv_members = processor.load_csv()

    # Process data
    processed_members, issues = processor.process_csv_data(csv_members)

    # Report issues
    if issues:
        print(f"\nData Issues Found ({len(issues)}):")
        for issue in issues[:20]:  # Show first 20
            print(f"  - {issue}")
        if len(issues) > 20:
            print(f"  ... and {len(issues) - 20} more issues")

    # Generate output
    json_output = processor.generate_update_sql(processed_members)

    # Save to file for review
    output_path = Path("/Users/anandsrivastava/environment/cityuniclub/scripts/member_update_mapping.json")
    output_path.parent.mkdir(exist_ok=True)
    output_path.write_text(json_output)
    print(f"\nMember mapping saved to: {output_path}")

    print(f"\nSummary:")
    print(f"  Total members to update: {len(processed_members)}")
    print(f"  Data issues found: {len(issues)}")
    print(f"\nNext steps:")
    print(f"  1. Review member_update_mapping.json for accuracy")
    print(f"  2. Verify email addresses and membership numbers")
    print(f"  3. Run the actual database update script")


if __name__ == "__main__":
    main()
