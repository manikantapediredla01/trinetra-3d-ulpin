"""
TRINETRA — QUBO (Quadratic Unconstrained Binary Optimization) Engine

Formulates the 3D property configuration selection as a QUBO problem.

Binary variable x_i ∈ {0,1}:
  x_i = 1: candidate configuration i is selected
  x_i = 0: not selected

Objective:
  Cost = w_o * Overlap + w_g * Gap + w_b * BoundaryError
       + w_f * FloorError + w_t * TopologyError

Coefficients are computed from measurable candidate geometry metrics.
This is NOT arbitrary — each coefficient derives from actual spatial
measurements of the candidate configurations.

Constraint: exactly one configuration should be selected
  Penalty = λ * (Σx_i - 1)²

Total QUBO: minimize Cost + Penalty
"""
try:
    import numpy as np
except ImportError:
    np = None
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class CandidateMetrics:
    """Measurable geometric metrics for one candidate configuration."""
    candidate_id: str
    candidate_index: int
    area_m2: float
    volume_m3: float
    floor_range_min: int
    floor_range_max: int
    overlap_score: float      # 0.0 = no overlap (ideal), 1.0 = maximum overlap
    gap_score: float          # 0.0 = no gaps (ideal), 1.0 = maximum gaps
    boundary_error: float     # RMS boundary deviation in meters
    floor_error: float        # Floor height deviation from expected (m)
    topology_score: float     # 0.0 = topology errors, 1.0 = perfect topology


@dataclass
class QUBOResult:
    """Output of the QUBO formulation."""
    n_variables: int
    variable_labels: List[str]
    q_matrix: List[List[float]]         # Upper triangular Q matrix
    weights: Dict[str, float]           # w_overlap, w_gap, w_boundary, w_floor, w_topology
    constraint_lambda: float
    individual_costs: List[float]       # diagonal: cost per candidate alone
    ising_h: List[float]                # linear Ising coefficients
    ising_j: Dict[str, float]           # quadratic Ising coefficients {i,j: Jij}
    classical_solution: str             # optimal bitstring from brute force
    classical_cost: float
    qubo_breakdown: List[Dict[str, Any]]  # per-variable QUBO breakdown


def compute_weights_from_data(candidates: List[CandidateMetrics]) -> Dict[str, float]:
    """
    Compute QUBO weights from the distribution of candidate metrics.
    Higher weight for metrics with more variance (more discriminating).
    This is transparent and data-driven, not arbitrary.
    """
    if not candidates:
        return {"w_overlap": 1.0, "w_gap": 1.0, "w_boundary": 0.5, "w_floor": 0.5, "w_topology": 1.0}

    # Standard deviation of each metric (higher variance → higher weight)
    overlaps = [c.overlap_score for c in candidates]
    gaps = [c.gap_score for c in candidates]
    boundaries = [c.boundary_error for c in candidates]
    floors = [c.floor_error for c in candidates]
    topologies = [1.0 - c.topology_score for c in candidates]

    def safe_std(vals):
        arr = np.array(vals)
        s = float(np.std(arr))
        return max(s, 0.01)  # avoid zero weights

    total = safe_std(overlaps) + safe_std(gaps) + safe_std(boundaries) + safe_std(floors) + safe_std(topologies)

    return {
        "w_overlap": 2.0 * safe_std(overlaps) / total,
        "w_gap": 2.0 * safe_std(gaps) / total,
        "w_boundary": 1.5 * safe_std(boundaries) / total,
        "w_floor": 1.5 * safe_std(floors) / total,
        "w_topology": 2.0 * safe_std(topologies) / total,
    }


def candidate_cost(candidate: CandidateMetrics, weights: Dict[str, float]) -> float:
    """Cost function for a single candidate (diagonal QUBO term)."""
    topology_penalty = 1.0 - candidate.topology_score  # invert: 0=good → low penalty
    return (
        weights["w_overlap"] * candidate.overlap_score
        + weights["w_gap"] * candidate.gap_score
        + weights["w_boundary"] * candidate.boundary_error
        + weights["w_floor"] * candidate.floor_error
        + weights["w_topology"] * topology_penalty
    )


def cross_penalty(ci: CandidateMetrics, cj: CandidateMetrics, weights: Dict[str, float]) -> float:
    """
    Off-diagonal QUBO term for selecting both ci and cj simultaneously.
    Captures interaction cost (geometric overlap between two candidates).
    """
    # Mutual overlap penalty: if both are selected, combined overlap is worse
    mutual_overlap = (ci.overlap_score + cj.overlap_score) / 2.0
    return weights["w_overlap"] * mutual_overlap * 0.5


def build_qubo(candidates: List[CandidateMetrics], constraint_lambda: float = 5.0) -> QUBOResult:
    """
    Build the complete QUBO matrix from candidate metrics.

    The constraint (Σx_i - 1)² enforces exactly-one-selection.
    Expanding: Σx_i² + 2*Σ_{i<j} x_i*x_j - 2*Σx_i + 1
    Since x_i² = x_i for binary: Σ(1-2)x_i + 2*Σ_{i<j}x_i*x_j + const

    Q[i][i] += λ*(1 - 2) = -λ
    Q[i][j] += λ*2        (for i < j)
    """
    n = len(candidates)
    if n == 0:
        raise ValueError("No candidates provided to QUBO engine")

    weights = compute_weights_from_data(candidates)
    Q = np.zeros((n, n))

    # Diagonal: individual cost + constraint diagonal term
    individual_costs = []
    for i, c in enumerate(candidates):
        cost = candidate_cost(c, weights)
        individual_costs.append(cost)
        Q[i][i] = cost + constraint_lambda * (1 - 2)  # -λ

    # Upper triangle: cross penalties + constraint off-diagonal
    for i in range(n):
        for j in range(i + 1, n):
            cross = cross_penalty(candidates[i], candidates[j], weights)
            Q[i][j] = cross + constraint_lambda * 2  # +2λ

    # Classical exact solution (brute force, feasible for n ≤ 15)
    best_bitstring, best_cost = brute_force_solve(Q)

    # Convert QUBO to Ising Hamiltonian
    # x_i = (1 - z_i) / 2 where z_i ∈ {-1, +1}
    ising_h, ising_j, ising_offset = qubo_to_ising(Q)

    # QUBO breakdown per variable
    qubo_breakdown = []
    for i, c in enumerate(candidates):
        qubo_breakdown.append({
            "candidate_id": c.candidate_id,
            "candidate_index": c.candidate_index,
            "variable": f"x_{i}",
            "diagonal": float(Q[i][i]),
            "overlap_contribution": weights["w_overlap"] * c.overlap_score,
            "gap_contribution": weights["w_gap"] * c.gap_score,
            "boundary_contribution": weights["w_boundary"] * c.boundary_error,
            "floor_contribution": weights["w_floor"] * c.floor_error,
            "topology_contribution": weights["w_topology"] * (1.0 - c.topology_score),
            "constraint_diagonal": constraint_lambda * (1 - 2),
            "total_individual_cost": individual_costs[i],
        })

    variable_labels = [f"x_{i} (Candidate {c.candidate_index})" for i, c in enumerate(candidates)]

    return QUBOResult(
        n_variables=n,
        variable_labels=variable_labels,
        q_matrix=Q.tolist(),
        weights=weights,
        constraint_lambda=constraint_lambda,
        individual_costs=individual_costs,
        ising_h=ising_h,
        ising_j=ising_j,
        classical_solution=best_bitstring,
        classical_cost=best_cost,
        qubo_breakdown=qubo_breakdown,
    )


def evaluate_qubo(Q: np.ndarray, bitstring: str) -> float:
    """Evaluate QUBO objective for a given bitstring."""
    x = np.array([int(b) for b in bitstring])
    return float(x @ Q @ x)


def brute_force_solve(Q: np.ndarray) -> Tuple[str, float]:
    """Exact brute-force solution (feasible for n ≤ 15 variables)."""
    n = Q.shape[0]
    best_cost = float("inf")
    best_bitstring = "0" * n

    for i in range(2**n):
        bitstring = format(i, f"0{n}b")
        cost = evaluate_qubo(Q, bitstring)
        if cost < best_cost:
            best_cost = cost
            best_bitstring = bitstring

    return best_bitstring, best_cost


def qubo_to_ising(Q: np.ndarray) -> Tuple[List[float], Dict[str, float], float]:
    """
    Convert QUBO to Ising Hamiltonian.
    x_i = (1 - z_i) / 2
    H = Σ h_i z_i + Σ_{i<j} J_{ij} z_i z_j + const
    """
    n = Q.shape[0]
    h = np.zeros(n)
    J = {}
    offset = 0.0

    for i in range(n):
        for j in range(i, n):
            q = Q[i][j] if i != j else Q[i][i]
            if i == j:
                # Q[i][i] * x_i = Q[i][i] * (1 - z_i)/2
                h[i] -= q / 2
                offset += q / 2
            else:
                # Q[i][j] * x_i * x_j = Q[i][j] * (1-z_i)(1-z_j)/4
                J[f"{i},{j}"] = q / 4
                h[i] -= q / 4
                h[j] -= q / 4
                offset += q / 4

    return h.tolist(), J, float(offset)


def decode_bitstring(bitstring: str, candidates: Any) -> Dict[str, Any]:
    """
    Decode QAOA/classical output bitstring to selected candidate configurations.
    A QAOA bitstring is NEVER a ULPIN — it is a candidate selection vector.
    """
    selected = []
    selected_indices = []
    for i, bit in enumerate(bitstring):
        if bit == "1":
            selected_indices.append(i)
            if i < len(candidates):
                selected.append(candidates[i])

    return {
        "selected_indices": selected_indices,
        "selected_candidates": selected,
        "selected_labels": selected,
        "is_valid_one_hot": len(selected_indices) == 1,
        "bitstring": bitstring,
    }
