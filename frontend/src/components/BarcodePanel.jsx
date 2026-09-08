import React from 'react';
import { Barcode, CheckCircle, Globe, QrCode } from 'lucide-react';

export default function BarcodePanel({ barcodes }) {
  if (!barcodes || barcodes.length === 0) return null;

  return (
    <div className="enterprise-card" style={{ padding: '14px 16px', marginBottom: '16px', background: 'rgba(168, 85, 247, 0.06)', borderColor: 'rgba(168, 85, 247, 0.3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Barcode size={18} color="#c084fc" />
          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f1f5f9' }}>
            Detected Barcodes & GS1 Product Identifiers ({barcodes.length})
          </span>
        </div>
        <span className="status-pill pill-barcode">
          Rule 6 GS1 Verification
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
        {barcodes.map((b, idx) => (
          <div 
            key={idx}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'rgba(10, 16, 31, 0.8)',
              border: '1px solid rgba(168, 85, 247, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#c084fc', fontWeight: 700 }}>
                {b.type}
              </span>
              {b.is_gs1_india && (
                <span style={{ fontSize: '0.68rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <CheckCircle size={10} /> GS1 India
                </span>
              )}
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
              {b.data}
            </div>

            <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Globe size={11} /> {b.country_origin}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}