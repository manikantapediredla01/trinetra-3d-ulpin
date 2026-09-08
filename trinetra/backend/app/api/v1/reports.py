"""TRINETRA — Reports Generation API router."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.demo.generator import generate_demo_property

router = APIRouter(prefix="/reports")


class ReportRequest(BaseModel):
    type: str  # verification, validation, encroachment, discrepancy, confidence, qaoa
    property_id: str


@router.post("/generate")
async def generate_report(req: ReportRequest):
    """Generate official Department of Land Resources compliance report."""
    demo = generate_demo_property()
    prop = demo["property"]
    report_id = f"REP-{req.type.upper()}-2026-001"

    return {
        "report_id": report_id,
        "report_type": req.type,
        "property_id": req.property_id,
        "property_name": prop.get("metadata", {}).get("building_name", "Srinivas Commercial Complex"),
        "ulpin": "IN-3D-HYD0-2024-0001",
        "generated_at": "2026-09-07T12:00:00Z",
        "issuing_department": "Department of Land Resources, Ministry of Rural Development",
        "download_url": f"/reports/download/{report_id}.pdf",
        "summary": {
            "status": "APPROVED_WITH_FLAG",
            "confidence": 0.94,
            "encroachment_flagged": True,
            "floors_verified": 7,
            "quantum_method": "QAOA p=1 (Qiskit Aer)",
        },
        "digital_signature": "SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    }
