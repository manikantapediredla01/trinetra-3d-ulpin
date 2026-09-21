"""
Verify dynamic properties, ULPIN generation, intelligent assistant, and fast logout.
"""
import sys
import os
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, r"c:\Users\pediredla manikanta\OneDrive\Documents\Pictures\Documents\trinetra\trinetra-final\trinetra\backend")

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_all():
    print("--- 1. Testing GET /api/v1/properties ---")
    res = client.get("/api/v1/properties")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    props = res.json()
    print(f"Total properties returned: {len(props)}")
    for p in props:
        print(f"  - {p['id']}: {p['name']} ({p['floor_count']} floors, ULPIN: {p['ulpin']})")
    assert len(props) >= 5, "Expected at least 5 properties"

    print("\n--- 2. Testing POST /api/v1/properties/process-dynamic (Real Input -> 3D Structure + ULPIN) ---")
    dynamic_payload = {
        "property_name": "Meenakshi Sky Horizon",
        "district": "Hyderabad",
        "city": "Hyderabad",
        "parcel_ref": "HYD/BH/123/25",
        "building_type": "Commercial IT Tech Park",
        "floor_count": 10,
        "base_elevation_m": 536.0,
        "lat": 17.42440,
        "lon": 78.44860,
        "dataset_ids": ["ds-lidar-01", "ds-gis-02"],
        "dataset_names": ["iith_lidar_pointcloud.laz", "hmda_cadastral.geojson"]
    }
    res = client.post("/api/v1/properties/process-dynamic", json=dynamic_payload)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    dyn_data = res.json()
    created_prop = dyn_data["property"]
    print(f"Created Property: {created_prop['name']}")
    print(f"Assigned 3D-ULPIN: {created_prop['ulpin']}")
    print(f"Floors: {created_prop['floor_count']}, Height: {created_prop['height_m']}m, Status: {created_prop['status']}")
    assert "IN-3D-HYD" in created_prop["ulpin"], f"Invalid ULPIN: {created_prop['ulpin']}"
    assert len(created_prop["floors"]) >= 10, "Floors not properly generated"

    print("\n--- 3. Testing GET /api/v1/properties/{id} for the newly created property ---")
    res = client.get(f"/api/v1/properties/{created_prop['id']}")
    assert res.status_code == 200
    detail = res.json()
    print(f"Fetched details for {detail['property']['name']}: {len(detail['floor_units'])} units")

    print("\n--- 4. Testing Intelligent GIS Assistant with Arbitrary Questions ---")
    queries = [
        "What is the permissible FAR and setback rule in Banjara Hills commercial zones?",
        "Can you explain why the top floor of Srinivas complex was flagged for violation?",
        "What is the elevation and height of Meenakshi Sky Horizon?",
        "How does LiDAR point cloud downsampling and QAOA quantum candidate selection work?",
        "Tell me about the underground water and 11kV electrical feeder cables in this area",
        "Who owns the basement parking level in Srinivas Commercial Complex?",
        "How is the 14-digit 3D ULPIN calculated for multi-storey buildings?"
    ]
    for q in queries:
        res = client.post("/api/v1/assistant/chat", json={"message": q, "property_id": created_prop["id"]})
        assert res.status_code == 200
        reply = res.json()["reply"]
        first_line = reply.split('\n')[0]
        print(f"Q: '{q}'\nA: {first_line[:120]}...\n")

    print("--- 5. Testing Instant Logout ---")
    res = client.post("/api/v1/auth/logout")
    assert res.status_code == 200
    print(f"Logout response: {res.json()}")

    print("\nALL VERIFICATIONS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_all()
