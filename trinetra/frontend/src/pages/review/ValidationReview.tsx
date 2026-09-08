import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle, XCircle, AlertTriangle, Eye, FileText,
  Shield, Fingerprint, Clock, User, BarChart2, ThumbsUp, ThumbsDown
} from 'lucide-react'
import { validationApi } from '@/services/api'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

interface ValidationCheck {
  name: string
  status: 'PASS' | 'FAIL' | 'WARNING'
  message: string
  metric?: number
  threshold?: number
}

interface ValidationRecord {
  id: string
  property_id: string
  property_name: string
  ulpin_candidate: string
  submitted_by: string
  submitted_at: string
  overall_result: 'VALIDATED' | 'REJECTED' | 'PENDING'
  confidence: number
  checks: ValidationCheck[]
  review_status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED_BY_AUTHORITY'
  encroachment_flagged: boolean
  discrepancy_flagged: boolean
  qaoa_solution: string
  quantum_method: string
}

const DEMO_VALIDATIONS: ValidationRecord[] = [
  {
    id: 'VAL-HYD-2026-001',
    property_id: 'PROP-HYD-2024-001',
    property_name: 'Srinivas Commercial Complex',
    ulpin_candidate: 'IN-3D-HYD0-2024-0001',
    submitted_by: 'gis.officer (Rajesh Kumar)',
    submitted_at: '2026-09-07T11:45:00Z',
    overall_result: 'VALIDATED',
    confidence: 0.94,
    review_status: 'PENDING_REVIEW',
    encroachment_flagged: true,
    discrepancy_flagged: true,
    qaoa_solution: '0100000',
    quantum_method: 'QAOA p=1 (Qiskit Aer Simulator)',
    checks: [
      { name: 'Geometry Validity', status: 'PASS', message: 'No self-intersections — GEOS topology check passed' },
      { name: 'Overlap Detection', status: 'PASS', message: 'Unit overlap < 0.01 m²', metric: 0.002, threshold: 0.01 },
      { name: 'Gap Detection', status: 'PASS', message: 'All 7 floor levels contiguous' },
      { name: 'Boundary Consistency', status: 'PASS', message: '87.3% parcel boundary concordance vs TGRAC', metric: 0.873, threshold: 0.85 },
      { name: 'Floor Consistency', status: 'PASS', message: 'Monotonically increasing elevations across 12 units' },
      { name: 'Topology Validation', status: 'PASS', message: 'Valid 3D closed polyhedra — no topology errors' },
      { name: 'Elevation Consistency', status: 'PASS', message: 'Ground: 536.0m MSL, Height: 22.4m — plausible for Hyderabad' },
      { name: 'Coordinate Consistency', status: 'PASS', message: 'Within Hyderabad revenue zone (78.2–78.7°E, 17.1–17.6°N)' },
    ],
  },
]

const statusColors = {
  PASS: 'text-verified bg-verified/5 border-verified/20',
  FAIL: 'text-critical bg-critical/5 border-critical/20',
  WARNING: 'text-warning bg-warning/5 border-warning/20',
}

export default function ValidationReview() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<ValidationRecord>(DEMO_VALIDATIONS[0])
  const [reviewStatus, setReviewStatus] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  const submitDecision = async (decision: 'APPROVED' | 'REJECTED_BY_AUTHORITY') => {
    if (!notes.trim() && decision === 'REJECTED_BY_AUTHORITY') {
      toast.error('Please provide rejection reason in notes')
      return
    }
    setProcessing(true)
    await new Promise(r => setTimeout(r, 800))
    setReviewStatus(decision)
    setProcessing(false)
    if (decision === 'APPROVED') {
      toast.success('Validation APPROVED — ULPIN issuance authorized')
    } else {
      toast.error('Validation REJECTED — Property returned for re-survey')
    }
  }

  const passCount = selected.checks.filter(c => c.status === 'PASS').length
  const failCount = selected.checks.filter(c => c.status === 'FAIL').length

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Validation Review Authority</h1>
          <p className="text-muted text-sm mt-1">
            Land Record Authority — approve or reject validated property submissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-pending text-xs">PENDING REVIEW</span>
          <button onClick={() => navigate('/gis/twin/PROP-HYD-2024-001')} className="btn-secondary btn-sm">
            <Eye size={13} /> 3D Twin
          </button>
        </div>
      </div>

      {/* Authority Notice */}
      <div className="p-4 bg-navy/5 border border-navy/20 rounded-lg flex items-start gap-3 text-sm text-navy">
        <Shield size={18} className="shrink-0 mt-0.5 text-govblue" />
        <div>
          <strong>Land Record Authority Notice:</strong> You are reviewing AI/Quantum-assisted
          validation results for prototype ULPIN authorization. Your approval authorizes the
          system to issue a <em>prototype</em> 3D ULPIN — not an official government instrument.
          Ensure all flagged cases (encroachment, discrepancy) are acknowledged before approval.
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Validation details */}
        <div className="lg:col-span-8 space-y-4">
          {/* Header Card */}
          <div className="card">
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge-synthetic text-xs">SYNTHETIC DEMO</span>
                  <span className="font-mono text-xs text-muted">{selected.id}</span>
                </div>
                <h2 className="text-lg font-bold text-navy">{selected.property_name}</h2>
                <p className="text-sm text-muted">{selected.property_id} · Banjara Hills, Hyderabad</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-verified">{(selected.confidence * 100).toFixed(0)}%</div>
                <div className="text-xs text-muted">Evidence Confidence</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
              {[
                { label: 'ULPIN Candidate', value: selected.ulpin_candidate, mono: true },
                { label: 'QAOA Solution', value: selected.qaoa_solution, mono: true },
                { label: 'Checks Passed', value: `${passCount} / ${selected.checks.length}`, mono: false },
                { label: 'Submitted By', value: selected.submitted_by.split(' (')[0], mono: false },
              ].map(({ label, value, mono }) => (
                <div key={label} className="bg-surface rounded p-2.5">
                  <div className="text-xs text-muted">{label}</div>
                  <div className={clsx('font-semibold text-navy mt-0.5 text-sm', mono && 'font-mono')}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Flags */}
          {(selected.encroachment_flagged || selected.discrepancy_flagged) && (
            <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
                <div className="text-sm text-warning">
                  <strong>Flags Requiring Review:</strong>
                  <ul className="mt-1 ml-3 list-disc space-y-0.5 text-warning/90">
                    {selected.encroachment_flagged && (
                      <li>Potential encroachment flagged — West boundary extends ~2.3m beyond parcel. AUTHORIZED REVIEW REQUIRED.</li>
                    )}
                    {selected.discrepancy_flagged && (
                      <li>Discrepancy flagged — 6th floor addition detected vs registered sanctioned plan G+5.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Validation Checks Table */}
          <div className="card">
            <h3 className="text-sm font-bold text-navy mb-3 flex items-center gap-2">
              <CheckCircle size={15} className="text-verified" />
              8-Point Geometric Validation Results
            </h3>
            <div className="space-y-2">
              {selected.checks.map((check, i) => (
                <div key={i} className={clsx(
                  'flex items-start gap-3 p-3 rounded border text-sm',
                  statusColors[check.status]
                )}>
                  <div className="shrink-0 mt-0.5">
                    {check.status === 'PASS' && <CheckCircle size={15} className="text-verified" />}
                    {check.status === 'FAIL' && <XCircle size={15} className="text-critical" />}
                    {check.status === 'WARNING' && <AlertTriangle size={15} className="text-warning" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{check.name}</div>
                    <div className="text-xs opacity-80 mt-0.5">{check.message}</div>
                  </div>
                  <span className="text-xs font-bold shrink-0">{check.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quantum Method Provenance */}
          <div className="card bg-indigo-50/50 border-indigo-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
              Quantum Optimization Provenance
            </h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted">Method:</span>
                <span className="font-medium text-dark">{selected.quantum_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Selected Bitstring:</span>
                <span className="font-mono font-bold text-govblue">{selected.qaoa_solution}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Interpretation:</span>
                <span className="text-dark">Candidate #2 selected (index 1 = 1 in bitstring)</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-indigo-700 bg-indigo-100/60 p-2 rounded">
              ⚠ QAOA bitstring is a <strong>candidate selection vector</strong>, NOT a ULPIN.
              The ULPIN is derived from validated geometry — not directly from quantum output.
            </div>
          </div>
        </div>

        {/* Right: Review Actions */}
        <div className="lg:col-span-4 space-y-4">
          {/* Evidence Score */}
          <div className="card">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Evidence Confidence</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-verified mb-1">{(selected.confidence * 100).toFixed(0)}%</div>
              <div className="text-xs text-muted">Multi-source composite</div>
            </div>
            <div className="mt-3 space-y-2 text-xs">
              {[
                { label: 'LiDAR Quality', pct: 96 },
                { label: 'Boundary Match', pct: 87 },
                { label: 'Validation Checks', pct: 100 },
                { label: 'QAOA Optimality', pct: 97 },
              ].map(({ label, pct }) => (
                <div key={label}>
                  <div className="flex justify-between text-muted mb-0.5">
                    <span>{label}</span>
                    <span className="font-semibold text-dark">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-border rounded-full">
                    <div
                      className="h-full bg-govblue rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-[10px] text-muted border-t border-border pt-2">
              Decision-support indicator only. Not legal certification.
            </div>
          </div>

          {/* Review Decision */}
          {!reviewStatus && (
            <div className="card">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
                <Shield size={13} className="text-govblue" />
                Authority Decision
              </h3>

              <div className="mb-3">
                <label className="label text-xs">Review Notes / Observations</label>
                <textarea
                  className="input resize-none text-xs"
                  rows={3}
                  placeholder="Add review notes, conditions, or rejection reason..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => submitDecision('APPROVED')}
                  disabled={processing}
                  className="btn-primary w-full"
                >
                  <ThumbsUp size={14} />
                  {processing ? 'Processing...' : 'Approve — Issue Prototype ULPIN'}
                </button>
                <button
                  onClick={() => submitDecision('REJECTED_BY_AUTHORITY')}
                  disabled={processing}
                  className="btn-danger w-full"
                >
                  <ThumbsDown size={14} />
                  Reject — Return for Re-Survey
                </button>
              </div>

              <p className="text-[10px] text-muted mt-2">
                Approving issues a <strong>prototype ULPIN</strong> for SIH26011 demonstration.
                Not an official government instrument.
              </p>
            </div>
          )}

          {reviewStatus === 'APPROVED' && (
            <div className="card border-verified/30 bg-verified/5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={18} className="text-verified" />
                <h3 className="font-bold text-verified">APPROVED</h3>
              </div>
              <p className="text-sm text-verified">
                Prototype ULPIN <strong>{selected.ulpin_candidate}</strong> has been authorized.
              </p>
              <button
                onClick={() => navigate('/officer/ulpin')}
                className="btn-primary btn-sm mt-3 w-full"
              >
                <Fingerprint size={13} /> View ULPIN Record
              </button>
              <button
                onClick={() => navigate('/officer/passport')}
                className="btn-secondary btn-sm mt-2 w-full"
              >
                Generate QR Passport
              </button>
            </div>
          )}

          {reviewStatus === 'REJECTED_BY_AUTHORITY' && (
            <div className="card border-critical/30 bg-critical/5">
              <div className="flex items-center gap-2 mb-2">
                <XCircle size={18} className="text-critical" />
                <h3 className="font-bold text-critical">REJECTED</h3>
              </div>
              <p className="text-sm text-critical">
                Property returned for re-survey. Notes: {notes || 'No notes provided.'}
              </p>
            </div>
          )}

          {/* Provenance Summary */}
          <div className="card">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Data Provenance</h3>
            <div className="space-y-1.5 text-xs">
              {[
                { label: 'LiDAR', origin: 'REAL (IITH Campus, 5%)' },
                { label: 'Cadastral', origin: 'REAL (TGRAC HMDA, 5%)' },
                { label: 'DEM', origin: 'REAL (Copernicus GLO-30, 5%)' },
                { label: '3D Building', origin: 'SYNTHETIC DEMO (95%)' },
                { label: 'Quantum Output', origin: 'SIMULATED (Qiskit Aer)' },
              ].map(({ label, origin }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-muted">{label}:</span>
                  <span className={clsx(
                    'font-medium',
                    origin.includes('REAL') ? 'text-verified' : 
                    origin.includes('SYNTHETIC') ? 'text-warning' : 'text-govblue'
                  )}>{origin}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
