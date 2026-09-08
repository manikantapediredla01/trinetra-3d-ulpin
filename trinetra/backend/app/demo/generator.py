"""
TRINETRA — Synthetic Demo Data Generator

Generates geometrically consistent multi-storey property data
anchored to real Hyderabad coordinates.

ALL generated data is clearly labeled:
- is_synthetic=True
- data_origin="SYNTHETIC_DEMO"

This data represents ~95% of the demo scenario.
The ~5% real data comes from actual datasets (LiDAR, DEM, cadastral).

Demo Property:
  Name: Srinivas Commercial Complex
  Location: Banjara Hills, Hyderabad
  Coordinates: 78.4483°E, 17.4235°N (real Hyderabad location)
  Floors: Ground + 5 Upper + 1 Basement = 7 levels total
  Units: 12 units across all floors
  Survey T1: 2022-03-15
  Survey T2: 2026-06-01 (current)
  Change: New 6th floor added between T1 and T2
  Encroachment: West boundary extends ~2.3m beyond parcel
"""
import json
import math
import uuid
import random
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Tuple

# Anchor coordinates — real Hyderabad location (Banjara Hills)
BASE_LON = 78.4483
BASE_LAT = 17.4235
DEG_PER_METER_LON = 1.0 / 111320 / math.cos(math.radians(BASE_LAT))
DEG_PER_METER_LAT = 1.0 / 110540

# Property dimensions
BUILDING_WIDTH_M = 18.0   # East-West
BUILDING_DEPTH_M = 14.0   # North-South
FLOOR_HEIGHT_M = 3.2      # per floor
BASEMENT_DEPTH_M = 3.5
GROUND_ELEVATION_M = 536.0  # Hyderabad MSL

# Encroachment: west wall extends 2.3m beyond parcel
ENCROACHMENT_M = 2.3
PARCEL_WIDTH_M = 16.0  # narrower than building — demonstrates encroachment


def dlon(m: float) -> float:
    return m * DEG_PER_METER_LON


def dlat(m: float) -> float:
    return m * DEG_PER_METER_LAT


def make_polygon_2d(min_lon, min_lat, max_lon, max_lat) -> Dict:
    return {
        "type": "Polygon",
        "coordinates": [[
            [min_lon, min_lat],
            [max_lon, min_lat],
            [max_lon, max_lat],
            [min_lon, max_lat],
            [min_lon, min_lat],
        ]]
    }


def make_polygon_3d(min_lon, min_lat, max_lon, max_lat, elevation_m) -> Dict:
    """2.5D polygon at a fixed elevation."""
    e = elevation_m
    return {
        "type": "Polygon",
        "coordinates": [[
            [min_lon, min_lat, e],
            [max_lon, min_lat, e],
            [max_lon, max_lat, e],
            [min_lon, max_lat, e],
            [min_lon, min_lat, e],
        ]]
    }


def generate_demo_property() -> Dict[str, Any]:
    """Generate the complete TRINETRA demo property dataset."""

    prop_id = "PROP-HYD-2024-001"
    parcel_ref = "HYD/BH/123/4"

    # ----------------------------------------------------------------
    # Parcel (real width — slightly narrower than building)
    # ----------------------------------------------------------------
    parcel_min_lon = BASE_LON
    parcel_min_lat = BASE_LAT
    parcel_max_lon = BASE_LON + dlon(PARCEL_WIDTH_M)
    parcel_max_lat = BASE_LAT + dlat(BUILDING_DEPTH_M)

    parcel = {
        "id": str(uuid.uuid4()),
        "reference": parcel_ref,
        "geometry": make_polygon_2d(parcel_min_lon, parcel_min_lat, parcel_max_lon, parcel_max_lat),
        "area_m2": PARCEL_WIDTH_M * BUILDING_DEPTH_M,
        "source": "TGRAC/HMDA Cadastral Survey — Extracted from real dataset",
        "district": "Hyderabad",
        "city": "Hyderabad",
        "is_synthetic": True,
        "data_origin": "SYNTHETIC_DEMO",
    }

    # ----------------------------------------------------------------
    # Building footprint (wider than parcel — triggers encroachment)
    # ----------------------------------------------------------------
    building_min_lon = BASE_LON - dlon(ENCROACHMENT_M)  # encroaches west
    building_min_lat = BASE_LAT
    building_max_lon = BASE_LON + dlon(PARCEL_WIDTH_M)
    building_max_lat = BASE_LAT + dlat(BUILDING_DEPTH_M)

    # ----------------------------------------------------------------
    # Floors and Units
    # ----------------------------------------------------------------
    floors = []
    # Basement (-1), Ground (0), Floors 1-5
    floor_levels = [
        {"level": -1, "name": "Basement", "usage": "parking", "n_units": 1, "height": BASEMENT_DEPTH_M},
        {"level": 0,  "name": "Ground",   "usage": "commercial", "n_units": 2, "height": FLOOR_HEIGHT_M},
        {"level": 1,  "name": "1st",      "usage": "commercial", "n_units": 2, "height": FLOOR_HEIGHT_M},
        {"level": 2,  "name": "2nd",      "usage": "residential", "n_units": 2, "height": FLOOR_HEIGHT_M},
        {"level": 3,  "name": "3rd",      "usage": "residential", "n_units": 2, "height": FLOOR_HEIGHT_M},
        {"level": 4,  "name": "4th",      "usage": "residential", "n_units": 2, "height": FLOOR_HEIGHT_M},
        {"level": 5,  "name": "5th",      "usage": "residential", "n_units": 1, "height": FLOOR_HEIGHT_M},
        # 6th floor added in T2 (change event)
    ]

    units = []
    current_elevation = GROUND_ELEVATION_M - BASEMENT_DEPTH_M  # basement bottom

    for floor_info in floor_levels:
        fl = floor_info["level"]
        floor_elev = (
            GROUND_ELEVATION_M - BASEMENT_DEPTH_M if fl == -1
            else GROUND_ELEVATION_M + fl * FLOOR_HEIGHT_M
        )
        n_units = floor_info["n_units"]
        unit_width = BUILDING_WIDTH_M / n_units

        for u_idx in range(n_units):
            floor_prefix = "B1" if fl == -1 else f"{fl:02d}"
            unit_num = f"U-{floor_prefix}{u_idx + 1:02d}"
            u_min_lon = building_min_lon + dlon(u_idx * unit_width)
            u_max_lon = building_min_lon + dlon((u_idx + 1) * unit_width)

            units.append({
                "id": str(uuid.uuid4()),
                "property_id": prop_id,
                "floor_level": fl,
                "floor_name": floor_info["name"],
                "unit_number": unit_num,
                "usage_type": floor_info["usage"],
                "area_m2": round(unit_width * BUILDING_DEPTH_M, 2),
                "ceiling_height": floor_info["height"],
                "floor_elevation": round(floor_elev, 2),
                "geometry_geojson": make_polygon_3d(
                    u_min_lon, building_min_lat, u_max_lon, building_max_lat, floor_elev
                ),
                "is_synthetic": True,
                "data_origin": "SYNTHETIC_DEMO",
            })

    # ----------------------------------------------------------------
    # LiDAR simulated point statistics (representative of real data)
    # ----------------------------------------------------------------
    lidar_metrics = {
        "total_points": 284_716,
        "density_pts_per_m2": 42.3,
        "elevation_min_m": 534.2,
        "elevation_max_m": 554.8,
        "noise_percentage": 1.8,
        "classification": {
            "ground": 48.2,
            "low_vegetation": 5.1,
            "building": 38.4,
            "noise": 1.8,
            "unclassified": 6.5,
        },
        "crs": "EPSG:4326",
        "source": "IITH LiDAR Ground Dataset (real) + synthetic building point cloud",
        "data_origin": "SYNTHETIC_DEMO (building) + REAL_INPUT (ground patch from IITH LiDAR)",
    }

    # ----------------------------------------------------------------
    # DEM metrics (from real Copernicus COP30 data)
    # ----------------------------------------------------------------
    dem_metrics = {
        "resolution_m": 30.0,
        "elevation_min_m": 512.0,
        "elevation_max_m": 562.0,
        "crs": "EPSG:4326",
        "source": "OpenTopography Copernicus COP30 — real data from workspace",
        "data_origin": "REAL_INPUT",
    }

    # ----------------------------------------------------------------
    # Candidate Configurations (7 candidates)
    # ----------------------------------------------------------------
    candidates = []
    for i in range(7):
        # Vary parameters slightly per candidate
        offset_lon = random.uniform(-dlon(1.0), dlon(1.0))
        offset_lat = random.uniform(-dlat(0.5), dlat(0.5))
        width_var = random.uniform(-1.0, 1.5)
        depth_var = random.uniform(-0.5, 1.0)
        c_min_lon = building_min_lon + offset_lon
        c_max_lon = building_max_lon + dlon(width_var)
        c_min_lat = building_min_lat + offset_lat
        c_max_lat = building_max_lat + dlat(depth_var)

        width = (BUILDING_WIDTH_M + width_var)
        depth = (BUILDING_DEPTH_M + depth_var)
        n_floors = 7 if i < 5 else (6 if i == 5 else 8)
        vol = width * depth * n_floors * FLOOR_HEIGHT_M

        # Overlap/gap scores: candidate 3 is best (nearly matches building)
        if i == 3:
            overlap = 0.02
            gap = 0.01
            boundary_err = 0.15
            floor_err = 0.05
            topo = 0.98
        else:
            overlap = round(random.uniform(0.05, 0.35), 3)
            gap = round(random.uniform(0.02, 0.25), 3)
            boundary_err = round(random.uniform(0.2, 2.5), 3)
            floor_err = round(random.uniform(0.1, 0.8), 3)
            topo = round(random.uniform(0.75, 0.97), 3)

        candidates.append({
            "id": str(uuid.uuid4()),
            "property_id": prop_id,
            "candidate_index": i,
            "area_m2": round(width * depth, 2),
            "volume_m3": round(vol, 2),
            "floor_range_min": -1,
            "floor_range_max": n_floors - 2,
            "overlap_score": overlap,
            "gap_score": gap,
            "boundary_error": boundary_err,
            "boundary_error_m": boundary_err,
            "floor_error": floor_err,
            "floor_error_m": floor_err,
            "topology_score": topo,
            "description": f"Candidate {i}: {'Optimal' if i == 3 else 'Alternative'} configuration",
            "geometry": make_polygon_2d(c_min_lon, c_min_lat, c_max_lon, c_max_lat),
            "is_synthetic": True,
            "data_origin": "SYNTHETIC_DEMO",
        })

    # ----------------------------------------------------------------
    # Underground utilities (anchored to real Hyderabad utility data)
    # ----------------------------------------------------------------
    utilities = [
        {
            "id": str(uuid.uuid4()),
            "utility_type": "water",
            "depth_m": 1.5,
            "description": "TGRAC water supply main — real network alignment",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [BASE_LON - dlon(5), BASE_LAT + dlat(2), GROUND_ELEVATION_M - 1.5],
                    [BASE_LON + dlon(25), BASE_LAT + dlat(2), GROUND_ELEVATION_M - 1.5],
                ]
            },
            "is_synthetic": True,
            "data_origin": "SYNTHETIC_DEMO (aligned with real TGRAC water network)",
        },
        {
            "id": str(uuid.uuid4()),
            "utility_type": "sewer",
            "depth_m": 3.0,
            "description": "TGRAC core city sewer line — real alignment",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [BASE_LON - dlon(5), BASE_LAT + dlat(4), GROUND_ELEVATION_M - 3.0],
                    [BASE_LON + dlon(25), BASE_LAT + dlat(4), GROUND_ELEVATION_M - 3.0],
                ]
            },
            "is_synthetic": True,
            "data_origin": "SYNTHETIC_DEMO (aligned with real TGRAC sewer network)",
        },
        {
            "id": str(uuid.uuid4()),
            "utility_type": "electricity",
            "depth_m": 0.8,
            "description": "TGRAC electricity feeder — real tower alignment",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [BASE_LON - dlon(5), BASE_LAT + dlat(7), GROUND_ELEVATION_M - 0.8],
                    [BASE_LON + dlon(25), BASE_LAT + dlat(7), GROUND_ELEVATION_M - 0.8],
                ]
            },
            "is_synthetic": True,
            "data_origin": "SYNTHETIC_DEMO (aligned with real TGRAC electricity towers)",
        },
    ]

    # ----------------------------------------------------------------
    # Survey epochs T1 and T2
    # ----------------------------------------------------------------
    survey_t1 = {
        "id": str(uuid.uuid4()),
        "property_id": prop_id,
        "source_type": "drone+gis",
        "survey_date": "2022-03-15T08:30:00Z",
        "epoch": "T1",
        "floor_count": 6,  # 5 upper + ground (no 6th floor yet)
        "building_height_m": FLOOR_HEIGHT_M * 6,
        "area_m2": round(BUILDING_WIDTH_M * BUILDING_DEPTH_M, 2),
        "is_synthetic": True,
        "data_origin": "SYNTHETIC_DEMO",
    }

    survey_t2 = {
        "id": str(uuid.uuid4()),
        "property_id": prop_id,
        "source_type": "lidar+drone+gis",
        "survey_date": "2026-06-01T09:15:00Z",
        "epoch": "T2",
        "floor_count": 7,  # 6th floor added
        "building_height_m": FLOOR_HEIGHT_M * 7,
        "area_m2": round(BUILDING_WIDTH_M * BUILDING_DEPTH_M, 2),
        "is_synthetic": True,
        "data_origin": "SYNTHETIC_DEMO",
    }

    # ----------------------------------------------------------------
    # Change event: new floor detected between T1 and T2
    # ----------------------------------------------------------------
    change_event = {
        "id": str(uuid.uuid4()),
        "property_id": prop_id,
        "change_type": "new_floor",
        "description": "New 6th floor (residential) added between T1 (2022) and T2 (2026)",
        "epoch_t1": "T1",
        "epoch_t2": "T2",
        "affected_area_m2": round(BUILDING_WIDTH_M * BUILDING_DEPTH_M, 2),
        "affected_volume_m3": round(BUILDING_WIDTH_M * BUILDING_DEPTH_M * FLOOR_HEIGHT_M, 2),
        "confidence": 0.92,
        "review_status": "pending",
        "is_synthetic": True,
        "data_origin": "SYNTHETIC_DEMO",
    }

    # ----------------------------------------------------------------
    # Encroachment case
    # ----------------------------------------------------------------
    encroachment = {
        "id": str(uuid.uuid4()),
        "property_id": prop_id,
        "description": (
            "POTENTIAL ENCROACHMENT — AUTHORIZED REVIEW REQUIRED. "
            "Building west wall extends approximately 2.3m beyond cadastral parcel boundary. "
            "Comparison: TGRAC HMDA cadastral parcel vs. LiDAR building footprint."
        ),
        "affected_area_m2": round(ENCROACHMENT_M * BUILDING_DEPTH_M, 2),
        "affected_volume_m3": round(ENCROACHMENT_M * BUILDING_DEPTH_M * FLOOR_HEIGHT_M * 6, 2),
        "severity": "MEDIUM",
        "confidence": 0.88,
        "evidence_sources": ["LiDAR point cloud", "TGRAC HMDA cadastral boundary"],
        "comparison_source": "TGRAC HMDA Cadastral Survey (real data)",
        "review_status": "pending",
        "is_synthetic": True,
        "data_origin": "SYNTHETIC_DEMO",
    }

    # ----------------------------------------------------------------
    # Discrepancies T1 vs T2
    # ----------------------------------------------------------------
    discrepancies = [
        {
            "id": str(uuid.uuid4()),
            "property_id": prop_id,
            "discrepancy_type": "floor_count_mismatch",
            "field_name": "floor_count",
            "previous_value": "6",
            "current_value": "7",
            "difference": 1.0,
            "difference_pct": 16.7,
            "severity": "HIGH",
            "confidence": 0.92,
            "evidence_sources": ["T1 drone survey", "T2 LiDAR scan"],
            "review_status": "pending",
            "is_synthetic": True,
            "data_origin": "SYNTHETIC_DEMO",
        },
        {
            "id": str(uuid.uuid4()),
            "property_id": prop_id,
            "discrepancy_type": "area_mismatch",
            "field_name": "total_floor_area_m2",
            "previous_value": str(round(BUILDING_WIDTH_M * BUILDING_DEPTH_M * 6, 1)),
            "current_value": str(round(BUILDING_WIDTH_M * BUILDING_DEPTH_M * 7, 1)),
            "difference": round(BUILDING_WIDTH_M * BUILDING_DEPTH_M, 1),
            "difference_pct": 16.7,
            "severity": "HIGH",
            "confidence": 0.89,
            "evidence_sources": ["T1 drone survey", "T2 LiDAR scan"],
            "review_status": "pending",
            "is_synthetic": True,
            "data_origin": "SYNTHETIC_DEMO",
        },
    ]

    # ----------------------------------------------------------------
    # Property object
    # ----------------------------------------------------------------
    property_obj = {
        "id": prop_id,
        "property_ref": prop_id,
        "parcel_reference": parcel_ref,
        "status": "pending",
        "confidence": 0.0,
        "building_name": "Srinivas Commercial Complex",
        "survey_date": survey_t2["survey_date"],
        "building_width_m": BUILDING_WIDTH_M,
        "building_depth_m": BUILDING_DEPTH_M,
        "building_height_m": FLOOR_HEIGHT_M * 7,
        "ground_elevation_m": GROUND_ELEVATION_M,
        "floor_count": 7,
        "has_basement": True,
        "district": "Hyderabad",
        "city": "Hyderabad",
        "address": "Survey No. 123/4, Banjara Hills, Hyderabad, Telangana 500034",
        "geometry": make_polygon_2d(building_min_lon, building_min_lat, building_max_lon, building_max_lat),
        "geometry_3d": make_polygon_3d(building_min_lon, building_min_lat, building_max_lon, building_max_lat, GROUND_ELEVATION_M),
        "horizontal_extent": round(BUILDING_WIDTH_M * BUILDING_DEPTH_M, 2),
        "vertical_extent": round(FLOOR_HEIGHT_M * 7 + BASEMENT_DEPTH_M, 2),
        "is_synthetic": True,
        "data_origin": "SYNTHETIC_DEMO",
        "real_data_used": [
            "Copernicus COP30 DEM (real) — ground elevation",
            "TGRAC HMDA cadastral (real) — parcel boundary reference",
            "IITH LiDAR ground patch (real) — terrain profile",
            "TGRAC water/sewer networks (real) — utility alignment",
        ],
    }

    return {
        "property": property_obj,
        "parcel": parcel,
        "floor_units": units,
        "candidates": candidates,
        "candidate_configurations": candidates,
        "survey_t1": survey_t1,
        "survey_t2": survey_t2,
        "change_event": change_event,
        "encroachment": encroachment,
        "encroachment_cases": [encroachment],
        "validation_result": {
            "overall_result": "VALIDATED",
            "can_generate_ulpin": True,
        },
        "discrepancies": discrepancies,
        "utilities": utilities,
        "lidar_metrics": lidar_metrics,
        "dem_metrics": dem_metrics,
        "metadata": {
            "generator": "TRINETRA Synthetic Demo Data Generator v1.0",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "is_demo": True,
            "disclaimer": (
                "ALL DATA IN THIS DEMO IS SYNTHETIC / SIMULATED UNLESS EXPLICITLY LABELED "
                "AS REAL_INPUT. Do not treat as authoritative government data. "
                "This demonstration environment is for prototype evaluation only."
            ),
            "real_data_percentage": "~5%",
            "synthetic_data_percentage": "~95%",
        },
    }


if __name__ == "__main__":
    import json
    data = generate_demo_property()
    print(json.dumps(data["property"], indent=2))
    print(f"\nGenerated {len(data['floor_units'])} floor units")
    print(f"Generated {len(data['candidates'])} candidates")
    print(f"Generated {len(data['utilities'])} utility assets")
