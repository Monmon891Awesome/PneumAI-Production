"""
Image Service for PneumAI
Image processing, DICOM handling, and annotation creation
"""

import cv2
import numpy as np
from PIL import Image
import io
import pydicom
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)


class ImageService:
    """Service for image processing operations"""

    @staticmethod
    def read_image(file_bytes: bytes, filename: str) -> np.ndarray:
        """
        Read uploaded image file into numpy array
        Supports DICOM, JPEG, PNG, and other standard formats

        Args:
            file_bytes: Image file as bytes
            filename: Original filename

        Returns:
            Image as numpy array (BGR format)

        Raises:
            ValueError: If image format is not supported or cannot be decoded
        """
        try:
            logger.info(f"Reading image: {filename}, size: {len(file_bytes)} bytes")

            # Check if it's a DICOM file
            if filename.lower().endswith('.dcm') or filename.lower().endswith('.dicom'):
                return ImageService._read_dicom(file_bytes)

            # Try PIL for standard image formats
            try:
                pil_image = Image.open(io.BytesIO(file_bytes))
                logger.info(f"PIL opened image, mode: {pil_image.mode}, size: {pil_image.size}")

                # Convert to RGB if needed
                if pil_image.mode not in ('RGB', 'L'):
                    pil_image = pil_image.convert('RGB')

                # Convert to numpy array
                image = np.array(pil_image)
                logger.info(f"Image shape after PIL: {image.shape}")

                # Convert RGB to BGR for OpenCV compatibility
                if len(image.shape) == 3 and image.shape[2] == 3:
                    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
                elif len(image.shape) == 2:
                    # Grayscale to BGR
                    image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)

                return image

            except Exception as pil_error:
                logger.warning(f"PIL failed: {pil_error}, trying OpenCV...")

                # Fallback to OpenCV
                nparr = np.frombuffer(file_bytes, np.uint8)
                image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

                if image is None:
                    raise ValueError("All decoders failed - unsupported file format")

                return image

        except Exception as e:
            logger.error(f"❌ Error reading image: {e}")
            import traceback
            traceback.print_exc()
            raise ValueError(f"Invalid image file: {str(e)}")

    @staticmethod
    def _read_dicom(file_bytes: bytes) -> np.ndarray:
        """
        Read DICOM file and convert to numpy array

        Args:
            file_bytes: DICOM file as bytes

        Returns:
            Image as numpy array (BGR format)

        Raises:
            ValueError: If DICOM file cannot be parsed
        """
        try:
            logger.info("Detected DICOM file, parsing...")
            dicom_data = pydicom.dcmread(io.BytesIO(file_bytes))

            # Get pixel data
            pixel_array = dicom_data.pixel_array.astype(np.float32)
            logger.info(f"DICOM pixel array shape: {pixel_array.shape}, dtype: {pixel_array.dtype}")

            # Apply windowing if available
            try:
                if hasattr(dicom_data, 'WindowCenter') and hasattr(dicom_data, 'WindowWidth'):
                    window_center = dicom_data.WindowCenter
                    window_width = dicom_data.WindowWidth

                    # Handle MultiValue - take first element if it's a list
                    if isinstance(window_center, (list, tuple)):
                        window_center = window_center[0]
                    if isinstance(window_width, (list, tuple)):
                        window_width = window_width[0]

                    center = float(window_center)
                    width = float(window_width)
                    lower = center - width / 2
                    upper = center + width / 2
                    pixel_array = np.clip(pixel_array, lower, upper)
                    logger.info(f"Applied windowing: center={center}, width={width}")
            except Exception as window_error:
                logger.warning(f"Window level not applied: {window_error}")

            # Normalize to 0-255
            pixel_min = pixel_array.min()
            pixel_max = pixel_array.max()
            logger.info(f"Pixel range before normalization: {pixel_min}-{pixel_max}")

            if pixel_max > pixel_min:
                pixel_array = ((pixel_array - pixel_min) / (pixel_max - pixel_min) * 255).astype(np.uint8)
            else:
                pixel_array = np.zeros_like(pixel_array).astype(np.uint8)

            logger.info(f"Normalized to 8-bit: {pixel_array.min()}-{pixel_array.max()}")

            # Convert grayscale to BGR for consistency
            if len(pixel_array.shape) == 2:
                image = cv2.cvtColor(pixel_array, cv2.COLOR_GRAY2BGR)
            else:
                image = pixel_array

            logger.info(f"Final image shape: {image.shape}")
            return image

        except Exception as dicom_error:
            logger.error(f"❌ DICOM parsing failed: {dicom_error}")
            import traceback
            traceback.print_exc()
            raise ValueError(f"Failed to parse DICOM file: {str(dicom_error)}")

    @staticmethod
    def create_annotated_image(image: np.ndarray, detections: List[Dict]) -> bytes:
        """
        Create annotated image with YOLO boxes, edge detection, contour analysis, and legend

        Args:
            image: Original image as numpy array (BGR)
            detections: List of detection dictionaries from YOLO

        Returns:
            Annotated image as JPEG bytes
        """
        annotated = image.copy()
        height, width = annotated.shape[:2]

        # Define colors (BGR format)
        yolo_color = (0, 0, 255)      # Red for YOLO detections
        edge_color = (255, 255, 0)    # Cyan for edge detection
        contour_color = (128, 0, 128) # Purple for contour analysis

        # Step 1: Edge Detection (Canny algorithm)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, threshold1=50, threshold2=150)

        # Create edge overlay (cyan pixels where edges detected)
        edge_overlay = np.zeros_like(annotated)
        edge_overlay[edges > 0] = edge_color
        annotated = cv2.addWeighted(annotated, 0.85, edge_overlay, 0.15, 0)

        # Step 2: Contour Analysis
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 100:  # Filter small noise contours
                # Draw purple contours
                cv2.drawContours(annotated, [contour], -1, contour_color, 1)

        # Step 3: YOLO Bounding Boxes
        for det in detections:
            bbox = det.get("boundingBox", {})
            x = int(bbox.get("x", 0))
            y = int(bbox.get("y", 0))
            w = int(bbox.get("width", 0))
            h = int(bbox.get("height", 0))
            class_name = det.get("class", "unknown")
            confidence = det.get("confidence", 0.0)

            # Draw red YOLO box
            cv2.rectangle(annotated, (x, y), (x + w, y + h), yolo_color, 2)

            # Add label with confidence
            label = f"{class_name.replace('_', ' ').title()}: {confidence*100:.1f}%"
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = 0.5
            font_thickness = 1
            (label_width, label_height), baseline = cv2.getTextSize(label, font, font_scale, font_thickness)

            label_y = y - 10 if y > 30 else y + h + 20
            padding = 4
            cv2.rectangle(annotated,
                         (x, label_y - label_height - padding),
                         (x + label_width + padding * 2, label_y + padding),
                         (0, 0, 0), -1)
            cv2.putText(annotated, label, (x + padding, label_y),
                       font, font_scale, (255, 255, 255), font_thickness)

        # Step 4: Add Legend at Bottom
        legend_height = 50
        legend = np.ones((legend_height, width, 3), dtype=np.uint8) * 240  # Light gray background

        # Legend text
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.45
        font_thickness = 1
        y_offset = 30

        # Red box indicator
        cv2.rectangle(legend, (20, 15), (40, 35), yolo_color, -1)
        cv2.putText(legend, "Detection", (50, y_offset), font, font_scale, (0, 0, 0), font_thickness)

        # Cyan edge indicator
        cv2.rectangle(legend, (int(width * 0.33), 15), (int(width * 0.33) + 20, 35), edge_color, -1)
        cv2.putText(legend, "Edges", (int(width * 0.33) + 30, y_offset), font, font_scale, (0, 0, 0), font_thickness)

        # Purple contour indicator
        cv2.rectangle(legend, (int(width * 0.66), 15), (int(width * 0.66) + 20, 35), contour_color, -1)
        cv2.putText(legend, "Contours", (int(width * 0.66) + 30, y_offset), font, font_scale, (0, 0, 0), font_thickness)

        # Combine image and legend
        annotated_with_legend = np.vstack([annotated, legend])

        # Encode as JPEG
        success, encoded_image = cv2.imencode('.jpg', annotated_with_legend, [cv2.IMWRITE_JPEG_QUALITY, 95])
        if not success:
            raise Exception("Failed to encode annotated image")

        return encoded_image.tobytes()

    @staticmethod
    def encode_image_to_jpeg(image: np.ndarray, quality: int = 95) -> bytes:
        """
        Encode numpy array image to JPEG bytes

        Args:
            image: Image as numpy array
            quality: JPEG quality (0-100)

        Returns:
            Image as JPEG bytes
        """
        success, encoded_image = cv2.imencode('.jpg', image, [cv2.IMWRITE_JPEG_QUALITY, quality])
        if not success:
            raise Exception("Failed to encode image to JPEG")
        return encoded_image.tobytes()

    @staticmethod
    def decode_image_from_bytes(image_bytes: bytes) -> np.ndarray:
        """
        Decode image bytes to numpy array

        Args:
            image_bytes: Image as bytes

        Returns:
            Image as numpy array
        """
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if image is None:
            raise ValueError("Failed to decode image bytes")
        return image

    @staticmethod
    def resize_image(image: np.ndarray, max_width: int = 1024, max_height: int = 1024) -> np.ndarray:
        """
        Resize image while maintaining aspect ratio

        Args:
            image: Image as numpy array
            max_width: Maximum width
            max_height: Maximum height

        Returns:
            Resized image
        """
        height, width = image.shape[:2]

        # Calculate scaling factor
        scale = min(max_width / width, max_height / height, 1.0)

        if scale < 1.0:
            new_width = int(width * scale)
            new_height = int(height * scale)
            resized = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
            logger.info(f"Resized image from {width}x{height} to {new_width}x{new_height}")
            return resized

        return image

    @staticmethod
    def create_thumbnail(image: np.ndarray, size: tuple = (200, 200)) -> bytes:
        """
        Create thumbnail of image

        Args:
            image: Image as numpy array
            size: Thumbnail size (width, height)

        Returns:
            Thumbnail as JPEG bytes
        """
        thumbnail = cv2.resize(image, size, interpolation=cv2.INTER_AREA)
        return ImageService.encode_image_to_jpeg(thumbnail, quality=85)


# Global image service instance
image_service = ImageService()
