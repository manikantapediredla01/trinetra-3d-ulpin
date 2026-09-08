"""TRINETRA — QAOA API router."""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid

from app.core.database import get_db
from app.core.deps import get_current_user, require_permission
from app.auth.rbac import Permission
from app.models import QAOARun, QUBORun, CandidateConfiguration, AuditLog, User
from app.quantum.qubo import CandidateMetrics, build_qubo, decode_bitstring
from app.quantum.qaoa import run_qaoa

router = APIRouter(prefix="/qaoa")


@router.post("/run/{qubo_id}")
async def run_qaoa_endpoint(
    qubo_id: str,
    depth_p: int = 1,
    shots: int = 1024,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.RUN_QAOA)),
):
    """Run QAOA simulation on a QUBO problem."""
    result = await db.execute(select(QUBORun).where(QUBORun.id == qubo_id))
    qubo_run = result.scalar_one_or_none()
    if not qubo_run:
        raise HTTPException(status_code=404, detail="QUBO run not found")

    # Reconstruct QUBOResult from DB
    from app.quantum.qubo import QUBOResult
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

    # Run QAOA
    qaoa_result = run_qaoa(qubo_result, depth_p=depth_p, shots=shots)

    # Store result
    qaoa_run = QAOARun(
        qubo_id=uuid.UUID(qubo_id),
        property_id=qubo_run.property_id,
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

    # Audit log
    log = AuditLog(user_id=current_user.id, action="RUN_QAOA",
                   resource_type="qaoa_run", resource_id=str(qaoa_run.id),
                   details={"qubo_id": qubo_id, "backend": qaoa_result.backend,
                            "fallback": qaoa_result.used_classical_fallback})
    db.add(log)
    await db.flush()

    return {
        "run_id": str(qaoa_run.id),
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


@router.get("/{run_id}")
async def get_qaoa_run(
    run_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.RUN_QAOA)),
):
    result = await db.execute(select(QAOARun).where(QAOARun.id == run_id))
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="QAOA run not found")
    return {
        "run_id": str(run.id),
        "selected_bitstring": run.selected_bitstring,
        "backend": run.backend,
        "used_classical_fallback": run.used_classical_fallback,
        "top_results": run.metadata_.get("top_results", []),
        "disclaimer": run.metadata_.get("disclaimer", ""),
    }
