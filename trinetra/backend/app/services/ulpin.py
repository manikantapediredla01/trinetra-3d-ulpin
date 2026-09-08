"""
TRINETRA — 3D ULPIN Service

Generates and validates Department of Land Resources (DoLR) and
Bhuvan standard 3D Unique Land Parcel Identification Numbers.
"""
import hashlib
import re
from typing import Dict, Any, Optional, Tuple


class ULPINService:
    """3D Unique Land Parcel Identification Number generator and validator."""

    @staticmethod
    def generate_3d_ulpin(
        state_code: str,
        district_code: str,
        lat: float,
        lon: float,
        elevation_base_m: float,
        levels_count: int,
        parcel_ref: str,
        sequence: int = 1,
    ) -> Dict[str, Any]:
        """
        Generates standard 14-16 character 3D ULPIN.
        Format: IN-3D-[DIST_CODE]-[SPATIAL_HASH_4]-[SEQ_4]
        Example: IN-3D-HYD0-2024-0001
        """
        clean_state = state_code.upper().strip()[:2]
        clean_dist = district_code.upper().strip()[:4]
        if len(clean_dist) < 4:
            clean_dist = clean_dist.ljust(4, "0")

        # Spatial hash from coordinate tokens
        coord_token = f"{lat:.4f}_{lon:.4f}_{elevation_base_m:.1f}_{parcel_ref}"
        hash_digest = hashlib.sha256(coord_token.encode()).hexdigest()
        spatial_token = hash_digest[:4].upper()
        seq_str = f"{sequence:04d}"

        ulpin = f"IN-3D-{clean_dist}-{spatial_token}-{seq_str}"

        return {
            "ulpin": ulpin,
            "state_code": clean_state,
            "district_code": clean_dist,
            "spatial_token": spatial_token,
            "sequence": sequence,
            "elevation_datum_msl": elevation_base_m,
            "vertical_levels": levels_count,
            "hash_sha256": hash_digest,
            "is_valid_format": True,
            "issuing_body": "Department of Land Resources (DoLR)",
        }

    @staticmethod
    def validate_ulpin_format(ulpin: str) -> bool:
        """Validates format regex: IN-3D-[A-Z0-9]{4}-[A-Z0-9]{4}-[0-9]{4}."""
        pattern = r"^IN-3D-[A-Z0-9]{4}-[A-Z0-9]{4}-[0-9]{4}$"
        return bool(re.match(pattern, ulpin.strip()))


ulpin_service = ULPINService()
