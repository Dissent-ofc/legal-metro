import React from 'react';
import { ShieldCheck, ShieldAlert, Download, AlertTriangle, FileSpreadsheet } from 'lucide-react';

export default function ScoreGauge({ scanData, onExportPdf, exporting }) {
  if (!scanData) return null;

  const score = scanData.compliance_score || 0;
  const isCompliant = scanData.verdict === 'COMPLIANT';
  const isCritical = scanData.fail_count > 2;

  const strokeColor = isCompliant ? '#10b981' : isCritical ? '#f43f5e' : '#f59e0b';
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="enterprise-card" style={{ padding: '16px 20px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Gauge */}
          <div style={{ position: 'relative', width: '82px', height: '82px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="82" height="82" viewBox="0 0 82 82">
              <circle
                cx="41"
                cy="41"
                r={radius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="7"
              />
              <circle
                cx="41"
                cy="41"
                r={radius}
                fill="none"
                stroke={strokeColor}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 41 41)"
                style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                {Math.round(score)}%
              </div>
              <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                Compliance
              </div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span 
                className={`status-pill ${isCompliant ? 'pill-pass' : isCritical ? 'pill-fail' : 'pill-amber'}`}
                style={{ fontSize: '0.78rem', padding: '3px 10px' }}
              >
                {isCompliant ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
                {scanData.verdict}
              </span>
            </div>
            <div style={{ fontSize: '0.84rem', color: '#f1f5f9', fontWeight: 500, maxWidth: '340px' }}>
              {scanData.summary}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '3px' }}>
              Statutory Declarations Passed: <b style={{ color: '#34d399' }}>{scanData.pass_count}</b> / {scanData.total_rules}
            </div>
          </div>
        </div>

        <button 
          className="action-btn btn-cyan"
          onClick={onExportPdf}
          disabled={exporting}
          style={{ whiteSpace: 'nowrap' }}
        >
          <Download size={15} />
          {exporting ? 'Generating PDF...' : 'Download Statutory PDF Audit'}
        </button>
      </div>
    </div>
  );
}