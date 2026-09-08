"""
TRINETRA — QAOA (Quantum Approximate Optimization Algorithm) Engine

Uses Qiskit 1.x + Qiskit Aer simulator.

IMPORTANT DISCLAIMERS (displayed in UI):
- This runs on a CLASSICAL SIMULATOR, not a quantum computer.
- We do NOT claim quantum speedup.
- For the small problem size (≤10 variables), classical exact solution
  is also computed and compared.
- The QAOA bitstring is a CANDIDATE SELECTION VECTOR, NOT a ULPIN.
- ULPIN is generated ONLY after geometry reconstruction + validation.

Workflow:
  Candidates → QUBO → Ising Hamiltonian → QAOA circuit → measurement
  → bitstrings → cost evaluation → best configuration → geometry reconstruction
"""
import time
import logging
try:
    import numpy as np
except ImportError:
    np = None
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass

logger = logging.getLogger(__name__)

# Try to import Qiskit — if unavailable, use classical fallback
try:
    from qiskit import QuantumCircuit
    from qiskit.circuit.library import QAOAAnsatz
    from qiskit.primitives import StatevectorSampler
    from qiskit_aer import AerSimulator
    from qiskit_aer.primitives import Sampler as AerSampler
    from qiskit.quantum_info import SparsePauliOp
    from scipy.optimize import minimize
    QISKIT_AVAILABLE = True
    logger.info("[INFO] Qiskit + Qiskit Aer available -- QAOA simulator enabled")
except ImportError:
    QISKIT_AVAILABLE = False
    logger.warning("[WARN] Qiskit not available -- classical fallback will be used")

from app.quantum.qubo import QUBOResult, evaluate_qubo


@dataclass
class QAOAResult:
    """Output of the QAOA optimization run."""
    n_qubits: int
    depth_p: int
    backend: str
    shots: int
    bitstrings: List[str]
    probabilities: List[float]
    objective_values: List[float]
    selected_bitstring: str
    selected_cost: float
    classical_solution: str
    classical_cost: float
    optimality_gap: float
    runtime_ms: float
    used_classical_fallback: bool
    circuit_diagram: str
    gamma_params: List[float]
    beta_params: List[float]
    optimization_history: List[float]
    disclaimer: str
    top_results: List[Dict[str, Any]]  # top 10 bitstrings by probability


def build_cost_hamiltonian(ising_h: List[float], ising_j: Dict[str, float], n: int) -> "SparsePauliOp":
    """Build Qiskit SparsePauliOp from Ising coefficients."""
    pauli_list = []

    # Single qubit terms: h_i * Z_i
    for i, h in enumerate(ising_h):
        if abs(h) > 1e-10:
            pauli_str = ["I"] * n
            pauli_str[i] = "Z"
            pauli_list.append(("".join(reversed(pauli_str)), h))

    # Two-qubit terms: J_{ij} * Z_i Z_j
    for key, j_val in ising_j.items():
        if abs(j_val) > 1e-10:
            i, j = map(int, key.split(","))
            pauli_str = ["I"] * n
            pauli_str[i] = "Z"
            pauli_str[j] = "Z"
            pauli_list.append(("".join(reversed(pauli_str)), j_val))

    if not pauli_list:
        # Identity fallback
        pauli_list = [("I" * n, 0.0)]

    return SparsePauliOp.from_list(pauli_list)


def run_qaoa(
    qubo_result: QUBOResult,
    depth_p: int = 1,
    shots: int = 1024,
) -> QAOAResult:
    """
    Run QAOA on the Qiskit Aer simulator.
    Falls back to classical exact solution if Qiskit unavailable.
    """
    n = qubo_result.n_variables
    classical_solution = qubo_result.classical_solution
    classical_cost = qubo_result.classical_cost
    Q = np.array(qubo_result.q_matrix)

    start_time = time.time()

    if not QISKIT_AVAILABLE or n == 0:
        return _classical_fallback(qubo_result, start_time, depth_p=depth_p, shots=shots)

    try:
        return _run_qiskit_qaoa(qubo_result, Q, depth_p, shots, start_time)
    except Exception as e:
        logger.error(f"QAOA execution failed: {e} — using classical fallback")
        result = _classical_fallback(qubo_result, start_time, depth_p=depth_p, shots=shots)
        result.used_classical_fallback = True
        return result


def _run_qiskit_qaoa(
    qubo_result: QUBOResult,
    Q: np.ndarray,
    depth_p: int,
    shots: int,
    start_time: float,
) -> QAOAResult:
    """Internal: run actual Qiskit QAOA circuit."""
    n = qubo_result.n_variables
    ising_h = qubo_result.ising_h
    ising_j = qubo_result.ising_j

    # Build cost Hamiltonian
    cost_op = build_cost_hamiltonian(ising_h, ising_j, n)

    # Build QAOA ansatz circuit
    ansatz = QAOAAnsatz(cost_operator=cost_op, reps=depth_p)
    ansatz.measure_all()

    # Aer simulator
    backend = AerSimulator()
    sampler = AerSampler()

    # Parameter optimization with COBYLA
    n_params = 2 * depth_p  # gamma + beta per layer
    initial_params = np.random.uniform(0, np.pi, n_params)
    optimization_history = []

    def objective(params):
        """Expectation value of cost operator."""
        job = sampler.run([(ansatz, params)], shots=shots)
        result = job.result()
        counts = result[0].data.meas.get_counts()
        # Compute expectation value
        total_shots = sum(counts.values())
        exp_val = 0.0
        for bitstring, count in counts.items():
            # Qiskit returns little-endian; reverse for our convention
            bs = bitstring[::-1]
            cost = evaluate_qubo(Q, bs)
            exp_val += (count / total_shots) * cost
        optimization_history.append(exp_val)
        return exp_val

    opt_result = minimize(objective, initial_params, method="COBYLA",
                         options={"maxiter": 100, "rhobeg": 0.5})
    optimal_params = opt_result.x

    # Final measurement with optimal parameters
    final_job = sampler.run([(ansatz, optimal_params)], shots=shots)
    final_result = final_job.result()
    counts = final_result[0].data.meas.get_counts()

    # Process results
    total = sum(counts.values())
    bitstring_data = []
    for bs_raw, count in counts.items():
        bs = bs_raw[::-1]  # little-endian → big-endian
        cost = evaluate_qubo(Q, bs)
        bitstring_data.append((bs, count / total, cost))

    bitstring_data.sort(key=lambda x: x[2])  # sort by cost

    # Best result
    selected_bitstring = bitstring_data[0][0]
    selected_cost = bitstring_data[0][2]

    # Top 10 for display
    top_results = [
        {
            "bitstring": bs,
            "probability": float(prob),
            "cost": float(cost),
            "rank": i + 1,
        }
        for i, (bs, prob, cost) in enumerate(bitstring_data[:10])
    ]

    # Circuit diagram (text)
    try:
        parameterized = ansatz.assign_parameters(optimal_params)
        circuit_diagram = str(parameterized.decompose())
    except Exception:
        circuit_diagram = f"QAOA circuit: {n} qubits, depth p={depth_p}"

    runtime_ms = (time.time() - start_time) * 1000
    optimality_gap = abs(selected_cost - qubo_result.classical_cost)

    gammas = optimal_params[:depth_p].tolist()
    betas = optimal_params[depth_p:].tolist()

    return QAOAResult(
        n_qubits=n,
        depth_p=depth_p,
        backend="qiskit_aer_simulator",
        shots=shots,
        bitstrings=[bd[0] for bd in bitstring_data],
        probabilities=[bd[1] for bd in bitstring_data],
        objective_values=[bd[2] for bd in bitstring_data],
        selected_bitstring=selected_bitstring,
        selected_cost=float(selected_cost),
        classical_solution=qubo_result.classical_solution,
        classical_cost=float(qubo_result.classical_cost),
        optimality_gap=float(optimality_gap),
        runtime_ms=float(runtime_ms),
        used_classical_fallback=False,
        circuit_diagram=circuit_diagram,
        gamma_params=gammas,
        beta_params=betas,
        optimization_history=optimization_history,
        top_results=top_results,
        disclaimer=(
            "QAOA Simulator — This runs on a classical Aer simulator, "
            "NOT a quantum computer. No quantum speedup is claimed. "
            "Results benchmarked against classical brute-force solution. "
            "QAOA bitstring is a candidate selection vector, NOT a ULPIN."
        ),
    )


def _classical_fallback(qubo_result: QUBOResult, start_time: float, depth_p: int = 1, shots: int = 1024) -> QAOAResult:
    """
    Classical fallback when Qiskit is unavailable.
    Uses the brute-force solution from QUBO.
    Clearly labeled as classical fallback.
    """
    n = qubo_result.n_variables
    Q = np.array(qubo_result.q_matrix)
    bs = qubo_result.classical_solution
    cost = qubo_result.classical_cost

    # Generate nearby solutions for display
    top_results = []
    seen = set()
    candidates_list = []
    for i in range(2**n):
        bitstring = format(i, f"0{n}b")
        c = evaluate_qubo(Q, bitstring)
        candidates_list.append((bitstring, c))
    candidates_list.sort(key=lambda x: x[1])

    for rank, (bitstring, c) in enumerate(candidates_list[:10]):
        top_results.append({
            "bitstring": bitstring,
            "probability": max(0.0, (10 - rank) / 55),  # heuristic display prob
            "cost": float(c),
            "rank": rank + 1,
        })

    runtime_ms = (time.time() - start_time) * 1000

    return QAOAResult(
        n_qubits=n,
        depth_p=depth_p,
        backend="classical_brute_force",
        shots=shots,
        bitstrings=[r["bitstring"] for r in top_results],
        probabilities=[r["probability"] for r in top_results],
        objective_values=[r["cost"] for r in top_results],
        selected_bitstring=bs,
        selected_cost=float(cost),
        classical_solution=qubo_result.classical_solution,
        classical_cost=float(qubo_result.classical_cost),
        optimality_gap=0.0,
        runtime_ms=float(runtime_ms),
        used_classical_fallback=True,
        circuit_diagram="(Classical fallback — no quantum circuit)",
        gamma_params=[],
        beta_params=[],
        optimization_history=[float(cost)],
        top_results=top_results,
        disclaimer=(
            "QAOA UNAVAILABLE — Classical brute-force fallback used. "
            "Install qiskit and qiskit-aer for quantum simulation. "
            "Results represent the exact classical optimal solution."
        ),
    )
