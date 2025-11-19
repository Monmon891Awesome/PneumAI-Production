"""
Scans Router for PneumAI
CT Scan upload, analysis, and comment management
"""

from fastapi import APIRouter, File, UploadFile, HTTPException, Form, Request
from fastapi.responses import Response
from typing import Optional, List
from datetime import datetime
import logging

from app.models.schemas import (
    ScanResponse,
    ScanResults,
    ScanMetadata,
    ImageSize,
    CommentCreate,
    CommentUpdate,
    CommentResponse,
    MessageOnlyResponse
)
from app.services.yolo_service import yolo_service
from app.services.image_service import image_service
from app.services.file_manager import file_manager
from app.database import (
    create_scan,
    get_scan,
    get_patient_scans,
    get_all_scans,
    delete_scan,
    create_scan_comment,
    get_scan_comments,
    update_scan_comment,
    delete_scan_comment
)
from app.utils.helpers import generate_scan_id, format_file_size
from app.utils.security import sanitize_filename
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/analyze", response_model=ScanResponse)
async def analyze_scan(
    scan: UploadFile = File(...),
    patientId: Optional[str] = Form(None),
    request: Request = None
):
    """
    Upload and analyze CT scan image with YOLOv12

    Supports: DICOM (.dcm), JPEG, PNG
    Returns: Detection results, annotated image URLs
    """
    try:
        # Record start time
        start_time = datetime.utcnow()

        # Validate file size
        contents = await scan.read()
        file_size = len(contents)

        if file_size > settings.MAX_UPLOAD_SIZE_BYTES:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size: {settings.MAX_UPLOAD_SIZE_MB}MB"
            )

        # Sanitize filename
        safe_filename = sanitize_filename(scan.filename or "scan.jpg")
        file_format = safe_filename.split('.')[-1].lower()

        logger.info(f"📤 Processing scan: {safe_filename} ({format_file_size(file_size)})")

        # Read and process image
        image = image_service.read_image(contents, safe_filename)

        # Run YOLO inference
        results = yolo_service.analyze(image)

        # Create annotated image
        annotated_image_bytes = image_service.create_annotated_image(image, results['detections'])

        # Encode original image
        original_image_bytes = image_service.encode_image_to_jpeg(image)

        # Generate scan ID
        scan_id = generate_scan_id()

        # Save both images to filesystem
        original_path, annotated_path = file_manager.save_scan_images(
            scan_id,
            original_image_bytes,
            annotated_image_bytes
        )

        # Calculate processing time
        processing_time = (datetime.utcnow() - start_time).total_seconds()

        # Prepare scan data for database
        scan_data = {
            'scanId': scan_id,
            'patientId': patientId or 'unknown',
            'status': 'completed',
            'uploadTime': start_time.isoformat(),
            'processingTime': processing_time,
            'results': {
                'detected': results['detected'],
                'confidence': results['confidence'],
                'riskLevel': results['riskLevel'],
                'topClass': results['topClass']
            },
            'metadata': {
                'fileSize': file_size,
                'format': file_format,
                'imageSize': results['imageSize']
            },
            'originalPath': original_path,
            'annotatedPath': annotated_path
        }

        # Save to database
        create_scan(scan_data, results['detections'])

        logger.info(f"✅ Scan completed: {scan_id} - Risk: {results['riskLevel']} ({processing_time:.2f}s)")

        # Construct response with image URLs
        # Construct response with image URLs
        base_url = str(request.base_url).rstrip('/') if request else f"http://localhost:{settings.PORT}"
        image_urls = file_manager.get_scan_image_urls(scan_id, base_url)

        return ScanResponse(
            scanId=scan_id,
            patientId=patientId,
            status='completed',
            uploadTime=start_time,
            processingTime=processing_time,
            results=ScanResults(
                detected=results['detected'],
                confidence=results['confidence'],
                topClass=results['topClass'],
                riskLevel=results['riskLevel'],
                detections=results['detections'],
                imageSize=ImageSize(**results['imageSize']),
                imageUrl=image_urls['imageUrl'],
                annotatedImageUrl=image_urls['annotatedImageUrl']
            ),
            metadata=ScanMetadata(
                fileSize=file_size,
                format=file_format,
                imageSize=ImageSize(**results['imageSize'])
            )
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error processing scan: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Scan processing failed: {str(e)}")


@router.get("/{scan_id}")
async def get_scan_by_id(scan_id: str, request: Request):
    """
    Get scan information by ID

    Returns scan metadata and detection results
    """
    try:
        scan = get_scan(scan_id)

        if not scan:
            raise HTTPException(status_code=404, detail=f"Scan not found: {scan_id}")

        # Add image URLs
        # Add image URLs
        base_url = str(request.base_url).rstrip('/')
        image_urls = file_manager.get_scan_image_urls(scan_id, base_url)

        scan['results']['imageUrl'] = image_urls['imageUrl']
        scan['results']['annotatedImageUrl'] = image_urls['annotatedImageUrl']

        return scan

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching scan {scan_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch scan")


@router.get("/patient/{patient_id}/scans")
async def get_scans_for_patient(patient_id: str):
    """
    Get all scans for a patient

    Returns list of scan summaries
    """
    try:
        scans = get_patient_scans(patient_id)
        return {"scans": scans, "count": len(scans)}
    except Exception as e:
        logger.error(f"Error fetching scans for patient {patient_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch patient scans")


@router.get("")
async def get_all_scans_endpoint():
    """
    Get all scans (for doctors/admins)
    
    Returns list of scan summaries
    """
    try:
        scans = get_all_scans()
        return {"scans": scans, "count": len(scans)}
    except Exception as e:
        logger.error(f"Error fetching all scans: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch scans")


@router.delete("/{scan_id}", response_model=MessageOnlyResponse)
async def delete_scan_by_id(scan_id: str):
    """
    Delete a scan

    Removes scan record from database and deletes associated image files
    """
    try:
        # Check if scan exists
        scan = get_scan(scan_id)
        if not scan:
            raise HTTPException(status_code=404, detail=f"Scan not found: {scan_id}")

        # Delete from database (cascade deletes detections)
        delete_scan(scan_id)

        # Delete image files
        file_manager.delete_scan_files(scan_id)

        logger.info(f"✅ Scan deleted: {scan_id}")

        return MessageOnlyResponse(message=f"Scan {scan_id} deleted successfully")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting scan {scan_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete scan")


# ============================================================
# SCAN COMMENTS ENDPOINTS
# ============================================================

@router.post("/{scan_id}/comments", response_model=CommentResponse, status_code=201)
async def add_comment_to_scan(scan_id: str, comment: CommentCreate):
    """
    Add a comment to a scan

    Supports threaded comments via parent_comment_id
    """
    try:
        # Verify scan exists
        scan = get_scan(scan_id)
        if not scan:
            raise HTTPException(status_code=404, detail=f"Scan not found: {scan_id}")

        # Create comment
        comment_data = {
            'scan_id': scan_id,
            'user_id': comment.user_id,
            'user_role': comment.user_role.value,
            'user_name': comment.user_name,
            'comment_text': comment.comment_text,
            'parent_comment_id': comment.parent_comment_id
        }

        created_comment = create_scan_comment(comment_data)

        logger.info(f"✅ Comment added to scan {scan_id} by {comment.user_name}")

        return created_comment

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding comment to scan {scan_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to add comment")


@router.get("/{scan_id}/comments", response_model=List[CommentResponse])
async def get_scan_comments_list(scan_id: str):
    """
    Get all comments for a scan

    Returns comments in chronological order
    """
    try:
        comments = get_scan_comments(scan_id)
        return comments
    except Exception as e:
        logger.error(f"Error fetching comments for scan {scan_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch comments")


@router.put("/comment/{comment_id}", response_model=CommentResponse)
async def update_comment_text(comment_id: int, update: CommentUpdate):
    """
    Update a comment

    Only the comment text can be updated
    """
    try:
        updated_comment = update_scan_comment(comment_id, update.comment_text)

        if not updated_comment:
            raise HTTPException(status_code=404, detail=f"Comment not found: {comment_id}")

        logger.info(f"✅ Comment {comment_id} updated")

        return updated_comment

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating comment {comment_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update comment")


@router.delete("/comment/{comment_id}", response_model=MessageOnlyResponse)
async def delete_comment_by_id(comment_id: int):
    """
    Delete a comment

    Cascade deletes child comments if this is a parent comment
    """
    try:
        success = delete_scan_comment(comment_id)

        if not success:
            raise HTTPException(status_code=404, detail=f"Comment not found: {comment_id}")

        logger.info(f"✅ Comment {comment_id} deleted")

        return MessageOnlyResponse(message=f"Comment {comment_id} deleted successfully")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting comment {comment_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete comment")
