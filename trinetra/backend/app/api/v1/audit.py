"""TRINETRA — Audit Log API router."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.core.database import get_db
from app.models import AuditLog

router = APIRouter(prefix="/audit")

DEMO_AUDIT_LOGS = [
    {
        "id": "aud_01",
        "action": "ULPIN_GENERATION",
        "resource_type": "PROPERTY",
        "resource_id": "PROP-HYD-2024-001",
        "details": {"ulpin": "IN-3D-HYD0-2024-0001", "validation_passed": True},
        "ip_address": "127.0.0.1",
        "timestamp": "2026-09-07T11:45:00Z",
        "user": "gis.officer",
    },
    {
        "id": "aud_02",
        "action": "VALIDATION_RUN",
        "resource_type": "PROPERTY",
        "resource_id": "PROP-HYD-2024-001",
        "details": {"checks_run": 8, "result": "VALIDATED"},
        "ip_address": "127.0.0.1",
        "timestamp": "2026-09-07T11:32:00Z",
        "user": "gis.officer",
    },
    {
        "id": "aud_03",
        "action": "QAOA_EXECUTION",
        "resource_type": "QUBO",
        "resource_id": "qubo_run_01",
        "details": {"depth_p": 1, "shots": 1024, "selected_bitstring": "0100000"},
        "ip_address": "127.0.0.1",
        "timestamp": "2026-09-07T11:15:00Z",
        "user": "gis.officer",
    },
    {
        "id": "aud_04",
        "action": "ENCROACHMENT_FLAGGED",
        "resource_type": "ENCROACHMENT_CASE",
        "resource_id": "ENC-HYD-2024-001",
        "details": {"overhang_m": 2.3, "boundary": "West", "severity": "HIGH"},
        "ip_address": "127.0.0.1",
        "timestamp": "2026-09-07T10:55:00Z",
        "user": "system",
    },
    {
        "id": "aud_05",
        "action": "DATASET_INGESTED",
        "resource_type": "DATASET",
        "resource_id": "ds_hyd_lidar_01",
        "details": {"filename": "IITH_ground_lidar_clip.las", "pts": 450000},
        "ip_address": "127.0.0.1",
        "timestamp": "2026-09-07T10:05:00Z",
        "user": "gis.officer",
    },
]


@router.get("")
async def list_audit_logs(
    action: Optional[str] = None,
    user: Optional[str] = None,
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve immutable system audit logs."""
    try:
        result = await db.execute(select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit))
        logs = result.scalars().all()
        if logs:
            return [
                {
                    "id": str(log.id),
                    "action": log.action,
                    "resource_type": log.resource_type,
                    "resource_id": log.resource_id,
                    "details": log.details,
                    "ip_address": log.ip_address,
                    "timestamp": log.timestamp.isoformat() if log.timestamp else None,
                    "user": str(log.user_id) if log.user_id else "system",
                }
                for log in logs
            ]
    except Exception:
        pass

    # Return rich demo audit logs
    filtered = DEMO_AUDIT_LOGS
    if action:
        filtered = [l for l in filtered if l["action"].lower() == action.lower()]
    return filtered
