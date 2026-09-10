import React from 'react';
import { Barcode, CheckCircle, Globe } from 'lucide-react';

export default function BarcodePanel({ barcodes }) {
  if (!barcodes || barcodes.length === 0) return null;

  return (
    <div className="gov-card" style={{ padding: '14px 18px', marginBottom: '18px', background: '#faf5ff', borderColor: '#e9d5ff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Barcode size={18} color="#7e22ce" />
          <span style={{ fontWeight: 800, fontSize: '0.84rem', color: '#581c87', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
            Detected Barcodes &amp; GS1 Product Identifiers ({barcodes.length})
          </span>
        </div>
        <span style={{
          fontSize: '0.68rem',
          fontWeight: 700,
          background: '#f3e8ff',
          color: '#7e22ce',
          border: '1px solid #d8b4fe',
          padding: '2px 8px',
          borderRadius: '4px'
        }}>
          Rule 6 GS1 Verification
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
        {barcodes.map((b, idx) => (
          <div 
            key={idx}
            style={{
              padding: '10px 12px',
              borderRadius: '6px',
              background: '#ffffff',
              border: '1px solid #e9d5ff',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#7e22ce', fontWeight: 700 }}>
                {b.type}
              </span>
              {b.is_gs1_india && (
                <span style={{ fontSize: '0.68rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                  <CheckCircle size={10} /> GS1 India
                </span>
              )}
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
              {b.data}
            </div>

            <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Globe size={11} /> {b.country_origin}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}