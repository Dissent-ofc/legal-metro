import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SamplePicker from './components/SamplePicker';
import ImageCanvas from './components/ImageCanvas';
import BarcodePanel from './components/BarcodePanel';
import ScoreGauge from './components/ScoreGauge';
import RuleCard from './components/RuleCard';
import { Scale, CheckSquare, Sparkles, SlidersHorizontal } from 'lucide-react';

export default function App() {
  const [samples, setSamples] = useState([]);
  const [selectedSampleId, setSelectedSampleId] = useState(null);
  const [scanData, setScanData] = useState(null);
  const [activeRuleId, setActiveRuleId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

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
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanName = (scanData.product_name || 'Report').replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `Legal_Metrology_Inspection_${cleanName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("Error exporting PDF:", err);
      alert("PDF Generation Notice: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  const activeRule = scanData?.rules?.find((r) => r.rule_id === activeRuleId);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main className="dashboard-grid">
        {/* Left Column: Image Canvas & Barcode Viewer */}
        <section style={{ display: 'flex', flexDirection: 'column' }}>
          <SamplePicker 
            samples={samples} 
            selectedSampleId={selectedSampleId} 
            onSelectSample={handleSelectSample}
            loading={loading}
          />

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
          />
        </section>

        {/* Right Column: Scorecard, Barcode Details & 7-Rule Matrix */}
        <section style={{ display: 'flex', flexDirection: 'column' }}>
          <ScoreGauge 
            scanData={scanData} 
            onExportPdf={handleExportPdf}
            exporting={exporting}
          />

          <BarcodePanel barcodes={scanData?.barcodes} />

          <div className="enterprise-card" style={{ padding: '18px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={17} color="#38bdf8" />
                <h2 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f1f5f9' }}>
                  Statutory Rule Compliance Matrix (Rules 6 & 9)
                </h2>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Select rule to focus on canvas
              </span>
            </div>

            <div style={{ maxHeight: '480px', overflowY: 'auto', paddingRight: '4px' }}>
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
        </section>
      </main>
    </div>
  );
}