import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SamplePicker from './components/SamplePicker';
import ImageCanvas from './components/ImageCanvas';
import ScoreGauge from './components/ScoreGauge';
import RuleCard from './components/RuleCard';
import ReportModal from './components/ReportModal';
import { CheckSquare, Barcode, Globe } from 'lucide-react';

export default function App() {
  const [samples, setSamples] = useState([]);
  const [selectedSampleId, setSelectedSampleId] = useState(null);
  const [scanData, setScanData] = useState(null);
  const [activeRuleId, setActiveRuleId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/samples')
      .then((res) => res.json())
      .then((data) => {
        setSamples(data.samples || []);
        if (data.samples && data.samples.length > 0) {
          handleSelectSample(data.samples[0].id);
        }
      })
      .catch((err) => console.error("Error loading samples:", err));
  }, []);

  const handleSelectSample = async (sampleId) => {
    setSelectedSampleId(sampleId);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('sample_id', sampleId);
      const res = await fetch('/api/scan', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setScanData(data);
      setActiveRuleId(null);
    } catch (err) {
      console.error("Error scanning sample:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async (file) => {
    setSelectedSampleId(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/scan', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setScanData(data);
      setActiveRuleId(null);
    } catch (err) {
      console.error("Error uploading image:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    if (!scanData) return;
    setExporting(true);
    try {
      const res = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scanData),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Server error (${res.status})`);
      }
      const data = await res.json();
      if (!data.pdf_base64) {
        throw new Error("Invalid PDF response structure");
      }

      // Convert base64 to binary ArrayBuffer safely
      const binaryString = window.atob(data.pdf_base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename || 'Legal_Metrology_Inspection_Report.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error exporting PDF:", err);
      alert("PDF Notice: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  const activeRule = scanData?.rules?.find((r) => r.rule_id === activeRuleId);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* 2-Row by 2-Column Perfectly Symmetrical Dashboard */}
      <main className="dashboard-grid-2x2">
        
        {/* ROW 1, COL 1: Benchmark Packaging Library */}
        <div style={{ height: '100%' }}>
          <SamplePicker 
            samples={samples} 
            selectedSampleId={selectedSampleId} 
            onSelectSample={handleSelectSample}
            loading={loading}
          />
        </div>

        {/* ROW 1, COL 2: Compliance Score Card */}
        <div style={{ height: '100%' }}>
          <ScoreGauge 
            scanData={scanData} 
            onExportPdf={handleExportPdf}
            onOpenModal={() => setIsModalOpen(true)}
            exporting={exporting}
          />
        </div>

        {/* ROW 2, COL 1: Optical Inspection Viewport (Image Canvas) */}
        <div style={{ height: '100%' }}>
          <ImageCanvas 
            imageUrl={scanData?.image_url}
            imageWidth={scanData?.image_width}
            imageHeight={scanData?.image_height}
            ocrBlocks={scanData?.ocr_blocks}
            barcodes={scanData?.barcodes}
            highlightedField={activeRule?.extracted_value}
            onBlockClick={(block) => {
              const matched = scanData?.rules?.find(r => r.extracted_value && block.text.includes(r.extracted_value.slice(0, 10)));
              if (matched) setActiveRuleId(matched.rule_id);
            }}
            onUploadImage={handleUploadImage}
            loading={loading}
            sourceType={scanData?.source}
            productName={scanData?.product_name}
          />
        </div>

        {/* ROW 2, COL 2: Statutory Compliance Matrix & Barcode Details */}
        <div className="gov-card" style={{ padding: '16px 20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
          
          {/* Section Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckSquare size={17} color="#2563eb" />
              <h2 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f2744', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Statutory Rule Compliance Matrix (Rules 6 &amp; 9)
              </h2>
            </div>
            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
              Select rule to focus on label
            </span>
          </div>

          {/* Optional Barcode Bar if detected */}
          {scanData?.barcodes && scanData.barcodes.length > 0 && (
            <div style={{
              background: '#faf5ff',
              border: '1px solid #e9d5ff',
              borderRadius: '6px',
              padding: '6px 10px',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.74rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#7e22ce', fontWeight: 700 }}>
                <Barcode size={14} />
                <span>{scanData.barcodes[0].type}: {scanData.barcodes[0].data}</span>
              </div>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Globe size={11} /> {scanData.barcodes[0].country_origin}
              </span>
            </div>
          )}

          {/* Rule Cards Container - Fills entire card height with zero empty space */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', paddingRight: '2px' }}>
            {scanData?.rules?.map((rule) => (
              <RuleCard 
                key={rule.rule_id}
                rule={rule}
                isActive={activeRuleId === rule.rule_id}
                onClick={() => setActiveRuleId(activeRuleId === rule.rule_id ? null : rule.rule_id)}
              />
            ))}
          </div>
        </div>

      </main>

      {/* Official Certificate & Print Preview Modal */}
      <ReportModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        scanData={scanData}
        onExportPdf={handleExportPdf}
        exporting={exporting}
      />
    </div>
  );
}