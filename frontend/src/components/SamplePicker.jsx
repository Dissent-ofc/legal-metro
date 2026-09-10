import React from 'react';
import { Package, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function SamplePicker({ samples, selectedSampleId, onSelectSample, loading }) {
  return (
    <div className="gov-card" style={{ padding: '16px 20px', marginBottom: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={17} color="#1e40af" />
          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f2744', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Benchmark Test Packaging Library
          </span>
        </div>
        <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
          Click any product to inspect
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
        {samples.map((s) => {
          const isCompliant = s.expected_verdict.includes('COMPLIANT') && !s.expected_verdict.includes('NON');
          const isSelected = selectedSampleId === s.id;

          return (
            <div
              key={s.id}
              onClick={() => !loading && onSelectSample(s.id)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: isSelected ? '#2563eb' : '#e2e8f0',
                background: isSelected ? '#eff6ff' : '#ffffff',
                boxShadow: isSelected ? '0 0 0 1px #2563eb' : 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                minHeight: '68px',
                justifyContent: 'center'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                <span style={{ 
                  fontWeight: 700, 
                  fontSize: '0.82rem', 
                  color: isSelected ? '#1e40af' : '#1e293b', 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis' 
                }}>
                  {s.name}
                </span>
                {isCompliant ? (
                  <span className="badge badge-pass" style={{ fontSize: '0.64rem', padding: '2px 6px', flexShrink: 0 }}>
                    <CheckCircle2 size={10} />Pass
                  </span>
                ) : (
                  <span className="badge badge-fail" style={{ fontSize: '0.64rem', padding: '2px 6px', flexShrink: 0 }}>
                    <AlertTriangle size={10} />Violations
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                {s.category}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}