import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Eye, Flag, CheckCircle, XCircle } from 'lucide-react'
import { encroachmentApi } from '@/services/api'
import toast from 'react-hot-toast'

const DEMO_CASE = {
  id: 'enc-001',
  property_ref: 'PROP-HYD-2024-001',
  description: 'POTENTIAL ENCROACHMENT — AUTHORIZED REVIEW REQUIRED. Building west wall extends approximately 2.3m beyond cadastral parcel boundary.',
  affected_area_m2: 32.2,
  affected_volume_m3: 618.2,
  severity: 'MEDIUM',
  confidence: 0.88,
  evidence_sources: ['LiDAR point cloud (IITH, real)', 'TGRAC HMDA cadastral boundary (real)'],
  review_status: 'pending',
}

export default function EncroachmentReview() {
  const [reviewing, setReviewing] = useState(false)
  const [decision, setDecision] = useState<'approved_review' | 'cleared' | null>(null)
  const [notes, setNotes] = useState('')

  const submitReview = async (status: string) => {
    setReviewing(true)
    try { await encroachmentApi.review(DEMO_CASE.id, status, notes) } catch {}
    await new Promise(r => setTimeout(r, 500))
    setDecision(status as any)
    setReviewing(false)
    toast.success(`Encroachment case ${status === 'cleared' ? 'cleared' : 'flagged for further action'}`)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Encroachment Review</h1>
        <p className="text-muted text-sm mt-1">Review and act on potential encroachment detections</p>
      </div>

      {/* Critical disclaimer */}
      <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/30 rounded-lg">
        <AlertTriangle size={18} className="text-warning shrink-0 mt-0.5" />
        <div className="text-sm text-warning">
          <strong>POTENTIAL ENCROACHMENT — AUTHORIZED REVIEW REQUIRED.</strong><br />
          These detections are AI/geospatial analysis outputs.
          They are <strong>NOT legal confirmations</strong> of encroachment.
          An authorized officer must review evidence and take formal action.
          The system will NEVER automatically label a property as "LEGAL ENCROACHMENT CONFIRMED".
        </div>
      </div>

      <div className="card border-l-4 border-warning">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="badge-pending mb-2">PENDING REVIEW</span>
            <div className="font-semibold text-navy text-lg mt-1">{DEMO_CASE.property_ref}</div>
            <div className="text-muted text-sm">{DEMO_CASE.description}</div>
          </div>
          <span className={`badge text-sm py-1 px-3 ${DEMO_CASE.severity === 'HIGH' ? 'badge-critical' : 'badge-pending'}`}>
            {DEMO_CASE.severity}
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {[
            { label: 'Affected Area', value: `${DEMO_CASE.affected_area_m2} m²` },
            { label: 'Affected Volume', value: `${DEMO_CASE.affected_volume_m3} m³` },
            { label: 'Detection Confidence', value: `${(DEMO_CASE.confidence * 100).toFixed(0)}%` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface rounded p-3">
              <div className="text-xs text-muted">{label}</div>
              <div className="font-bold text-navy mt-1">{value}</div>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <div className="text-xs font-semibold text-muted mb-2">Evidence Sources</div>
          <div className="flex flex-wrap gap-2">
            {DEMO_CASE.evidence_sources.map(s => (
              <span key={s} className="badge-info">{s}</span>
            ))}
          </div>
        </div>

        {!decision && (
          <div className="space-y-3">
            <div>
              <label className="label">Review Notes</label>
              <textarea className="input resize-none" rows={3} placeholder="Add review notes…" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => submitReview('approved_review')} disabled={reviewing}
                className="btn bg-warning text-white hover:bg-warning/90">
                <Flag size={15} />Escalate for Field Verification
              </button>
              <button onClick={() => submitReview('cleared')} disabled={reviewing}
                className="btn-secondary">
                <CheckCircle size={15} className="text-verified" />Mark as Cleared
              </button>
            </div>
          </div>
        )}

        {decision === 'approved_review' && (
          <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded text-sm text-warning">
            <Flag size={16} />Escalated for field verification by authorized officer.
          </div>
        )}
        {decision === 'cleared' && (
          <div className="flex items-center gap-2 p-3 bg-verified/10 border border-verified/20 rounded text-sm text-verified">
            <CheckCircle size={16} />Cleared — No encroachment confirmed by authorized review.
          </div>
        )}
      </div>

      <div className="p-3 bg-surface rounded border border-border text-xs text-muted">
        <strong className="text-dark">Data note:</strong> Encroachment detection based on comparison of
        SYNTHETIC DEMO building footprint vs. REAL TGRAC HMDA cadastral boundary.
        The 2.3m discrepancy is intentionally introduced in the demo dataset.
      </div>
    </div>
  )
}
