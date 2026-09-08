"""TRINETRA — Services Package."""
from app.services.ulpin import ulpin_service
from app.services.reports import report_service
from app.services.change_detection import change_service

__all__ = ["ulpin_service", "report_service", "change_service"]
