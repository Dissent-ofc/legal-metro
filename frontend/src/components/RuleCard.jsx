import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function RuleCard({ rule, isActive, onClick }) {
  const isPass = rule.status === 'PASS';

  return (
    <div 
      onClick={onClick}
      style={{
        padding: '12px 14px',
        borderRadius: '8px',
        border: '1px solid',
        borderColor: isActive ? '#2563eb' : '#e2e8f0',
        background: isActive ? '#eff6ff' : isPass ? '#ffffff' : '#fff5f5',
        boxShadow: isActive ? '0 0 0 1.5px #2563eb' : 'none',
        marginBottom: '8px',
        cursor: 'pointer',
        transition: 'all 0.15s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: '0.72rem', 
            background: isActive ? '#dbeafe' : '#f1f5f9', 
            color: '#1e40af', 
            padding: '2px 6px', 
            borderRadius: '4px',
            fontWeight: 700 
          }}>
            {rule.rule_id}
          </span>
          <span style={{ fontWeight: 700, fontSize: '0.86rem', color: '#0f172a' }}>
            {rule.title}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
            {rule.statutory_ref}
          </span>
          {isPass ? (
            <span className="badge badge-pass" style={{ fontSize: '0.64rem', padding: '2px 6px' }}>
              <CheckCircle2 size={10} />PASS
            </span>
          ) : (
            <span className="badge badge-fail" style={{ fontSize: '0.64rem', padding: '2px 6px' }}>
              <XCircle size={10} />FAIL
            </span>
          )}
        </div>
      </div>

      <div style={{ fontSize: '0.78rem', color: isPass ? '#475569' : '#be123c', lineHeight: '1.35', marginBottom: '6px' }}>
        {rule.reason}
      </div>

      {rule.extracted_value && (
        <div style={{ 
          background: isPass ? '#f8fafc' : '#fff1f2', 
          border: `1px solid ${isPass ? '#e2e8f0' : '#fecdd3'}`,
          padding: '4px 8px', 
          borderRadius: '4px', 
          fontSize: '0.72rem',
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
        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
          Prominence Ratio: <b>{rule.ratio}x</b> (MRP: {rule.mrp_height_px}px vs Median: {rule.median_height_px}px)
        </div>
      )}
    </div>
  );
}