"""TRINETRA — QR Property Passport API router."""
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from app.demo.generator import generate_demo_property

router = APIRouter(prefix="/passport")


@router.get("/{property_id}")
async def get_passport(property_id: str):
    """Retrieve full QR Property Passport data."""
    demo = generate_demo_property()
    prop = demo["property"]
    units = demo["floor_units"]
    val = demo["validation_result"]

    return {
        "ulpin": "IN-3D-HYD0-2024-0001",
        "property_id": property_id,
        "building_name": prop.get("metadata", {}).get("building_name", "Srinivas Commercial Complex"),
        "address": "Plot 42, Road 12, Banjara Hills, Hyderabad, Telangana 500034",
        "jurisdiction": "Greater Hyderabad Municipal Corporation (GHMC)",
        "coordinates": {"latitude": 17.4235, "longitude": 78.4483},
        "structure": {
            "total_floors": 7,
            "basement_levels": 1,
            "above_ground": 6,
            "footprint_area_m2": 252.0,
            "total_builtup_area_m2": 1512.0,
            "height_m": 19.2,
            "ground_elevation_msl": 536.0,
        },
        "floor_units": [
            {
                "unit_number": u["unit_number"],
                "floor_level": u["floor_level"],
                "area_m2": u["area_m2"],
                "usage_type": u["usage_type"],
                "tenant": u.get("tenant", "Commercial Tenant"),
            }
            for u in units
        ],
        "verification": {
            "validation_status": "VALIDATED",
            "confidence_score": 0.94,
            "qaoa_optimized": True,
            "all_8_checks_passed": True,
            "issued_date": "2026-06-15",
            "issuing_authority": "Department of Land Resources (DoLR), MoRD",
        },
        "qr_code_payload": f"https://trinetra.gov.in/passport/{property_id}",
        "tier_disclosures": {
            "public": ["ULPIN", "Building Name", "Levels", "Verification Status", "Jurisdiction"],
            "financial_institutions": ["Built-up Area", "Unit Breakdowns", "Sanction Compliance"],
            "authorized_officers": ["Encroachment Flag", "Discrepancy History", "Raw Geometries", "Audit Log"],
        },
    }


@router.get("/{property_id}/qr")
async def get_passport_qr(property_id: str):
    """Return QR payload and verification link."""
    return {
        "property_id": property_id,
        "ulpin": "IN-3D-HYD0-2024-0001",
        "qr_url": f"http://localhost:5173/passport/{property_id}",
        "raw_string": f"TRINETRA:ULPIN=IN-3D-HYD0-2024-0001;PROP={property_id};HASH=a8f9c2d1b;VERIFIED=TRUE",
    }
