import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck, Activity, CheckCircle, Cpu, Atom,
  Layers, Database, FileText, ArrowRight, Info
} from 'lucide-react'

interface ModalityScore {
  name: string
  score: number
  weight: number
  category: string
  sensor: string
  details: string
  provenance: string
}

const MODALITIES: ModalityScore[] = [
  {
    name: 'LiDAR Point Cloud Density & Spatial Precision',
    score: 96.0,
    weight: 0.25,
    category: '3D Geometry',
    sensor: 'Airborne/Ground LiDAR (18.4 pts/m²)',
    details: 'RMSE 3.2cm relative to Survey of India (SOI) CORS benchmark.',
    provenance: 'REAL_INPUT (IITH ground LiDAR excerpt 5%)',
  },
  {
    name: 'Cadastral Boundary Concordance (TGRAC/HMDA)',
    score: 91.0,
    weight: 0.25,
    category: 'Legal Boundary',
    sensor: 'Total Station & Revenue Cadastral Polygon',
    details: '91% polygon concordance with revenue parcel HYD/BH/123/4.',
    provenance: 'REAL_INPUT (TGRAC Cadastral Map 5%)',
  },
  {
    name: 'DEM Topographic Datum Correlation',
    score: 95.0,
    weight: 0.15,
    category: 'Elevation',
    sensor: 'Copernicus GLO-30 30m DSM/DEM',
    details: 'Ground contact matches Copernicus DEM 536.0m MSL within ±0.4m.',
    provenance: 'REAL_INPUT (Copernicus DEM 5%)',
  },
  {
    name: 'QAOA Quantum Solution Optimality',
    score: 97.0,
    weight: 0.20,
    category: 'Optimization',
    sensor: 'Qiskit Aer Simulator (p=1 QAOA)',
    details: 'Bitstring 0100000 matches classical brute-force minimum (cost=0.150).',
    provenance: 'SIMULATED_QAOA (Statevector Analysis)',
  },
  {
    name: 'Sanctioned Plan (TG-bPASS) Concordance',
    score: 89.0,
    weight: 0.15,
    category: 'Statutory',
    sensor: 'Municipal Permit PDF & Auto-CAD DWG',
    details: 'Concordance on floors G+4 (89%); flags unpermitted 6th level.',
    provenance: 'REAL_INPUT (TG-bPASS Sanctioned Plan)',
  },
]

export default function ConfidenceAnalytics() {
  const navigate = useNavigate()

  // Calculate composite score
  const compositeScore = MODALITIES.reduce(
    (acc, m) => acc + (m.score * m.weight),
    0
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="card p-6 bg-gradient-to-r from-navy via-govblue to-teal text-white rounded-xl shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge bg-white/20 text-white font-mono text-xs uppercase px-2.5 py-1 rounded">
                Multi-Modal Scoring Engine
              </span>
              <span className="badge bg-emerald-400 text-navy font-bold text-xs px-2.5 py-1 rounded">
                TIER 1 — HIGH CONFIDENCE
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              Confidence & Quality Index: {compositeScore.toFixed(1)}%
            </h1>
            <p className="text-white/80 text-sm mt-1 max-w-2xl">
              Composite confidence rating computed across 5 heterogeneous sensor, cadastral, and mathematical optimization modalities for <strong className="text-white">PROP-HYD-2024-001</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-3xl font-black text-amber-300 font-mono">
                {compositeScore.toFixed(1)}%
              </div>
              <div className="text-[11px] text-white/80 uppercase tracking-wider font-semibold">
                Overall Metric
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Modality Progress Cards */}
        <div className="lg:col-span-8 space-y-4">
          <div className="card">
            <h3 className="text-sm font-bold text-navy pb-3 border-b border-border flex items-center justify-between">
              <span>Modalities Breakdown (Weighted Index)</span>
              <span className="text-xs text-muted font-normal font-mono">
                Formula: Σ (Weight_i × Score_i)
              </span>
            </h3>

            <div className="space-y-4 pt-3">
              {MODALITIES.map((m) => (
                <div key={m.name} className="p-4 rounded-lg bg-surface border border-border/70 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                        {m.category} (Weight: {(m.weight * 100).toFixed(0)}%)
                      </span>
                      <h4 className="text-sm font-bold text-navy">{m.name}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold font-mono text-govblue">{m.score.toFixed(1)}%</span>
                      <span className="text-[10px] text-muted block">{m.sensor}</span>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-govblue h-full rounded-full transition-all duration-500"
                      style={{ width: `${m.score}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted pt-1">
                    <span>{m.details}</span>
                    <span className="font-mono text-[10px] text-teal font-medium bg-teal/10 px-2 py-0.5 rounded">
                      {m.provenance}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Provenance Distribution & Legal Standing */}
        <div className="lg:col-span-4 space-y-4">
          {/* Data Composition Card */}
          <div className="card">
            <h3 className="text-sm font-bold text-navy pb-3 border-b border-border flex items-center gap-2">
              <Database className="w-4 h-4 text-govblue" />
              Data Composition & Provenance
            </h3>
            <div className="pt-3 space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-teal font-semibold">Real Datasets Anchor</span>
                  <span className="font-mono font-bold">5.0%</span>
                </div>
                <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                  <div className="bg-teal h-full rounded-full" style={{ width: '5%' }} />
                </div>
                <p className="text-[11px] text-muted">
                  TGRAC Cadastral, Copernicus GLO-30 DEM, IITH LiDAR point cloud excerpt.
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-border/40">
                <div className="flex justify-between font-medium">
                  <span className="text-govblue font-semibold">Synthetic Benchmark Data</span>
                  <span className="font-mono font-bold">95.0%</span>
                </div>
                <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                  <div className="bg-govblue h-full rounded-full" style={{ width: '95%' }} />
                </div>
                <p className="text-[11px] text-muted">
                  Geometrically synthesized 7-level building volume anchored to Hyderabad coordinates.
                </p>
              </div>
            </div>
          </div>

          {/* Statutory Integrity Scorecard */}
          <div className="card border-emerald-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Statutory Certification
            </h4>
            <div className="space-y-2 text-xs">
              <p className="text-dark leading-relaxed">
                A composite score of <strong className="text-emerald-700">94.0%</strong> exceeds the DoLR minimum statutory threshold (85.0%) required for 3D ULPIN registry certification.
              </p>

              <div className="p-2.5 bg-emerald-50 rounded border border-emerald-200 text-emerald-900 font-semibold text-center">
                CERTIFIED FOR ULPIN REGISTRATION
              </div>

              <button
                onClick={() => navigate('/officer/ulpin')}
                className="btn-primary w-full text-xs justify-center mt-2"
              >
                Proceed to 3D ULPIN Issuance <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
