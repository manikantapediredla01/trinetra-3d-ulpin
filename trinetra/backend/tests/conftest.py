"""TRINETRA — Pytest configuration and fixtures."""
import pytest
import sys
import os

# Add app to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.demo.generator import generate_demo_property


@pytest.fixture
def demo_property_data():
    return generate_demo_property()


@pytest.fixture
def sample_candidates(demo_property_data):
    from app.quantum.qubo import CandidateMetrics
    raw = demo_property_data.get("candidate_configurations", [])
    metrics = []
    for c in raw:
        metrics.append(
            CandidateMetrics(
                candidate_id=f"cand_{c['candidate_index']}",
                candidate_index=c["candidate_index"],
                area_m2=c["area_m2"],
                volume_m3=c["volume_m3"],
                floor_range_min=c["floor_range_min"],
                floor_range_max=c["floor_range_max"],
                overlap_score=c["overlap_score"],
                gap_score=c["gap_score"],
                boundary_error=c.get("boundary_error_m", c.get("boundary_error", 0.0)),
                floor_error=c.get("floor_error_m", c.get("floor_error", 0.0)),
                topology_score=c["topology_score"],
            )
        )
    return metrics
