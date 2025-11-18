"""
Health Check Router for PneumAI
Health and readiness endpoints for monitoring
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime
import logging

from app.models.schemas import HealthResponse
from app.database import Database
from app.services.yolo_service import yolo_service
from app.services.file_manager import file_manager
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Basic health check endpoint
    Returns system status and component health
    """
    # Check database connection
    db_healthy = False
    try:
        with Database.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            db_healthy = True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_healthy = False

    # Check YOLO model
    model_loaded = yolo_service.is_loaded()

    # Check upload directory is writable
    upload_dir_writable = False
    try:
        test_file = settings.UPLOAD_DIR / ".health_check"
        test_file.touch()
        test_file.unlink()
        upload_dir_writable = True
    except Exception as e:
        logger.error(f"Upload directory not writable: {e}")
        upload_dir_writable = False

    # Overall status
    status = "healthy" if (db_healthy and model_loaded and upload_dir_writable) else "degraded"

    return HealthResponse(
        status=status,
        database=db_healthy,
        model_loaded=model_loaded,
        upload_dir_writable=upload_dir_writable,
        timestamp=datetime.utcnow()
    )


@router.get("/readiness")
async def readiness_check():
    """
    Readiness check for deployment platforms (Railway, Kubernetes, etc.)
    Returns 200 if ready, 503 if not ready
    """
    try:
        # Check database
        with Database.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")

        # Check YOLO model
        if not yolo_service.is_loaded():
            raise HTTPException(status_code=503, detail="YOLO model not loaded")

        return {"ready": True, "timestamp": datetime.utcnow().isoformat()}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        raise HTTPException(status_code=503, detail=f"Service not ready: {str(e)}")


@router.get("/status")
async def detailed_status():
    """
    Detailed system status including storage and model info
    """
    try:
        # Database info
        db_info = {"connected": False, "tables": []}
        try:
            with Database.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT table_name
                    FROM information_schema.tables
                    WHERE table_schema = 'public'
                    ORDER BY table_name
                """)
                db_info = {
                    "connected": True,
                    "tables": [row[0] for row in cursor.fetchall()]
                }
        except Exception as e:
            logger.error(f"Database status check failed: {e}")

        # YOLO model info
        model_info = yolo_service.get_model_info()

        # Storage info
        storage_info = file_manager.get_storage_info()

        return {
            "application": {
                "name": "PneumAI Unified Backend",
                "version": "1.0.0",
                "environment": settings.ENVIRONMENT
            },
            "database": db_info,
            "model": model_info,
            "storage": storage_info,
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Status endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
