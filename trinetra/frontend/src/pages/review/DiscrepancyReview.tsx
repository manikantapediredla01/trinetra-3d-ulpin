import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText, AlertTriangle, CheckCircle, XCircle, Clock,
  Eye, Filter, ArrowRight, Shield, Download
} from 'lucide-react'
import toast from 'react-hot-toast'

interface DiscrepancyItem {
  id: string
  title: string
  property_ref: string
  field: string
  sanctioned_value: string
  survey_value: string
  deviation: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'PENDING_REVIEW' | 'NOTICE_ISSUED' | 'COMPOUNDED' | 'DISMISSED'
  date_flagged: string
}

const DISCREPANCIES_DATA: DiscrepancyItem[] = [
  {
    id: 'DISC-2026-001',
    title: 'Unpermitted Vertical Expansion (6th Floor)',
    property_ref: 'PROP-HYD-2024-001',
    field: 'Vertical Storeys / FAR',
    sanctioned_value: '5 Floors (G+4) / 1,260 m²',
    survey_value: '6 Floors (G+5) / 1,512 m²',
    deviation: '+1 Floor Level (+252 m² Built-up)',
    severity: 'CRITICAL',
    status: 'PENDING_REVIEW',
    date_flagged: '2026-06-02',
  },
  {
    id: 'DISC-2026-002',
    title: 'Western Boundary Setback Deviation',
    property_ref: 'PROP-HYD-2024-001',
    field: 'Side Setback (West)',
    sanctioned_value: '3.00 m Mandatory Clear Setback',
    survey_value: '0.70 m Physical Setback',
    deviation: '-2.30 m Encroaching on Setback Buffer',
    severity: 'HIGH',
    status: 'NOTICE_ISSUED',
    date_flagged: '2026-06-02',
  },
  {
    id: 'DISC-2026-003',
    title: 'Basement Usage Modification',
    property_ref: 'PROP-HYD-2024-001',
    field: 'Basement Permitted Usage',
    sanctioned_value: 'Exclusive 2-Wheeler / 4-Wheeler Parking',
    survey_value: '40% Part Commercial Storage Area',
    deviation: 'Commercial use of mandatory parking',
    severity: 'MEDIUM',
    status: 'PENDING_REVIEW',
    date_flagged: '2026-06-03',
  },
]

export default function DiscrepancyReview() {
  const navigate = useNavigate()
  const [discrepancies, setDiscrepancies] = useState(DISCREPANCIES_DATA)
  const [selectedDisc, setSelectedDisc] = useState<DiscrepancyItem | null>(DISCREPANCIES_DATA[0])

  const handleAction = (status: DiscrepancyItem['status'], label: string) => {
    if (!selectedDisc) return
    setDiscrepancies((prev) =>
      prev.map((d) => (d.id === selectedDisc.id ? { ...d, status } : d))
    )
    setSelectedDisc((prev) => (prev ? { ...prev, status } : null))
    toast.success(`Action recorded: ${label} for ${selectedDisc.id}`)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="card p-5 bg-white border-border flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-critical text-xs font-semibold">STATUTORY AUDIT</span>
            <span className="badge-info text-xs font-mono">TG-bPASS PERMIT RECONCILIATION</span>
          </div>
          <h1 className="text-2xl font-bold text-navy">
            Building Permit & 3D Reality Discrepancy Review
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Cross-checks sanctioned municipal drawings against verified 3D LoD-2 surveyed geometries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/review/encroachment')}
            className="btn-secondary text-xs"
          >
            <Shield className="w-3.5 h-3.5 mr-1" /> Encroachment Review
          </button>
          <button
            onClick={() => navigate('/gis/twin/PROP-HYD-2024-001')}
            className="btn-primary text-xs"
          >
            <Eye className="w-3.5 h-3.5 mr-1" /> Inspect in 3D Twin
          </button>
        </div>
      </div>

      {/* Main Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Discrepancies Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="card">
            <h3 className="text-sm font-bold text-navy pb-3 border-b border-border flex items-center justify-between">
              <span>Active Discrepancies ({discrepancies.length})</span>
              <span className="text-xs font-normal text-muted">Property: PROP-HYD-2024-001</span>
            </h3>

            <div className="space-y-3 pt-3">
              {discrepancies.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setSelectedDisc(d)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedDisc?.id === d.id
                      ? 'border-govblue bg-govblue/5 shadow-sm ring-1 ring-govblue'
                      : 'border-border bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-govblue">{d.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.severity === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800'
                            : d.severity === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {d.severity}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        d.status === 'PENDING_REVIEW'
                          ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          : d.status === 'NOTICE_ISSUED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {d.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-navy">{d.title}</h4>
                  <div className="mt-2 text-xs text-muted flex items-center justify-between">
                    <span>Deviation: <strong className="text-rose-600 font-semibold">{d.deviation}</strong></span>
                    <span className="font-mono text-[11px]">{d.date_flagged}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Selected Discrepancy Evidence & Adjudication */}
        <div className="lg:col-span-5 space-y-4">
          {selectedDisc && (
            <div className="card border-govblue/30 shadow-md">
              <div className="pb-3 border-b border-border">
                <span className="font-mono text-xs font-bold text-govblue">{selectedDisc.id}</span>
                <h3 className="text-base font-bold text-navy mt-1">{selectedDisc.title}</h3>
                <p className="text-xs text-muted">Field: {selectedDisc.field}</p>
              </div>

              {/* Comparative Evidence Block */}
              <div className="pt-3 space-y-3 text-xs">
                <div className="p-3 bg-surface rounded-lg border border-border/70">
                  <span className="text-muted block text-[11px] uppercase font-semibold">
                    TG-bPASS Sanctioned Permit Specification
                  </span>
                  <span className="font-mono font-bold text-dark text-sm block mt-0.5">
                    {selectedDisc.sanctioned_value}
                  </span>
                </div>

                <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                  <span className="text-rose-700 block text-[11px] uppercase font-semibold">
                    Physical 3D LiDAR & Drone Survey Measurement
                  </span>
                  <span className="font-mono font-bold text-rose-900 text-sm block mt-0.5">
                    {selectedDisc.survey_value}
                  </span>
                </div>

                <div className="p-2.5 bg-amber-50 rounded border border-amber-200 text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Statutory Deviation:</strong> {selectedDisc.deviation}. Violates Section 178 of Telangana Municipalities Act.
                  </span>
                </div>
              </div>

              {/* Officer Adjudication Controls */}
              <div className="pt-5 mt-4 border-t border-border space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  Adjudication Decision
                </h4>

                <button
                  onClick={() => handleAction('NOTICE_ISSUED', 'Show Cause Notice Issued')}
                  className="btn-danger w-full text-xs justify-center"
                >
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Issue Formal Show Cause Notice
                </button>

                <button
                  onClick={() => handleAction('COMPOUNDED', 'Compounding Penalty Levied')}
                  className="btn-primary w-full text-xs justify-center"
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1" /> Levy Compounding Fine & Regularize
                </button>

                <button
                  onClick={() => handleAction('DISMISSED', 'Case Dismissed (Permit Exemption)')}
                  className="btn-secondary w-full text-xs justify-center"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" /> Dismiss (Exemption Verified)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
