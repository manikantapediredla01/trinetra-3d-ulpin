"""TRINETRA — In-memory demo user credentials and fallback registry."""
import uuid
from datetime import datetime, timezone
from app.auth.rbac import UserRole
from app.core.config import settings


DEMO_USERS_CONFIG = [
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000001"),
        "username": "admin.trinetra",
        "full_name": "System Administrator",
        "role": UserRole.SYSTEM_ADMINISTRATOR.value,
        "organization": "TRINETRA Platform Admin",
        "department": "IT/Systems",
        "password_attr": "DEMO_ADMIN_PASSWORD",
        "default_password": "Trinetra@Admin2024",
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000002"),
        "username": "land.authority",
        "full_name": "Dr. Priya Sharma",
        "role": UserRole.LAND_RECORD_AUTHORITY.value,
        "organization": "Department of Land Resources",
        "department": "Land Records Division",
        "password_attr": "DEMO_LAND_AUTHORITY_PASSWORD",
        "default_password": "Trinetra@LandAuth2024",
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000003"),
        "username": "gis.officer",
        "full_name": "Rajesh Kumar",
        "role": UserRole.SURVEY_GIS_OFFICER.value,
        "organization": "TGRAC / Survey of India",
        "department": "GIS Survey Division",
        "password_attr": "DEMO_GIS_OFFICER_PASSWORD",
        "default_password": "Trinetra@GIS2024",
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000004"),
        "username": "urban.planner",
        "full_name": "Anita Reddy",
        "role": UserRole.URBAN_INFRASTRUCTURE_PLANNER.value,
        "organization": "GHMC / Urban Development",
        "department": "Infrastructure Planning",
        "password_attr": "DEMO_URBAN_PLANNER_PASSWORD",
        "default_password": "Trinetra@Urban2024",
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000005"),
        "username": "review.officer",
        "full_name": "Suresh Babu",
        "role": UserRole.AUTHORIZED_REVIEWER.value,
        "organization": "HMDA Review Cell",
        "department": "Property Review",
        "password_attr": "DEMO_REVIEW_OFFICER_PASSWORD",
        "default_password": "Trinetra@Review2024",
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000006"),
        "username": "citizen.demo",
        "full_name": "Citizen (Demo)",
        "role": UserRole.AUTHORIZED_CITIZEN.value,
        "organization": "Public",
        "department": "N/A",
        "password_attr": "DEMO_CITIZEN_PASSWORD",
        "default_password": "Trinetra@Citizen2024",
    },
]

DEMO_USERS_BY_USERNAME = {u["username"]: u for u in DEMO_USERS_CONFIG}
DEMO_USERS_BY_USERNAME["officer"] = DEMO_USERS_BY_USERNAME["gis.officer"]
DEMO_USERS_BY_USERNAME["admin"] = DEMO_USERS_BY_USERNAME["admin.trinetra"]
DEMO_USERS_BY_USERNAME["planner"] = DEMO_USERS_BY_USERNAME["urban.planner"]
DEMO_USERS_BY_USERNAME["reviewer"] = DEMO_USERS_BY_USERNAME["review.officer"]
DEMO_USERS_BY_USERNAME["citizen"] = DEMO_USERS_BY_USERNAME["citizen.demo"]

DEMO_USERS_BY_ID = {str(u["id"]): u for u in DEMO_USERS_CONFIG}


class DemoUser:
    """Mock user object matching SQLAlchemy User attributes for in-memory demo mode."""

    def __init__(self, data: dict):
        self.id = data["id"]
        self.username = data["username"]
        self.full_name = data["full_name"]
        self.role = data["role"]
        self.organization = data["organization"]
        self.department = data["department"]
        self.is_active = True
        self.is_demo = True
        self.last_login = datetime.now(timezone.utc)
        self.email = f"{data['username']}@demo.trinetra.gov.in"

    def __repr__(self):
        return f"<DemoUser username={self.username} role={self.role}>"


def get_demo_user_by_credentials(username: str, password: str):
    clean_username = username.strip().lower()
    cfg = DEMO_USERS_BY_USERNAME.get(clean_username)
    if not cfg:
        return None
    # In demo/quick login mode, accept configured passwords or any reasonable test password
    if password and len(password.strip()) > 0:
        return DemoUser(cfg)
    return None


def get_demo_user_by_id(user_id: str):
    cfg = DEMO_USERS_BY_ID.get(str(user_id))
    if cfg:
        return DemoUser(cfg)
    return None
