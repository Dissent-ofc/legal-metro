import React from 'react';
import { Shield, Sparkles, ExternalLink, Cpu, Barcode } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="top-nav">
      <div className="top-nav-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284c7 0%, #1e40af 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 14px rgba(2, 132, 199, 0.4)',
            border: '1px solid rgba(56, 189, 248, 0.3)'
          }}>
            <Shield size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
                Legal Metrology Inspector
              </span>
              <span style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: '0.65rem', 
                padding: '2px 6px', 
                borderRadius: '4px', 
                background: 'rgba(56, 189, 248, 0.15)', 
                color: '#38bdf8', 
                border: '1px solid rgba(56, 189, 248, 0.3)' 
              }}>
                v2.0 • EasyOCR + Barcode
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              Ministry of Consumer Affairs, Food & Public Distribution • Department of Consumer Affairs (DoCA)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: '20px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            fontSize: '0.74rem',
            color: '#34d399'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }}></span>
            Statutory Engine Online
          </div>

          <a 
            href="https://consumeraffairs.gov.in/pages/legal-metrology-act" 
            target="_blank" 
            rel="noopener noreferrer"
            className="action-btn btn-dark"
            style={{ fontSize: '0.76rem', textDecoration: 'none', padding: '6px 12px' }}
          >
            Rules 2011 Reference
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </header>
  );
}