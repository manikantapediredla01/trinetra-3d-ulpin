"""Tests for QUBO matrix formulation engine."""
import numpy as np
from app.quantum.qubo import build_qubo, CandidateMetrics, decode_bitstring


def test_qubo_matrix_construction(sample_candidates):
    result = build_qubo(sample_candidates, constraint_lambda=5.0)

    assert result.n_variables == len(sample_candidates)
    assert len(result.q_matrix) == len(sample_candidates)
    assert len(result.q_matrix[0]) == len(sample_candidates)
    assert result.constraint_lambda == 5.0
    assert result.classical_solution is not None
    assert len(result.classical_solution) == len(sample_candidates)


def test_qubo_classical_solution_one_hot(sample_candidates):
    result = build_qubo(sample_candidates, constraint_lambda=5.0)
    # The penalty lambda enforces exactly one configuration selected
    ones_count = result.classical_solution.count("1")
    assert ones_count == 1, f"Expected 1 selected configuration, got: {result.classical_solution}"


def test_qubo_decode_bitstring():
    bitstring = "0100000"
    labels = ["c0", "c1", "c2", "c3", "c4", "c5", "c6"]
    decoded = decode_bitstring(bitstring, labels)
    assert decoded["selected_indices"] == [1]
    assert decoded["selected_labels"] == ["c1"]
    assert decoded["is_valid_one_hot"] is True
