"""TRINETRA — Audit Logging Middleware and utilities."""
import logging
from typing import Optional, Dict, Any
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.database import AsyncSessionLocal
from app.models import AuditLog

logger = logging.getLogger(__name__)


async def log_audit_event(
    action: str,
    user_id: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
):
    """Log an audit event asynchronously."""
    try:
        async with AsyncSessionLocal() as db:
            log_entry = AuditLog(
                action=action,
                user_id=user_id,
                resource_type=resource_type,
                resource_id=resource_id,
                details=details or {},
                ip_address=ip_address,
                user_agent=user_agent,
            )
            db.add(log_entry)
            await db.commit()
    except Exception as e:
        logger.warning(f"Failed to record audit log: {e}")


class AuditMiddleware(BaseHTTPMiddleware):
    """HTTP middleware for request auditing."""
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        return response


# Also alias audit_middleware if used as a function or middleware
async def audit_middleware(request: Request, call_next):
    response = await call_next(request)
    return response
