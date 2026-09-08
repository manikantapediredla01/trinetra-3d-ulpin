"""Tests for Demo Data Generator and Geometry Reconstructor."""
from app.demo.generator import generate_demo_property
from app.quantum.geometry_reconstruction import GeometryReconstructor


def test_demo_property_generator_attributes():
    data = generate_demo_property()

    assert "property" in data
    assert "parcel" in data
    assert "floor_units" in data
    assert "candidate_configurations" in data
    assert "validation_result" in data
    assert "encroachment_cases" in data
    assert "utilities" in data

    prop = data["property"]
    assert prop["is_synthetic"] is True
    assert prop["data_origin"] == "SYNTHETIC_DEMO"
    assert prop["floor_count"] in (6, 7)
    assert prop["has_basement"] is True
    assert len(data["floor_units"]) >= 7


def test_geometry_reconstructor():
    bitstring = "0100000"
    idx = GeometryReconstructor.decode_bitstring_to_index(bitstring)
    assert idx == 1

    candidate = {
        "candidate_index": 1,
        "area_m2": 252.0,
        "volume_m3": 4838.4,
        "floor_range_min": -1,
        "floor_range_max": 5,
    }

    mesh = GeometryReconstructor.reconstruct_from_candidate(candidate)
    assert mesh["status"] == "RECONSTRUCTED"
    assert mesh["geometry_type"] == "MultiPolygonZ"
    assert mesh["volumetric_metrics"]["floor_levels"] == 7
    assert mesh["topology_verification"]["is_closed_manifold"] is True
