"""TRINETRA — Candidate 3D Volumes API router."""
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.demo.generator import generate_demo_property

router = APIRouter(prefix="/candidates")


class CandidateGenerateRequest(BaseModel):
    property_id: str


@router.post("/generate")
async def generate_candidates(req: CandidateGenerateRequest):
    """Generate candidate 3D volume configurations for QUBO optimization."""
    demo = generate_demo_property()
    candidates = demo.get("candidate_configurations", [])
    return {
        "status": "success",
        "property_id": req.property_id,
        "count": len(candidates),
        "candidates": candidates,
        "description": "Candidate 3D property boundary configurations generated with measurable geometric error metrics for QUBO",
    }


@router.get("")
async def list_candidates(property_id: Optional[str] = None):
    """List candidate configurations."""
    demo = generate_demo_property()
    candidates = demo.get("candidate_configurations", [])
    return candidates


@router.get("/{candidate_id}")
async def get_candidate(candidate_id: str):
    """Get specific candidate configuration."""
    demo = generate_demo_property()
    candidates = demo.get("candidate_configurations", [])
    for c in candidates:
        if str(c.get("candidate_index")) == candidate_id or c.get("id") == candidate_id:
            return c
    if candidates:
        return candidates[0]
    raise HTTPException(status_code=404, detail="Candidate not found")
