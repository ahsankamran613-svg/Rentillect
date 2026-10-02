"""
Seed script: 002_comprehensive_pakistan_areas.py
Populates a comprehensive database of sectors, housing schemes, and societies
for all 8 major Pakistani cities in Rentillect.
"""

import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv("d:/Rentillect/backend/.env")
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    raise ValueError("Missing Supabase credentials in backend/.env")

client = create_client(url, key)

PAKISTAN_SECTORS = {
    "Islamabad": [
        # CDA Sectors E
        "Sector E-7", "Sector E-8 (Naval)", "Sector E-9 (Air Force)", "Sector E-11/1", "Sector E-11/2", "Sector E-11/3", "Sector E-11/4", "Sector E-12",
        # CDA Sectors F
        "Sector F-6", "Sector F-7", "Sector F-8", "Sector F-10/1", "Sector F-10/2", "Sector F-10/3", "Sector F-10/4",
        "Sector F-11/1", "Sector F-11/2", "Sector F-11/3", "Sector F-11/4", "Sector F-15", "Sector F-17 (Multi Gardens)",
        # CDA Sectors G
        "Sector G-5 (Diplomatic Enclave)", "Sector G-6", "Sector G-7", "Sector G-8", "Sector G-9 (Karachi Company)",
        "Sector G-10", "Sector G-11", "Sector G-13/1", "Sector G-13/2", "Sector G-13/3", "Sector G-13/4",
        "Sector G-14", "Sector G-15",
        # CDA Sectors H & I
        "Sector H-8", "Sector H-9", "Sector H-11", "Sector H-12 (NUST)", "Sector H-13",
        "Sector I-8", "Sector I-9", "Sector I-10", "Sector I-11", "Sector I-14",
        # CDA Sectors B, C, D
        "Sector B-17 (Multi Gardens)", "Sector C-18", "Sector D-12", "Sector D-17",
        # Major Societies & Schemes in Islamabad
        "Bahria Town (Phase 1-6)", "Bahria Town (Phase 7-8)", "Bahria Enclave (Islamabad)",
        "DHA Phase 2 (Islamabad)", "DHA Phase 3", "DHA Phase 4", "DHA Phase 5",
        "Gulberg Greens (IBECHS)", "Gulberg Residencia",
        "Bani Gala", "Chak Shahzad", "Park View City",
        "PWD Housing Society", "Soan Gardens", "CBR Town", "Pakistan Town",
        "Naval Anchorage", "Police Foundation", "Korang Town", "River Garden",
        "Top City-1", "Mumtaz City", "Faisal Town (F-18)"
    ],
    "Lahore": [
        # DHA Lahore
        "DHA Phase 1", "DHA Phase 2", "DHA Phase 3", "DHA Phase 4",
        "DHA Phase 5", "DHA Phase 6", "DHA Phase 7", "DHA Phase 8 (Ex-Air Avenue)",
        "DHA Phase 9 (Prism)", "DHA Phase 9 (Town)", "DHA Rahbar (Phase 11)",
        # Gulberg
        "Gulberg I", "Gulberg II", "Gulberg III", "Gulberg IV", "Gulberg V",
        # Model Town & Cantt
        "Model Town", "Lahore Cantt", "Cavalry Ground", "Saddar", "Askari 1", "Askari 5", "Askari 10", "Askari 11",
        # Johar Town & Faisal Town
        "Johar Town (Phase 1)", "Johar Town (Phase 2)", "Faisal Town", "Garden Town",
        # Bahria Town Lahore
        "Bahria Town (Sector A)", "Bahria Town (Sector B)", "Bahria Town (Sector C)",
        "Bahria Town (Sector D)", "Bahria Town (Sector E)", "Bahria Town (Sector F)",
        # Wapda Town & Iqbal Town
        "Wapda Town (Phase 1)", "Wapda Town (Phase 2)", "Allama Iqbal Town",
        # Southern Societies
        "Lake City", "Valencia Housing Society", "State Life Housing Society",
        "Punjab Govt Employees Society (PCSIR)", "NFC Housing Society",
        "Paragon City", "Divine Gardens", "Green City", "Park View City Lahore",
        "Central Park Housing Scheme", "Fazaia Housing Scheme", "Eden City",
        # Central & Western Lahore
        "Samanabad", "Shadman", "Ichhra", "Gulshan-e-Ravi", "Township", "Green Town",
        "Sabzazar", "Raiwind Road Corridor"
    ],
    "Karachi": [
        # DHA Karachi
        "DHA Phase 1", "DHA Phase 2 & 2 Ext", "DHA Phase 4", "DHA Phase 5",
        "DHA Phase 6", "DHA Phase 7 & 7 Ext", "DHA Phase 8",
        # Clifton
        "Clifton Block 1", "Clifton Block 2", "Clifton Block 3", "Clifton Block 4",
        "Clifton Block 5", "Clifton Block 7", "Clifton Block 8", "Clifton Block 9",
        "Bath Island", "Civil Lines",
        # Gulshan-e-Iqbal & Gulistan-e-Johar
        "Gulshan-e-Iqbal (Blocks 1-7)", "Gulshan-e-Iqbal (Blocks 8-13)", "Gulshan-e-Iqbal (Blocks 14-19)",
        "Gulistan-e-Johar (Blocks 1-6)", "Gulistan-e-Johar (Blocks 7-13)", "Gulistan-e-Johar (Blocks 14-20)",
        # PECHS & Bahadurabad
        "PECHS Block 2", "PECHS Block 3", "PECHS Block 6", "Bahadurabad",
        "Sindhi Muslim Cooperative Housing (SMCHS)", "Tariq Road", "KDA Scheme 1",
        # North Nazimabad & Nazimabad
        "North Nazimabad (Blocks A-D)", "North Nazimabad (Blocks E-H)", "North Nazimabad (Blocks I-N)",
        "Nazimabad (Blocks 1-5)",
        # Modern Mega Schemes
        "Bahria Town Karachi (Precincts 1-10)", "Bahria Town Karachi (Precincts 11-20)", "Bahria Town Karachi (Sports City)",
        "Malir Cantt", "Fazaia Housing Scheme", "Naval Housing Scheme (Karsaz)",
        "Scheme 33 (Gulshan-e-Kaneez Fatima)", "Scheme 33 (Saadi Town)", "Scheme 33 (Teacher Society)",
        # Other Key Towns
        "Federal B Area (FB Area)", "Garden East", "Garden West", "Buffer Zone",
        "Gulshan-e-Maymar", "Surjani Town"
    ],
    "Rawalpindi": [
        # Bahria Town Rawalpindi
        "Bahria Town (Phase 1-3)", "Bahria Town (Phase 4-6)", "Bahria Town (Phase 7)", "Bahria Town (Phase 8)",
        "Bahria Town (Safari Valley)", "Bahria Greens",
        # DHA Rawalpindi
        "DHA Phase 1 (Orchard & Sector A-F)",
        # Cantt & Commercial
        "Saddar (Rawalpindi Cantt)", "Chaklala Scheme 3", "Chaklala Scheme 2", "Chaklala Garrison",
        "Askari 7", "Askari 13", "Askari 14",
        # Residential Areas
        "Satellite Town (Blocks A-F)", "Westridge 1", "Westridge 2", "Westridge 3",
        "Gulraiz Housing Scheme (Phases 1-6)", "Adiala Road Corridor", "Peshawar Road",
        "Shalley Valley", "Range Road", "Misrial Road", "Airport Housing Society",
        "Gulshan-e-Abad", "Media Town", "PWD Rawalpindi Road"
    ],
    "Peshawar": [
        "Hayatabad (Phase 1)", "Hayatabad (Phase 2)", "Hayatabad (Phase 3)",
        "Hayatabad (Phase 4)", "Hayatabad (Phase 5)", "Hayatabad (Phase 6)", "Hayatabad (Phase 7)",
        "University Town", "Peshawar Cantt", "Warsak Road", "Regi Model Town",
        "DHA Peshawar", "Gulbahar", "Dalazak Road", "Kohat Road Corridor",
        "Charsadda Road", "Nasir Bagh Road", "Ring Road Enclave"
    ],
    "Faisalabad": [
        "Madina Town", "D Ground (Peoples Colony No. 1)", "Peoples Colony No. 2",
        "Kohinoor City", "Canal Road Corridor", "Citi Housing (Phase 1 & 2)",
        "FDA City", "Susan Road", "Civil Lines", "Millat Town",
        "Gulberg Faisalabad", "Samanabad Faisalabad", "Ghulam Muhammad Abad",
        "WAPDA City", "Eden Executive Heights"
    ],
    "Multan": [
        "DHA Multan (Sectors A-Z)", "Multan Cantt", "Bosan Road Corridor",
        "Gulgasht Colony", "Model Town Multan", "Royal Orchard",
        "New Multan", "WAPDA Town (Phase 1 & 2)", "Officers Colony",
        "Zakariya Town", "Shamsabad", "Fatima Jinnah Town", "Buch Executive Villas"
    ],
    "Quetta": [
        "Quetta Cantt", "Jinnah Town", "Samungli Road", "Zarghoon Housing Scheme",
        "Satellite Town Quetta", "Shahbaz Town", "Model Town Quetta",
        "Chiltan Housing Scheme", "Airport Road Quetta", "Arbab Town",
        "Kasi Road", "Nawan Killi"
    ]
}

def seed_comprehensive_areas():
    print("Beginning Pakistan Sectors & Societies Seeding...")
    cities_res = client.table("cities").select("*").execute()
    cities_by_name = {c["name"]: c["id"] for c in (cities_res.data or [])}

    total_inserted = 0
    total_skipped = 0

    for city_name, areas in PAKISTAN_SECTORS.items():
        city_id = cities_by_name.get(city_name)
        if not city_id:
            print(f"Warning: City '{city_name}' not found in database. Skipping.")
            continue

        # Get existing areas for this city
        existing_res = client.table("areas").select("name").eq("city_id", city_id).execute()
        existing_names = set(a["name"] for a in (existing_res.data or []))

        to_insert = []
        for area_name in areas:
            if area_name in existing_names:
                total_skipped += 1
                continue
            to_insert.append({"city_id": city_id, "name": area_name})

        if to_insert:
            client.table("areas").insert(to_insert).execute()
            total_inserted += len(to_insert)
            print(f"  [OK] {city_name}: Added {len(to_insert)} new sectors/societies (Total now: {len(existing_names) + len(to_insert)})")
        else:
            print(f"  - {city_name}: All {len(areas)} sectors already up to date")

    print("\nSeeding Completed Successfully!")
    print(f"Total New Areas Inserted: {total_inserted}")
    print(f"Total Pre-existing Areas: {total_skipped}")

if __name__ == "__main__":
    seed_comprehensive_areas()
