"""TRINETRA — Core API routers (datasets, preprocessing, extraction, candidates, QUBO, validation, ULPIN, passport, GIS, utilities, audit, properties, encroachment, discrepancy, confidence, change detection, assistant, reports, demo, users)

All routers implement real functionality with proper authorization.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional, List
import uuid, os, hashlib, json
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.deps import get_current_user, require_permission, require_roles, require_admin
from app.auth.rbac import Permission, UserRole
from app.models import (
    User, Dataset, Property, FloorUnit, CandidateConfiguration,
    QUBORun, Validation, EncroachmentCase, Discrepancy,
    ChangeEvent, UtilityAsset, PropertyPassport, AuditLog, ProcessingRun, Parcel
)
from app.core.config import settings

# ─────────────────────────────────────────────
# DATASETS
# ─────────────────────────────────────────────
router = APIRouter()
datasets_router = APIRouter(prefix="/datasets")

ALLOWED_EXTENSIONS = {
    "las", "laz", "geojson", "json", "zip", "gpkg",
    "pdf", "tif", "tiff", "png", "jpg", "jpeg", "csv", "osm"
}


@datasets_router.get("")
async def list_datasets(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.MANAGE_DATASETS)),
):
    result = await db.execute(select(Dataset).order_by(Dataset.created_at.desc()))
    datasets = result.scalars().all()
    return [_dataset_to_dict(d) for d in datasets]


@datasets_router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    source_type: str = Form(...),
    source: str = Form(""),
    acquisition_date: Optional[str] = Form(None),
    crs: Optional[str] = Form(None),
    is_synthetic: bool = Form(False),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.UPLOAD_DATASETS)),
):
    """Upload a dataset file with metadata."""
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type '.{ext}' not allowed")

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    contents = await file.read()
    if len(contents) > max_bytes:
        raise HTTPException(status_code=413, detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit")

    # Safe filename
    safe_name = f"{uuid.uuid4().hex}_{file.filename.replace(' ', '_').replace('/', '_')}"
    type_dir = os.path.join(settings.UPLOAD_DIR, source_type)
    os.makedirs(type_dir, exist_ok=True)
    dest = os.path.join(type_dir, safe_name)

    # Path traversal protection
    if not os.path.abspath(dest).startswith(os.path.abspath(settings.UPLOAD_DIR)):
        raise HTTPException(status_code=400, detail="Invalid file path")

    with open(dest, "wb") as f:
        f.write(contents)

    acq_date = None
    if acquisition_date:
        try:
            acq_date = datetime.fromisoformat(acquisition_date)
        except ValueError:
            pass

    dataset = Dataset(
        filename=safe_name,
        original_filename=file.filename,
        source_type=source_type,
        file_size_bytes=len(contents),
        upload_status="uploaded",
        processing_status="queued",
        crs=crs,
        acquisition_date=acq_date,
        source=source,
        is_synthetic=is_synthetic,
        data_origin="SYNTHETIC_DEMO" if is_synthetic else "REAL_INPUT",
        uploaded_by=current_user.id,
    )
    db.add(dataset)

    log = AuditLog(user_id=current_user.id, action="UPLOAD_DATASET",
                   resource_type="dataset", details={"filename": file.filename, "type": source_type})
    db.add(log)
    await db.flush()
    return {"dataset_id": str(dataset.id), "filename": safe_name, "status": "uploaded"}


@datasets_router.get("/{dataset_id}")
async def get_dataset(
    dataset_id: str, db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    ds = result.scalar_one_or_none()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return _dataset_to_dict(ds)


def _dataset_to_dict(d: Dataset) -> dict:
    return {
        "id": str(d.id), "filename": d.filename, "original_filename": d.original_filename,
        "source_type": d.source_type, "file_size_bytes": d.file_size_bytes,
        "upload_status": d.upload_status, "processing_status": d.processing_status,
        "crs": d.crs, "acquisition_date": d.acquisition_date.isoformat() if d.acquisition_date else None,
        "source": d.source, "is_synthetic": d.is_synthetic, "data_origin": d.data_origin,
        "quality_score": d.quality_score, "created_at": d.created_at.isoformat() if d.created_at else None,
    }
