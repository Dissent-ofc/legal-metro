"""
FastAPI Backend Application for Legal Metrology Compliance Checker
SIH Problem Statement 26034 (Ministry of Consumer Affairs - DoCA)
Supports real camera/label photo uploads, Barcode/QR detection & Deep Learning OCR.
"""

import os
import uuid
import shutil
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, FileResponse
from fastapi.staticfiles import StaticFiles
from typing import Optional
from PIL import Image

from rule_engine import evaluate_compliance
from field_classifier import classify_ocr_blocks
from ocr_engine import run_ocr_on_image
from barcode_engine import detect_barcodes
from sample_data import SAMPLES
from pdf_exporter import generate_pdf_report

app = FastAPI(
    title="Legal Metrology Compliance Checker API",
    description="Automated compliance checking under Legal Metrology (Packaged Commodities) Rules, 2011",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SAMPLE_IMAGES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "sample_images"))
UPLOADS_DIR = os.path.join(SAMPLE_IMAGES_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

if os.path.exists(SAMPLE_IMAGES_DIR):
    app.mount("/sample_images", StaticFiles(directory=SAMPLE_IMAGES_DIR), name="sample_images")


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Legal Metrology Compliance Engine 2.0",
        "act": "Legal Metrology Act, 2009",
        "rules": "Legal Metrology (Packaged Commodities) Rules, 2011",
        "features": ["DeepLearning_OCR", "Barcode_QR_Scanner", "Rule6_Declarations", "Rule9_Prominence"]
    }


@app.get("/api/samples")
def get_samples():
    return {
        "samples": [
            {
                "id": s["id"],
                "name": s["name"],
                "category": s["category"],
                "description": s["description"],
                "image_url": f"/sample_images/{s['image_filename']}",
                "expected_verdict": s["expected_verdict"],
                "image_width": 700,
                "image_height": 360
            }
            for s in SAMPLES
        ]
    }


@app.post("/api/scan")
async def scan_package(
    file: Optional[UploadFile] = File(None),
    sample_id: Optional[str] = Form(None)
):
    # Case 1: Pre-loaded benchmark sample selected
    if sample_id:
        sample = next((s for s in SAMPLES if s["id"] == sample_id), None)
        if not sample:
            raise HTTPException(status_code=404, detail="Sample package not found")
            
        sample_img_path = os.path.join(SAMPLE_IMAGES_DIR, sample["image_filename"])
        barcodes = []
        if os.path.exists(sample_img_path):
            with open(sample_img_path, "rb") as f:
                img_bytes = f.read()
                barcodes = detect_barcodes(img_bytes)

        ocr_blocks = sample["ocr_blocks"]
        classified_fields = classify_ocr_blocks(ocr_blocks)
        compliance_results = evaluate_compliance(classified_fields, ocr_blocks)
        
        return {
            "source": "sample",
            "sample_id": sample["id"],
            "product_name": sample["name"],
            "category": sample["category"],
            "image_url": f"/sample_images/{sample['image_filename']}",
            "image_width": 700,
            "image_height": 360,
            "ocr_blocks": ocr_blocks,
            "barcodes": barcodes,
            "classified_fields": classified_fields,
            **compliance_results
        }
        
    # Case 2: Real Custom Image Upload
    if not file:
        raise HTTPException(status_code=400, detail="No image file or sample ID provided")
        
    contents = await file.read()
    
    # Save uploaded file
    file_ext = os.path.splitext(file.filename)[1] or ".jpg"
    unique_filename = f"upload_{uuid.uuid4().hex[:10]}{file_ext}"
    saved_path = os.path.join(UPLOADS_DIR, unique_filename)
    with open(saved_path, "wb") as f:
        f.write(contents)

    # 1. OCR text layout & bbox extraction
    ocr_blocks, img_w, img_h = run_ocr_on_image(contents)

    # 2. Barcode & QR code detection
    barcodes = detect_barcodes(contents)

    # 3. Field Classification
    classified_fields = classify_ocr_blocks(ocr_blocks)

    # 4. 7-Rule Compliance Evaluation
    compliance_results = evaluate_compliance(classified_fields, ocr_blocks)
    
    clean_name = file.filename.rsplit('.', 1)[0].replace('_', ' ').replace('-', ' ').title()
    
    return {
        "source": "upload",
        "filename": file.filename,
        "product_name": clean_name,
        "category": "Custom Uploaded Commodity",
        "image_url": f"/sample_images/uploads/{unique_filename}",
        "image_width": img_w,
        "image_height": img_h,
        "ocr_blocks": ocr_blocks,
        "barcodes": barcodes,
        "classified_fields": classified_fields,
        **compliance_results
    }


@app.post("/api/export-pdf")
async def export_pdf(payload: dict):
    try:
        pdf_bytes = generate_pdf_report(payload)
        filename_clean = payload.get('product_name', 'Inspection_Report').replace(' ', '_')
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=Legal_Metrology_Inspection_{filename_clean}.pdf",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache"
            }
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"PDF Generation failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)