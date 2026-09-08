"""
TRINETRA Standalone Quantum Engine — QUBO Matrix Builder

Formulates the 3D property boundary selection problem as a
Quadratic Unconstrained Binary Optimization (QUBO) matrix.
"""
import numpy as np
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass


@dataclass
class CandidateProfile:
    index: int
    name: str
    overlap_score: float
    gap_score: float
    boundary_error_m: float
    floor_error_m: float
    topology_score: float


DEFAULT_WEIGHTS = {
    "w_overlap": 10.0,
    "w_gap": 8.0,
    "w_boundary": 5.0,
    "w_floor": 4.0,
    "w_topology": 12.0,
}


def compute_qubo_matrix(
    candidates: List[CandidateProfile],
    weights: Dict[str, float] = None,
    penalty_lambda: float = 5.0,
) -> Tuple[np.ndarray, np.ndarray, Dict[Tuple[int, int], float]]:
    """
    Builds symmetric Q matrix and Ising coefficients (h, J).
    Total cost: min x^T Q x s.t. sum(x_i) = 1
    Penalty formulation: lambda * (sum(x_i) - 1)^2
    """
    if weights is None:
        weights = DEFAULT_WEIGHTS

    n = len(candidates)
    Q = np.zeros((n, n), dtype=float)

    # Diagonal: individual geometric errors + linear penalty term
    for i, c in enumerate(candidates):
        cost_i = (
            weights["w_overlap"] * c.overlap_score
            + weights["w_gap"] * c.gap_score
            + weights["w_boundary"] * c.boundary_error_m
            + weights["w_floor"] * c.floor_error_m
            + weights["w_topology"] * (1.0 - c.topology_score)
        )
        # Linear penalty expansion: lambda * (x_i^2 - 2*x_i) = -lambda * x_i (since x_i^2 = x_i)
        Q[i, i] = cost_i - penalty_lambda

    # Off-diagonal: quadratic penalty cross-terms
    for i in range(n):
        for j in range(i + 1, n):
            # Penalty cross-term: +2 * lambda * x_i * x_j
            Q[i, j] = 2.0 * penalty_lambda
            Q[j, i] = Q[i, j]

    # Convert binary x_i in {0,1} to Ising spin s_i in {-1,+1}
    # x_i = (1 - s_i) / 2
    h = np.zeros(n, dtype=float)
    J = {}

    for i in range(n):
        h[i] = -0.5 * Q[i, i] - 0.25 * sum(Q[i, j] for j in range(n) if j != i)

    for i in range(n):
        for j in range(i + 1, n):
            J[(i, j)] = 0.25 * Q[i, j]

    return Q, h, J


if __name__ == "__main__":
    demo_cands = [
        CandidateProfile(0, "Candidate 0 (Raw Mesh)", 0.08, 0.05, 0.42, 0.08, 0.95),
        CandidateProfile(1, "Candidate 1 (Optimal)", 0.00, 0.00, 0.05, 0.02, 1.00),
        CandidateProfile(2, "Candidate 2 (LoD-1)", 0.02, 0.12, 0.65, 0.25, 0.90),
        CandidateProfile(3, "Candidate 3 (Overhang)", 0.15, 0.01, 0.95, 0.10, 0.85),
    ]

    Q_mat, h_vec, J_dict = compute_qubo_matrix(demo_cands)
    print("QUBO Q Matrix (4x4):")
    print(np.round(Q_mat, 3))
    print("\nIsing linear terms (h):", np.round(h_vec, 3))
