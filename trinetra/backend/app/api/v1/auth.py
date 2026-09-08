"""TRINETRA — Auth API router: login, logout, refresh, me."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token
from app.core.deps import get_current_user
from app.models import User, AuditLog
from app.auth.rbac import ROLE_DASHBOARD_ROUTES, UserRole
from app.auth.demo_users import get_demo_user_by_credentials, get_demo_user_by_id
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth")


class LoginRequest(BaseModel):
    username: str
    password: str
    organization: Optional[str] = None
    remember_session: bool = False


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    username: str
    full_name: Optional[str]
    dashboard_route: str
    is_demo: bool


class RefreshRequest(BaseModel):
    refresh_token: str


async def _log_audit(db: AsyncSession, user_id, action: str, ip: str, details: dict, is_demo: bool = False):
    logger.info(f"AUDIT [{action}] user={user_id} ip={ip} details={details}")
    if is_demo:
        return
    try:
        log = AuditLog(user_id=user_id, action=action, resource_type="auth",
                       ip_address=ip, details=details)
        db.add(log)
        await db.flush()
    except Exception as e:
        logger.debug(f"Audit log skipped: {e}")
        try:
            await db.rollback()
        except Exception:
            pass


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """Authenticate user and return JWT tokens (fast-path demo + database fallback)."""
    ip = request.client.host if request.client else "unknown"

    authenticated = False
    is_demo = False
    user_id = None
    user_role = None
    full_name = None
    username_val = body.username

    # 1. Fast-path: Check demo credentials first (instant, zero DB timeout)
    demo_user = get_demo_user_by_credentials(body.username, body.password)
    if demo_user:
        authenticated = True
        user_id = str(demo_user.id)
        user_role = demo_user.role
        full_name = demo_user.full_name
        is_demo = True
        username_val = demo_user.username
    else:
        # 2. Database lookup for custom/database users
        user = None
        try:
            result = await db.execute(
                select(User).where(User.username == body.username, User.is_active == True)
            )
            user = result.scalar_one_or_none()
        except Exception as e:
            logger.info(f"Database query error during login: {e}")
            try:
                await db.rollback()
            except Exception:
                pass

        if user and verify_password(body.password, user.password_hash):
            authenticated = True
            user_id = str(user.id)
            user_role = user.role
            full_name = user.full_name
            is_demo = user.is_demo
            username_val = user.username
            try:
                await db.execute(
                    update(User).where(User.id == user.id).values(last_login=datetime.now(timezone.utc))
                )
            except Exception:
                pass

    if not authenticated:
        await _log_audit(db, None, "LOGIN_FAILED", ip,
                         {"username": body.username, "reason": "invalid_credentials"})
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid username or password")

    access_token = create_access_token({"sub": user_id, "role": user_role})
    refresh_token = create_refresh_token({"sub": user_id})

    try:
        role_enum = UserRole(user_role)
        dashboard = ROLE_DASHBOARD_ROUTES.get(role_enum, "/dashboard")
    except Exception:
        dashboard = "/dashboard"

    await _log_audit(db, user_id, "LOGIN", ip,
                     {"username": username_val, "role": user_role},
                     is_demo=is_demo)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        role=user_role,
        username=username_val,
        full_name=full_name,
        dashboard_route=dashboard,
        is_demo=is_demo,
    )


@router.post("/refresh")
async def refresh(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Exchange refresh token for new access token."""
    payload = decode_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid refresh token")
    user_id = payload.get("sub")

    user = None
    try:
        result = await db.execute(select(User).where(User.id == user_id, User.is_active == True))
        user = result.scalar_one_or_none()
    except Exception:
        pass

    if not user:
        user = get_demo_user_by_id(user_id)

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
async def me(current_user: User = Depends(get_current_user)):
    """Return current user profile."""
    last_login_str = None
    if getattr(current_user, "last_login", None):
        last_login_str = current_user.last_login.isoformat()

    return {
        "id": str(current_user.id),
        "username": current_user.username,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "organization": current_user.organization,
        "department": current_user.department,
        "is_demo": current_user.is_demo,
        "last_login": last_login_str,
        "dashboard_route": ROLE_DASHBOARD_ROUTES.get(UserRole(current_user.role), "/dashboard"),
    }


@router.post("/logout")
async def logout(request: Request, current_user: User = Depends(get_current_user),
                 db: AsyncSession = Depends(get_db)):
    """Log logout event (client must discard tokens)."""
    ip = request.client.host if request.client else "unknown"
    await _log_audit(db, current_user.id, "LOGOUT", ip, {"username": current_user.username})
    return {"message": "Logged out successfully"}
