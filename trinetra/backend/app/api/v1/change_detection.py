"""TRINETRA — Temporal 3D Change Detection (T1 vs T2) API router."""
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.demo.generator import generate_demo_property

router = APIRouter(prefix="/change-detection")


class ChangeDetectRequest(BaseModel):
    property_id: str


@router.post("/detect")
async def detect_changes(req: ChangeDetectRequest):
    """Detect volumetric and structural changes between Survey Epoch T1 (2022) and T2 (2026)."""
    demo = generate_demo_property()
    events = demo.get("change_events", [])
    return {
        "status": "completed",
        "property_id": req.property_id,
        "epochs_compared": {"t1": "2022-03-15 (Survey Baseline)", "t2": "2026-06-01 (Current Drone/LiDAR)"},
        "changes_detected_count": len(events),
        "events": events,
        "summary": "1 critical vertical expansion detected: Entire 6th floor (252m², 806.4m³) constructed without updated permit.",
    }


@router.get("")
async def list_change_events(property_id: Optional[str] = None):
    """List historical and detected change events."""
    demo = generate_demo_property()
    return demo.get("change_events", [])
