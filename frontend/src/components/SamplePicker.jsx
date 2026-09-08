import React from 'react';
import { Package, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function SamplePicker({ samples, selectedSampleId, onSelectSample, loading }) {
  return (
    <div className="enterprise-card" style={{ padding: '14px 16px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={16} color="#38bdf8" />
          <span style={{ fontWeight: 700, fontSize: '0.86rem', color: '#f1f5f9' }}>
            Benchmark Test Packaging Library
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
          Instant 1-Click Inspection
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '8px' }}>
        {samples.map((s) => {
          const isCompliant = s.expected_verdict.includes('COMPLIANT') && !s.expected_verdict.includes('NON');
          const isSelected = selectedSampleId === s.id;

          return (
            <div
              key={s.id}
              onClick={() => !loading && onSelectSample(s.id)}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                border: isSelected ? '1.5px solid #38bdf8' : '1px solid var(--border-subtle)',
                background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(10, 16, 31, 0.6)',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.18s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {s.name}
                </span>
                {isCompliant ? (
                  <span className="status-pill pill-pass" style={{ fontSize: '0.66rem' }}><CheckCircle2 size={10} />Pass</span>
                ) : (
                  <span className="status-pill pill-fail" style={{ fontSize: '0.66rem' }}><AlertTriangle size={10} />Violations</span>
                )}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {s.category}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}