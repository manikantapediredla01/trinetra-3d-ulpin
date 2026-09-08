"""Tests for QAOA Quantum Simulator engine."""
from app.quantum.qubo import build_qubo
from app.quantum.qaoa import run_qaoa


def test_qaoa_simulation_run(sample_candidates):
    qubo_res = build_qubo(sample_candidates, constraint_lambda=5.0)
    qaoa_res = run_qaoa(qubo_res, depth_p=1, shots=512)

    assert qaoa_res.backend is not None
    assert qaoa_res.depth_p == 1
    assert qaoa_res.shots == 512
    assert qaoa_res.selected_bitstring is not None
    assert len(qaoa_res.bitstrings) > 0
    assert len(qaoa_res.probabilities) > 0
    assert abs(sum(qaoa_res.probabilities) - 1.0) < 0.05
    assert qaoa_res.optimality_gap >= 0.0
