"""TRINETRA — Properties API router."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional, Dict, Any

from app.core.database import get_db
from app.models import Property, FloorUnit, CandidateConfiguration, Validation
from app.demo.generator import generate_demo_property

router = APIRouter(prefix="/properties")


@router.get("")
async def list_properties(
    district: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """List properties with optional filters."""
    query = select(Property)
    if district:
        query = query.where(Property.district == district)
    if status:
        query = query.where(Property.status == status)

    try:
        result = await db.execute(query)
        props = result.scalars().all()
        if props:
            return [
                {
                    "id": str(p.id),
                    "property_ref": p.property_ref,
                    "ulpin": p.ulpin,
                    "status": p.status,
                    "confidence": p.confidence,
                    "floor_count": p.floor_count,
                    "has_basement": p.has_basement,
                    "horizontal_extent": p.horizontal_extent,
                    "vertical_extent": p.vertical_extent,
                    "city": p.city,
                    "district": p.district,
                    "address": p.address,
                    "is_synthetic": p.is_synthetic,
                    "data_origin": p.data_origin,
                }
                for p in props
            ]
    except Exception:
        pass

    # Return demo property if DB empty or unavailable
    demo = generate_demo_property()
    p = demo["property"]
    return [
        {
            "id": p["property_ref"],
            "property_ref": p["property_ref"],
            "ulpin": p.get("ulpin", "IN-3D-HYD0-2024-0001"),
            "status": p.get("status", "verified"),
            "confidence": p.get("confidence", 0.94),
            "floor_count": p.get("floor_count", 6),
            "has_basement": p.get("has_basement", True),
            "horizontal_extent": p.get("horizontal_extent_m2", 252.0),
            "vertical_extent": p.get("vertical_extent_m", 19.2),
            "city": p.get("city", "Hyderabad"),
            "district": p.get("district", "Hyderabad"),
            "address": p.get("address", "Plot 42, Road 12, Banjara Hills, Hyderabad"),
            "is_synthetic": True,
            "data_origin": "SYNTHETIC_DEMO",
        }
    ]


@router.get("/search")
async def search_properties(
    q: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db),
):
    """Search properties by ULPIN, property reference, or address."""
    demo = generate_demo_property()
    p = demo["property"]
    match = (
        q.lower() in p["property_ref"].lower()
        or q.lower() in str(p.get("ulpin", "")).lower()
        or q.lower() in p.get("address", "").lower()
        or q.lower() in p.get("city", "").lower()
    )
    if match:
        return [
            {
                "id": p["property_ref"],
                "property_ref": p["property_ref"],
                "ulpin": p.get("ulpin", "IN-3D-HYD0-2024-0001"),
                "status": p.get("status", "verified"),
                "confidence": 0.94,
                "address": p.get("address"),
                "floor_count": p.get("floor_count"),
                "city": p.get("city"),
            }
        ]
    return []


@router.get("/{property_id}")
async def get_property(
    property_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get single property details by ID or reference."""
    demo = generate_demo_property()
    p = demo["property"]
    if property_id in [p["property_ref"], "PROP-HYD-2024-001", "default"]:
        return {
            "property": p,
            "parcel": demo["parcel"],
            "floor_units": demo["floor_units"],
            "candidate_configurations": demo["candidate_configurations"],
            "validation_result": demo["validation_result"],
            "encroachment_cases": demo["encroachment_cases"],
            "discrepancies": demo["discrepancies"],
            "change_events": demo["change_events"],
            "utilities": demo["utilities"],
            "confidence_score": demo["confidence_score"],
            "metadata": {
                "source_layers": ["Copernicus DEM", "IITH LiDAR clip", "HMDA Cadastral", "TG-bPASS Plan"],
                "synthetic_notice": "95% Synthetic demonstration geometry anchored to Hyderabad coordinates",
            },
        }

    # DB fallback
    try:
        result = await db.execute(select(Property).where(Property.property_ref == property_id))
        prop = result.scalar_one_or_none()
        if prop:
            return {
                "property": {
                    "id": str(prop.id),
                    "property_ref": prop.property_ref,
                    "ulpin": prop.ulpin,
                    "status": prop.status,
                    "confidence": prop.confidence,
                    "floor_count": prop.floor_count,
                    "city": prop.city,
                    "address": prop.address,
                }
            }
    except Exception:
        pass

    raise HTTPException(status_code=404, detail="Property not found")
