"""TRINETRA — Discrepancy Detection API router."""
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.demo.generator import generate_demo_property

router = APIRouter(prefix="/discrepancy")


class DiscrepancyDetectRequest(BaseModel):
    property_id: str


class DiscrepancyReviewRequest(BaseModel):
    status: str


@router.post("/detect")
async def detect_discrepancies(req: DiscrepancyDetectRequest):
    """Detect discrepancies between registered/sanctioned plans and 3D reality."""
    demo = generate_demo_property()
    discrepancies = demo.get("discrepancies", [])
    return {
        "status": "completed",
        "property_id": req.property_id,
        "discrepancies_count": len(discrepancies),
        "discrepancies": discrepancies,
    }


@router.get("")
async def list_discrepancies(property_id: Optional[str] = None):
    """List detected discrepancies."""
    demo = generate_demo_property()
    return demo.get("discrepancies", [])


@router.post("/{disc_id}/review")
async def review_discrepancy(disc_id: str, req: DiscrepancyReviewRequest):
    """Update discrepancy review status."""
    return {
        "id": disc_id,
        "status": req.status,
        "reviewed_at": "2026-09-07T12:00:00Z",
    }
