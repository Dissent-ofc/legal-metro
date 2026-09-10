import React from 'react';
import { Shield, ExternalLink, CheckCircle } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="top-nav">
      <div className="top-nav-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0f2744 0%, #1e40af 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(15, 39, 68, 0.25)',
            border: '1px solid #1e3a8a'
          }}>
            <Shield size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '1.15rem', color: '#0f2744', letterSpacing: '-0.01em' }}>
                Legal Metrology Compliance Inspector
              </h1>
              <span className="badge badge-blue" style={{ fontSize: '0.68rem', fontWeight: 700 }}>
                Rule 6 &amp; 9 Engine
              </span>
            </div>
            <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 500 }}>
              Ministry of Consumer Affairs, Food &amp; Public Distribution • Department of Consumer Affairs (DoCA)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '6px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            fontSize: '0.74rem',
            color: '#047857',
            fontWeight: 600
          }}>
            <CheckCircle size={13} color="#059669" />
            Statutory Standards Active
          </div>

          <a 
            href="https://consumeraffairs.gov.in/pages/legal-metrology-act" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ fontSize: '0.76rem', textDecoration: 'none', padding: '6px 12px' }}
          >
            Statutory Guidelines
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </header>
  );
}