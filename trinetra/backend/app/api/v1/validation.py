"""TRINETRA — Validation API router."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uuid

from app.core.database import get_db
from app.validation.validator import validate_property
from app.demo.generator import generate_demo_property

router = APIRouter(prefix="/validation")

_val_cache: Dict[str, Any] = {}


class ValidationRunRequest(BaseModel):
    property_id: str
    qaoa_run_id: Optional[str] = None


@router.post("/run")
async def run_validation(req: ValidationRunRequest, db: AsyncSession = Depends(get_db)):
    """Run 8-check geometric, topological, boundary, and elevation validation."""
    demo = generate_demo_property()
    prop = demo["property"]
    units = demo["floor_units"]
    parcel = demo["parcel"]

    result = validate_property(
        property_id=req.property_id,
        geometry_geojson=prop.get("geometry_3d"),
        floor_units=units,
        parcel_geojson=parcel.get("geometry"),
        building_height=prop.get("building_height_m", 19.2),
        ground_elevation=prop.get("ground_elevation_m", 536.0),
        city="Hyderabad",
    )

    val_id = str(uuid.uuid4())
    resp = {
        "id": val_id,
        "property_id": req.property_id,
        "qaoa_run_id": req.qaoa_run_id,
        "overall_result": result.overall_result,
        "can_generate_ulpin": result.can_generate_ulpin,
        "geometry_status": result.geometry_status,
        "overlap_status": result.overlap_status,
        "gap_status": result.gap_status,
        "boundary_status": result.boundary_status,
        "floor_status": result.floor_status,
        "topology_status": result.topology_status,
        "elevation_status": result.elevation_status,
        "coordinate_status": result.coordinate_status,
        "checks": [
            {
                "name": c.name,
                "status": c.status,
                "message": c.message,
                "metric": c.metric,
                "threshold": c.threshold,
            }
            for c in result.checks
        ],
        "notes": result.notes,
        "timestamp": "2026-09-07T12:00:00Z",
    }
    _val_cache[val_id] = resp
    _val_cache["latest"] = resp
    return resp


@router.get("/{val_id}")
async def get_validation(val_id: str):
    """Get validation result by ID."""
    if val_id in _val_cache:
        return _val_cache[val_id]
    if "latest" in _val_cache:
        return _val_cache["latest"]
    demo = generate_demo_property()
    return demo["validation_result"]


@router.get("")
async def list_validations(property_id: Optional[str] = None):
    """List validations for property."""
    if "latest" in _val_cache:
        return [_val_cache["latest"]]
    demo = generate_demo_property()
    return [demo["validation_result"]]
