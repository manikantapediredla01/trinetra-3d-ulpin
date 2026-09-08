import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp, Building, MapPin, Calendar, AlertTriangle,
  Layers, Download, Filter, Activity, ArrowRight
} from 'lucide-react'

interface WardChangeStat {
  ward: string
  zone: string
  properties_monitored: number
  vertical_expansions_detected: number
  unauthorized_floors: number
  added_volume_m3: number
  compliance_rate: number
}

const WARD_STATS: WardChangeStat[] = [
  { ward: 'Banjara Hills (Ward 93)', zone: 'Khairatabad', properties_monitored: 420, vertical_expansions_detected: 18, unauthorized_floors: 14, added_volume_m3: 14200, compliance_rate: 95.7 },
  { ward: 'Jubilee Hills (Ward 94)', zone: 'Khairatabad', properties_monitored: 380, vertical_expansions_detected: 22, unauthorized_floors: 19, added_volume_m3: 18500, compliance_rate: 94.2 },
  { ward: 'Gachibowli (Ward 105)', zone: 'Serilingampally', properties_monitored: 650, vertical_expansions_detected: 35, unauthorized_floors: 31, added_volume_m3: 38400, compliance_rate: 94.6 },
  { ward: 'Madhapur (Ward 107)', zone: 'Serilingampally', properties_monitored: 590, vertical_expansions_detected: 29, unauthorized_floors: 24, added_volume_m3: 29800, compliance_rate: 95.1 },
  { ward: 'Begumpet (Ward 148)', zone: 'Secunderabad', properties_monitored: 310, vertical_expansions_detected: 11, unauthorized_floors: 8, added_volume_m3: 9200, compliance_rate: 96.5 },
]

export default function ChangeAnalytics() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="card p-5 bg-white border-border flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-info text-xs font-semibold">URBAN INTELLIGENCE</span>
            <span className="badge bg-purple-100 text-purple-800 text-xs font-mono font-medium">GHMC MUNICIPAL WIDE</span>
          </div>
          <h1 className="text-2xl font-bold text-navy">
            City-Wide 3D Vertical Expansion Analytics
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Macro-level temporal changes, unauthorized floor proliferation, and Floor Area Ratio (FAR) consumption across GHMC zones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/gis/change-detection')}
            className="btn-secondary text-xs"
          >
            Property Level Change Detection
          </button>
          <button
            onClick={() => navigate('/gis/explorer')}
            className="btn-primary text-xs"
          >
            <Layers className="w-3.5 h-3.5 mr-1" /> View 3D GIS Layers
          </button>
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-xs text-muted font-medium">Monitored Multi-Storey Parcels</div>
          <div className="text-2xl font-black text-navy mt-1">2,350</div>
          <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
            <span className="font-semibold">+140</span> newly indexed this quarter
          </div>
        </div>

        <div className="card">
          <div className="text-xs text-muted font-medium">Vertical Expansions (T1→T2)</div>
          <div className="text-2xl font-black text-rose-600 mt-1">115</div>
          <div className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
            <AlertTriangle className="w-3 h-3" /> 96 unauthorized additions
          </div>
        </div>

        <div className="card">
          <div className="text-xs text-muted font-medium">Unauthorized Built-Up Volume</div>
          <div className="text-2xl font-black text-amber-600 mt-1">110,100 m³</div>
          <div className="text-[11px] text-muted mt-1">
            Across 5 high-growth IT corridors
          </div>
        </div>

        <div className="card">
          <div className="text-xs text-muted font-medium">Revenue Recovery Potential</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">₹42.8 Cr</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">
            Compounding penalty estimations
          </div>
        </div>
      </div>

      {/* Ward Breakdown Table */}
      <div className="card">
        <h3 className="text-sm font-bold text-navy pb-3 border-b border-border">
          Zonal & Ward Vertical Expansion Statistics (Survey Epoch 2022–2026)
        </h3>

        <div className="overflow-x-auto pt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted font-medium">
                <th className="pb-2">Ward / Sector</th>
                <th className="pb-2">Municipal Zone</th>
                <th className="pb-2">Parcels Monitored</th>
                <th className="pb-2">Expansions Detected</th>
                <th className="pb-2">Unauthorized Floors</th>
                <th className="pb-2">Added Volume</th>
                <th className="pb-2">Compliance Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {WARD_STATS.map((w) => (
                <tr key={w.ward} className="hover:bg-gray-50">
                  <td className="py-3 font-semibold text-dark flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-govblue shrink-0" />
                    <span>{w.ward}</span>
                  </td>
                  <td className="py-3 text-muted">{w.zone}</td>
                  <td className="py-3 font-mono">{w.properties_monitored}</td>
                  <td className="py-3 font-mono font-bold text-navy">{w.vertical_expansions_detected}</td>
                  <td className="py-3 font-mono font-bold text-rose-600">+{w.unauthorized_floors}</td>
                  <td className="py-3 font-mono">{w.added_volume_m3.toLocaleString()} m³</td>
                  <td className="py-3 font-mono">
                    <span className="badge-verified text-[10px]">{w.compliance_rate}%</span>
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
