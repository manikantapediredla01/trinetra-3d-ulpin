"""TRINETRA — SQLAlchemy ORM Models (all tables)."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime, Integer, Float,
    Text, JSON, ForeignKey, Enum as SAEnum, Index
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(200), unique=True, nullable=True)
    password_hash = Column(String(200), nullable=False)
    role = Column(String(50), nullable=False)  # UserRole value
    full_name = Column(String(200))
    organization = Column(String(200))
    department = Column(String(200))
    is_active = Column(Boolean, default=True)
    is_demo = Column(Boolean, default=False)
    last_login = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    audit_logs = relationship("AuditLog", back_populates="user", lazy="dynamic")


class Dataset(Base):
    __tablename__ = "datasets"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String(500), nullable=False)
    original_filename = Column(String(500))
    source_type = Column(String(50))  # lidar, gis, dem, dsm, drone, floorplan, gnss
    file_size_bytes = Column(Integer)
    upload_status = Column(String(50), default="pending")  # pending/uploaded/failed
    processing_status = Column(String(50), default="queued")  # queued/processing/completed/failed
    crs = Column(String(100))
    acquisition_date = Column(DateTime(timezone=True))
    source = Column(String(200))
    metadata_ = Column("metadata", JSON, default=dict)
    quality_score = Column(Float)
    is_synthetic = Column(Boolean, default=False)
    data_origin = Column(String(50), default="REAL_INPUT")  # REAL_INPUT/SYNTHETIC_DEMO/DERIVED_AI/SIMULATED_QAOA
    provenance = Column(JSON, default=dict)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class Property(Base):
    __tablename__ = "properties"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_ref = Column(String(100), unique=True, index=True)
    ulpin = Column(String(100), unique=True, nullable=True, index=True)
    parcel_reference = Column(String(100))
    status = Column(String(50), default="pending")  # pending/processing/verified/rejected
    confidence = Column(Float, default=0.0)
    survey_date = Column(DateTime(timezone=True))
    geometry_3d = Column(Geometry("MULTIPOLYGONZ", srid=4326), nullable=True)
    horizontal_extent = Column(Float)  # m²
    vertical_extent = Column(Float)  # m
    floor_count = Column(Integer, default=0)
    has_basement = Column(Boolean, default=False)
    building_height = Column(Float)
    ground_elevation = Column(Float)
    district = Column(String(100))
    city = Column(String(100))
    address = Column(Text)
    is_synthetic = Column(Boolean, default=False)
    data_origin = Column(String(50), default="REAL_INPUT")
    metadata_ = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    floor_units = relationship("FloorUnit", back_populates="property", cascade="all, delete-orphan")
    surveys = relationship("Survey", back_populates="property")
    candidates = relationship("CandidateConfiguration", back_populates="property")
    validations = relationship("Validation", back_populates="property")
    encroachment_cases = relationship("EncroachmentCase", back_populates="property")
    discrepancies = relationship("Discrepancy", back_populates="property")
    change_events = relationship("ChangeEvent", back_populates="property")


class Parcel(Base):
    __tablename__ = "parcels"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reference = Column(String(100), unique=True, index=True)
    geometry = Column(Geometry("POLYGON", srid=4326))
    area_m2 = Column(Float)
    source = Column(String(200))
    district = Column(String(100))
    city = Column(String(100))
    is_synthetic = Column(Boolean, default=False)
    data_origin = Column(String(50), default="REAL_INPUT")
    metadata_ = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class FloorUnit(Base):
    __tablename__ = "floor_units"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"), nullable=False)
    floor_level = Column(Integer, nullable=False)  # 0=ground, -1=basement
    unit_number = Column(String(50))
    geometry_3d = Column(Geometry("POLYGONZ", srid=4326), nullable=True)
    area_m2 = Column(Float)
    ceiling_height = Column(Float)
    floor_elevation = Column(Float)
    usage_type = Column(String(100))
    is_synthetic = Column(Boolean, default=False)
    metadata_ = Column("metadata", JSON, default=dict)
    property = relationship("Property", back_populates="floor_units")


class Survey(Base):
    __tablename__ = "surveys"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"))
    source_type = Column(String(50))  # lidar/drone/gis/gnss
    survey_date = Column(DateTime(timezone=True))
    epoch = Column(String(10))  # T1/T2
    provenance = Column(JSON, default=dict)
    metadata_ = Column("metadata", JSON, default=dict)
    is_synthetic = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    property = relationship("Property", back_populates="surveys")


class CandidateConfiguration(Base):
    __tablename__ = "candidate_configurations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"))
    candidate_index = Column(Integer)
    geometry_3d = Column(Geometry("MULTIPOLYGONZ", srid=4326), nullable=True)
    area_m2 = Column(Float)
    volume_m3 = Column(Float)
    floor_range_min = Column(Integer)
    floor_range_max = Column(Integer)
    overlap_score = Column(Float)
    gap_score = Column(Float)
    boundary_error = Column(Float)
    floor_error = Column(Float)
    topology_score = Column(Float)
    total_cost = Column(Float)
    description = Column(Text)
    metadata_ = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    property = relationship("Property", back_populates="candidates")


class QUBORun(Base):
    __tablename__ = "qubo_runs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"))
    n_variables = Column(Integer)
    q_matrix = Column(JSON)  # 2D array
    variable_labels = Column(JSON)  # list of candidate IDs
    weights = Column(JSON)  # w_overlap, w_gap, w_boundary, w_floor, w_topology
    objective_value = Column(Float)
    ising_h = Column(JSON)  # Ising Hamiltonian coefficients
    ising_j = Column(JSON)
    classical_solution = Column(String(50))  # classical optimal bitstring
    classical_cost = Column(Float)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    qaoa_runs = relationship("QAOARun", back_populates="qubo_run")


class QAOARun(Base):
    __tablename__ = "qaoa_runs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    qubo_id = Column(UUID(as_uuid=True), ForeignKey("qubo_runs.id"))
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"))
    backend = Column(String(100))
    depth_p = Column(Integer)
    n_qubits = Column(Integer)
    shots = Column(Integer)
    bitstrings = Column(JSON)  # list of strings
    probabilities = Column(JSON)  # list of floats
    objective_values = Column(JSON)  # cost per bitstring
    selected_bitstring = Column(String(50))
    selected_cost = Column(Float)
    optimality_gap = Column(Float)
    runtime_ms = Column(Float)
    used_classical_fallback = Column(Boolean, default=False)
    circuit_diagram = Column(Text)
    metadata_ = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    qubo_run = relationship("QUBORun", back_populates="qaoa_runs")


class Validation(Base):
    __tablename__ = "validations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"))
    qaoa_run_id = Column(UUID(as_uuid=True), ForeignKey("qaoa_runs.id"), nullable=True)
    geometry_status = Column(String(10))  # PASS/FAIL
    overlap_status = Column(String(10))
    gap_status = Column(String(10))
    boundary_status = Column(String(10))
    floor_status = Column(String(10))
    topology_status = Column(String(10))
    elevation_status = Column(String(10))
    coordinate_status = Column(String(10))
    overall_result = Column(String(20))  # VALIDATED/REJECTED
    notes = Column(JSON, default=list)
    validated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    property = relationship("Property", back_populates="validations")


class EncroachmentCase(Base):
    __tablename__ = "encroachment_cases"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"))
    affected_geometry = Column(Geometry("MULTIPOLYGONZ", srid=4326), nullable=True)
    affected_area_m2 = Column(Float)
    affected_volume_m3 = Column(Float)
    severity = Column(String(20))  # LOW/MEDIUM/HIGH/CRITICAL
    confidence = Column(Float)
    evidence_sources = Column(JSON)
    comparison_source = Column(String(200))
    review_status = Column(String(30), default="pending")  # pending/under_review/resolved
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    property = relationship("Property", back_populates="encroachment_cases")


class Discrepancy(Base):
    __tablename__ = "discrepancies"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"))
    discrepancy_type = Column(String(50))  # area_mismatch/floor_mismatch/boundary_mismatch/etc
    field_name = Column(String(100))
    previous_value = Column(Text)
    current_value = Column(Text)
    difference = Column(Float)
    difference_pct = Column(Float)
    severity = Column(String(20))
    confidence = Column(Float)
    evidence_sources = Column(JSON)
    review_status = Column(String(30), default="pending")
    created_at = Column(DateTime(timezone=True), default=utcnow)
    property = relationship("Property", back_populates="discrepancies")


class ChangeEvent(Base):
    __tablename__ = "change_events"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"))
    previous_survey_id = Column(UUID(as_uuid=True), ForeignKey("surveys.id"), nullable=True)
    current_survey_id = Column(UUID(as_uuid=True), ForeignKey("surveys.id"), nullable=True)
    change_type = Column(String(50))  # new_floor/expansion/demolition/roof_modification/new_structure
    affected_geometry = Column(Geometry("MULTIPOLYGONZ", srid=4326), nullable=True)
    affected_area_m2 = Column(Float)
    affected_volume_m3 = Column(Float)
    confidence = Column(Float)
    review_status = Column(String(30), default="pending")
    description = Column(Text)
    epoch_t1 = Column(String(10))
    epoch_t2 = Column(String(10))
    created_at = Column(DateTime(timezone=True), default=utcnow)
    property = relationship("Property", back_populates="change_events")


class UtilityAsset(Base):
    __tablename__ = "utility_assets"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    utility_type = Column(String(50))  # water/electricity/sewer/drainage
    geometry_3d = Column(Geometry("LINESTRINGZ", srid=4326), nullable=True)
    depth_m = Column(Float)
    source = Column(String(200))
    is_synthetic = Column(Boolean, default=False)
    data_origin = Column(String(50), default="REAL_INPUT")
    metadata_ = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class PropertyPassport(Base):
    __tablename__ = "property_passports"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"), unique=True)
    ulpin = Column(String(100))
    qr_data = Column(Text)  # URL or encoded data
    qr_image_path = Column(String(500))
    issued_at = Column(DateTime(timezone=True), default=utcnow)
    valid_until = Column(DateTime(timezone=True))
    is_public = Column(Boolean, default=True)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False, index=True)
    resource_type = Column(String(100))
    resource_id = Column(String(200))
    details = Column(JSON, default=dict)
    ip_address = Column(String(50))
    user_agent = Column(Text)
    session_id = Column(String(200))
    timestamp = Column(DateTime(timezone=True), default=utcnow, index=True)
    user = relationship("User", back_populates="audit_logs")

    __table_args__ = (
        Index("ix_audit_logs_user_action", "user_id", "action"),
        Index("ix_audit_logs_timestamp", "timestamp"),
    )


class ProcessingRun(Base):
    __tablename__ = "processing_runs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"), nullable=True)
    dataset_ids = Column(JSON, default=list)
    run_type = Column(String(50))  # preprocessing/extraction/candidate_gen
    status = Column(String(30), default="queued")
    stages = Column(JSON, default=list)  # list of stage results
    metrics = Column(JSON, default=dict)
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    error = Column(Text)
    created_at = Column(DateTime(timezone=True), default=utcnow)
