"""
YOLO Service for PneumAI
YOLOv12 ONNX model inference for lung cancer detection
Optimized for Railway deployment with ONNX Runtime (1.5 GB vs 8.2 GB)
"""

import numpy as np
from typing import List, Dict, Optional, Tuple
import logging
import os
import cv2
import onnxruntime as ort

from app.config import settings
from app.utils.helpers import calculate_risk_level

logger = logging.getLogger(__name__)


class YOLOService:
    """YOLO ONNX model service for lung cancer detection"""

    def __init__(self):
        """Initialize YOLO ONNX service"""
        self.session: Optional[ort.InferenceSession] = None
        self.model_loaded = False
        self.model_path = str(settings.MODEL_PATH)
        self.confidence_threshold = settings.YOLO_CONFIDENCE_THRESHOLD
        self.input_size = 640  # Standard YOLO input size
        self.class_names = {}  # Will be populated from model metadata

    def load_model(self) -> bool:
        """
        Load the YOLOv12 ONNX model from file

        Returns:
            True if model loaded successfully, False otherwise
        """
        try:
            if not os.path.exists(self.model_path):
                logger.error(f"❌ Model file not found: {self.model_path}")
                logger.error(f"Current directory: {os.getcwd()}")
                return False

            logger.info(f"Loading YOLO ONNX model from {self.model_path}...")

            # Create ONNX Runtime session with optimizations
            sess_options = ort.SessionOptions()
            sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL

            self.session = ort.InferenceSession(
                self.model_path,
                sess_options=sess_options,
                providers=['CPUExecutionProvider']  # Use CPU for Railway deployment
            )

            # Extract class names from model metadata if available
            metadata = self.session.get_modelmeta()
            if metadata and hasattr(metadata, 'custom_metadata_map'):
                custom_meta = metadata.custom_metadata_map
                if 'names' in custom_meta:
                    # Parse names from metadata (format: "{0: 'class1', 1: 'class2', ...}")
                    try:
                        import json
                        # Try standard JSON first
                        self.class_names = json.loads(custom_meta['names'])
                    except:
                        try:
                            # Fallback for Python dict string format (common in YOLO exports)
                            import ast
                            self.class_names = ast.literal_eval(custom_meta['names'])
                        except Exception as e:
                            logger.warning(f"Could not parse class names from metadata: {e}")
                            self.class_names = {}

            # Fallback class names if not in metadata
            if not self.class_names:
                self.class_names = {
                    0: "normal",
                    1: "benign",
                    2: "malignant",
                    3: "nodule",
                    4: "mass",
                    5: "suspicious"
                }

            self.model_loaded = True
            logger.info("✅ YOLO ONNX model loaded successfully!")
            logger.info(f"Model input: {self.session.get_inputs()[0].name}, shape: {self.session.get_inputs()[0].shape}")
            logger.info(f"Model output: {self.session.get_outputs()[0].name}, shape: {self.session.get_outputs()[0].shape}")
            return True

        except Exception as e:
            logger.error(f"❌ Error loading YOLO ONNX model: {e}")
            import traceback
            traceback.print_exc()
            self.model_loaded = False
            return False

    def is_loaded(self) -> bool:
        """
        Check if model is loaded

        Returns:
            True if model is loaded, False otherwise
        """
        return self.model_loaded and self.session is not None

    def _preprocess_image(self, image: np.ndarray) -> Tuple[np.ndarray, float, Tuple[int, int]]:
        """
        Preprocess image for YOLO ONNX inference

        Args:
            image: Input image as numpy array (BGR format from OpenCV)

        Returns:
            Tuple of (preprocessed_image, scale_factor, original_shape)
        """
        original_height, original_width = image.shape[:2]

        # Resize image while maintaining aspect ratio
        scale = min(self.input_size / original_width, self.input_size / original_height)
        new_width = int(original_width * scale)
        new_height = int(original_height * scale)

        resized = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_LINEAR)

        # Create padded image
        padded = np.full((self.input_size, self.input_size, 3), 114, dtype=np.uint8)
        padded[:new_height, :new_width] = resized

        # Convert BGR to RGB
        rgb_image = cv2.cvtColor(padded, cv2.COLOR_BGR2RGB)

        # Normalize and transpose to CHW format
        input_tensor = rgb_image.astype(np.float32) / 255.0
        input_tensor = np.transpose(input_tensor, (2, 0, 1))  # HWC to CHW
        input_tensor = np.expand_dims(input_tensor, 0)  # Add batch dimension

        return input_tensor, scale, (original_width, original_height)

    def _postprocess_detections(self, output: np.ndarray, scale: float, original_shape: Tuple[int, int]) -> List[Dict]:
        """
        Postprocess YOLO ONNX output to extract detections

        Args:
            output: Raw model output
            scale: Scale factor used during preprocessing
            original_shape: Original image shape (width, height)

        Returns:
            List of detection dictionaries
        """
        detections = []
        original_width, original_height = original_shape

        # YOLO output format: [batch, num_classes + 4, num_predictions]
        # Need to transpose to [batch, num_predictions, num_classes + 4]
        if len(output.shape) == 3:
            output = np.transpose(output[0], (1, 0))  # [8400, num_classes + 4]

        # Extract boxes and class scores
        boxes = output[:, :4]  # [x_center, y_center, width, height]
        class_scores = output[:, 4:]  # class probabilities

        # Get class IDs and confidences
        class_ids = np.argmax(class_scores, axis=1)
        confidences = np.max(class_scores, axis=1)

        # Filter by confidence threshold
        mask = confidences >= self.confidence_threshold
        boxes = boxes[mask]
        class_ids = class_ids[mask]
        confidences = confidences[mask]

        # Convert boxes from [x_center, y_center, w, h] to [x1, y1, x2, y2]
        boxes[:, 0] = boxes[:, 0] - boxes[:, 2] / 2  # x1
        boxes[:, 1] = boxes[:, 1] - boxes[:, 3] / 2  # y1
        boxes[:, 2] = boxes[:, 0] + boxes[:, 2]      # x2
        boxes[:, 3] = boxes[:, 1] + boxes[:, 3]      # y2

        # Scale boxes back to original image size
        boxes /= scale

        # Apply NMS (Non-Maximum Suppression)
        indices = cv2.dnn.NMSBoxes(
            boxes.tolist(),
            confidences.tolist(),
            self.confidence_threshold,
            0.45  # NMS threshold
        )

        if len(indices) > 0:
            for idx in indices.flatten():
                x1, y1, x2, y2 = boxes[idx]
                cls_id = int(class_ids[idx])
                confidence = float(confidences[idx])
                class_name = self.class_names.get(cls_id, f"class_{cls_id}")

                # Calculate approximate size in mm
                pixel_width = float(x2 - x1)
                pixel_height = float(y2 - y1)
                avg_size_px = (pixel_width + pixel_height) / 2
                size_mm = float(avg_size_px * 0.5)  # Rough conversion factor

                # Determine shape based on aspect ratio
                aspect_ratio = float(pixel_width / pixel_height if pixel_height > 0 else 1.0)
                if 0.8 <= aspect_ratio <= 1.2:
                    shape = "round"
                elif aspect_ratio > 1.2:
                    shape = "oval"
                else:
                    shape = "irregular"

                detections.append({
                    "class": class_name,
                    "confidence": round(confidence, 3),
                    "boundingBox": {
                        "x": int(max(0, x1)),
                        "y": int(max(0, y1)),
                        "width": int(min(original_width, x2) - max(0, x1)),
                        "height": int(min(original_height, y2) - max(0, y1))
                    },
                    "characteristics": {
                        "size_mm": round(size_mm, 1),
                        "shape": shape,
                        "density": "solid"
                    }
                })

        return detections

    def analyze(self, image: np.ndarray) -> Dict:
        """
        Process CT scan image with YOLOv12 ONNX model

        Args:
            image: Input image as numpy array (BGR format from OpenCV)

        Returns:
            Dictionary with detection results
        """
        if not self.is_loaded():
            raise Exception("YOLO model not loaded. Call load_model() first.")

        try:
            # Get image dimensions
            height, width = image.shape[:2]

            # Preprocess image
            input_tensor, scale, original_shape = self._preprocess_image(image)

            # Run ONNX inference
            input_name = self.session.get_inputs()[0].name
            output_name = self.session.get_outputs()[0].name
            outputs = self.session.run([output_name], {input_name: input_tensor})

            # Postprocess detections
            detections = self._postprocess_detections(outputs[0], scale, original_shape)

            # Determine top class and confidence
            max_confidence = 0.0
            top_class = "normal"

            if len(detections) > 0:
                # Find detection with highest confidence
                top_detection = max(detections, key=lambda x: x["confidence"])
                max_confidence = top_detection["confidence"]
                top_class = top_detection["class"]
            else:
                # No detections - classify as normal
                max_confidence = 0.5  # Lower confidence for normal classification

            detected = top_class != "normal"

            # Calculate risk level using helper function
            risk_level = calculate_risk_level(max_confidence, detected)

            return {
                "detected": detected,
                "confidence": float(max_confidence),
                "topClass": top_class,
                "riskLevel": risk_level,
                "detections": detections,
                "imageSize": {"width": int(width), "height": int(height)}
            }

        except Exception as e:
            logger.error(f"❌ Error during YOLO ONNX inference: {e}")
            import traceback
            traceback.print_exc()
            raise Exception(f"Model inference error: {str(e)}")

    def get_model_info(self) -> Dict:
        """
        Get information about the loaded ONNX model

        Returns:
            Dictionary with model information
        """
        if not self.is_loaded():
            return {
                "loaded": False,
                "model_path": str(self.model_path),
                "confidence_threshold": self.confidence_threshold,
                "format": "ONNX"
            }

        return {
            "loaded": True,
            "model_path": str(self.model_path),
            "confidence_threshold": self.confidence_threshold,
            "classes": self.class_names,
            "num_classes": len(self.class_names),
            "format": "ONNX",
            "input_size": self.input_size,
            "providers": self.session.get_providers() if self.session else []
        }


# Global YOLO service instance
yolo_service = YOLOService()
