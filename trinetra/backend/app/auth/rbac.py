"""TRINETRA — RBAC: Role definitions and permission system."""
from enum import Enum
from typing import Set, Dict


class UserRole(str, Enum):
    SYSTEM_ADMINISTRATOR = "system_administrator"
    LAND_RECORD_AUTHORITY = "land_record_authority"
    SURVEY_GIS_OFFICER = "survey_gis_officer"
    URBAN_INFRASTRUCTURE_PLANNER = "urban_infrastructure_planner"
    AUTHORIZED_REVIEWER = "authorized_reviewer"
    AUTHORIZED_CITIZEN = "authorized_citizen"


class Permission(str, Enum):
    # User management
    MANAGE_USERS = "manage_users"
    MANAGE_ROLES = "manage_roles"
    VIEW_AUDIT_LOGS = "view_audit_logs"
    VIEW_SYSTEM_HEALTH = "view_system_health"
    MANAGE_DATASETS = "manage_datasets"
    MANAGE_SETTINGS = "manage_settings"

    # Data operations
    UPLOAD_DATASETS = "upload_datasets"
    VIEW_LIDAR = "view_lidar"
    VIEW_GIS_PARCELS = "view_gis_parcels"
    VIEW_DEM = "view_dem"
    VIEW_DRONE = "view_drone"
    VIEW_FLOOR_PLANS = "view_floor_plans"

    # Pipeline
    RUN_PREPROCESSING = "run_preprocessing"
    RUN_EXTRACTION = "run_extraction"
    GENERATE_CANDIDATES = "generate_candidates"
    RUN_QUBO = "run_qubo"
    RUN_QAOA = "run_qaoa"
    VIEW_CONFIDENCE = "view_confidence"

    # Property operations
    VIEW_PROPERTIES = "view_properties"
    VIEW_3D_GIS = "view_3d_gis"
    VIEW_UTILITIES = "view_utilities"

    # Validation / Review
    RUN_VALIDATION = "run_validation"
    GENERATE_ULPIN = "generate_ulpin"
    REVIEW_PROPERTIES = "review_properties"
    APPROVE_REJECT = "approve_reject"
    REVIEW_DISCREPANCIES = "review_discrepancies"
    REVIEW_ENCROACHMENTS = "review_encroachments"
    REVIEW_CHANGE_DETECTION = "review_change_detection"

    # Citizen
    ACCESS_PUBLIC_PROPERTY = "access_public_property"
    VIEW_PROPERTY_PASSPORT = "view_property_passport"
    SCAN_QR = "scan_qr"


# Role → Set[Permission] mapping
ROLE_PERMISSIONS: Dict[UserRole, Set[Permission]] = {
    UserRole.SYSTEM_ADMINISTRATOR: set(Permission),  # all permissions

    UserRole.LAND_RECORD_AUTHORITY: {
        Permission.REVIEW_PROPERTIES,
        Permission.APPROVE_REJECT,
        Permission.REVIEW_DISCREPANCIES,
        Permission.REVIEW_ENCROACHMENTS,
        Permission.VIEW_PROPERTIES,
        Permission.VIEW_PROPERTY_PASSPORT,
        Permission.VIEW_3D_GIS,
        Permission.VIEW_CONFIDENCE,
        Permission.VIEW_AUDIT_LOGS,
    },

    UserRole.SURVEY_GIS_OFFICER: {
        Permission.UPLOAD_DATASETS,
        Permission.VIEW_LIDAR,
        Permission.VIEW_GIS_PARCELS,
        Permission.VIEW_DEM,
        Permission.VIEW_DRONE,
        Permission.VIEW_FLOOR_PLANS,
        Permission.RUN_PREPROCESSING,
        Permission.RUN_EXTRACTION,
        Permission.GENERATE_CANDIDATES,
        Permission.RUN_QUBO,
        Permission.RUN_QAOA,
        Permission.RUN_VALIDATION,
        Permission.GENERATE_ULPIN,
        Permission.VIEW_PROPERTIES,
        Permission.VIEW_3D_GIS,
        Permission.VIEW_CONFIDENCE,
        Permission.VIEW_UTILITIES,
    },

    UserRole.URBAN_INFRASTRUCTURE_PLANNER: {
        Permission.VIEW_3D_GIS,
        Permission.VIEW_PROPERTIES,
        Permission.VIEW_UTILITIES,
        Permission.VIEW_GIS_PARCELS,
    },

    UserRole.AUTHORIZED_REVIEWER: {
        Permission.REVIEW_ENCROACHMENTS,
        Permission.REVIEW_DISCREPANCIES,
        Permission.REVIEW_CHANGE_DETECTION,
        Permission.APPROVE_REJECT,
        Permission.VIEW_PROPERTIES,
        Permission.VIEW_CONFIDENCE,
    },

    UserRole.AUTHORIZED_CITIZEN: {
        Permission.ACCESS_PUBLIC_PROPERTY,
        Permission.VIEW_PROPERTY_PASSPORT,
        Permission.SCAN_QR,
    },
}


def has_permission(role: UserRole, permission: Permission) -> bool:
    """Check if a role has a specific permission."""
    return permission in ROLE_PERMISSIONS.get(role, set())


def get_role_permissions(role: UserRole) -> Set[Permission]:
    """Return all permissions for a role."""
    return ROLE_PERMISSIONS.get(role, set())


# Dashboard routes per role
ROLE_DASHBOARD_ROUTES: Dict[UserRole, str] = {
    UserRole.SYSTEM_ADMINISTRATOR: "/admin/dashboard",
    UserRole.LAND_RECORD_AUTHORITY: "/authority/dashboard",
    UserRole.SURVEY_GIS_OFFICER: "/officer/dashboard",
    UserRole.URBAN_INFRASTRUCTURE_PLANNER: "/planner/dashboard",
    UserRole.AUTHORIZED_REVIEWER: "/reviewer/dashboard",
    UserRole.AUTHORIZED_CITIZEN: "/citizen/dashboard",
}
