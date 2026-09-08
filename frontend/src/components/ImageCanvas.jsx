import React, { useRef, useState, useEffect } from 'react';
import { Upload, Layers, ZoomIn, ZoomOut, RotateCcw, Crosshair, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ImageCanvas({ 
  imageUrl, 
  imageWidth,
  imageHeight,
  ocrBlocks, 
  barcodes,
  highlightedField, 
  onBlockClick,
  onUploadImage,
  loading
}) {
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);
  const [hoveredBlock, setHoveredBlock] = useState(null);
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 700, h: 360 });
  const [showOcrBoxes, setShowOcrBoxes] = useState(true);
  const [showBarcodeBoxes, setShowBarcodeBoxes] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (imageWidth && imageHeight) {
      setImgNaturalSize({ w: imageWidth, h: imageHeight });
    }
  }, [imageWidth, imageHeight]);

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth && naturalHeight) {
      setImgNaturalSize({ w: naturalWidth, h: naturalHeight });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUploadImage(e.dataTransfer.files[0]);
    }
  };

  const viewW = imgNaturalSize.w || 700;
  const viewH = imgNaturalSize.h || 360;

  return (
    <div className="enterprise-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Canvas Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Crosshair size={18} color="#38bdf8" />
          <span style={{ fontWeight: 700, fontSize: '0.94rem', color: '#f1f5f9' }}>
            Optical Inspection Viewport ({viewW} × {viewH}px)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Layer toggles */}
          <button 
            className="action-btn btn-dark" 
            style={{ padding: '5px 9px', fontSize: '0.74rem', background: showOcrBoxes ? 'rgba(56, 189, 248, 0.15)' : 'transparent' }}
            onClick={() => setShowOcrBoxes(!showOcrBoxes)}
            title="Toggle OCR Text Bounding Boxes"
          >
            <Layers size={13} />
            OCR ({ocrBlocks?.length || 0})
          </button>

          {barcodes && barcodes.length > 0 && (
            <button 
              className="action-btn btn-dark" 
              style={{ padding: '5px 9px', fontSize: '0.74rem', background: showBarcodeBoxes ? 'rgba(168, 85, 247, 0.2)' : 'transparent', color: '#c084fc' }}
              onClick={() => setShowBarcodeBoxes(!showBarcodeBoxes)}
              title="Toggle Barcode Bounding Boxes"
            >
              Barcodes ({barcodes.length})
            </button>
          )}

          {/* Upload Button */}
          <button 
            className="action-btn btn-cyan"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            <Upload size={14} />
            Upload Product Image
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && onUploadImage(e.target.files[0])}
          />
        </div>
      </div>

      {/* Main Image Viewport Area */}
      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        style={{
          flex: 1,
          minHeight: '420px',
          background: '#040711',
          borderRadius: '10px',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: '12px'
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', color: '#38bdf8' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(56, 189, 248, 0.2)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 14px' }} />
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Running Deep Learning OCR & Barcode Extraction...</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>Detecting bounding boxes & checking Legal Metrology Rules 2011</div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : imageUrl ? (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', maxHeight: '440px', transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.15s ease' }}>
              <img 
                ref={imgRef}
                src={imageUrl} 
                alt="Packaged Commodity Inspection" 
                onLoad={handleImageLoad}
                style={{
                  maxWidth: '100%',
                  maxHeight: '440px',
                  borderRadius: '6px',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />

              {/* Exact Coordinate SVG Overlay */}
              <svg
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'auto'
                }}
                viewBox={`0 0 ${viewW} ${viewH}`}
                preserveAspectRatio="none"
              >
                {/* 1. OCR Text Bounding Boxes */}
                {showOcrBoxes && ocrBlocks?.map((block, idx) => {
                  if (!block.bbox || block.bbox.length < 4) return null;
                  const [x, y, w, h] = block.bbox;
                  
                  const isHovered = hoveredBlock?.text === block.text;
                  const isHighlight = highlightedField && block.text.toLowerCase().includes(highlightedField.toLowerCase().slice(0, 10));
                  
                  let stroke = 'rgba(56, 189, 248, 0.45)';
                  let fill = 'rgba(56, 189, 248, 0.06)';
                  let strokeWidth = 1.2;

                  if (isHighlight) {
                    stroke = '#f59e0b';
                    fill = 'rgba(245, 158, 11, 0.28)';
                    strokeWidth = 2.8;
                  } else if (isHovered) {
                    stroke = '#38bdf8';
                    fill = 'rgba(56, 189, 248, 0.25)';
                    strokeWidth = 2.2;
                  }

                  return (
                    <g 
                      key={`ocr-${idx}`} 
                      style={{ cursor: 'pointer' }} 
                      onClick={() => onBlockClick(block)}
                      onMouseEnter={() => setHoveredBlock(block)}
                      onMouseLeave={() => setHoveredBlock(null)}
                    >
                      <rect
                        x={x}
                        y={y}
                        width={w}
                        height={h}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        rx={2}
                      />
                    </g>
                  );
                })}

                {/* 2. Barcode Bounding Boxes (Purple/Cyan) */}
                {showBarcodeBoxes && barcodes?.map((b, idx) => {
                  if (!b.bbox || b.bbox.length < 4) return null;
                  const [x, y, w, h] = b.bbox;

                  return (
                    <g key={`bar-${idx}`}>
                      <rect
                        x={x}
                        y={y}
                        width={w}
                        height={h}
                        fill="rgba(168, 85, 247, 0.2)"
                        stroke="#c084fc"
                        strokeWidth={2.4}
                        strokeDasharray="4 2"
                        rx={3}
                      />
                      <rect
                        x={x}
                        y={Math.max(0, y - 18)}
                        width={Math.min(w, 140)}
                        height={16}
                        fill="#7e22ce"
                        rx={2}
                      />
                      <text
                        x={x + 4}
                        y={Math.max(12, y - 6)}
                        fill="#ffffff"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {b.type} {b.data?.slice(0, 10)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>
            <Upload size={38} color="#38bdf8" style={{ marginBottom: '10px' }} />
            <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.96rem' }}>
              Upload any packaged product photograph or label
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
              Supports real JPG, PNG, WEBP with arbitrary orientations & barcodes
            </div>
          </div>
        )}

        {/* Hover Inspector Tooltip */}
        {hoveredBlock && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            right: '12px',
            background: 'rgba(11, 18, 36, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid #38bdf8',
            borderRadius: '8px',
            padding: '8px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>
                TEXT BLOCK:
              </span>
              <span style={{ fontSize: '0.8rem', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                "{hoveredBlock.text}"
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
              Conf: {(hoveredBlock.confidence * 100).toFixed(0)}%
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.74rem', color: '#64748b' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 8, height: 8, background: '#38bdf8', borderRadius: 2 }}></span> OCR Declaration
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 8, height: 8, background: '#c084fc', borderRadius: 2 }}></span> Barcode / QR
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 8, height: 8, background: '#f59e0b', borderRadius: 2 }}></span> Selected Rule
          </span>
        </div>
        <div>
          Click any text block to inspect matched Legal Metrology rule
        </div>
      </div>
    </div>
  );
}