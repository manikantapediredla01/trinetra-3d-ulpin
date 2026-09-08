"""TRINETRA — QUBO API router."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uuid

from app.core.database import get_db
from app.models import QUBORun, CandidateConfiguration
from app.quantum.qubo import CandidateMetrics, build_qubo
from app.demo.generator import generate_demo_property

router = APIRouter(prefix="/qubo")

_qubo_cache: Dict[str, Any] = {}


class QUBOCreateRequest(BaseModel):
    property_id: str
    constraint_lambda: Optional[float] = 5.0


@router.post("/create")
async def create_qubo(req: QUBOCreateRequest, db: AsyncSession = Depends(get_db)):
    """Formulate QUBO optimization problem from candidate configurations."""
    demo = generate_demo_property()
    raw_candidates = demo.get("candidate_configurations", [])

    metrics_list = []
    for c in raw_candidates:
        metrics_list.append(
            CandidateMetrics(
                candidate_id=f"cand_{c['candidate_index']}",
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
            )
        )

    qubo_res = build_qubo(metrics_list, constraint_lambda=req.constraint_lambda or 5.0)
    qubo_id = str(uuid.uuid4())

    response_data = {
        "id": qubo_id,
        "property_id": req.property_id,
        "n_variables": qubo_res.n_variables,
        "variable_labels": qubo_res.variable_labels,
        "q_matrix": qubo_res.q_matrix,
        "weights": qubo_res.weights,
        "constraint_lambda": qubo_res.constraint_lambda,
        "individual_costs": qubo_res.individual_costs,
        "ising_h": qubo_res.ising_h,
        "ising_j": qubo_res.ising_j,
        "classical_solution": qubo_res.classical_solution,
        "classical_cost": qubo_res.classical_cost,
        "qubo_breakdown": qubo_res.qubo_breakdown,
        "status": "ready_for_qaoa",
    }
    _qubo_cache[qubo_id] = response_data
    _qubo_cache["latest"] = response_data

    # Try storing to DB
    try:
        run = QUBORun(
            id=uuid.UUID(qubo_id),
            n_variables=qubo_res.n_variables,
            q_matrix=qubo_res.q_matrix,
            variable_labels=qubo_res.variable_labels,
            weights=qubo_res.weights,
            ising_h=qubo_res.ising_h,
            ising_j=qubo_res.ising_j,
            classical_solution=qubo_res.classical_solution,
            classical_cost=qubo_res.classical_cost,
        )
        db.add(run)
        await db.commit()
    except Exception:
        pass

    return response_data


@router.get("/{qubo_id}")
async def get_qubo(qubo_id: str):
    """Get QUBO formulation by ID."""
    if qubo_id in _qubo_cache:
        return _qubo_cache[qubo_id]
    if "latest" in _qubo_cache:
        return _qubo_cache["latest"]
    # Fallback build
    req = QUBOCreateRequest(property_id="PROP-HYD-2024-001")
    return await create_qubo(req, None)


@router.get("")
async def list_qubo(property_id: Optional[str] = None):
    """List QUBO formulations."""
    if "latest" in _qubo_cache:
        return [_qubo_cache["latest"]]
    req = QUBOCreateRequest(property_id=property_id or "PROP-HYD-2024-001")
    res = await create_qubo(req, None)
    return [res]
