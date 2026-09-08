import React from 'react';
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';

export default function RuleCard({ rule, isActive, onClick }) {
  const isPass = rule.status === 'PASS';

  return (
    <div 
      className={`statutory-card ${isPass ? 'pass' : 'fail'} ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: '0.74rem', 
            background: 'rgba(56, 189, 248, 0.15)', 
            color: '#38bdf8', 
            padding: '2px 6px', 
            borderRadius: '4px',
            fontWeight: 700 
          }}>
            {rule.rule_id}
          </span>
          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f1f5f9' }}>
            {rule.title}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
            {rule.statutory_ref}
          </span>
          {isPass ? (
            <span className="status-pill pill-pass"><CheckCircle2 size={11} />PASS</span>
          ) : (
            <span className="status-pill pill-fail"><XCircle size={11} />FAIL</span>
          )}
        </div>
      </div>

      <div style={{ fontSize: '0.78rem', color: isPass ? '#94a3b8' : '#fca5a5', lineHeight: '1.35', marginBottom: '6px' }}>
        {rule.reason}
      </div>

      {rule.extracted_value && (
        <div style={{ 
          background: 'rgba(0, 0, 0, 0.4)', 
          padding: '5px 8px', 
          borderRadius: '5px', 
          fontSize: '0.74rem',
          fontFamily: 'var(--font-mono)',
          color: '#38bdf8',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          <b>Detected:</b> {rule.extracted_value}
        </div>
      )}

      {rule.rule_id === 'R7' && rule.ratio && (
        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
          Prominence Ratio: <b>{rule.ratio}x</b> (MRP Height: {rule.mrp_height_px}px vs Median Text: {rule.median_height_px}px)
        </div>
      )}
    </div>
  );
}