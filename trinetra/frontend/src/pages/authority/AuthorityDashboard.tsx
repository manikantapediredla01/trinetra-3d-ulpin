import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Shield, CheckCircle, AlertTriangle, FileText,
  Award, Stamp, Users, ArrowRight, Eye, Download
} from 'lucide-react'
import toast from 'react-hot-toast'

interface PendingApproval {
  id: string
  property_name: string
  location: string
  ulpin_draft: string
  floors: number
  confidence: number
  validation_status: string
  encroachment_flag: boolean
}

const PENDING_LIST: PendingApproval[] = [
  {
    id: 'PROP-HYD-2024-001',
    property_name: 'Srinivas Commercial Complex',
    location: 'Banjara Hills, Hyderabad',
    ulpin_draft: 'IN-3D-HYD0-2024-0001',
    floors: 7,
    confidence: 0.94,
    validation_status: '8/8 PASS',
    encroachment_flag: true,
  },
  {
    id: 'PROP-VIZ-2024-008',
    property_name: 'Bayview Executive Towers',
    location: 'Siripuram, Visakhapatnam',
    ulpin_draft: 'IN-3D-VIZ0-2024-0008',
    floors: 9,
    confidence: 0.96,
    validation_status: '8/8 PASS',
    encroachment_flag: false,
  },
]

export default function AuthorityDashboard() {
  const navigate = useNavigate()
  const [approvals, setApprovals] = useState(PENDING_LIST)

  const handleSealAndSign = (id: string) => {
    toast.success(`Digital Sign & Seal applied to ${id}! 3D ULPIN certified.`)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="card p-6 bg-gradient-to-r from-navy via-[#1b3d68] to-govblue text-white rounded-xl shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge bg-white/20 text-white font-mono text-xs uppercase px-2.5 py-1 rounded">
                Department of Land Resources (DoLR)
              </span>
              <span className="badge bg-amber-400 text-navy font-bold text-xs px-2.5 py-1 rounded">
                LAND RECORD AUTHORITY
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              Land Record Authority Executive Portal
            </h1>
            <p className="text-white/80 text-sm mt-1 max-w-2xl">
              Statutory oversight for 3D ULPIN certification, revenue court adjudications, and inter-departmental urban compliance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/review/encroachment')}
              className="btn bg-white/10 hover:bg-white/20 text-white text-xs border border-white/20"
            >
              Encroachment Cases
            </button>
            <button
              onClick={() => navigate('/gis/explorer')}
              className="btn bg-white text-navy font-bold text-xs shadow hover:bg-gray-100"
            >
              Open 3D Registry GIS
            </button>
          </div>
        </div>
      </div>

      {/* Aggregate Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-xs text-muted font-medium">Certified 3D ULPINs Issued</div>
          <div className="text-2xl font-black text-navy mt-1">1,842</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">100% PostGIS Geocoded</div>
        </div>

        <div className="card">
          <div className="text-xs text-muted font-medium">Pending Statutory Seals</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{approvals.length} Properties</div>
          <div className="text-[11px] text-muted mt-1">Awaiting digital signature</div>
        </div>

        <div className="card">
          <div className="text-xs text-muted font-medium">Disputes in Revenue Tribunal</div>
          <div className="text-2xl font-black text-rose-600 mt-1">18 Cases</div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">Western Boundary priority</div>
        </div>

        <div className="card">
          <div className="text-xs text-muted font-medium">Total Volumetric Registered</div>
          <div className="text-2xl font-black text-dark mt-1">4.2M m³</div>
          <div className="text-[11px] text-govblue font-semibold mt-1">LoD-2 3D Geometry</div>
        </div>
      </div>

      {/* Pending Seal & Approval Queue */}
      <div className="card">
        <h3 className="text-sm font-bold text-navy pb-3 border-b border-border flex items-center justify-between">
          <span>Pending 3D ULPIN Final Sign & Seal Queue</span>
          <span className="text-xs text-muted font-normal">Officer Recommendation Complete</span>
        </h3>

        <div className="overflow-x-auto pt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted font-medium">
                <th className="pb-2">Property Name & ID</th>
                <th className="pb-2">Location</th>
                <th className="pb-2">Draft 3D ULPIN</th>
                <th className="pb-2">Levels</th>
                <th className="pb-2">Confidence</th>
                <th className="pb-2">Validation</th>
                <th className="pb-2">Notice Flag</th>
                <th className="pb-2 text-right">Statutory Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {approvals.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="py-3">
                    <div className="font-bold text-navy">{p.property_name}</div>
                    <div className="font-mono text-[11px] text-govblue">{p.id}</div>
                  </td>
                  <td className="py-3 text-muted">{p.location}</td>
                  <td className="py-3 font-mono font-bold text-dark">{p.ulpin_draft}</td>
                  <td className="py-3 font-medium">{p.floors} Levels</td>
                  <td className="py-3 font-mono font-semibold text-emerald-700">
                    {(p.confidence * 100).toFixed(0)}%
                  </td>
                  <td className="py-3">
                    <span className="badge-verified text-[10px]">{p.validation_status}</span>
                  </td>
                  <td className="py-3">
                    {p.encroachment_flag ? (
                      <span className="badge-critical text-[10px] flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Encroachment Flag
                      </span>
                    ) : (
                      <span className="badge-verified text-[10px]">Clean</span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleSealAndSign(p.id)}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      <Stamp className="w-3.5 h-3.5 mr-1" /> Sign & Issue
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
