"""
File Manager Service for PneumAI
Handles filesystem operations for CT scan images
"""

from pathlib import Path
from typing import Optional, Tuple
import aiofiles
import logging
import os

from app.config import settings

logger = logging.getLogger(__name__)


class FileManager:
    """Manage file operations for scan images"""

    def __init__(self):
        """Initialize file manager with upload directories"""
        self.upload_dir = settings.UPLOAD_DIR
        self.originals_dir = settings.originals_dir
        self.annotated_dir = settings.annotated_dir
        self.thumbnails_dir = settings.thumbnails_dir

        # Ensure directories exist
        self._ensure_directories()

    def _ensure_directories(self):
        """Create upload directories if they don't exist"""
        for directory in [self.originals_dir, self.annotated_dir, self.thumbnails_dir]:
            directory.mkdir(parents=True, exist_ok=True)
            logger.debug(f"Ensured directory exists: {directory}")

    # ============================================================
    # PATH GENERATION
    # ============================================================

    def get_original_path(self, scan_id: str) -> Path:
        """
        Get file path for original scan image

        Args:
            scan_id: Scan ID

        Returns:
            Path object for original image
        """
        return self.originals_dir / f"{scan_id}.jpg"

    def get_annotated_path(self, scan_id: str) -> Path:
        """
        Get file path for annotated scan image

        Args:
            scan_id: Scan ID

        Returns:
            Path object for annotated image
        """
        return self.annotated_dir / f"{scan_id}_annotated.jpg"

    def get_thumbnail_path(self, scan_id: str) -> Path:
        """
        Get file path for thumbnail image

        Args:
            scan_id: Scan ID

        Returns:
            Path object for thumbnail
        """
        return self.thumbnails_dir / f"{scan_id}_thumb.jpg"

    def get_relative_path(self, absolute_path: Path) -> str:
        """
        Convert absolute path to relative path from upload directory

        Args:
            absolute_path: Absolute file path

        Returns:
            Relative path string (e.g., "originals/scan_123.jpg")
        """
        try:
            return str(absolute_path.relative_to(self.upload_dir))
        except ValueError:
            # If path is not relative to upload_dir, return as-is
            return str(absolute_path)

    # ============================================================
    # FILE OPERATIONS
    # ============================================================

    def save_image(self, image_bytes: bytes, file_path: Path) -> bool:
        """
        Save image bytes to file (synchronous)

        Args:
            image_bytes: Image data as bytes
            file_path: Destination file path

        Returns:
            True if successful, False otherwise
        """
        try:
            # Ensure parent directory exists
            file_path.parent.mkdir(parents=True, exist_ok=True)

            # Write file
            with open(file_path, 'wb') as f:
                f.write(image_bytes)

            logger.info(f"✅ Saved image: {file_path} ({len(image_bytes)} bytes)")
            return True

        except Exception as e:
            logger.error(f"❌ Failed to save image {file_path}: {e}")
            return False

    async def save_image_async(self, image_bytes: bytes, file_path: Path) -> bool:
        """
        Save image bytes to file (asynchronous)

        Args:
            image_bytes: Image data as bytes
            file_path: Destination file path

        Returns:
            True if successful, False otherwise
        """
        try:
            # Ensure parent directory exists
            file_path.parent.mkdir(parents=True, exist_ok=True)

            # Write file asynchronously
            async with aiofiles.open(file_path, 'wb') as f:
                await f.write(image_bytes)

            logger.info(f"✅ Saved image (async): {file_path} ({len(image_bytes)} bytes)")
            return True

        except Exception as e:
            logger.error(f"❌ Failed to save image {file_path}: {e}")
            return False

    def read_image(self, file_path: Path) -> Optional[bytes]:
        """
        Read image file to bytes (synchronous)

        Args:
            file_path: Source file path

        Returns:
            Image bytes or None if failed
        """
        try:
            if not file_path.exists():
                logger.warning(f"File not found: {file_path}")
                return None

            with open(file_path, 'rb') as f:
                image_bytes = f.read()

            logger.debug(f"Read image: {file_path} ({len(image_bytes)} bytes)")
            return image_bytes

        except Exception as e:
            logger.error(f"❌ Failed to read image {file_path}: {e}")
            return None

    async def read_image_async(self, file_path: Path) -> Optional[bytes]:
        """
        Read image file to bytes (asynchronous)

        Args:
            file_path: Source file path

        Returns:
            Image bytes or None if failed
        """
        try:
            if not file_path.exists():
                logger.warning(f"File not found: {file_path}")
                return None

            async with aiofiles.open(file_path, 'rb') as f:
                image_bytes = await f.read()

            logger.debug(f"Read image (async): {file_path} ({len(image_bytes)} bytes)")
            return image_bytes

        except Exception as e:
            logger.error(f"❌ Failed to read image {file_path}: {e}")
            return None

    def delete_file(self, file_path: Path) -> bool:
        """
        Delete a file

        Args:
            file_path: File to delete

        Returns:
            True if successful, False otherwise
        """
        try:
            if file_path.exists():
                file_path.unlink()
                logger.info(f"✅ Deleted file: {file_path}")
                return True
            else:
                logger.warning(f"File not found for deletion: {file_path}")
                return False

        except Exception as e:
            logger.error(f"❌ Failed to delete file {file_path}: {e}")
            return False

    def file_exists(self, file_path: Path) -> bool:
        """
        Check if file exists

        Args:
            file_path: File path to check

        Returns:
            True if file exists, False otherwise
        """
        return file_path.exists() and file_path.is_file()

    def get_file_size(self, file_path: Path) -> int:
        """
        Get file size in bytes

        Args:
            file_path: File path

        Returns:
            File size in bytes, or 0 if file doesn't exist
        """
        try:
            if file_path.exists():
                return file_path.stat().st_size
            return 0
        except Exception as e:
            logger.error(f"Error getting file size for {file_path}: {e}")
            return 0

    # ============================================================
    # SCAN OPERATIONS
    # ============================================================

    def save_scan_images(self, scan_id: str, original_bytes: bytes, annotated_bytes: bytes) -> Tuple[str, str]:
        """
        Save both original and annotated images for a scan

        Args:
            scan_id: Scan ID
            original_bytes: Original image bytes
            annotated_bytes: Annotated image bytes

        Returns:
            Tuple of (original_path, annotated_path) as relative strings
        """
        original_path = self.get_original_path(scan_id)
        annotated_path = self.get_annotated_path(scan_id)

        # Save both images
        self.save_image(original_bytes, original_path)
        self.save_image(annotated_bytes, annotated_path)

        # Return relative paths for database storage
        return (
            self.get_relative_path(original_path),
            self.get_relative_path(annotated_path)
        )

    def delete_scan_files(self, scan_id: str) -> bool:
        """
        Delete all files associated with a scan

        Args:
            scan_id: Scan ID

        Returns:
            True if at least one file was deleted
        """
        paths = [
            self.get_original_path(scan_id),
            self.get_annotated_path(scan_id),
            self.get_thumbnail_path(scan_id)
        ]

        deleted_count = 0
        for path in paths:
            if self.delete_file(path):
                deleted_count += 1

        logger.info(f"Deleted {deleted_count} files for scan {scan_id}")
        return deleted_count > 0

    def get_scan_image_urls(self, scan_id: str, base_url: str = "") -> dict:
        """
        Get URLs for scan images

        Args:
            scan_id: Scan ID
            base_url: Base URL for the API (optional)

        Returns:
            Dictionary with image URLs
        """
        original_path = self.get_relative_path(self.get_original_path(scan_id))
        annotated_path = self.get_relative_path(self.get_annotated_path(scan_id))

        return {
            "imageUrl": f"{base_url}/uploads/{original_path}",
            "annotatedImageUrl": f"{base_url}/uploads/{annotated_path}"
        }

    # ============================================================
    # STORAGE INFO
    # ============================================================

    def get_storage_info(self) -> dict:
        """
        Get storage usage information

        Returns:
            Dictionary with storage stats
        """
        def count_files_and_size(directory: Path) -> Tuple[int, int]:
            """Count files and total size in a directory"""
            if not directory.exists():
                return 0, 0

            count = 0
            total_size = 0
            for file in directory.iterdir():
                if file.is_file():
                    count += 1
                    total_size += file.stat().st_size
            return count, total_size

        orig_count, orig_size = count_files_and_size(self.originals_dir)
        anno_count, anno_size = count_files_and_size(self.annotated_dir)
        thumb_count, thumb_size = count_files_and_size(self.thumbnails_dir)

        return {
            "originals": {"count": orig_count, "size_bytes": orig_size},
            "annotated": {"count": anno_count, "size_bytes": anno_size},
            "thumbnails": {"count": thumb_count, "size_bytes": thumb_size},
            "total": {
                "count": orig_count + anno_count + thumb_count,
                "size_bytes": orig_size + anno_size + thumb_size
            }
        }


# Global file manager instance
file_manager = FileManager()
