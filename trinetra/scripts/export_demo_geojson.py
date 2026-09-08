"""
TRINETRA — Demo GeoJSON Exporter Script

Exports the benchmark property geometries, cadastral boundary,
encroachment overlay, and subsurface utilities to GeoJSON files in data/demo/.
"""
import json
import os
import sys

# Ensure backend app in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))
from app.demo.generator import generate_demo_property


def export_all():
    demo_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "demo"))
    os.makedirs(demo_dir, exist_ok=True)

    data = generate_demo_property()
    prop = data["property"]
    parcel = data["parcel"]
    units = data["floor_units"]
    encroachment = data.get("encroachment")
    utilities = data.get("utilities", [])

    # 1. Export Property Footprint & Floors
    property_geojson = {
        "type": "FeatureCollection",
        "name": "TRINETRA_3D_Property_Srinivas_Complex",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "property_ref": prop["property_ref"],
                    "ulpin": prop.get("ulpin", "IN-3D-HYD0-2024-0001"),
                    "name": prop.get("building_name", "Srinivas Commercial Complex"),
                    "levels_count": prop.get("floor_count", 7),
                    "height_m": prop.get("building_height_m", 22.4),
                    "ground_elevation_msl": prop.get("ground_elevation_m", 536.0),
                    "is_synthetic": True,
                    "data_origin": "SYNTHETIC_DEMO",
                },
                "geometry": prop.get("geometry"),
            }
        ]
    }

    # Add floor units as features
    for u in units:
        property_geojson["features"].append({
            "type": "Feature",
            "properties": {
                "unit_number": u.get("unit_number"),
                "floor_level": u.get("floor_level"),
                "usage_type": u.get("usage_type"),
                "area_m2": u.get("area_m2"),
                "floor_elevation_msl": u.get("floor_elevation"),
                "ceiling_height_m": u.get("ceiling_height"),
            },
            "geometry": u.get("geometry_geojson"),
        })

    with open(os.path.join(demo_dir, "srinivas_commercial_complex.geojson"), "w") as f:
        json.dump(property_geojson, f, indent=2)

    # 2. Export Cadastral Parcel
    parcel_geojson = {
        "type": "FeatureCollection",
        "name": "Cadastral_Parcel_HYD_BH_123_4",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "parcel_reference": parcel.get("reference", "HYD/BH/123/4"),
                    "area_m2": parcel.get("area_m2", 224.0),
                    "district": parcel.get("district", "Hyderabad"),
                    "city": parcel.get("city", "Hyderabad"),
                    "source": parcel.get("source", "HMDA"),
                    "is_synthetic": False,
                    "data_origin": "REAL_INPUT",
                },
                "geometry": parcel.get("geometry"),
            }
        ]
    }

    with open(os.path.join(demo_dir, "cadastral_parcel_hyd_bh_123_4.geojson"), "w") as f:
        json.dump(parcel_geojson, f, indent=2)

    # 3. Export Encroachment
    encroach_features = []
    if encroachment:
        encroach_features.append({
            "type": "Feature",
            "properties": {
                "case_id": encroachment.get("id", "ENC-HYD-001"),
                "property_ref": prop["property_ref"],
                "overhang_m": encroachment.get("overhang_depth_m", 2.3),
                "affected_area_m2": encroachment.get("encroachment_area_m2", 32.2),
                "severity": encroachment.get("severity", "HIGH"),
                "legal_flag": "POTENTIAL ENCROACHMENT",
            },
            "geometry": encroachment.get("geometry"),
        })

    encroach_geojson = {
        "type": "FeatureCollection",
        "name": "Potential_Encroachment_Overlays",
        "features": encroach_features,
    }

    with open(os.path.join(demo_dir, "encroachment_west_boundary.geojson"), "w") as f:
        json.dump(encroach_geojson, f, indent=2)

    # 4. Export Utilities
    utilities_geojson = {
        "type": "FeatureCollection",
        "name": "Underground_Utilities_Hyderabad",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "utility_type": u.get("type"),
                    "depth_m": u.get("depth_m"),
                    "diameter_mm": u.get("diameter_mm"),
                    "material": u.get("material"),
                    "source": u.get("source"),
                },
                "geometry": u.get("geometry"),
            }
            for u in utilities
        ]
    }

    with open(os.path.join(demo_dir, "utilities_subsurface.geojson"), "w") as f:
        json.dump(utilities_geojson, f, indent=2)

    # 5. Export Summary JSON
    summary = {
        "property_id": prop["property_ref"],
        "ulpin": "IN-3D-HYD0-2024-0001",
        "name": prop.get("building_name", "Srinivas Commercial Complex"),
        "location": "Banjara Hills, Hyderabad, Telangana",
        "coordinates": {"lat": 17.4235, "lon": 78.4483, "elevation_msl": 536.0},
        "structure": {
            "levels_total": prop.get("floor_count", 7),
            "has_basement": prop.get("has_basement", True),
            "footprint_m2": prop.get("horizontal_extent", 252.0),
            "height_m": prop.get("building_height_m", 22.4),
        },
        "flags": {
            "encroachment": "2.3m overhang on West boundary into adjacent parcel",
            "discrepancy": "6th floor constructed without TG-bPASS sanction amendment",
        },
        "data_composition": {
            "real_data_pct": 5.0,
            "synthetic_data_pct": 95.0,
            "real_sources": ["HMDA Cadastral (207MB)", "Copernicus GLO-30 DEM", "IITH LiDAR clip"],
        }
    }

    with open(os.path.join(demo_dir, "demo_summary.json"), "w") as f:
        json.dump(summary, f, indent=2)

    print(f"[SUCCESS] Exported all demo GeoJSON datasets to: {demo_dir}")


if __name__ == "__main__":
    export_all()
