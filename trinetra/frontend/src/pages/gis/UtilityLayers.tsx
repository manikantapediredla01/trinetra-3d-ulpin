import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Layers, Waves, Zap, Shield, AlertTriangle, CheckCircle,
  Eye, EyeOff, Filter, Search, Activity, Database, ArrowLeft
} from 'lucide-react'

interface UtilityAssetItem {
  id: string
  name: string
  type: 'WATER' | 'POWER' | 'SEWER' | 'DRAINAGE'
  diameter_mm: number
  depth_m: number
  elevation_msl: number
  material: string
  source: string
  clash_status: 'SAFE' | 'WARNING' | 'CRITICAL'
  clash_distance_m: number
}

const UTILITIES_DATA: UtilityAssetItem[] = [
  { id: 'UTL-WTR-001', name: 'Municipal Feeder Trunk Line', type: 'WATER', diameter_mm: 300, depth_m: -1.8, elevation_msl: 534.2, material: 'Ductile Iron (DI)', source: 'HMWSSB Water Grid (Real 5%)', clash_status: 'SAFE', clash_distance_m: 4.2 },
  { id: 'UTL-PWR-002', name: '11kV High Tension Cable Conduit', type: 'POWER', diameter_mm: 150, depth_m: -1.2, elevation_msl: 534.8, material: 'Armoured XLPE', source: 'TSSPDCL GIS Map (Real 5%)', clash_status: 'SAFE', clash_distance_m: 2.8 },
  { id: 'UTL-SWR-003', name: 'Secondary Sewer Trunk Line', type: 'SEWER', diameter_mm: 450, depth_m: -2.9, elevation_msl: 533.1, material: 'Reinforced Concrete (RCC)', source: 'GHMC Drainage Masterplan', clash_status: 'WARNING', clash_distance_m: 0.9 },
  { id: 'UTL-DRN-004', name: 'Storm Water Nala Culvert', type: 'DRAINAGE', diameter_mm: 800, depth_m: -1.5, elevation_msl: 534.5, material: 'Precast Box Drain', source: 'GHMC Disaster Cell GIS', clash_status: 'SAFE', clash_distance_m: 6.5 },
  { id: 'UTL-PWR-005', name: 'Low Voltage Distribution Loop', type: 'POWER', diameter_mm: 90, depth_m: -0.8, elevation_msl: 535.2, material: 'PVC Encased Conduit', source: 'TSSPDCL GIS Map', clash_status: 'SAFE', clash_distance_m: 3.1 },
]

export default function UtilityLayers() {
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [maxDepth, setMaxDepth] = useState<number>(-5.0)
  const [selectedAsset, setSelectedAsset] = useState<UtilityAssetItem | null>(UTILITIES_DATA[2])

  const filteredUtilities = UTILITIES_DATA.filter((u) => {
    if (selectedType !== 'ALL' && u.type !== selectedType) return false
    if (u.depth_m < maxDepth) return false
    return true
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="card p-5 bg-white border-border flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-info text-xs font-semibold">SUBTERRANEAN GIS</span>
            <span className="badge-real text-xs font-mono">GHMC & TSSPDCL REAL GRIDS (5%)</span>
          </div>
          <h1 className="text-2xl font-bold text-navy">
            Underground Infrastructure & Utility Layers
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Subsurface clash detection and depth profiling for <strong className="text-navy">Srinivas Commercial Complex</strong> (Basement: -3.5m MSL).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/gis/twin/PROP-HYD-2024-001')}
            className="btn-secondary text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Digital Twin
          </button>
          <button
            onClick={() => navigate('/gis/explorer')}
            className="btn-primary text-xs"
          >
            <Layers className="w-3.5 h-3.5 mr-1" /> View in Cesium 3D
          </button>
        </div>
      </div>

      {/* Subsurface Depth Profile Visualization */}
      <div className="card p-5 bg-slate-950 border-slate-800 text-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h2 className="text-sm font-bold flex items-center gap-2 text-cyan-300">
            <Activity className="w-4 h-4 text-cyan-400" />
            Elevation & Subsurface Cross-Section (North-South Transect)
          </h2>
          <span className="text-[11px] font-mono text-slate-400">
            Ground Datum: 536.0m MSL (Banjara Hills)
          </span>
        </div>

        {/* Depth Profile Graphic */}
        <div className="relative h-64 bg-slate-900/80 border border-slate-800 rounded-lg p-4 overflow-hidden flex flex-col justify-between">
          {/* Surface Level Line */}
          <div className="border-b-2 border-emerald-500 border-dashed pb-1 flex justify-between items-center text-[10px] font-mono text-emerald-400">
            <span>SURFACE GROUND LEVEL (+0.0m / 536.0m MSL)</span>
            <span>HYDERABAD REVENUE PARCEL DATUM</span>
          </div>

          {/* Building Basement Shaded Box */}
          <div className="absolute right-12 top-[60px] w-64 h-[120px] bg-blue-950/60 border-2 border-blue-500/80 rounded flex flex-col items-center justify-center text-center p-2 z-10">
            <span className="text-xs font-bold text-cyan-300">PROP-HYD-2024-001</span>
            <span className="text-[10px] text-blue-200">Basement Foundation (-3.5m Depth)</span>
            <span className="text-[9px] font-mono text-cyan-400/90 mt-1">Foundation Level: 532.5m MSL</span>
          </div>

          {/* Subsurface Utility Depth Bands */}
          <div className="space-y-6 pt-4 relative z-0">
            {UTILITIES_DATA.map((u) => {
              const depthPct = Math.min(Math.abs(u.depth_m) * 20, 90)
              let color = 'bg-sky-500 border-sky-400'
              if (u.type === 'POWER') color = 'bg-amber-500 border-amber-400'
              if (u.type === 'SEWER') color = 'bg-purple-500 border-purple-400'
              if (u.type === 'DRAINAGE') color = 'bg-teal-500 border-teal-400'

              return (
                <div
                  key={u.id}
                  onClick={() => setSelectedAsset(u)}
                  className={`flex items-center gap-3 cursor-pointer group transition-all p-1.5 rounded ${
                    selectedAsset?.id === u.id ? 'bg-white/10 ring-1 ring-cyan-400' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="w-16 font-mono text-[10px] text-slate-400">{u.depth_m}m</div>
                  <div className={`w-3.5 h-3.5 rounded-full border-2 ${color} shrink-0 group-hover:scale-125 transition-transform`} />
                  <div className="flex-1 border-t border-slate-700/60 flex items-center justify-between pl-2">
                    <span className="text-xs font-medium text-slate-200 group-hover:text-cyan-300">
                      {u.name} ({u.diameter_mm}mm)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 mr-80">
                      {u.elevation_msl}m MSL
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bottom Depth Reference */}
          <div className="border-t border-slate-800 pt-1 flex justify-between text-[10px] font-mono text-slate-500">
            <span>BEDROCK STRATA (-5.0m Depth / 531.0m MSL)</span>
            <span>SUBTERRANEAN SCAN RESOLUTION: ±3cm GPR</span>
          </div>
        </div>
      </div>

      {/* Utilities Grid & Clash Detection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Asset Table & Filtering */}
        <div className="lg:col-span-8 space-y-4">
          <div className="card">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
              <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                <Filter className="w-4 h-4 text-govblue" />
                Subsurface Asset Registry ({filteredUtilities.length})
              </h3>

              <div className="flex items-center gap-1.5">
                {['ALL', 'WATER', 'POWER', 'SEWER', 'DRAINAGE'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      selectedType === t
                        ? 'bg-govblue text-white'
                        : 'bg-surface text-muted hover:bg-gray-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto pt-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted font-medium">
                    <th className="pb-2">Asset ID</th>
                    <th className="pb-2">Utility Network</th>
                    <th className="pb-2">Diameter</th>
                    <th className="pb-2">Depth</th>
                    <th className="pb-2">Foundation Proximity</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredUtilities.map((u) => (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedAsset(u)}
                      className={`cursor-pointer transition-colors ${
                        selectedAsset?.id === u.id ? 'bg-govblue/5 font-medium' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="py-2.5 font-mono text-govblue">{u.id}</td>
                      <td className="py-2.5 font-medium text-dark">{u.name}</td>
                      <td className="py-2.5 font-mono">{u.diameter_mm} mm</td>
                      <td className="py-2.5 font-mono">{u.depth_m} m</td>
                      <td className="py-2.5 font-mono">{u.clash_distance_m} m clearance</td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            u.clash_status === 'SAFE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {u.clash_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Selected Asset Dossier */}
        <div className="lg:col-span-4 space-y-4">
          {selectedAsset && (
            <div className="card border-govblue/30 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-govblue/10 text-govblue px-2 py-0.5 rounded font-semibold">
                    {selectedAsset.type} ASSET
                  </span>
                  <h3 className="text-sm font-bold text-navy mt-1">{selectedAsset.name}</h3>
                </div>
                <span className="font-mono text-xs font-bold text-govblue">{selectedAsset.id}</span>
              </div>

              <div className="pt-3 space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted">Conduit Diameter:</span>
                  <span className="font-semibold text-dark">{selectedAsset.diameter_mm} mm</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted">Burial Depth:</span>
                  <span className="font-mono font-bold text-navy">{selectedAsset.depth_m} meters</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted">Absolute Elevation:</span>
                  <span className="font-mono text-dark">{selectedAsset.elevation_msl} m MSL</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted">Pipe Material:</span>
                  <span className="font-medium text-dark">{selectedAsset.material}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted">Data Provenance:</span>
                  <span className="font-semibold text-emerald-700">{selectedAsset.source}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted">Distance to Basement:</span>
                  <span className="font-mono font-bold text-dark">{selectedAsset.clash_distance_m} m</span>
                </div>
              </div>

              {selectedAsset.clash_status === 'WARNING' && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 leading-tight flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Proximity Warning:</strong> This asset passes within 0.9m of the building basement pile wall. Requires vibration monitoring during any foundation excavation.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Regulatory Clearance Card */}
          <div className="card">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-govblue" />
              Municipal NOC Status
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 flex items-center justify-between">
                <span>HMWSSB Water Supply</span>
                <span className="font-semibold">NOC Cleared</span>
              </div>
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 flex items-center justify-between">
                <span>TSSPDCL Electrical</span>
                <span className="font-semibold">NOC Cleared</span>
              </div>
              <div className="p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 flex items-center justify-between">
                <span>Sewerage Buffer (0.9m)</span>
                <span className="font-semibold">Conditional NOC</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
