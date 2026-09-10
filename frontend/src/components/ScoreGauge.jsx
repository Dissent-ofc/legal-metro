import React from 'react';
import { ShieldCheck, ShieldAlert, Download, Eye, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ScoreGauge({ scanData, onExportPdf, onOpenModal, exporting }) {
  if (!scanData) return null;

  const score = Math.round(scanData.compliance_score || 0);
  const isCompliant = scanData.verdict === 'COMPLIANT';
  const isCritical = scanData.fail_count > 2;

  const statusColor = isCompliant ? '#059669' : isCritical ? '#e11d48' : '#d97706';
  const statusBg = isCompliant ? '#ecfdf5' : isCritical ? '#fff1f2' : '#fffbeb';
  const statusBorder = isCompliant ? '#a7f3d0' : isCritical ? '#fecdd3' : '#fde68a';

  return (
    <div className="gov-card" style={{ padding: '20px 24px', marginBottom: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Left: Score & Verdict Breakdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          
          {/* Numerical Score Box */}
          <div style={{
            minWidth: '88px',
            height: '84px',
            borderRadius: '10px',
            background: statusBg,
            border: `1.5px solid ${statusBorder}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            flexShrink: 0
          }}>
            <span style={{ fontSize: '1.65rem', fontWeight: 900, color: statusColor, lineHeight: 1 }}>
              {score}%
            </span>
            <span style={{ fontSize: '0.66rem', fontWeight: 700, color: statusColor, textTransform: 'uppercase', marginTop: '4px', letterSpacing: '0.4px' }}>
              Compliance
            </span>
          </div>

          {/* Verdict Details */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: statusBg,
                color: statusColor,
                border: `1px solid ${statusBorder}`,
                fontWeight: 800,
                fontSize: '0.84rem',
                letterSpacing: '0.01em'
              }}>
                {isCompliant ? <ShieldCheck size={15} /> : <ShieldAlert size={15} />}
                {scanData.verdict}
              </span>
            </div>

            <div style={{ fontSize: '0.86rem', color: '#334155', fontWeight: 500, maxWidth: '400px', lineHeight: 1.4 }}>
              {scanData.summary}
            </div>

            <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>
                Statutory Declarations Passed: <b style={{ color: '#047857' }}>{scanData.pass_count}</b> / {scanData.total_rules}
              </span>
              {scanData.fail_count > 0 && (
                <span style={{ color: '#be123c', fontWeight: 600 }}>
                  ({scanData.fail_count} non-compliant)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Export & Preview Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            className="btn-secondary"
            onClick={onOpenModal}
            style={{ padding: '8px 14px', whiteSpace: 'nowrap' }}
            title="Inspect & Print Official Digital Certificate"
          >
            <Eye size={15} />
            View Certificate
          </button>

          <button 
            className="btn-primary"
            onClick={onExportPdf}
            disabled={exporting}
            style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}
          >
            <Download size={15} />
            {exporting ? 'Generating PDF...' : 'Download PDF Report'}
          </button>
        </div>

      </div>
    </div>
  );
}