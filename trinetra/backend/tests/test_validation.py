"""Tests for 8-check statutory validation engine."""
from app.validation.validator import validate_property


def test_validation_engine_runs(demo_property_data):
    prop = demo_property_data["property"]
    units = demo_property_data["floor_units"]
    parcel = demo_property_data["parcel"]

    result = validate_property(
        property_id=prop["property_ref"],
        geometry_geojson=prop.get("geometry_3d"),
        floor_units=units,
        parcel_geojson=parcel.get("geometry"),
        building_height=prop.get("building_height_m", 19.2),
        ground_elevation=prop.get("ground_elevation_m", 536.0),
        city="Hyderabad",
    )

    assert result.property_id == "PROP-HYD-2024-001"
    assert len(result.checks) == 8
    assert result.overall_result in ["VALIDATED", "NEEDS_REVIEW", "REJECTED"]
    assert result.geometry_status in ["PASS", "FAIL", "WARNING"]
    assert result.floor_status in ["PASS", "FAIL", "WARNING"]
    assert result.coordinate_status in ["PASS", "FAIL", "WARNING"]
