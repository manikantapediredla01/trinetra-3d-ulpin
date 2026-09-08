"""TRINETRA — Controlled GIS Assistant API router."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import time

from app.demo.generator import generate_demo_property

router = APIRouter(prefix="/assistant")


class AssistantQuery(BaseModel):
    message: str
    property_id: Optional[str] = "PROP-HYD-2024-001"


RESPONSES = {
    "ulpin": (
        "The 3D ULPIN for this property is **IN-3D-HYD0-2024-0001**. "
        "It uniquely defines both horizontal cadastral extent and vertical 3D space across all 7 levels (Basement to Floor 5)."
    ),
    "floor": (
        "**Srinivas Commercial Complex** comprises 7 physical levels:\n"
        "• Level -1: Basement Parking (3.5m clearance, 532.5m MSL)\n"
        "• Level 0: Ground Commercial Retail\n"
        "• Levels 1–4: Commercial Offices (10 sanctioned units)\n"
        "• Level 5: Top floor (flagged as new addition between T1 and T2 surveys)."
    ),
    "encroach": (
        "⚠️ **POTENTIAL ENCROACHMENT ALERT**:\n"
        "A 2.3-meter horizontal encroachment is detected along the Western boundary, projecting into adjacent survey parcel HYD/BH/123/5. "
        "The affected ground area is approximately 32.2 m². This is flagged for revenue officer review."
    ),
    "qaoa": (
        "The QUBO selection problem evaluated 7 candidate 3D spatial configurations. "
        "The Qiskit QAOA simulation (p=1, 1024 shots) converged on bitstring **0100000** (Candidate 1) with 97.4% optimality, "
        "minimizing boundary mismatch and zeroing inter-floor volumetric overlaps."
    ),
    "utility": (
        "Underground utility scans show a 200mm municipal water main at -1.8m depth running along the North road, "
        "and an 11kV electrical conduit at -1.2m depth along the East boundary. No subterranean clashes detected."
    ),
    "change": (
        "Comparative temporal analysis between **Epoch T1 (March 2022)** and **Epoch T2 (June 2026)** "
        "identified a vertical addition of 1 floor (+3.2m height, +252 m² built-up area) not reflected in the original TG-bPASS permit."
    ),
}


@router.post("/query")
@router.post("/chat")
async def chat_assistant(req: AssistantQuery):
    """Handle natural language GIS assistant queries."""
    msg = req.message.lower()
    reply = None
    for key, text in RESPONSES.items():
        if key in msg:
            reply = text
            break

    if not reply:
        reply = (
            f"I have inspected property **{req.property_id}** (Srinivas Commercial Complex, Hyderabad). "
            f"You can ask me about its 3D ULPIN, floor breakdowns, QAOA optimization, potential encroachments, "
            f"underground utilities, or T1 vs T2 change detection."
        )

    return {
        "reply": reply,
        "timestamp": "2026-09-07T12:00:00Z",
        "property_id": req.property_id,
        "sources_referenced": [
            "Cadastral Map: HYD/BH/123/4",
            "LiDAR Point Cloud (Epoch T2)",
            "QAOA Optimization Log",
            "Copernicus GLO-30 DEM",
        ],
    }
