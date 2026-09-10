import React from 'react';
import { ShieldCheck, ShieldAlert, Download, Eye } from 'lucide-react';

export default function ScoreGauge({ scanData, onExportPdf, onOpenModal, exporting }) {
  if (!scanData) return null;

  const score = Math.round(scanData.compliance_score || 0);
  const isCompliant = scanData.verdict === 'COMPLIANT';
  const isCritical = scanData.fail_count > 2;

  const statusColor = isCompliant ? '#059669' : isCritical ? '#e11d48' : '#d97706';
  const statusBg = isCompliant ? '#ecfdf5' : isCritical ? '#fff1f2' : '#fffbeb';
  const statusBorder = isCompliant ? '#a7f3d0' : isCritical ? '#fecdd3' : '#fde68a';

  return (
    <div className="gov-card" style={{ padding: '16px 20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f2744', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
          Compliance Assessment Summary
        </span>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '3px 9px',
          borderRadius: '6px',
          background: statusBg,
          color: statusColor,
          border: `1px solid ${statusBorder}`,
          fontWeight: 800,
          fontSize: '0.78rem'
        }}>
          {isCompliant ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
          {scanData.verdict}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '4px 0' }}>
        {/* Score box */}
        <div style={{
          minWidth: '80px',
          height: '66px',
          borderRadius: '8px',
          background: statusBg,
          border: `1.5px solid ${statusBorder}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px',
          flexShrink: 0
        }}>
          <span style={{ fontSize: '1.45rem', fontWeight: 900, color: statusColor, lineHeight: 1 }}>
            {score}%
          </span>
          <span style={{ fontSize: '0.62rem', fontWeight: 700, color: statusColor, textTransform: 'uppercase', marginTop: '3px', letterSpacing: '0.3px' }}>
            Score
          </span>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 500, lineHeight: 1.35 }}>
            {scanData.summary}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
            Statutory Declarations Passed: <b style={{ color: '#047857' }}>{scanData.pass_count}</b> / {scanData.total_rules}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
        <button 
          className="btn-secondary"
          onClick={onOpenModal}
          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          title="Inspect &amp; Print Official Digital Certificate"
        >
          <Eye size={13} />
          View Certificate
        </button>

        <button 
          className="btn-primary"
          onClick={onExportPdf}
          disabled={exporting}
          style={{ padding: '6px 14px', fontSize: '0.78rem' }}
        >
          <Download size={13} />
          {exporting ? 'Exporting...' : 'Download PDF'}
        </button>
      </div>
    </div>
  );
}