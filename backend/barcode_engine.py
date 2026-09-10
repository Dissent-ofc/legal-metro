"""
Barcode & QR Code Detection Engine for Packaged Commodities
Detects EAN-13, EAN-8, UPC, Code 128, QR Codes and validates GS1 prefix.
"""

import io
import cv2
import numpy as np
from PIL import Image
from typing import List, Dict, Any

try:
    import zxingcpp
    ZXING_AVAILABLE = True
except ImportError:
    ZXING_AVAILABLE = False


def detect_barcodes(image_bytes: bytes) -> List[Dict[str, Any]]:
    """
    Detects all 1D/2D barcodes in an image.
    Returns list of { type, data, bbox: [x, y, w, h], is_gs1_india, is_valid }
    """
    barcodes = []
    
    # Convert bytes to numpy image
    nparr = np.frombuffer(image_bytes, np.uint8)
    img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img_cv is None:
        return []
        
    img_h, img_w = img_cv.shape[:2]

    # Method 1: zxingcpp (fast & highly accurate for multi-angle/distorted barcodes)
    if ZXING_AVAILABLE:
        try:
            results = zxingcpp.read_barcodes(img_cv)
            for res in results:
                pos = res.position
                # pos has top_left, top_right, bottom_right, bottom_left
                pts = [
                    (pos.top_left.x, pos.top_left.y),
                    (pos.top_right.x, pos.top_right.y),
                    (pos.bottom_right.x, pos.bottom_right.y),
                    (pos.bottom_left.x, pos.bottom_left.y)
                ]
                xs = [p[0] for p in pts]
                ys = [p[1] for p in pts]
                x = max(0, min(xs))
                y = max(0, min(ys))
                w = min(img_w - x, max(xs) - x)
                h = min(img_h - y, max(ys) - y)

                data_str = res.text
                fmt_str = str(res.format).replace("BarcodeFormat.", "")
                
                # Check GS1 India prefix (890 is India GS1 prefix)
                is_india = data_str.startswith("890") if data_str else False
                
                barcodes.append({
                    "type": fmt_str,
                    "data": data_str,
                    "bbox": [int(x), int(y), int(w), int(h)],
                    "is_gs1_india": is_india,
                    "country_origin": "India (GS1 Prefix 890)" if is_india else "International / Standard GTIN",
                    "confidence": 0.99
                })
        except Exception as e:
            print(f"zxingcpp barcode detection warning: {e}")

    # Method 2: OpenCV Barcode Detector fallback
    if not barcodes:
        try:
            detector = cv2.barcode_BarcodeDetector()
            ret = detector.detectAndDecode(img_cv)
            if len(ret) == 4:
                ok, decoded_info, decoded_type, corners = ret
            elif len(ret) == 3:
                decoded_info, decoded_type, corners = ret
                ok = bool(decoded_info)
            else:
                ok, decoded_info = False, []
            if ok and decoded_info:
                for data_str, fmt_str, corner in zip(decoded_info, decoded_type, corners):
                    if data_str:
                        pts = corner.astype(int)
                        x, y, w, h = cv2.boundingRect(pts)
                        is_india = data_str.startswith("890")
                        barcodes.append({
                            "type": fmt_str or "1D_BARCODE",
                            "data": data_str,
                            "bbox": [int(x), int(y), int(w), int(h)],
                            "is_gs1_india": is_india,
                            "country_origin": "India (GS1 Prefix 890)" if is_india else "International / Standard GTIN",
                            "confidence": 0.95
                        })
        except Exception as e:
            print(f"OpenCV barcode detector fallback warning: {e}")

    # Method 3: OpenCV QR Code Detector fallback
    if not any(b["type"] in ["QRCode", "QR_CODE"] for b in barcodes):
        try:
            qr_detector = cv2.QRCodeDetector()
            data, pts, _ = qr_detector.detectAndDecode(img_cv)
            if data and pts is not None:
                pts = pts.reshape(-1, 2).astype(int)
                x, y, w, h = cv2.boundingRect(pts)
                barcodes.append({
                    "type": "QR_CODE",
                    "data": data,
                    "bbox": [int(x), int(y), int(w), int(h)],
                    "is_gs1_india": False,
                    "country_origin": "Digital QR Verification / URL",
                    "confidence": 0.98
                })
        except Exception as e:
            print(f"OpenCV QR fallback warning: {e}")

    return barcodes