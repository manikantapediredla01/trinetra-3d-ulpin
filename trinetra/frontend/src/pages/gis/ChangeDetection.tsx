import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  History, Calendar, AlertTriangle, ArrowRight, CheckCircle,
  Eye, Sliders, Layers, FileText, Download, Shield, Activity
} from 'lucide-react'

export default function ChangeDetection() {
  const navigate = useNavigate()
  const [sliderPosition, setSliderPosition] = useState<number>(50)
  const [viewMode, setViewMode] = useState<'SPLIT' | 'T1' | 'T2'>('SPLIT')

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="card p-5 bg-white border-border flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-critical text-xs font-semibold">TEMPORAL 3D AUDIT</span>
            <span className="badge-info text-xs font-mono">EPOCH T1 (2022) vs EPOCH T2 (2026)</span>
          </div>
          <h1 className="text-2xl font-bold text-navy">
            Temporal 3D Change Detection & Volumetric Expansion
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Volumetric comparison for <strong className="text-navy">Srinivas Commercial Complex</strong> (PROP-HYD-2024-001).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/review/discrepancy')}
            className="btn-secondary text-xs"
          >
            <FileText className="w-3.5 h-3.5 mr-1" /> View Discrepancy Log
          </button>
          <button
            onClick={() => navigate('/analytics/changes')}
            className="btn-primary text-xs"
          >
            <Activity className="w-3.5 h-3.5 mr-1" /> City-wide Analytics
          </button>
        </div>
      </div>

      {/* Temporal Comparison Visualizer */}
      <div className="card p-0 overflow-hidden bg-slate-950 border-slate-800 shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <History className="w-4 h-4" /> 4-Year Volumetric Delta Analysis
            </span>
            <span className="text-[11px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded font-mono">
              +1 Unauthorized Floor Detected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('SPLIT')}
              className={`px-3 py-1 rounded text-xs font-medium ${
                viewMode === 'SPLIT' ? 'bg-cyan-500 text-black font-semibold' : 'bg-white/10 text-white'
              }`}
            >
              Side-by-Side Split
            </button>
            <button
              onClick={() => setViewMode('T1')}
              className={`px-3 py-1 rounded text-xs font-medium ${
                viewMode === 'T1' ? 'bg-cyan-500 text-black font-semibold' : 'bg-white/10 text-white'
              }`}
            >
              Epoch T1 (2022)
            </button>
            <button
              onClick={() => setViewMode('T2')}
              className={`px-3 py-1 rounded text-xs font-medium ${
                viewMode === 'T2' ? 'bg-cyan-500 text-black font-semibold' : 'bg-white/10 text-white'
              }`}
            >
              Epoch T2 (2026)
            </button>
          </div>
        </div>

        {/* Visual 3D Building Models (T1 vs T2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 p-8 min-h-[380px]">
          {/* Epoch T1 Model */}
          {(viewMode === 'SPLIT' || viewMode === 'T1') && (
            <div className="flex flex-col items-center justify-center p-4">
              <div className="text-center mb-6">
                <span className="badge bg-slate-800 text-slate-300 font-mono text-[11px] px-2 py-1 rounded">
                  SURVEY EPOCH T1: 15 MARCH 2022
                </span>
                <h3 className="text-sm font-bold text-white mt-1">Sanctioned Baseline Construction</h3>
                <p className="text-[11px] text-slate-400">Ground + 4 Upper Floors (5 Levels Above Ground)</p>
              </div>

              {/* T1 Building Stack (5 floors) */}
              <div className="w-56 flex flex-col gap-1.5 opacity-90 select-none">
                <div className="w-full h-3 bg-slate-600 rounded-t flex items-center justify-center text-[9px] text-slate-300 font-mono">
                  ROOF (548.8m MSL)
                </div>
                {[4, 3, 2, 1, 0].map((lvl) => (
                  <div
                    key={lvl}
                    className="h-10 bg-slate-800/90 border border-slate-600 rounded flex items-center justify-between px-3 text-xs text-slate-200"
                  >
                    <span>{lvl === 0 ? 'Ground Floor' : `Level ${lvl}`}</span>
                    <span className="text-[10px] font-mono text-slate-400">252 m²</span>
                  </div>
                ))}
                <div className="h-9 bg-amber-950/50 border border-amber-800/80 rounded flex items-center justify-between px-3 text-xs text-amber-300">
                  <span>Basement Parking</span>
                  <span className="text-[10px] font-mono">532.5m MSL</span>
                </div>
              </div>

              <div className="mt-6 text-[11px] font-mono text-slate-400">
                Height: 16.0m | Volume: 4,032.0 m³
              </div>
            </div>
          )}

          {/* Epoch T2 Model */}
          {(viewMode === 'SPLIT' || viewMode === 'T2') && (
            <div className="flex flex-col items-center justify-center p-4 bg-slate-900/20">
              <div className="text-center mb-6">
                <span className="badge bg-rose-950/80 text-rose-300 border border-rose-800 font-mono text-[11px] px-2 py-1 rounded">
                  SURVEY EPOCH T2: 01 JUNE 2026
                </span>
                <h3 className="text-sm font-bold text-white mt-1">Current Physical 3D Survey</h3>
                <p className="text-[11px] text-rose-400 font-medium">Ground + 5 Upper Floors (1 New Floor Added)</p>
              </div>

              {/* T2 Building Stack (6 floors with highlighted top floor) */}
              <div className="w-56 flex flex-col gap-1.5 select-none">
                <div className="w-full h-3 bg-rose-600 rounded-t flex items-center justify-center text-[9px] text-white font-mono shadow">
                  NEW ROOF (552.0m MSL)
                </div>

                {/* Newly Added Floor */}
                <div className="h-10 bg-rose-600/80 border-2 border-rose-400 rounded flex items-center justify-between px-3 text-xs text-white font-bold animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.5)] relative">
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Level 5 (NEW)</span>
                  </div>
                  <span className="text-[10px] font-mono">+252 m²</span>
                  <span className="absolute -right-20 bg-rose-600 text-[9px] px-1.5 py-0.5 rounded font-mono uppercase">
                    UNAUTHORIZED
                  </span>
                </div>

                {[4, 3, 2, 1, 0].map((lvl) => (
                  <div
                    key={lvl}
                    className="h-10 bg-slate-800/90 border border-slate-600 rounded flex items-center justify-between px-3 text-xs text-slate-200"
                  >
                    <span>{lvl === 0 ? 'Ground Floor' : `Level ${lvl}`}</span>
                    <span className="text-[10px] font-mono text-slate-400">252 m²</span>
                  </div>
                ))}
                <div className="h-9 bg-amber-950/50 border border-amber-800/80 rounded flex items-center justify-between px-3 text-xs text-amber-300">
                  <span>Basement Parking</span>
                  <span className="text-[10px] font-mono">532.5m MSL</span>
                </div>
              </div>

              <div className="mt-6 text-[11px] font-mono text-rose-400 font-semibold">
                Height: 19.2m (+3.2m) | Volume: 4,838.4 m³ (+806.4 m³)
              </div>
            </div>
          )}
        </div>

        {/* Interactive Comparison Range Slider */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-4 text-xs text-slate-300">
          <span className="font-mono text-slate-400 shrink-0">T1 Baseline</span>
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={(e) => setSliderPosition(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
          <span className="font-mono text-rose-400 shrink-0">T2 Present</span>
        </div>
      </div>

      {/* Delta Metrics Table & Enforcement Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <div className="card">
            <h3 className="text-sm font-bold text-navy pb-3 border-b border-border">
              Volumetric & Structural Deviation Ledger
            </h3>
            <div className="overflow-x-auto pt-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted font-medium">
                    <th className="pb-2">Metric Parameter</th>
                    <th className="pb-2">Epoch T1 (2022)</th>
                    <th className="pb-2">Epoch T2 (2026)</th>
                    <th className="pb-2">Volumetric Delta</th>
                    <th className="pb-2">Permit Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr>
                    <td className="py-2.5 font-medium text-dark">Building Vertical Height</td>
                    <td className="py-2.5 font-mono">16.0 meters</td>
                    <td className="py-2.5 font-mono">19.2 meters</td>
                    <td className="py-2.5 font-mono font-bold text-rose-600">+3.2 m (+20.0%)</td>
                    <td className="py-2.5"><span className="badge-critical">Exceeds Sanction</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium text-dark">Number of Above-Ground Floors</td>
                    <td className="py-2.5 font-mono">5 Floors (G+4)</td>
                    <td className="py-2.5 font-mono">6 Floors (G+5)</td>
                    <td className="py-2.5 font-mono font-bold text-rose-600">+1 Floor Level</td>
                    <td className="py-2.5"><span className="badge-critical">Unregistered</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium text-dark">Cumulative Built-up Area</td>
                    <td className="py-2.5 font-mono">1,260.0 m²</td>
                    <td className="py-2.5 font-mono">1,512.0 m²</td>
                    <td className="py-2.5 font-mono font-bold text-rose-600">+252.0 m²</td>
                    <td className="py-2.5"><span className="badge-critical">FAR Violation</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium text-dark">Total 3D Enclosed Volume</td>
                    <td className="py-2.5 font-mono">4,032.0 m³</td>
                    <td className="py-2.5 font-mono">4,838.4 m³</td>
                    <td className="py-2.5 font-mono font-bold text-rose-600">+806.4 m³</td>
                    <td className="py-2.5"><span className="badge-critical">Volumetric Breach</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium text-dark">Ground Contact Footprint</td>
                    <td className="py-2.5 font-mono">252.0 m²</td>
                    <td className="py-2.5 font-mono">252.0 m²</td>
                    <td className="py-2.5 font-mono text-emerald-600">0.0 m² (Unchanged)</td>
                    <td className="py-2.5"><span className="badge-verified">Compliant</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Legal Enforcement Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="card border-rose-200 shadow-md">
            <h3 className="text-sm font-bold text-navy flex items-center gap-2 pb-2 border-b border-border">
              <Shield className="w-4 h-4 text-rose-600" />
              Statutory Enforcement Protocol
            </h3>
            <div className="pt-3 space-y-3 text-xs">
              <p className="text-dark leading-relaxed">
                Under the <strong>Telangana Municipalities Act, 2019</strong>, vertical expansions without prior building sanction are subject to compounding fines or structural regularization notices.
              </p>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-900 font-medium">
                Case Status: <strong>Notice Drafted (Section 178)</strong>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => navigate('/review/discrepancy')}
                  className="btn-danger w-full text-xs justify-center"
                >
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Issue Notice to Builder
                </button>
                <button
                  onClick={() => navigate('/review/encroachment')}
                  className="btn-secondary w-full text-xs justify-center"
                >
                  Inspect West Encroachment <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
