"""
TRINETRA — Volumetric 3D Change Detection Service
Calculates volumetric and topological deviations between survey epochs.
"""
from typing import Dict, Any, List


class ChangeDetectionService:
    """Computes differences between multitemporal 3D property surveys."""

    @staticmethod
    def compare_epochs(
        epoch_t1_survey: Dict[str, Any],
        epoch_t2_survey: Dict[str, Any],
    ) -> Dict[str, Any]:
        h1 = epoch_t1_survey.get("height_m", 16.0)
        h2 = epoch_t2_survey.get("height_m", 19.2)
        v1 = epoch_t1_survey.get("volume_m3", 4032.0)
        v2 = epoch_t2_survey.get("volume_m3", 4838.4)
        floors1 = epoch_t1_survey.get("floors_count", 5)
        floors2 = epoch_t2_survey.get("floors_count", 6)

        delta_h = round(h2 - h1, 2)
        delta_v = round(v2 - v1, 2)
        delta_floors = floors2 - floors1

        has_expansion = delta_floors > 0 or delta_h > 0.5

        return {
            "comparison_id": "CMP-T1-T2-001",
            "epochs": {
                "t1": epoch_t1_survey.get("date", "2022-03-15"),
                "t2": epoch_t2_survey.get("date", "2026-06-01"),
            },
            "height_delta_m": delta_h,
            "volume_delta_m3": delta_v,
            "floors_delta": delta_floors,
            "expansion_detected": has_expansion,
            "severity": "CRITICAL" if delta_floors > 0 else "LOW",
            "status": "UNAUTHORIZED_EXPANSION_FLAGGED" if delta_floors > 0 else "CONSISTENT",
            "summary": (
                f"Volumetric addition of {delta_v} m³ (+{delta_h}m height, +{delta_floors} floor) "
                "detected between Epoch T1 and T2 surveys."
            ),
        }


change_service = ChangeDetectionService()
