"""TRINETRA — Demo API router."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import Dict, Any
import logging

from app.core.database import get_db
from app.core.deps import get_current_user_optional
from app.models import (
    Property, Parcel, FloorUnit, Survey, CandidateConfiguration,
    EncroachmentCase, Discrepancy, ChangeEvent, UtilityAsset, Dataset
)
from app.demo.generator import generate_demo_property

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/demo")

_demo_cache: Dict[str, Any] = {}


@router.post("/load")
async def load_demo_data(
    db: AsyncSession = Depends(get_db),
):
    """Load or reload the demo property data (Srinivas Commercial Complex, Hyderabad)."""
    demo_data = generate_demo_property()
    _demo_cache["demo_property"] = demo_data
    _demo_cache["is_loaded"] = True

    prop_info = demo_data["property"]
    parcel_info = demo_data["parcel"]

    # Try saving to DB if connection works
    try:
        # Check existing property
        existing = await db.execute(select(Property).where(Property.property_ref == prop_info["property_ref"]))
        p = existing.scalar_one_or_none()
        if not p:
            p = Property(
                property_ref=prop_info["property_ref"],
                ulpin=prop_info.get("ulpin"),
                parcel_reference=prop_info.get("parcel_reference"),
                status=prop_info.get("status", "processing"),
                confidence=prop_info.get("confidence", 0.94),
                horizontal_extent=prop_info.get("horizontal_extent_m2", 252.0),
                vertical_extent=prop_info.get("vertical_extent_m", 19.2),
                floor_count=prop_info.get("floor_count", 6),
                has_basement=prop_info.get("has_basement", True),
                building_height=prop_info.get("building_height_m", 19.2),
                ground_elevation=prop_info.get("ground_elevation_m", 536.0),
                district=prop_info.get("district", "Hyderabad"),
                city=prop_info.get("city", "Hyderabad"),
                address=prop_info.get("address", "Banjara Hills, Hyderabad"),
                is_synthetic=True,
                data_origin="SYNTHETIC_DEMO",
                metadata_=prop_info.get("metadata", {}),
            )
            db.add(p)
            await db.commit()
            await db.refresh(p)

            # Add floor units
            for u in demo_data.get("floor_units", []):
                fu = FloorUnit(
                    property_id=p.id,
                    floor_level=u["floor_level"],
                    unit_number=u["unit_number"],
                    area_m2=u["area_m2"],
                    ceiling_height=u["ceiling_height_m"],
                    floor_elevation=u["floor_elevation_m"],
                    usage_type=u["usage_type"],
                    is_synthetic=True,
                    metadata_={"tenant": u.get("tenant")},
                )
                db.add(fu)

            # Add candidates
            for c in demo_data.get("candidate_configurations", []):
                cand = CandidateConfiguration(
                    property_id=p.id,
                    candidate_index=c["candidate_index"],
                    area_m2=c["area_m2"],
                    volume_m3=c["volume_m3"],
                    floor_range_min=c["floor_range_min"],
                    floor_range_max=c["floor_range_max"],
                    overlap_score=c["overlap_score"],
                    gap_score=c["gap_score"],
                    boundary_error=c["boundary_error_m"],
                    floor_error=c["floor_error_m"],
                    topology_score=c["topology_score"],
                    total_cost=c["total_cost"],
                    description=c["description"],
                )
                db.add(cand)

            await db.commit()
    except Exception as e:
        logger.warning(f"Database insert skipped or partially failed: {e}")

    return {
        "status": "success",
        "message": "Demo property 'Srinivas Commercial Complex' loaded successfully",
        "property": {
            "id": prop_info["property_ref"],
            "name": prop_info.get("metadata", {}).get("building_name", "Srinivas Commercial Complex"),
            "location": "Banjara Hills, Hyderabad (17.4235° N, 78.4483° E)",
            "floors": "Basement + Ground + 5 Upper Floors (7 levels)",
            "units": len(demo_data.get("floor_units", [])),
            "ground_elevation": 536.0,
            "synthetic_disclaimer": "95% Synthetic Demo Scenario anchored to real Hyderabad coordinates",
        },
        "datasets_available": [
            {"name": "hyderabad_cadastral.geojson", "type": "Cadastral", "origin": "REAL_DATA (5%)"},
            {"name": "copernicus_dem_hyderabad.tif", "type": "DEM", "origin": "REAL_DATA (5%)"},
            {"name": "IITH_ground_lidar_clip.las", "type": "LiDAR", "origin": "REAL_DATA (5%)"},
            {"name": "srinivas_pointcloud_synthetic.laz", "type": "Synthetic 3D", "origin": "SYNTHETIC_DEMO (95%)"},
            {"name": "bpass_sanctioned_plan_t1.pdf", "type": "Sanctioned Plan", "origin": "TG-bPASS (Real Permit)"},
        ],
        "workflow_steps_ready": 15,
    }


@router.get("/status")
async def get_demo_status():
    """Check demo environment status."""
    is_loaded = _demo_cache.get("is_loaded", True)
    demo_prop = _demo_cache.get("demo_property") or generate_demo_property()

    return {
        "is_loaded": is_loaded,
        "property_id": "PROP-HYD-2024-001",
        "property_name": "Srinivas Commercial Complex",
        "city": "Hyderabad",
        "survey_epochs": ["T1 (2022-03)", "T2 (2026-06)"],
        "pipeline_stages": 11,
        "validation_checks": 8,
        "synthetic_ratio": "95% Synthetic / 5% Real Anchors",
    }


@router.get("/data")
async def get_demo_data():
    """Get complete generated demo property data."""
    data = _demo_cache.get("demo_property")
    if not data:
        data = generate_demo_property()
        _demo_cache["demo_property"] = data
        _demo_cache["is_loaded"] = True
    return data


@router.post("/reset")
async def reset_demo(db: AsyncSession = Depends(get_db)):
    """Reset demo state."""
    _demo_cache.clear()
    _demo_cache["is_loaded"] = False
    return {"status": "reset", "message": "Demo state reset successfully"}
