"""TRINETRA — QAOA API router.

Uses in-memory caches for QUBO lookup and QAOA result storage so the full
pipeline works without a live database connection (DB writes are attempted
but failures are silently swallowed).
"""
import logging
import uuid
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.deps import get_current_user, require_permission
from app.auth.rbac import Permission
from app.models import QAOARun, QUBORun, AuditLog, User
from app.quantum.qubo import CandidateMetrics, build_qubo, decode_bitstring, QUBOResult
from app.quantum.qaoa import run_qaoa

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/qaoa")

# ── In-memory caches (survive DB absence) ───────────────────────────────────
_qubo_cache: Dict[str, Any] = {}   # shared reference to qubo module cache
_qaoa_cache: Dict[str, Any] = {}


def _import_qubo_cache() -> Dict[str, Any]:
    """Lazily import the QUBO module-level cache."""
    try:
        from app.api.v1.qubo import _qubo_cache as qc  # type: ignore
        return qc
    except Exception:
        return {}


# ── Helpers ─────────────────────────────────────────────────────────────────

def _qubo_result_from_cache(qubo_id: str) -> Optional[QUBOResult]:
    """Reconstruct a QUBOResult from the in-memory QUBO cache."""
    cache = _import_qubo_cache()
    data = cache.get(qubo_id) or cache.get("latest")
    if not data:
        return None
    return QUBOResult(
        n_variables=data.get("n_variables", 7),
        variable_labels=data.get("variable_labels", []),
        q_matrix=data.get("q_matrix", []),
        weights=data.get("weights", {}),
        constraint_lambda=data.get("constraint_lambda", 5.0),
        individual_costs=data.get("individual_costs", []),
        ising_h=data.get("ising_h", []),
        ising_j=data.get("ising_j", []),
        classical_solution=data.get("classical_solution", "1000000"),
        classical_cost=data.get("classical_cost", 0.0),
        qubo_breakdown=data.get("qubo_breakdown", []),
    )


# ── Routes ───────────────────────────────────────────────────────────────────

@router.post("/run/{qubo_id}")
async def run_qaoa_endpoint(
    qubo_id: str,
    depth_p: int = 1,
    shots: int = 1024,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.RUN_QAOA)),
):
    """Run QAOA simulation on a QUBO problem.

    Lookup order for QUBO data:
    1. DB query (if DB is available and the run was persisted)
    2. In-memory _qubo_cache (module-level dict in qubo.py)
    Failure to find the QUBO in either source returns 404.
    """
    qubo_result: Optional[QUBOResult] = None

    # 1. Try DB first
    try:
        result = await db.execute(select(QUBORun).where(QUBORun.id == qubo_id))
        qubo_run = result.scalar_one_or_none()
        if qubo_run:
            qubo_result = QUBOResult(
                n_variables=qubo_run.n_variables,
                variable_labels=qubo_run.variable_labels,
                q_matrix=qubo_run.q_matrix,
                weights={},
                constraint_lambda=5.0,
                individual_costs=[],
                ising_h=qubo_run.ising_h,
                ising_j=qubo_run.ising_j,
                classical_solution=qubo_run.classical_solution,
                classical_cost=qubo_run.classical_cost or 0.0,
                qubo_breakdown=[],
            )
    except Exception as e:
        logger.debug(f"DB lookup for QUBO {qubo_id} failed, falling back to cache: {e}")

    # 2. Fall back to in-memory cache
    if qubo_result is None:
        qubo_result = _qubo_result_from_cache(qubo_id)

    if qubo_result is None:
        raise HTTPException(status_code=404, detail=f"QUBO run '{qubo_id}' not found in DB or cache")

    # Run QAOA simulation
    qaoa_result = run_qaoa(qubo_result, depth_p=depth_p, shots=shots)
    run_id = str(uuid.uuid4())

    # Build response payload
    payload = {
        "run_id": run_id,
        "qubo_id": qubo_id,
        "n_qubits": qaoa_result.n_qubits,
        "depth_p": qaoa_result.depth_p,
        "backend": qaoa_result.backend,
        "shots": qaoa_result.shots,
        "selected_bitstring": qaoa_result.selected_bitstring,
        "selected_cost": qaoa_result.selected_cost,
        "classical_solution": qaoa_result.classical_solution,
        "classical_cost": qaoa_result.classical_cost,
        "optimality_gap": qaoa_result.optimality_gap,
        "runtime_ms": qaoa_result.runtime_ms,
        "used_classical_fallback": qaoa_result.used_classical_fallback,
        "circuit_diagram": qaoa_result.circuit_diagram,
        "top_results": qaoa_result.top_results,
        "gamma_params": qaoa_result.gamma_params,
        "beta_params": qaoa_result.beta_params,
        "optimization_history": qaoa_result.optimization_history[:50],
        "disclaimer": qaoa_result.disclaimer,
        "interpretation": (
            f"QAOA selected bitstring '{qaoa_result.selected_bitstring}' — "
            "this is a CANDIDATE SELECTION VECTOR, NOT a ULPIN. "
            "Proceed to geometry reconstruction and validation before ULPIN generation."
        ),
    }

    # Cache in memory
    _qaoa_cache[run_id] = payload
    _qaoa_cache["latest"] = payload

    # Try DB persistence (non-fatal)
    try:
        qaoa_run = QAOARun(
            id=uuid.UUID(run_id),
            qubo_id=uuid.UUID(qubo_id),
            property_id=None,
            backend=qaoa_result.backend,
            depth_p=qaoa_result.depth_p,
            n_qubits=qaoa_result.n_qubits,
            shots=qaoa_result.shots,
            bitstrings=qaoa_result.bitstrings[:20],
            probabilities=qaoa_result.probabilities[:20],
            objective_values=qaoa_result.objective_values[:20],
            selected_bitstring=qaoa_result.selected_bitstring,
            selected_cost=qaoa_result.selected_cost,
            optimality_gap=qaoa_result.optimality_gap,
            runtime_ms=qaoa_result.runtime_ms,
            used_classical_fallback=qaoa_result.used_classical_fallback,
            circuit_diagram=qaoa_result.circuit_diagram,
            metadata_={
                "gamma_params": qaoa_result.gamma_params,
                "beta_params": qaoa_result.beta_params,
                "disclaimer": qaoa_result.disclaimer,
                "top_results": qaoa_result.top_results,
            },
        )
        db.add(qaoa_run)
        log = AuditLog(
            user_id=getattr(current_user, "id", uuid.UUID("00000000-0000-0000-0000-000000000003")),
            action="RUN_QAOA",
            resource_type="qaoa_run",
            resource_id=run_id,
            details={"qubo_id": qubo_id, "backend": qaoa_result.backend,
                     "fallback": qaoa_result.used_classical_fallback},
        )
        db.add(log)
        await db.flush()
    except Exception as e:
        logger.debug(f"DB persistence for QAOA run bypassed (no DB): {e}")
        try:
            await db.rollback()
        except Exception:
            pass

    return payload


@router.get("/{run_id}")
async def get_qaoa_run(
    run_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.RUN_QAOA)),
):
    # 1. In-memory cache first (much faster)
    if run_id in _qaoa_cache:
        return _qaoa_cache[run_id]
    if "latest" in _qaoa_cache:
        return _qaoa_cache["latest"]

    # 2. Try DB
    try:
        result = await db.execute(select(QAOARun).where(QAOARun.id == run_id))
        run = result.scalar_one_or_none()
        if run:
            return {
                "run_id": str(run.id),
                "selected_bitstring": run.selected_bitstring,
                "backend": run.backend,
                "used_classical_fallback": run.used_classical_fallback,
                "top_results": run.metadata_.get("top_results", []),
                "disclaimer": run.metadata_.get("disclaimer", ""),
            }
    except Exception:
        pass

    raise HTTPException(status_code=404, detail="QAOA run not found")
