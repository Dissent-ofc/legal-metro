import React, { useRef, useState, useEffect } from 'react';
import { Upload, Layers, Crosshair, ZoomIn, ZoomOut, RotateCcw, ImageIcon } from 'lucide-react';

export default function ImageCanvas({ 
  imageUrl, 
  imageWidth,
  imageHeight,
  ocrBlocks, 
  barcodes,
  highlightedField, 
  onBlockClick,
  onUploadImage,
  loading,
  sourceType,
  productName
}) {
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);
  const [hoveredBlock, setHoveredBlock] = useState(null);
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 700, h: 360 });
  const [showOcrBoxes, setShowOcrBoxes] = useState(true);
  const [showBarcodeBoxes, setShowBarcodeBoxes] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Sync dimensions whenever imageUrl or props change
  useEffect(() => {
    if (imageWidth && imageHeight) {
      setImgNaturalSize({ w: imageWidth, h: imageHeight });
    }
    setZoomLevel(1);
    setHoveredBlock(null);
  }, [imageUrl, imageWidth, imageHeight]);

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

  const viewW = imgNaturalSize.w || imageWidth || 700;
  const viewH = imgNaturalSize.h || imageHeight || 360;

  return (
    <div className="gov-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column' }}>
      
      {/* Viewport Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Crosshair size={17} color="#2563eb" />
          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f2744', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Optical Inspection Viewport
          </span>
          <span style={{ fontSize: '0.74rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
            ({viewW} × {viewH}px)
          </span>
          {sourceType === 'upload' && (
            <span className="badge badge-blue" style={{ fontSize: '0.66rem' }}>
              Custom Upload
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Zoom controls */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '2px' }}>
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.6, Math.round((prev - 0.2) * 10) / 10))}
              style={{ background: 'transparent', border: 'none', color: '#64748b', padding: '3px 6px', cursor: 'pointer', display: 'flex' }}
              title="Zoom Out"
            >
              <ZoomOut size={13} />
            </button>
            <span style={{ fontSize: '0.72rem', color: '#334155', fontWeight: 600, padding: '0 4px', minWidth: '34px', textAlign: 'center' }}>
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(2.5, Math.round((prev + 0.2) * 10) / 10))}
              style={{ background: 'transparent', border: 'none', color: '#64748b', padding: '3px 6px', cursor: 'pointer', display: 'flex' }}
              title="Zoom In"
            >
              <ZoomIn size={13} />
            </button>
            {zoomLevel !== 1 && (
              <button
                onClick={() => setZoomLevel(1)}
                style={{ background: 'transparent', border: 'none', color: '#2563eb', padding: '3px 6px', cursor: 'pointer', display: 'flex' }}
                title="Reset Zoom"
              >
                <RotateCcw size={12} />
              </button>
            )}
          </div>

          {/* Layer toggles */}
          <button 
            className="btn-secondary"
            style={{ 
              padding: '5px 10px', 
              fontSize: '0.74rem', 
              background: showOcrBoxes ? '#eff6ff' : '#ffffff',
              borderColor: showOcrBoxes ? '#bfdbfe' : '#e2e8f0',
              color: showOcrBoxes ? '#1d4ed8' : '#64748b'
            }}
            onClick={() => setShowOcrBoxes(!showOcrBoxes)}
            title="Toggle OCR Text Bounding Boxes"
          >
            <Layers size={13} />
            OCR ({ocrBlocks?.length || 0})
          </button>

          {/* Upload Button */}
          <button 
            className="btn-primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            <Upload size={13} />
            Upload Photo
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onUploadImage(e.target.files[0]);
                e.target.value = '';
              }
            }}
          />
        </div>
      </div>

      {/* Main Image Viewport Area (Fixed Height Container with clean border) */}
      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        style={{
          height: '440px',
          background: '#0f172a',
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: '12px'
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', color: '#93c5fd' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid rgba(147, 197, 253, 0.2)', borderTopColor: '#60a5fa', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f8fafc' }}>
              Scanning Package Label &amp; Verifying Rules...
            </div>
            <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '4px' }}>
              Extracting text declarations, net quantity, MRP &amp; consumer care
            </div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : imageUrl ? (
          <div 
            key={imageUrl}
            style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div style={{ 
              position: 'relative', 
              display: 'inline-block', 
              maxWidth: '100%', 
              maxHeight: '100%', 
              transform: `scale(${zoomLevel})`, 
              transformOrigin: 'center center', 
              transition: 'transform 0.15s ease' 
            }}>
              <img 
                ref={imgRef}
                src={imageUrl} 
                alt={productName || "Packaged Commodity Inspection"} 
                onLoad={handleImageLoad}
                style={{
                  maxWidth: '100%',
                  maxHeight: '416px',
                  borderRadius: '4px',
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
                  
                  let stroke = 'rgba(56, 189, 248, 0.6)';
                  let fill = 'rgba(56, 189, 248, 0.08)';
                  let strokeWidth = 1.2;

                  if (isHighlight) {
                    stroke = '#f59e0b';
                    fill = 'rgba(245, 158, 11, 0.3)';
                    strokeWidth = 2.6;
                  } else if (isHovered) {
                    stroke = '#60a5fa';
                    fill = 'rgba(96, 165, 250, 0.25)';
                    strokeWidth = 2.0;
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

                {/* 2. Barcode Bounding Boxes */}
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
                        fill="rgba(192, 132, 252, 0.2)"
                        stroke="#c084fc"
                        strokeWidth={2.2}
                        strokeDasharray="4 2"
                        rx={3}
                      />
                      <rect
                        x={x}
                        y={Math.max(0, y - 16)}
                        width={Math.min(w, 130)}
                        height={15}
                        fill="#7e22ce"
                        rx={2}
                      />
                      <text
                        x={x + 4}
                        y={Math.max(11, y - 5)}
                        fill="#ffffff"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {b.type}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>
            <ImageIcon size={36} color="#60a5fa" style={{ marginBottom: '10px' }} />
            <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.94rem' }}>
              Upload any packaged product photograph or label
            </div>
            <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '4px' }}>
              Supports real JPG, PNG, WEBP product packages
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
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid #38bdf8',
            borderRadius: '6px',
            padding: '7px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700 }}>
                DECLARATION:
              </span>
              <span style={{ fontSize: '0.78rem', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                "{hoveredBlock.text}"
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
              Conf: {(hoveredBlock.confidence * 100).toFixed(0)}%
            </div>
          </div>
        )}
      </div>

      {/* Legend Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.74rem', color: '#64748b' }}>
        <div style={{ display: 'flex', gap: '14px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 8, height: 8, background: '#38bdf8', borderRadius: 2 }}></span> OCR Declaration
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 8, height: 8, background: '#c084fc', borderRadius: 2 }}></span> Barcode / QR
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 8, height: 8, background: '#f59e0b', borderRadius: 2 }}></span> Focused Rule
          </span>
        </div>
        <div>
          Click any text block to inspect statutory rule
        </div>
      </div>

    </div>
  );
}