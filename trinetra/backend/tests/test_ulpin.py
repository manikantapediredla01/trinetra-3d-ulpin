"""Tests for 3D ULPIN generation and validation."""
from app.services.ulpin import ulpin_service


def test_ulpin_format_generation():
    res = ulpin_service.generate_3d_ulpin(
        state_code="TG",
        district_code="HYD",
        lat=17.4235,
        lon=78.4483,
        elevation_base_m=536.0,
        levels_count=7,
        parcel_ref="HYD/BH/123/4",
        sequence=1,
    )

    ulpin = res["ulpin"]
    assert ulpin.startswith("IN-3D-HYD")
    assert len(ulpin) >= 14
    assert res["is_valid_format"] is True
    assert ulpin_service.validate_ulpin_format(ulpin) is True


def test_ulpin_format_validation():
    valid = "IN-3D-HYD0-2024-0001"
    assert ulpin_service.validate_ulpin_format(valid) is True

    invalid = "INVALID-ULPIN-FORMAT"
    assert ulpin_service.validate_ulpin_format(invalid) is False
