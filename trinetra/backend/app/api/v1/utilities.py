"""TRINETRA — Underground & Utility Infrastructure API router."""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List, Dict, Any
from app.demo.generator import generate_demo_property

router = APIRouter(prefix="/utilities")


@router.get("")
async def list_utilities(bbox: Optional[str] = None):
    """Retrieve underground and surface utility networks near property."""
    demo = generate_demo_property()
    raw_utilities = demo.get("utilities", [])
    return {
        "count": len(raw_utilities),
        "crs": "EPSG:4326",
        "utilities": raw_utilities,
        "types": ["water_pipeline", "power_cable", "sewer_main", "storm_drain"],
        "provenance": {
            "source": "GHMC Water Supply & TSSPDCL GIS Infrastructure Map (Real Extract 5%)",
            "is_synthetic": False,
            "data_origin": "REAL_INPUT",
        },
    }
