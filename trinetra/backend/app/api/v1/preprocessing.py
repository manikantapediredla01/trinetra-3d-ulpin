"""TRINETRA — Preprocessing pipeline API."""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid, time, random
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.deps import require_permission
from app.auth.rbac import Permission
from app.models import ProcessingRun, Dataset, AuditLog, User

router = APIRouter(prefix="/preprocessing")

PIPELINE_STAGES = [
    "file_validation", "crs_detection", "coordinate_normalization",
    "georeferencing", "noise_removal", "duplicate_removal",
    "point_cloud_downsampling", "metadata_extraction", "quality_analysis",
    "multi_source_registration", "data_fusion",
]


def _simulate_preprocessing(dataset_ids: list, property_id: str = None) -> list:
    """
    Run deterministic preprocessing simulation with realistic metrics.
    Labels all results as synthetic where data is not real.
    """
    stages = []
    for i, stage_name in enumerate(PIPELINE_STAGES):
        time.sleep(0.01)  # minimal delay
        status = "COMPLETED"
        metrics = {}

        if stage_name == "file_validation":
            metrics = {"files_valid": len(dataset_ids), "files_invalid": 0, "checksum": "sha256_verified"}
        elif stage_name == "crs_detection":
            metrics = {"detected_crs": "EPSG:4326", "all_consistent": True}
        elif stage_name == "coordinate_normalization":
            metrics = {"points_normalized": 284716, "offset_applied": "none"}
        elif stage_name == "georeferencing":
            metrics = {"gcps_used": 4, "rmse_m": 0.23, "method": "affine_transform"}
        elif stage_name == "noise_removal":
            metrics = {"points_before": 284716, "noise_removed": 5124,
                       "noise_pct": 1.8, "method": "statistical_outlier_removal"}
        elif stage_name == "duplicate_removal":
            metrics = {"duplicates_removed": 312, "points_after": 279280}
        elif stage_name == "point_cloud_downsampling":
            metrics = {"points_before": 279280, "points_after": 138420,
                       "voxel_size_m": 0.05, "density_preserved_pct": 96}
        elif stage_name == "metadata_extraction":
            metrics = {"lidar_density": 42.3, "elevation_range_m": [534.2, 554.8],
                       "scan_date": "2026-06-01", "sensor": "Riegl VZ-2000i (simulated)"}
        elif stage_name == "quality_analysis":
            metrics = {"overall_quality": 0.94, "completeness": 0.97,
                       "accuracy_m": 0.12, "classification_coverage_pct": 93.5}
        elif stage_name == "multi_source_registration":
            metrics = {"sources_aligned": ["lidar", "dem", "gis"],
                       "alignment_rmse_m": 0.18, "control_points": 12}
        elif stage_name == "data_fusion":
            metrics = {"fused_sources": 4, "output_crs": "EPSG:4326",
                       "fusion_quality": 0.95, "is_synthetic": True,
                       "data_origin": "SYNTHETIC_DEMO"}

        stages.append({
            "stage_index": i,
            "stage_name": stage_name,
            "status": status,
            "metrics": metrics,
            "completed_at": datetime.now(timezone.utc).isoformat(),
        })

    return stages


@router.post("/run")
async def run_preprocessing(
    dataset_ids: list,
    property_id: str = None,
    background_tasks: BackgroundTasks = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.RUN_PREPROCESSING)),
):
    """Run preprocessing pipeline on a set of datasets."""
    run = ProcessingRun(
        property_id=uuid.UUID(property_id) if property_id else None,
        dataset_ids=dataset_ids,
        run_type="preprocessing",
        status="processing",
        started_at=datetime.now(timezone.utc),
    )
    db.add(run)

    # Run synchronously for MVP
    stages = _simulate_preprocessing(dataset_ids, property_id)
    run.stages = stages
    run.status = "completed"
    run.completed_at = datetime.now(timezone.utc)
    run.metrics = {
        "total_stages": len(stages),
        "completed": len([s for s in stages if s["status"] == "COMPLETED"]),
        "data_origin": "SYNTHETIC_DEMO",
    }

    log = AuditLog(user_id=current_user.id, action="RUN_PREPROCESSING",
                   resource_type="processing_run", details={"dataset_ids": dataset_ids})
    db.add(log)
    await db.flush()

    return {
        "run_id": str(run.id),
        "status": "completed",
        "stages": stages,
        "disclaimer": "SIMULATED PREPROCESSING — results are demonstration data",
    }


@router.get("/{run_id}/status")
async def get_preprocessing_status(
    run_id: str, db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.RUN_PREPROCESSING)),
):
    result = await db.execute(select(ProcessingRun).where(ProcessingRun.id == run_id))
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Processing run not found")
    return {"run_id": run_id, "status": run.status, "stages": run.stages, "metrics": run.metrics}
