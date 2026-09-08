"""
TRINETRA — Automated Test Runner (Unittest / Pytest compatible)

Runs unit tests across QUBO, QAOA, Validation, ULPIN, and Demo Generation.
"""
import sys
import os
import unittest

# Ensure paths
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.insert(0, backend_dir)
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "quantum")))

from app.demo.generator import generate_demo_property
from app.quantum.qubo import CandidateMetrics, build_qubo, decode_bitstring
from app.quantum.qaoa import run_qaoa
from app.validation.validator import validate_property
from app.services.ulpin import ulpin_service
from app.quantum.geometry_reconstruction import GeometryReconstructor


class TestQUBOEngine(unittest.TestCase):
    def setUp(self):
        demo = generate_demo_property()
        raw = demo.get("candidates", [])
        self.metrics = []
        for c in raw:
            self.metrics.append(
                CandidateMetrics(
                    candidate_id=f"cand_{c['candidate_index']}",
                    candidate_index=c["candidate_index"],
                    area_m2=c["area_m2"],
                    volume_m3=c["volume_m3"],
                    floor_range_min=c["floor_range_min"],
                    floor_range_max=c["floor_range_max"],
                    overlap_score=c["overlap_score"],
                    gap_score=c["gap_score"],
                    boundary_error=c.get("boundary_error", 0.1),
                    floor_error=c.get("floor_error", 0.05),
                    topology_score=c["topology_score"],
                )
            )

    def test_qubo_matrix_dimensions(self):
        result = build_qubo(self.metrics, constraint_lambda=5.0)
        self.assertEqual(result.n_variables, len(self.metrics))
        self.assertEqual(len(result.q_matrix), len(self.metrics))
        self.assertEqual(len(result.q_matrix[0]), len(self.metrics))

    def test_qubo_classical_solution_one_hot(self):
        result = build_qubo(self.metrics, constraint_lambda=5.0)
        ones_count = result.classical_solution.count("1")
        self.assertEqual(ones_count, 1)

    def test_decode_bitstring(self):
        labels = [f"c{i}" for i in range(len(self.metrics))]
        bitstring = "0" * len(labels)
        bitstring = "001" + "0" * (len(labels) - 3)
        res = decode_bitstring(bitstring, labels)
        self.assertEqual(res["selected_indices"], [2])
        self.assertTrue(res["is_valid_one_hot"])


class TestQAOAEngine(unittest.TestCase):
    def setUp(self):
        demo = generate_demo_property()
        raw = demo.get("candidates", [])
        metrics = []
        for c in raw[:4]:  # test with 4 candidates
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
                    boundary_error=c.get("boundary_error", 0.1),
                    floor_error=c.get("floor_error", 0.05),
                    topology_score=c["topology_score"],
                )
            )
        self.qubo = build_qubo(metrics, constraint_lambda=5.0)

    def test_qaoa_simulation(self):
        qaoa_res = run_qaoa(self.qubo, depth_p=1, shots=512)
        self.assertIsNotNone(qaoa_res.selected_bitstring)
        self.assertEqual(len(qaoa_res.selected_bitstring), self.qubo.n_variables)
        self.assertGreater(len(qaoa_res.probabilities), 0)
        self.assertGreaterEqual(qaoa_res.optimality_gap, 0.0)


class TestValidationEngine(unittest.TestCase):
    def setUp(self):
        self.demo = generate_demo_property()

    def test_eight_checks(self):
        prop = self.demo["property"]
        units = self.demo["floor_units"]
        parcel = self.demo["parcel"]

        res = validate_property(
            property_id=prop["property_ref"],
            geometry_geojson=prop.get("geometry"),
            floor_units=units,
            parcel_geojson=parcel.get("geometry"),
            building_height=prop.get("building_height_m", 19.2),
            ground_elevation=prop.get("ground_elevation_m", 536.0),
            city="Hyderabad",
        )
        self.assertEqual(res.property_id, "PROP-HYD-2024-001")
        self.assertEqual(len(res.checks), 8)
        self.assertIn(res.overall_result, ["VALIDATED", "NEEDS_REVIEW", "REJECTED"])


class TestULPINService(unittest.TestCase):
    def test_ulpin_generation_and_validation(self):
        data = ulpin_service.generate_3d_ulpin(
            state_code="TG",
            district_code="HYD",
            lat=17.4235,
            lon=78.4483,
            elevation_base_m=536.0,
            levels_count=7,
            parcel_ref="HYD/BH/123/4",
            sequence=1,
        )
        ulpin = data["ulpin"]
        self.assertTrue(ulpin.startswith("IN-3D-HYD"))
        self.assertTrue(ulpin_service.validate_ulpin_format(ulpin))


class TestGeometryReconstruction(unittest.TestCase):
    def test_reconstruction(self):
        candidate = {
            "candidate_index": 1,
            "area_m2": 252.0,
            "volume_m3": 4838.4,
            "floor_range_min": -1,
            "floor_range_max": 5,
        }
        mesh = GeometryReconstructor.reconstruct_from_candidate(candidate)
        self.assertEqual(mesh["status"], "RECONSTRUCTED")
        self.assertEqual(mesh["geometry_type"], "MultiPolygonZ")
        self.assertEqual(mesh["volumetric_metrics"]["floor_levels"], 7)
        self.assertTrue(mesh["topology_verification"]["is_closed_manifold"])


if __name__ == "__main__":
    print("=" * 60)
    print("  TRINETRA Automated Test Runner")
    print("=" * 60)
    unittest.main(verbosity=2)
