#!/usr/bin/env python3
"""Reconcile CSV mapping with database JSON to find mismatches."""

import json
from pathlib import Path

MAPPING = Path("/Users/anandsrivastava/environment/cityuniclub/scripts/member_update_mapping.json")
DB = Path("/Users/anandsrivastava/environment/cityuniclub/scripts/db_members.json")


def norm_email(e):
    if not e:
        return ""
    return e.strip().lower().rstrip(",").strip()


def main():
    csv_members = json.loads(MAPPING.read_text())
    db_data = json.loads(DB.read_text())
    db_members = db_data["members"]

    csv_by_email = {norm_email(m["email"]): m for m in csv_members}
    db_by_email = {norm_email(m["email"]): m for m in db_members}

    csv_emails = set(csv_by_email.keys())
    db_emails = set(db_by_email.keys())

    in_csv_only = csv_emails - db_emails
    in_db_only = db_emails - csv_emails
    matched = csv_emails & db_emails

    print(f"CSV members: {len(csv_emails)}")
    print(f"DB members:  {len(db_emails)}")
    print(f"Matched (email):     {len(matched)}")
    print(f"Only in CSV (new):   {len(in_csv_only)}")
    print(f"Only in DB (orphan): {len(in_db_only)}")
    print()

    print("=" * 80)
    print("NEW MEMBERS (in CSV, will be inserted):")
    print("=" * 80)
    new_members = sorted(
        [csv_by_email[e] for e in in_csv_only],
        key=lambda m: m["last_name"]
    )
    for m in new_members:
        print(f"  {m['membership_number']:10} {m['full_name']:40} {m['email']}")

    print()
    print("=" * 80)
    print("ORPHAN DB MEMBERS (not in CSV, will NOT be touched per conservative policy):")
    print("=" * 80)
    orphans = sorted(
        [db_by_email[e] for e in in_db_only],
        key=lambda m: m.get("last_name") or ""
    )
    for m in orphans:
        print(f"  #{m['membership_number']:5} {(m.get('first_name') or ''):20} {(m.get('last_name') or ''):30} {m['email']}")

    print()
    print("=" * 80)
    print("MATCHED RECORDS - FIELD DIFFERENCES:")
    print("=" * 80)
    diff_count = 0
    for email in sorted(matched):
        csv_m = csv_by_email[email]
        db_m = db_by_email[email]

        diffs = []
        if str(csv_m["membership_number"]) != str(db_m["membership_number"]):
            diffs.append(f"memnum: {db_m['membership_number']} -> {csv_m['membership_number']}")
        if csv_m["first_name"].strip() != (db_m.get("first_name") or "").strip():
            diffs.append(f"first: '{db_m.get('first_name')}' -> '{csv_m['first_name']}'")
        if csv_m["last_name"].strip() != (db_m.get("last_name") or "").strip():
            diffs.append(f"last: '{db_m.get('last_name')}' -> '{csv_m['last_name']}'")
        if csv_m["membership_type"] != db_m.get("membership_type"):
            diffs.append(f"type: '{db_m.get('membership_type')}' -> '{csv_m['membership_type']}'")
        csv_phone = (csv_m.get("phone_number") or "").strip()
        db_phone = (db_m.get("phone_number") or "").strip()
        if csv_phone and csv_phone != db_phone:
            diffs.append(f"phone: '{db_phone}' -> '{csv_phone}'")
        if csv_m["member_since"] != db_m.get("member_since"):
            diffs.append(f"since: {db_m.get('member_since')} -> {csv_m['member_since']}")

        if diffs:
            diff_count += 1
            print(f"\n  {email}")
            for d in diffs:
                print(f"    {d}")

    print(f"\n{diff_count} records have differences (will be updated)")


if __name__ == "__main__":
    main()
