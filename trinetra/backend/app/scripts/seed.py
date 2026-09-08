"""TRINETRA — Comprehensive seed script for demo accounts and demo property data."""
import asyncio
import sys
import os
import uuid

# Add parent to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import hash_password
from app.core.config import settings
from app.auth.rbac import UserRole
from app.models import User


DEMO_USERS = [
    {
        "username": "admin.trinetra",
        "full_name": "System Administrator",
        "role": UserRole.SYSTEM_ADMINISTRATOR.value,
        "organization": "TRINETRA Platform Admin",
        "department": "IT/Systems",
        "password_key": "DEMO_ADMIN_PASSWORD",
        "is_demo": True,
    },
    {
        "username": "land.authority",
        "full_name": "Dr. Priya Sharma",
        "role": UserRole.LAND_RECORD_AUTHORITY.value,
        "organization": "Department of Land Resources",
        "department": "Land Records Division",
        "password_key": "DEMO_LAND_AUTHORITY_PASSWORD",
        "is_demo": True,
    },
    {
        "username": "gis.officer",
        "full_name": "Rajesh Kumar",
        "role": UserRole.SURVEY_GIS_OFFICER.value,
        "organization": "TGRAC / Survey of India",
        "department": "GIS Survey Division",
        "password_key": "DEMO_GIS_OFFICER_PASSWORD",
        "is_demo": True,
    },
    {
        "username": "urban.planner",
        "full_name": "Anita Reddy",
        "role": UserRole.URBAN_INFRASTRUCTURE_PLANNER.value,
        "organization": "GHMC / Urban Development",
        "department": "Infrastructure Planning",
        "password_key": "DEMO_URBAN_PLANNER_PASSWORD",
        "is_demo": True,
    },
    {
        "username": "review.officer",
        "full_name": "Suresh Babu",
        "role": UserRole.AUTHORIZED_REVIEWER.value,
        "organization": "HMDA Review Cell",
        "department": "Property Review",
        "password_key": "DEMO_REVIEW_OFFICER_PASSWORD",
        "is_demo": True,
    },
    {
        "username": "citizen.demo",
        "full_name": "Citizen (Demo)",
        "role": UserRole.AUTHORIZED_CITIZEN.value,
        "organization": "Public",
        "department": "N/A",
        "password_key": "DEMO_CITIZEN_PASSWORD",
        "is_demo": True,
    },
]


async def seed():
    """Create all demo users if they don't exist."""
    print("🌱 TRINETRA Database Seed Script")
    print("=" * 50)

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Tables created/verified")

    async with AsyncSessionLocal() as db:
        for user_data in DEMO_USERS:
            # Check if user already exists
            result = await db.execute(
                select(User).where(User.username == user_data["username"])
            )
            existing = result.scalar_one_or_none()

            password = getattr(settings, user_data["password_key"])
            password_hash = hash_password(password)

            if existing:
                existing.password_hash = password_hash
                existing.full_name = user_data["full_name"]
                print(f"  🔄 Updated: {user_data['username']} ({user_data['role']})")
            else:
                user = User(
                    username=user_data["username"],
                    full_name=user_data["full_name"],
                    role=user_data["role"],
                    organization=user_data["organization"],
                    department=user_data["department"],
                    password_hash=password_hash,
                    is_active=True,
                    is_demo=user_data["is_demo"],
                )
                db.add(user)
                print(f"  ✅ Created: {user_data['username']} ({user_data['role']})")

        await db.commit()

    print("\n✅ Seed complete!")
    print("\n📋 DEMO ACCOUNTS (DEMONSTRATION ENVIRONMENT ONLY):")
    print("-" * 50)
    for u in DEMO_USERS:
        pwd = getattr(settings, u["password_key"])
        print(f"  {u['username']:25} | {u['role']:35} | {pwd}")
    print("-" * 50)
    print("⚠️  Change all demo passwords before any production deployment!")


if __name__ == "__main__":
    asyncio.run(seed())
