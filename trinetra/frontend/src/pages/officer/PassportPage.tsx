import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { QrCode, Download, Printer, CheckCircle, Loader, Shield } from 'lucide-react'
import { passportApi } from '@/services/api'
import toast from 'react-hot-toast'

const DEMO_PASSPORT = {
  ulpin: 'IN-3D-HYD0-2024-0001',
  property_ref: 'PROP-HYD-2024-001',
  parcel_reference: 'HYD/BH/123/4',
  location: 'Survey No. 123/4, Banjara Hills, Hyderabad, Telangana 500034',
  floors: 7,
  units: 12,
  area_m2: 252,
  vertical_extent_m: 25.9,
  status: 'VERIFIED',
  confidence: 94,
  verification_date: '2026-09-07',
  qr_url: 'http://localhost:5173/passport/PROP-HYD-2024-001',
}

export default function PassportPage() {
  const navigate = useNavigate()
  const [generating, setGenerating] = useState(false)
  const [passport, setPassport] = useState<typeof DEMO_PASSPORT | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  const generate = async () => {
    setGenerating(true)
    await new Promise(r => setTimeout(r, 1000))
    try {
      const { data } = await passportApi.getQR('PROP-HYD-2024-001')
      setQrDataUrl(data.qr_image)
    } catch {
      // Generate QR client-side as fallback
      try {
        const QRCode = await import('qrcode')
        const url = await QRCode.toDataURL(DEMO_PASSPORT.qr_url, {
          width: 220, margin: 2,
          color: { dark: '#12355B', light: '#FFFFFF' }
        })
        setQrDataUrl(url)
      } catch {}
    }
    setPassport(DEMO_PASSPORT)
    setGenerating(false)
    toast.success('QR Property Passport generated!')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">QR Property Passport</h1>
          <p className="text-muted text-sm mt-1">Scannable digital property passport for authorized verification</p>
        </div>
        {!passport && (
          <button onClick={generate} disabled={generating} className="btn-primary">
            {generating ? <><Loader size={14} className="animate-spin" />Generating…</> : <><QrCode size={14} />Generate QR Passport</>}
          </button>
        )}
      </div>

      <div className="p-3 bg-govblue/5 border border-govblue/20 rounded text-sm text-govblue">
        <strong>Important:</strong> The QR code provides access to the permitted Property Passport.
        It does NOT replace the authoritative 3D ULPIN. Confidential ownership data is not exposed.
      </div>

      {generating && (
        <div className="card py-10 flex flex-col items-center gap-3">
          <QrCode size={40} className="text-govblue animate-pulse" />
          <div className="font-medium text-navy">Generating QR Property Passport…</div>
        </div>
      )}

      {passport && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Passport card */}
          <div className="card border-2 border-navy/20 print:shadow-none" id="property-passport">
            {/* Passport header */}
            <div className="gradient-navy -mx-5 -mt-5 px-5 py-4 rounded-t-lg mb-5">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={16} className="text-teal" />
                <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">
                  TRINETRA · Digital Property Passport
                </span>
              </div>
              <div className="text-white/40 text-xs">
                Prototype | Department of Land Resources | SIH26011
              </div>
            </div>

            {/* QR code */}
            <div className="flex items-start gap-5">
              <div className="shrink-0">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Property QR Code" className="w-[160px] h-[160px] rounded border border-border" />
                ) : (
                  <div className="w-[160px] h-[160px] bg-surface border border-border rounded flex items-center justify-center">
                    <QrCode size={48} className="text-navy/30" />
                  </div>
                )}
                <div className="text-xs text-center text-muted mt-1">Scan to verify</div>
              </div>

              <div className="flex-1">
                <div className="font-mono text-sm font-bold text-navy mb-1">{passport.ulpin}</div>
                <div className="badge-verified mb-3">{passport.status}</div>
                <div className="space-y-1.5">
                  {[
                    { label: 'Property Ref', value: passport.property_ref },
                    { label: 'Parcel Ref', value: passport.parcel_reference },
                    { label: 'Floors / Units', value: `${passport.floors} / ${passport.units}` },
                    { label: 'Floor Area', value: `${passport.area_m2} m²` },
                    { label: 'Vertical Extent', value: `${passport.vertical_extent_m} m` },
                    { label: 'Evidence Confidence', value: `${passport.confidence}%` },
                    { label: 'Verification Date', value: passport.verification_date },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-xs text-muted">{label}</span>
                      <span className="text-xs font-semibold text-dark">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border">
              <div className="text-xs text-muted">{passport.location}</div>
              <div className="mt-2 p-2 bg-warning/5 border border-warning/20 rounded text-xs text-warning">
                ⚠ DEMONSTRATION PROTOTYPE — Not an official government document.
                This passport does not constitute legal property ownership proof.
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="card">
              <h3 className="section-title text-sm mb-4">Passport Actions</h3>
              <div className="space-y-3">
                <button onClick={() => window.print()} className="btn-secondary w-full justify-center">
                  <Printer size={16} />Print Passport
                </button>
                <button
                  onClick={() => {
                    const a = document.createElement('a')
                    if (qrDataUrl) { a.href = qrDataUrl; a.download = `QR_${passport.ulpin}.png`; a.click() }
                  }}
                  className="btn-secondary w-full justify-center"
                >
                  <Download size={16} />Download QR Image
                </button>
                <button
                  onClick={() => navigate(`/passport/${passport.property_ref}`)}
                  className="btn-teal w-full justify-center"
                >
                  <QrCode size={16} />Open Public Passport Page
                </button>
              </div>
            </div>

            <div className="card text-xs">
              <div className="font-semibold text-navy mb-3">What the QR exposes</div>
              {[
                { field: '3D ULPIN', visible: true },
                { field: 'Property reference', visible: true },
                { field: 'Location (city/district)', visible: true },
                { field: 'Floor count & units', visible: true },
                { field: 'Area & vertical extent', visible: true },
                { field: 'Verification status', visible: true },
                { field: 'Evidence confidence', visible: true },
                { field: 'Owner name / details', visible: false },
                { field: 'Raw LiDAR / GIS data', visible: false },
                { field: 'Internal discrepancy evidence', visible: false },
              ].map(({ field, visible }) => (
                <div key={field} className="flex items-center gap-2 py-1 border-b border-border/50 last:border-0">
                  {visible
                    ? <CheckCircle size={12} className="text-verified shrink-0" />
                    : <div className="w-3 h-3 rounded-full border border-critical/50 shrink-0" />
                  }
                  <span className={visible ? 'text-dark' : 'text-muted line-through'}>{field}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => navigate('/gis/twin/PROP-HYD-2024-001')} className="btn-primary flex-1 justify-center">
                View Digital Twin →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
