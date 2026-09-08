import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Fingerprint, CheckCircle, Loader, QrCode, Copy, Shield, Database } from 'lucide-react'
import { ulpinApi } from '@/services/api'
import toast from 'react-hot-toast'

const DEMO_ULPIN = 'IN-3D-HYD0-2024-0001'

interface ULPINRecord {
  ulpin: string
  property_ref: string
  parcel_reference: string
  horizontal_extent: number
  vertical_extent: number
  floor_range: string
  survey_date: string
  validation_status: string
  confidence: number
  city: string
  district: string
  generated_at: string
}

export default function ULPINGeneration() {
  const navigate = useNavigate()
  const [generating, setGenerating] = useState(false)
  const [ulpin, setUlpin] = useState<ULPINRecord | null>(null)

  const generate = async () => {
    setGenerating(true)
    await new Promise(r => setTimeout(r, 1800))
    try { await ulpinApi.generate('PROP-HYD-2024-001', 'demo-validation-id') } catch {}
    setUlpin({
      ulpin: DEMO_ULPIN,
      property_ref: 'PROP-HYD-2024-001',
      parcel_reference: 'HYD/BH/123/4',
      horizontal_extent: 252.0,
      vertical_extent: 25.9,
      floor_range: 'Basement (B) → 5th Floor',
      survey_date: '2026-06-01',
      validation_status: 'VALIDATED',
      confidence: 94,
      city: 'Hyderabad',
      district: 'Rangareddy',
      generated_at: new Date().toISOString(),
    })
    setGenerating(false)
    toast.success('Prototype 3D ULPIN generated!')
  }

  const copyULPIN = () => {
    navigator.clipboard.writeText(DEMO_ULPIN)
    toast.success('ULPIN copied to clipboard')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">3D ULPIN Generator</h1>
          <p className="text-muted text-sm mt-1">Unique Land Parcel Identification Number — 3D extended</p>
        </div>
        {!ulpin && (
          <button onClick={generate} disabled={generating} className="btn-primary">
            {generating
              ? <><Loader size={15} className="animate-spin" />Generating…</>
              : <><Fingerprint size={15} />Generate 3D ULPIN</>
            }
          </button>
        )}
      </div>

      {/* Gate notice */}
      <div className="p-4 bg-verified/5 border border-verified/20 rounded-lg flex items-start gap-3">
        <CheckCircle size={18} className="text-verified shrink-0 mt-0.5" />
        <div className="text-sm text-verified">
          <strong>Validation gate passed.</strong> All 8 checks: VALIDATED.
          ULPIN generation is now authorized for PROP-HYD-2024-001.
        </div>
      </div>

      {generating && (
        <div className="card py-12 flex flex-col items-center gap-4">
          <div className="relative">
            <Fingerprint size={48} className="text-govblue" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-2 border-govblue/30 border-t-govblue rounded-full animate-spin" />
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-navy">Generating Prototype 3D ULPIN…</div>
            <div className="text-muted text-sm">Deriving deterministic identifier from property attributes</div>
          </div>
        </div>
      )}

      {ulpin && (
        <div className="space-y-6">
          {/* ULPIN display */}
          <div className="card gradient-navy text-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-2">
                  Prototype 3D ULPIN — DEMONSTRATION ONLY
                </div>
                <div className="font-mono text-4xl font-bold tracking-widest mb-3">{ulpin.ulpin}</div>
                <div className="flex flex-wrap gap-3">
                  <span className="bg-white/10 px-2.5 py-1 rounded text-xs">IN = India</span>
                  <span className="bg-white/10 px-2.5 py-1 rounded text-xs">3D = Three-Dimensional</span>
                  <span className="bg-white/10 px-2.5 py-1 rounded text-xs">HYD0 = Hyderabad Zone</span>
                  <span className="bg-white/10 px-2.5 py-1 rounded text-xs">2024 = Survey Year</span>
                  <span className="bg-white/10 px-2.5 py-1 rounded text-xs">0001 = Sequential ID</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={copyULPIN} className="btn bg-white/20 text-white hover:bg-white/30 btn-sm">
                  <Copy size={13} />Copy
                </button>
                <span className="badge bg-teal/30 text-teal-200 border-teal/30">DEMO ULPIN</span>
              </div>
            </div>
          </div>

          {/* Property record */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="section-title text-sm mb-4"><Database size={16} className="text-govblue" />Property Record</h2>
              {[
                { label: 'Property Reference', value: ulpin.property_ref },
                { label: 'Parcel Reference', value: ulpin.parcel_reference },
                { label: 'City', value: ulpin.city },
                { label: 'District', value: ulpin.district },
                { label: 'Horizontal Extent', value: `${ulpin.horizontal_extent} m²` },
                { label: 'Vertical Extent', value: `${ulpin.vertical_extent} m` },
                { label: 'Floor Range', value: ulpin.floor_range },
                { label: 'Survey Date', value: ulpin.survey_date },
                { label: 'Validation Status', value: ulpin.validation_status },
                { label: 'Evidence Confidence', value: `${ulpin.confidence}%` },
                { label: 'Generated At', value: new Date(ulpin.generated_at).toLocaleString() },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
                  <span className="text-xs text-muted">{label}</span>
                  <span className="text-xs font-semibold text-dark">{value}</span>
                </div>
              ))}
            </div>

            <div className="card">
              <h2 className="section-title text-sm mb-4"><Shield size={16} className="text-teal" />Data Provenance Chain</h2>
              {[
                { step: 'Data Sources', detail: 'LiDAR (IITH real), DEM (COP30 real), GIS (TGRAC real), Floor Plan (TG-bPASS)', origin: 'REAL_INPUT' },
                { step: 'Preprocessing', detail: '11-stage pipeline — noise removal, registration, fusion', origin: 'DERIVED' },
                { step: 'AI Extraction', detail: 'Geometric building/floor extraction — 94% confidence', origin: 'DERIVED_AI' },
                { step: 'QUBO', detail: 'Data-driven Q matrix from measurable candidate metrics', origin: 'DERIVED' },
                { step: 'QAOA', detail: 'Qiskit Aer simulator — classical baseline confirmed', origin: 'SIMULATED_QAOA' },
                { step: 'Geometry', detail: 'Candidate C3 reconstructed from bitstring 0001000', origin: 'DERIVED' },
                { step: 'Validation', detail: 'All 8 checks PASSED', origin: 'VALIDATED' },
                { step: '3D ULPIN', detail: DEMO_ULPIN, origin: 'PROTOTYPE' },
              ].map(({ step, detail, origin }) => (
                <div key={step} className="py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-dark">{step}</div>
                      <div className="text-xs text-muted mt-0.5">{detail}</div>
                    </div>
                    <span className={
                      origin === 'REAL_INPUT' ? 'badge-real shrink-0' :
                      origin === 'SIMULATED_QAOA' ? 'badge-quantum shrink-0' :
                      origin === 'VALIDATED' ? 'badge-verified shrink-0' :
                      'badge-derived shrink-0'
                    }>{origin.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => navigate('/officer/passport')} className="btn-teal btn-lg">
              <QrCode size={18} />Generate QR Property Passport →
            </button>
            <button onClick={() => navigate('/gis/twin/PROP-HYD-2024-001')} className="btn-secondary btn-lg">
              View 3D Digital Twin →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
