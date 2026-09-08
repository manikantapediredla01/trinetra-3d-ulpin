"""TRINETRA — GIS API router."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from app.demo.generator import generate_demo_property

router = APIRouter(prefix="/gis")


class GISQueryRequest(BaseModel):
    intent: str


@router.get("/layers")
async def get_layers():
    """Return available 2D and 3D GIS geospatial layers."""
    return {
        "layers": [
            {
                "id": "cadastral_parcels",
                "name": "Cadastral Parcels (Revenue Survey)",
                "category": "Cadastral",
                "type": "GeoJSON",
                "origin": "REAL_DATA (TGRAC/HMDA 5%)",
                "crs": "EPSG:4326",
                "opacity": 0.8,
                "visible": True,
            },
            {
                "id": "property_volumes_3d",
                "name": "3D Property Volumes (LoD-2)",
                "category": "3D Property",
                "type": "3D_Mesh",
                "origin": "SYNTHETIC_DEMO (95%)",
                "crs": "EPSG:4326",
                "opacity": 0.85,
                "visible": True,
            },
            {
                "id": "dem_elevation",
                "name": "Copernicus GLO-30 DEM",
                "category": "Elevation",
                "type": "Raster",
                "origin": "REAL_DATA (Copernicus DEM 5%)",
                "crs": "EPSG:4326",
                "opacity": 0.6,
                "visible": False,
            },
            {
                "id": "iith_lidar_clip",
                "name": "Ground LiDAR Point Cloud",
                "category": "Point Cloud",
                "type": "LAS/LAZ",
                "origin": "REAL_DATA (IITH Campus 5%)",
                "crs": "EPSG:4326",
                "opacity": 1.0,
                "visible": False,
            },
            {
                "id": "underground_utilities",
                "name": "Underground Utilities (Water / Power / Sewer)",
                "category": "Utilities",
                "type": "3D_Linestring",
                "origin": "REAL_DATA (GHMC / TSSPDCL 5%)",
                "crs": "EPSG:4326",
                "opacity": 0.9,
                "visible": True,
            },
            {
                "id": "encroachment_zones",
                "name": "Potential Encroachment Overlays",
                "category": "Compliance",
                "type": "3D_Highlight",
                "origin": "DERIVED_AI",
                "crs": "EPSG:4326",
                "opacity": 0.75,
                "visible": True,
            },
        ]
    }


@router.post("/query")
async def run_gis_query(req: GISQueryRequest):
    """Natural language spatial query router."""
    q = req.intent.lower()
    demo = generate_demo_property()
    prop = demo["property"]

    if "encroach" in q:
        return {
            "answer": "Potential encroachment of 2.3m detected along the Western boundary into adjacent parcel HYD/BH/123/5.",
            "feature_id": "ENC-HYD-2024-001",
            "fly_to": {"lat": 17.4235, "lon": 78.4483, "altitude": 80},
        }
    elif "floor" in q or "unit" in q:
        return {
            "answer": "Srinivas Commercial Complex has 7 levels (Basement + Ground + 5 Upper Floors) with 12 distinct commercial/office units.",
            "feature_id": "PROP-HYD-2024-001",
            "fly_to": {"lat": 17.4235, "lon": 78.4483, "altitude": 60},
        }
    elif "ulpin" in q:
        return {
            "answer": "Property ULPIN is IN-3D-HYD0-2024-0001, verified against Hyderabad revenue cadastral survey records.",
            "feature_id": "PROP-HYD-2024-001",
            "fly_to": {"lat": 17.4235, "lon": 78.4483, "altitude": 100},
        }
    return {
        "answer": f"Located property '{prop.get('metadata', {}).get('building_name', 'Srinivas Commercial Complex')}' in Banjara Hills, Hyderabad.",
        "feature_id": "PROP-HYD-2024-001",
        "fly_to": {"lat": 17.4235, "lon": 78.4483, "altitude": 120},
    }


@router.get("/property3d/{property_id}")
async def get_property_3d(property_id: str):
    """Retrieve complete 3D geometry tree for CesiumJS/Three.js rendering."""
    demo = generate_demo_property()
    return {
        "property_id": property_id,
        "name": demo["property"].get("metadata", {}).get("building_name", "Srinivas Commercial Complex"),
        "parcel": demo["parcel"],
        "building_footprint": demo["property"].get("geometry_3d"),
        "floor_units": demo["floor_units"],
        "encroachment_case": demo["encroachment_cases"][0] if demo.get("encroachment_cases") else None,
        "utilities": demo["utilities"],
        "anchor_coordinates": {"lat": 17.4235, "lon": 78.4483, "ground_elevation": 536.0},
    }
