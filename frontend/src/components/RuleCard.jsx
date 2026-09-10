import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function RuleCard({ rule, isActive, onClick }) {
  const isPass = rule.status === 'PASS';

  return (
    <div 
      onClick={onClick}
      style={{
        padding: '9px 12px',
        borderRadius: '7px',
        border: '1px solid',
        borderColor: isActive ? '#2563eb' : isPass ? '#e2e8f0' : '#fecdd3',
        background: isActive ? '#eff6ff' : isPass ? '#ffffff' : '#fff5f5',
        boxShadow: isActive ? '0 0 0 1.5px #2563eb' : 'none',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '3px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: '0.70rem', 
            background: isActive ? '#dbeafe' : '#f1f5f9', 
            color: '#1e40af', 
            padding: '2px 5px', 
            borderRadius: '4px',
            fontWeight: 700 
          }}>
            {rule.rule_id}
          </span>
          <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>
            {rule.title}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.66rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
            {rule.statutory_ref}
          </span>
          {isPass ? (
            <span className="badge badge-pass" style={{ fontSize: '0.62rem', padding: '2px 5px' }}>
              <CheckCircle2 size={10} />PASS
            </span>
          ) : (
            <span className="badge badge-fail" style={{ fontSize: '0.62rem', padding: '2px 5px' }}>
              <XCircle size={10} />FAIL
            </span>
          )}
        </div>
      </div>

      <div style={{ fontSize: '0.76rem', color: isPass ? '#475569' : '#be123c', lineHeight: '1.3' }}>
        {rule.reason}
      </div>

      {rule.extracted_value && (
        <div style={{ 
          background: isPass ? '#f8fafc' : '#fff1f2', 
          border: `1px solid ${isPass ? '#e2e8f0' : '#fecdd3'}`,
          padding: '3px 7px', 
          borderRadius: '4px', 
          fontSize: '0.70rem',
          fontFamily: 'var(--font-mono)',
          color: isPass ? '#0369a1' : '#be123c',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          <b>Detected:</b> "{String(rule.extracted_value).slice(0, 90)}"
        </div>
      )}

      {rule.rule_id === 'R7' && rule.ratio && (
        <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
          Prominence Ratio: <b>{rule.ratio}x</b> (MRP: {rule.mrp_height_px}px vs Median: {rule.median_height_px}px)
        </div>
      )}
    </div>
  );
}