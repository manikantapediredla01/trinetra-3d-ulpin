import { useState } from 'react'
import {
  FileText, Shield, Filter, Search, Download,
  CheckCircle, Lock, Calendar, ExternalLink
} from 'lucide-react'

interface AuditEvent {
  id: string
  action: string
  resource_type: string
  resource_id: string
  user: string
  ip_address: string
  timestamp: string
  status: 'COMMITTED' | 'VERIFIED'
  details: string
}

const AUDIT_EVENTS: AuditEvent[] = [
  { id: 'AUD-9021', action: 'ULPIN_ISSUED', resource_type: 'PROPERTY', resource_id: 'PROP-HYD-2024-001', user: 'gis.officer', ip_address: '10.0.4.12', timestamp: '2026-09-07 11:45:20', status: 'VERIFIED', details: 'Assigned 3D ULPIN IN-3D-HYD0-2024-0001 after 8-check validation passage' },
  { id: 'AUD-9020', action: 'VALIDATION_COMPLETED', resource_type: 'VALIDATION_ENGINE', resource_id: 'VAL-PASS-HYD-001', user: 'gis.officer', ip_address: '10.0.4.12', timestamp: '2026-09-07 11:32:05', status: 'VERIFIED', details: '8/8 geometric & topological checks evaluated as VALIDATED' },
  { id: 'AUD-9019', action: 'QAOA_CONVERGENCE', resource_type: 'QUANTUM_SOLVER', resource_id: 'QUBO-RUN-001', user: 'gis.officer', ip_address: '10.0.4.12', timestamp: '2026-09-07 11:15:40', status: 'COMMITTED', details: 'Bitstring 0100000 sampled with 78.4% probability across 1024 shots' },
  { id: 'AUD-9018', action: 'ENCROACHMENT_FLAGGED', resource_type: 'ENCROACHMENT', resource_id: 'ENC-HYD-2024-001', user: 'system_auto', ip_address: '127.0.0.1', timestamp: '2026-09-07 10:55:12', status: 'VERIFIED', details: '2.3m western boundary overhang flagged vs parcel HYD/BH/123/5' },
  { id: 'AUD-9017', action: 'PREPROCESSING_STAGE_11', resource_type: 'PIPELINE', resource_id: 'RUN-PRE-001', user: 'gis.officer', ip_address: '10.0.4.12', timestamp: '2026-09-07 10:40:00', status: 'COMMITTED', details: 'Unified CRS to EPSG:4326, normalized HAG from Copernicus DEM' },
  { id: 'AUD-9016', action: 'DATASET_INGESTION', resource_type: 'DATASET', resource_id: 'DS-LIDAR-001', user: 'gis.officer', ip_address: '10.0.4.12', timestamp: '2026-09-07 10:05:32', status: 'COMMITTED', details: 'Uploaded IITH_ground_lidar_clip.las (450,000 points, 14.2 MB)' },
  { id: 'AUD-9015', action: 'USER_AUTHENTICATION', resource_type: 'AUTH_SESSION', resource_id: 'SESS-8291', user: 'gis.officer', ip_address: '10.0.4.12', timestamp: '2026-09-07 09:50:11', status: 'VERIFIED', details: 'JWT access token issued for role survey_gis_officer' },
]

export default function AuditLogs() {
  const [events] = useState<AuditEvent[]>(AUDIT_EVENTS)
  const [search, setSearch] = useState('')
  const [filterAction, setFilterAction] = useState('ALL')

  const filtered = events.filter((e) => {
    if (filterAction !== 'ALL' && e.action !== filterAction) return false
    if (
      search &&
      !e.action.toLowerCase().includes(search.toLowerCase()) &&
      !e.user.toLowerCase().includes(search.toLowerCase()) &&
      !e.resource_id.toLowerCase().includes(search.toLowerCase())
    )
      return false
    return true
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="card p-5 bg-white border-border flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-critical text-xs font-semibold">SECURITY AUDIT</span>
            <span className="badge-verified text-xs font-mono">APPEND-ONLY IMMUTABLE LEDGER</span>
          </div>
          <h1 className="text-2xl font-bold text-navy">
            Platform Audit Trail & Security Ledger
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Cryptographically sealed operational audit events for legal admissibility in revenue courts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn-secondary text-xs">
            <Download className="w-3.5 h-3.5 mr-1" /> Export Audit Trail (CSV)
          </button>
        </div>
      </div>

      {/* Filter and Ledger Table Card */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="relative w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted" />
              <input
                type="text"
                placeholder="Search action, user, or resource..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-8 text-xs"
              />
            </div>

            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="input text-xs w-48"
            >
              <option value="ALL">All Event Types</option>
              <option value="ULPIN_ISSUED">ULPIN_ISSUED</option>
              <option value="VALIDATION_COMPLETED">VALIDATION_COMPLETED</option>
              <option value="QAOA_CONVERGENCE">QAOA_CONVERGENCE</option>
              <option value="ENCROACHMENT_FLAGGED">ENCROACHMENT_FLAGGED</option>
              <option value="DATASET_INGESTION">DATASET_INGESTION</option>
            </select>
          </div>

          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded flex items-center gap-1">
            <Lock className="w-3 h-3" /> Hash Chain Verified
          </span>
        </div>

        <div className="overflow-x-auto pt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted font-medium">
                <th className="pb-2">Audit ID</th>
                <th className="pb-2">Timestamp (UTC)</th>
                <th className="pb-2">Action / Event</th>
                <th className="pb-2">Target Resource</th>
                <th className="pb-2">Originating User</th>
                <th className="pb-2">Client IP</th>
                <th className="pb-2">Event Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((ev) => (
                <tr key={ev.id} className="hover:bg-gray-50">
                  <td className="py-3 font-mono font-bold text-govblue">{ev.id}</td>
                  <td className="py-3 font-mono text-muted">{ev.timestamp}</td>
                  <td className="py-3">
                    <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                      {ev.action}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-dark">{ev.resource_id}</td>
                  <td className="py-3 font-medium text-navy">@{ev.user}</td>
                  <td className="py-3 font-mono text-muted">{ev.ip_address}</td>
                  <td className="py-3 text-dark max-w-xs truncate">{ev.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
