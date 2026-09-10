import React from 'react';
import { X, Printer, Download, ShieldCheck, ShieldAlert, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ReportModal({ isOpen, onClose, scanData, onExportPdf, exporting }) {
  if (!isOpen || !scanData) return null;

  const score = scanData.compliance_score || 0;
  const isCompliant = scanData.verdict === 'COMPLIANT';
  const isCritical = scanData.fail_count > 2;
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(2, 6, 23, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        color: '#0f172a',
        width: '100%',
        maxWidth: '840px',
        maxHeight: '90vh',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #cbd5e1'
      }}>
        {/* Modal Action Header (Non-printable) */}
        <div className="no-print" style={{
          background: '#0f2744',
          color: '#ffffff',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #1e3a8a'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="#38bdf8" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              Statutory Inspection Audit Sheet — Digital Certificate
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handlePrint}
              style={{
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Printer size={14} /> Print / Save as PDF
            </button>
            <button
              onClick={onExportPdf}
              disabled={exporting}
              style={{
                background: '#15803d',
                color: '#ffffff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Download size={14} /> {exporting ? 'Exporting...' : 'Download PDF'}
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Certificate Body (Printable) */}
        <div className="printable-certificate" style={{
          padding: '30px 40px',
          overflowY: 'auto',
          flex: 1,
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          {/* Government Letterhead */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0f2744', paddingBottom: '14px', marginBottom: '18px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              Government of India
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              Ministry of Consumer Affairs, Food &amp; Public Distribution
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Department of Consumer Affairs — Legal Metrology Division
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f2744', marginTop: '6px', letterSpacing: '0.2px' }}>
              LEGAL METROLOGY (PACKAGED COMMODITIES) RULES, 2011
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284c7' }}>
              Statutory Package Compliance &amp; Verification Inspection Audit Report
            </div>
          </div>

          {/* Inspection Metadata Table */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '18px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px 20px',
            fontSize: '0.82rem'
          }}>
            <div><b>Inspection Date:</b> {dateStr}</div>
            <div><b>Inspection ID:</b> LM-DOCA-20260910</div>
            <div><b>Commodity Name:</b> {scanData.product_name}</div>
            <div><b>Product Category:</b> {scanData.category || 'Packaged Commodity'}</div>
            <div>
              <b>Compliance Score:</b> <span style={{ fontWeight: 800, color: isCompliant ? '#15803d' : '#dc2626' }}>{score}%</span>
            </div>
            <div>
              <b>Inspection Verdict:</b>{' '}
              <span style={{
                fontWeight: 800,
                color: isCompliant ? '#15803d' : '#dc2626'
              }}>
                {scanData.verdict}
              </span>
            </div>
          </div>

          {/* Statutory Rule Compliance Matrix Table */}
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f2744', marginBottom: '8px' }}>
              Statutory Declaration Breakdown (Rule 6 &amp; Rule 9)
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px', width: '80px' }}>Rule ID</th>
                  <th style={{ padding: '8px 10px', width: '160px' }}>Mandatory Field</th>
                  <th style={{ padding: '8px 10px', width: '75px' }}>Status</th>
                  <th style={{ padding: '8px 10px' }}>Statutory Inspection Finding</th>
                </tr>
              </thead>
              <tbody>
                {scanData.rules?.map((r) => {
                  const isPass = r.status === 'PASS';
                  return (
                    <tr key={r.rule_id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 10px', verticalAlign: 'top' }}>
                        <b>{r.rule_id}</b>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{r.statutory_ref}</div>
                      </td>
                      <td style={{ padding: '8px 10px', verticalAlign: 'top', fontWeight: 600 }}>
                        {r.title}
                      </td>
                      <td style={{ padding: '8px 10px', verticalAlign: 'top' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          background: isPass ? '#dcfce7' : '#fee2e2',
                          color: isPass ? '#15803d' : '#b91c1c'
                        }}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', verticalAlign: 'top', color: '#334155' }}>
                        {r.reason}
                        {r.extracted_value && (
                          <div style={{ fontSize: '0.72rem', color: '#0284c7', marginTop: '2px', fontStyle: 'italic' }}>
                            Extracted: "{String(r.extracted_value).slice(0, 100)}"
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Statutory Sign-off */}
          <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '12px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#64748b' }}>
            <div>
              <b>Inspecting Subsystem:</b> Automated AI / DoCA Inspection Subsystem
            </div>
            <div>
              <b>Authorized Signature:</b> ___________________________
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-certificate, .printable-certificate * {
            visibility: visible;
          }
          .printable-certificate {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
