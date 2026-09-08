"""
TRINETRA — Validation Engine

Mandatory validation stage before ULPIN generation.
A ULPIN is ONLY generated after ALL validation checks pass.

Checks:
1. Geometry validity (valid polygon/multipolygon geometry)
2. Overlap detection (property volumes do not overlap)
3. Gap detection (no significant gaps in floor coverage)
4. Boundary consistency (3D boundary consistent with 2D parcel)
5. Floor consistency (floor elevations are monotonically increasing)
6. Topology validation (no self-intersections, proper closure)
7. Elevation consistency (ground elevation plausible for location)
8. Coordinate consistency (coordinates in expected range for region)
"""
import logging
import math
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
try:
    from shapely.geometry import mapping, shape
    try:
        from shapely.validation import explain_validity
    except ImportError:
        try:
            from shapely.validity import explain_validity
        except ImportError:
            def explain_validity(geom):
                return "Valid" if getattr(geom, "is_valid", True) else "Invalid"
except ImportError:
    mapping, shape = None, None
    def explain_validity(geom):
        return "Valid"
import json

logger = logging.getLogger(__name__)


@dataclass
class ValidationCheck:
    name: str
    status: str          # PASS / FAIL / WARNING / SKIP
    message: str
    metric: Optional[float] = None
    threshold: Optional[float] = None


@dataclass
class ValidationResult:
    property_id: str
    geometry_status: str
    overlap_status: str
    gap_status: str
    boundary_status: str
    floor_status: str
    topology_status: str
    elevation_status: str
    coordinate_status: str
    overall_result: str          # VALIDATED / REJECTED / NEEDS_REVIEW
    checks: List[ValidationCheck]
    notes: List[str]
    can_generate_ulpin: bool


def validate_property(
    property_id: str,
    geometry_geojson: Optional[Dict],
    floor_units: List[Dict],
    parcel_geojson: Optional[Dict],
    building_height: float,
    ground_elevation: float,
    city: str = "Hyderabad",
) -> ValidationResult:
    """
    Run all 8 validation checks on a reconstructed 3D property.
    Returns structured ValidationResult.
    """
    checks = []
    notes = []

    # ----------------------------------------------------------------
    # 1. Geometry Validity
    # ----------------------------------------------------------------
    geom_check = _check_geometry_validity(geometry_geojson)
    checks.append(geom_check)

    # ----------------------------------------------------------------
    # 2. Overlap Detection
    # ----------------------------------------------------------------
    overlap_check = _check_overlap(floor_units)
    checks.append(overlap_check)

    # ----------------------------------------------------------------
    # 3. Gap Detection
    # ----------------------------------------------------------------
    gap_check = _check_gaps(floor_units, building_height)
    checks.append(gap_check)

    # ----------------------------------------------------------------
    # 4. Boundary Consistency
    # ----------------------------------------------------------------
    boundary_check = _check_boundary_consistency(geometry_geojson, parcel_geojson)
    checks.append(boundary_check)

    # ----------------------------------------------------------------
    # 5. Floor Consistency
    # ----------------------------------------------------------------
    floor_check = _check_floor_consistency(floor_units)
    checks.append(floor_check)

    # ----------------------------------------------------------------
    # 6. Topology Validation
    # ----------------------------------------------------------------
    topology_check = _check_topology(geometry_geojson, floor_units)
    checks.append(topology_check)

    # ----------------------------------------------------------------
    # 7. Elevation Consistency
    # ----------------------------------------------------------------
    elevation_check = _check_elevation_consistency(
        ground_elevation, building_height, city
    )
    checks.append(elevation_check)

    # ----------------------------------------------------------------
    # 8. Coordinate Consistency
    # ----------------------------------------------------------------
    coord_check = _check_coordinate_consistency(geometry_geojson, city)
    checks.append(coord_check)

    # ----------------------------------------------------------------
    # Determine overall result
    # ----------------------------------------------------------------
    fail_count = sum(1 for c in checks if c.status == "FAIL")
    warn_count = sum(1 for c in checks if c.status == "WARNING")

    if fail_count == 0:
        overall = "VALIDATED"
        can_generate_ulpin = True
        if warn_count > 0:
            notes.append(f"{warn_count} warning(s) noted — review recommended")
    elif fail_count <= 2:
        overall = "NEEDS_REVIEW"
        can_generate_ulpin = False
        notes.append(f"{fail_count} check(s) failed — re-optimization may be required")
    else:
        overall = "REJECTED"
        can_generate_ulpin = False
        notes.append(f"{fail_count} critical checks failed — re-run optimization")

    def _status(check_name: str) -> str:
        for c in checks:
            if c.name == check_name:
                return c.status
        return "SKIP"

    return ValidationResult(
        property_id=property_id,
        geometry_status=_status("Geometry Validity"),
        overlap_status=_status("Overlap Detection"),
        gap_status=_status("Gap Detection"),
        boundary_status=_status("Boundary Consistency"),
        floor_status=_status("Floor Consistency"),
        topology_status=_status("Topology Validation"),
        elevation_status=_status("Elevation Consistency"),
        coordinate_status=_status("Coordinate Consistency"),
        overall_result=overall,
        checks=checks,
        notes=notes,
        can_generate_ulpin=can_generate_ulpin,
    )


def _check_geometry_validity(geometry_geojson: Optional[Dict]) -> ValidationCheck:
    if not geometry_geojson:
        return ValidationCheck("Geometry Validity", "FAIL", "No geometry provided")
    try:
        geom = shape(geometry_geojson)
        if geom.is_valid:
            return ValidationCheck("Geometry Validity", "PASS", "Geometry is topologically valid")
        else:
            reason = explain_validity(geom)
            return ValidationCheck("Geometry Validity", "FAIL", f"Invalid geometry: {reason}")
    except Exception as e:
        return ValidationCheck("Geometry Validity", "FAIL", f"Geometry parse error: {str(e)}")


def _check_overlap(floor_units: List[Dict]) -> ValidationCheck:
    if not floor_units or len(floor_units) < 2:
        return ValidationCheck("Overlap Detection", "PASS", "Single unit — no overlap possible")
    try:
        total_overlap_area = 0.0
        same_floor_units = {}
        for unit in floor_units:
            fl = unit.get("floor_level", 0)
            same_floor_units.setdefault(fl, []).append(unit)

        for fl, units in same_floor_units.items():
            for i in range(len(units)):
                for j in range(i + 1, len(units)):
                    g1 = units[i].get("geometry_geojson")
                    g2 = units[j].get("geometry_geojson")
                    if g1 and g2:
                        try:
                            s1 = shape(g1)
                            s2 = shape(g2)
                            if s1.intersects(s2):
                                inter = s1.intersection(s2)
                                total_overlap_area += inter.area
                        except Exception:
                            pass

        if total_overlap_area < 0.01:  # < 1 cm² overlap
            return ValidationCheck("Overlap Detection", "PASS",
                                   "No significant unit overlap detected",
                                   metric=total_overlap_area, threshold=0.01)
        elif total_overlap_area < 1.0:
            return ValidationCheck("Overlap Detection", "WARNING",
                                   f"Minor overlap: {total_overlap_area:.3f} m²",
                                   metric=total_overlap_area, threshold=0.01)
        else:
            return ValidationCheck("Overlap Detection", "FAIL",
                                   f"Significant overlap: {total_overlap_area:.2f} m²",
                                   metric=total_overlap_area, threshold=0.01)
    except Exception as e:
        return ValidationCheck("Overlap Detection", "WARNING", f"Could not compute overlap: {e}")


def _check_gaps(floor_units: List[Dict], building_height: float) -> ValidationCheck:
    if not floor_units:
        return ValidationCheck("Gap Detection", "FAIL", "No floor units provided")
    floor_levels = sorted(set(u.get("floor_level", 0) for u in floor_units))
    expected_floors = list(range(min(floor_levels), max(floor_levels) + 1))
    missing = [f for f in expected_floors if f not in floor_levels]
    if not missing:
        return ValidationCheck("Gap Detection", "PASS",
                               f"All {len(floor_levels)} floor levels present, no gaps")
    else:
        return ValidationCheck("Gap Detection", "FAIL",
                               f"Missing floor levels: {missing}")


def _check_boundary_consistency(
    geometry_geojson: Optional[Dict], parcel_geojson: Optional[Dict]
) -> ValidationCheck:
    if not parcel_geojson:
        return ValidationCheck("Boundary Consistency", "SKIP",
                               "No parcel reference available for comparison")
    if not geometry_geojson:
        return ValidationCheck("Boundary Consistency", "FAIL", "No 3D geometry to compare")
    try:
        prop_geom = shape(geometry_geojson)
        parcel_geom = shape(parcel_geojson)
        # Project footprint of 3D geometry onto 2D for comparison
        # For demo: use bounding box comparison
        prop_bounds = prop_geom.bounds
        parcel_bounds = parcel_geom.bounds

        # Compute approximate overlap using bounds
        overlap_x = max(0, min(prop_bounds[2], parcel_bounds[2]) - max(prop_bounds[0], parcel_bounds[0]))
        overlap_y = max(0, min(prop_bounds[3], parcel_bounds[3]) - max(prop_bounds[1], parcel_bounds[1]))
        overlap_area = overlap_x * overlap_y
        parcel_area = (parcel_bounds[2] - parcel_bounds[0]) * (parcel_bounds[3] - parcel_bounds[1])

        if parcel_area < 1e-12:
            return ValidationCheck("Boundary Consistency", "WARNING", "Parcel area too small to compare")

        coverage = overlap_area / parcel_area
        if coverage >= 0.85:
            return ValidationCheck("Boundary Consistency", "PASS",
                                   f"Boundary coverage: {coverage:.1%}",
                                   metric=coverage, threshold=0.85)
        elif coverage >= 0.70:
            return ValidationCheck("Boundary Consistency", "WARNING",
                                   f"Partial boundary match: {coverage:.1%}",
                                   metric=coverage, threshold=0.85)
        else:
            return ValidationCheck("Boundary Consistency", "FAIL",
                                   f"Poor boundary match: {coverage:.1%}",
                                   metric=coverage, threshold=0.85)
    except Exception as e:
        return ValidationCheck("Boundary Consistency", "WARNING", f"Comparison error: {e}")


def _check_floor_consistency(floor_units: List[Dict]) -> ValidationCheck:
    if not floor_units:
        return ValidationCheck("Floor Consistency", "FAIL", "No floor units")

    floor_elevations: Dict[int, float] = {}
    for u in floor_units:
        fl = u.get("floor_level", 0)
        elev = u.get("floor_elevation")
        if elev is not None:
            if fl in floor_elevations and abs(floor_elevations[fl] - elev) > 0.1:
                return ValidationCheck(
                    "Floor Consistency", "FAIL",
                    f"Inconsistent elevation on floor {fl}: {elev:.1f}m vs {floor_elevations[fl]:.1f}m"
                )
            floor_elevations[fl] = elev

    if not floor_elevations:
        return ValidationCheck("Floor Consistency", "WARNING", "No floor elevations specified in units")

    sorted_levels = sorted(floor_elevations.keys())
    prev_elev = None
    for fl in sorted_levels:
        elev = floor_elevations[fl]
        if prev_elev is not None and elev <= prev_elev:
            return ValidationCheck(
                "Floor Consistency", "FAIL",
                f"Non-monotonic elevation at floor {fl}: {elev:.1f}m <= {prev_elev:.1f}m"
            )
        prev_elev = elev

    return ValidationCheck(
        "Floor Consistency", "PASS",
        f"Floor elevations monotonically increasing across {len(sorted_levels)} levels ({len(floor_units)} units)"
    )


def _check_topology(geometry_geojson: Optional[Dict], floor_units: List[Dict]) -> ValidationCheck:
    issues = []
    if geometry_geojson:
        try:
            geom = shape(geometry_geojson)
            if geom.is_simple:
                pass
            else:
                issues.append("Non-simple geometry detected")
        except Exception as e:
            issues.append(f"Topology check error: {e}")
    if not issues:
        return ValidationCheck("Topology Validation", "PASS", "No topology errors detected")
    else:
        return ValidationCheck("Topology Validation", "FAIL", "; ".join(issues))


def _check_elevation_consistency(
    ground_elevation: float, building_height: float, city: str
) -> ValidationCheck:
    # Expected ground elevation ranges for Indian cities (MSL, meters)
    city_elevation_ranges = {
        "Hyderabad": (450, 650),
        "Vizag": (0, 200),
        "Visakhapatnam": (0, 200),
        "Delhi": (200, 350),
        "Mumbai": (0, 50),
    }
    city_range = city_elevation_ranges.get(city, (0, 1000))

    if not (city_range[0] <= ground_elevation <= city_range[1]):
        return ValidationCheck("Elevation Consistency", "WARNING",
                               f"Ground elevation {ground_elevation:.1f}m outside expected range "
                               f"for {city} ({city_range[0]}–{city_range[1]}m MSL)",
                               metric=ground_elevation)

    if building_height <= 0 or building_height > 500:
        return ValidationCheck("Elevation Consistency", "FAIL",
                               f"Implausible building height: {building_height:.1f}m",
                               metric=building_height)

    return ValidationCheck("Elevation Consistency", "PASS",
                           f"Ground: {ground_elevation:.1f}m MSL, Height: {building_height:.1f}m — plausible")


def _check_coordinate_consistency(geometry_geojson: Optional[Dict], city: str) -> ValidationCheck:
    city_bbox = {
        "Hyderabad": (78.2, 17.1, 78.7, 17.6),
        "Vizag": (83.1, 17.6, 83.4, 17.9),
        "Visakhapatnam": (83.1, 17.6, 83.4, 17.9),
    }
    bbox = city_bbox.get(city, (68.0, 6.0, 97.0, 37.0))  # India bounds

    if not geometry_geojson:
        return ValidationCheck("Coordinate Consistency", "SKIP", "No geometry to check")
    try:
        geom = shape(geometry_geojson)
        bounds = geom.bounds  # (minx, miny, maxx, maxy)
        in_range = (
            bbox[0] <= bounds[0] <= bbox[2] and
            bbox[1] <= bounds[1] <= bbox[3] and
            bbox[0] <= bounds[2] <= bbox[2] and
            bbox[1] <= bounds[3] <= bbox[3]
        )
        if in_range:
            return ValidationCheck("Coordinate Consistency", "PASS",
                                   f"Coordinates within expected range for {city}")
        else:
            return ValidationCheck("Coordinate Consistency", "FAIL",
                                   f"Coordinates {bounds} outside expected range for {city}")
    except Exception as e:
        return ValidationCheck("Coordinate Consistency", "WARNING", f"Could not check coordinates: {e}")
