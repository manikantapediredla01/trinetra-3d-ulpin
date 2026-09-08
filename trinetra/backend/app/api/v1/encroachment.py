"""TRINETRA — 3D Encroachment Detection API router."""
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.demo.generator import generate_demo_property

router = APIRouter(prefix="/encroachment")

_cases_cache: Dict[str, Any] = {}


class EncroachmentDetectRequest(BaseModel):
    property_id: str


class EncroachmentReviewRequest(BaseModel):
    status: str
    notes: Optional[str] = None


@router.post("/detect")
async def detect_encroachment(req: EncroachmentDetectRequest):
    """Detect vertical and horizontal encroachment beyond cadastral boundary."""
    demo = generate_demo_property()
    cases = demo.get("encroachment_cases", [])
    _cases_cache[req.property_id] = cases
    return {
        "status": "completed",
        "property_id": req.property_id,
        "encroachment_found": True,
        "cases_count": len(cases),
        "cases": cases,
        "disclaimer": "MANDATORY LEGAL NOTICE: Flagged as POTENTIAL ENCROACHMENT pending field inspection and revenue court verification.",
    }


@router.get("")
async def list_encroachment_cases(property_id: Optional[str] = None):
    """List encroachment cases."""
    demo = generate_demo_property()
    return demo.get("encroachment_cases", [])


@router.post("/{case_id}/review")
async def review_encroachment(case_id: str, req: EncroachmentReviewRequest):
    """Submit officer review decision for encroachment case."""
    return {
        "case_id": case_id,
        "new_status": req.status,
        "officer_notes": req.notes,
        "reviewed_at": "2026-09-07T12:00:00Z",
        "message": f"Case {case_id} updated to {req.status}",
    }
