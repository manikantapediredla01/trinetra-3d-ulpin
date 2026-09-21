import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Layers, Building, Box, Shield,
  QrCode, AlertTriangle, CheckCircle, Sliders, RotateCcw,
  Maximize2, ChevronRight
} from 'lucide-react'
import { propertiesApi } from '@/services/api'
import DigitalTwinModal from '@/components/DigitalTwinModal'

interface FloorUnitInfo {
  unit_number: string
  floor_level: number
  name: string
  usage: string
  area_m2: number
  elevation_msl: number
  ceiling_m: number
  tenant: string
  status: 'VERIFIED' | 'FLAGGED'
}

export default function DigitalTwin() {
  const { propertyId } = useParams()
  const navigate = useNavigate()

  const [properties, setProperties] = useState<any[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(propertyId || 'PROP-HYD-2024-001')
  const [propertyData, setPropertyData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const [selectedFloor, setSelectedFloor] = useState<number | null>(null)
  const [selectedUnit, setSelectedUnit] = useState<FloorUnitInfo | null>(null)
  const [wireframeMode, setWireframeMode] = useState(false)
  const [showCadastral, setShowCadastral] = useState(true)
  const [showEncroachment, setShowEncroachment] = useState(true)
  const [explodeView, setExplodeView] = useState(false)
  const [rotationAngle, setRotationAngle] = useState(25)

  // Fetch properties list
  useEffect(() => {
    propertiesApi.list()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setProperties(res.data)
        }
      })
      .catch(() => {})
  }, [])

  // Fetch single property details
  useEffect(() => {
    if (!selectedPropertyId) return
    setLoading(true)
    propertiesApi.get(selectedPropertyId)
      .then((res) => {
        setPropertyData(res.data)
        const units = res.data?.floor_units || res.data?.property?.floors || []
        if (units.length > 0) {
          setSelectedUnit(units[0])
          setSelectedFloor(units[0].floor_level)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedPropertyId])

  const prop = propertyData?.property || {}
  const floorUnits: FloorUnitInfo[] = propertyData?.floor_units || prop?.floors || []
  const distinctFloors = Array.from(new Set(floorUnits.map((u) => u.floor_level))).sort((a, b) => b - a)

  const activeFloorUnits = selectedFloor !== null
    ? floorUnits.filter((u) => u.floor_level === selectedFloor)
    : floorUnits

  const isEncroached = prop?.encroachment?.has_encroachment || prop?.status === 'FLAGGED'

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Top Banner with Property Switcher */}
      <div className="card p-5 bg-white border-border flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-verified text-xs font-semibold">3D DIGITAL PROPERTY TWIN</span>
            <span className="badge-info text-xs font-mono">LoD-2 VOLUMETRIC MODEL</span>
            {isEncroached ? (
              <span className="badge-critical text-xs flex items-center gap-1 font-semibold">
                <AlertTriangle className="w-3 h-3" /> Encroachment Flagged
              </span>
            ) : (
              <span className="badge-verified text-xs flex items-center gap-1 font-semibold">
                <CheckCircle className="w-3 h-3" /> Verified Compliant
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-3">
            {prop?.name || '3D Digital Twin Workbench'}
          </h1>
          <p className="text-xs text-muted mt-0.5">
            ULPIN: <strong className="font-mono text-govblue font-bold">{prop?.ulpin || 'IN-3D-HYD0-2024-0001'}</strong> | Parcel: <span className="font-medium text-dark">{prop?.parcel_ref || 'HYD/BH/123/4'}</span> | {prop?.district || 'Hyderabad'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Property Select Dropdown */}
          <div className="flex items-center gap-2 bg-surface border border-border px-3 py-1.5 rounded-md">
            <span className="text-xs text-muted font-medium">Switch Twin:</span>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="bg-transparent text-xs font-bold text-navy outline-none cursor-pointer"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.floor_count} Floors)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary text-xs"
          >
            <Maximize2 className="w-3.5 h-3.5 mr-1" /> Open Twin Modal
          </button>
          <button
            onClick={() => navigate('/officer/passport')}
            className="btn-secondary text-xs"
          >
            <QrCode className="w-3.5 h-3.5 mr-1" /> View Passport
          </button>
          <button
            onClick={() => navigate('/gis/explorer')}
            className="btn-secondary text-xs"
          >
            <Layers className="w-3.5 h-3.5 mr-1" /> 3D GIS Viewer
          </button>
        </div>
      </div>

      {/* Main Twin Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Interactive 3D Isometric Canvas */}
        <div className="lg:col-span-8 space-y-4">
          <div className="card p-0 overflow-hidden bg-slate-950 border-slate-800 shadow-xl relative min-h-[540px] flex flex-col justify-between">
            {/* 3D Viewport Controls Overlay */}
            <div className="p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/80 font-mono flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded">
                  <Box className="w-3.5 h-3.5 text-cyan-400" /> WebGL LoD-2 Mesh
                </span>
                <span className="text-xs text-cyan-300/80 font-mono bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
                  {prop?.floor_count || floorUnits.length} Levels | {prop?.height_m || 22.4}m MSL
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExplodeView(!explodeView)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    explodeView ? 'bg-cyan-500 text-black font-semibold' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Sliders className="w-3 h-3 inline mr-1" /> Explode View
                </button>
                <button
                  onClick={() => setWireframeMode(!wireframeMode)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    wireframeMode ? 'bg-cyan-500 text-black font-semibold' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Wireframe
                </button>
                <button
                  onClick={() => setRotationAngle((r) => (r + 45) % 360)}
                  className="px-2.5 py-1 rounded text-xs bg-white/10 text-white hover:bg-white/20"
                  title="Rotate Model"
                >
                  <RotateCcw className="w-3 h-3 inline mr-1" /> Rotate
                </button>
              </div>
            </div>

            {/* 3D Canvas / Sliced Isometric Graphic */}
            <div className="relative flex-1 flex items-center justify-center p-8 select-none overflow-hidden">
              {/* Perspective Backdrop Grid */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle at 50% 50%, #008C95 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Multi-Storey Building Stack Visualizer */}
              <div
                className="flex flex-col items-center gap-1.5 transition-all duration-500 py-6"
                style={{
                  transform: `perspective(900px) rotateX(15deg) rotateY(${rotationAngle}deg)`,
                  gap: explodeView ? '18px' : '4px',
                }}
              >
                {/* Upper Roof Cap */}
                <div className="w-64 h-4 bg-slate-700/80 border border-slate-500/50 rounded-t flex items-center justify-center text-[10px] text-slate-300 font-mono shadow">
                  ROOF SLAB ({(prop?.base_elevation_m || 536.0) + (prop?.height_m || 22.4)}m MSL)
                </div>

                {/* Floors Stack Top-to-Bottom */}
                {distinctFloors.map((level) => {
                  const isSelected = selectedFloor === level
                  const isEncroachingLevel = level === 5 && isEncroached
                  const isBasement = level < 0

                  let bgStyle = 'bg-sky-600/40 border-sky-400/60 text-sky-100 hover:border-cyan-300'
                  if (isSelected) {
                    bgStyle = 'bg-cyan-400 text-slate-950 font-bold border-white shadow-[0_0_20px_rgba(6,182,212,0.6)]'
                  } else if (isEncroachingLevel && showEncroachment) {
                    bgStyle = 'bg-rose-500/60 border-rose-400 text-white animate-pulse'
                  } else if (isBasement) {
                    bgStyle = 'bg-amber-900/40 border-amber-600/60 text-amber-200'
                  }

                  const elev = (prop?.base_elevation_m || 536.0) + level * 3.2

                  return (
                    <div
                      key={level}
                      onClick={() => {
                        setSelectedFloor(isSelected ? null : level)
                        const matching = floorUnits.find((u) => u.floor_level === level)
                        if (matching) setSelectedUnit(matching)
                      }}
                      className={`w-64 h-11 border transition-all duration-200 cursor-pointer rounded flex items-center justify-between px-4 relative ${bgStyle} ${
                        wireframeMode ? '!bg-transparent !border-cyan-400/90 !border-dashed' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold">
                          {level < 0 ? `B${Math.abs(level)}` : level === 0 ? 'GF' : `L${level}`}
                        </span>
                        <span className="text-[11px] font-medium truncate max-w-[130px]">
                          {level < 0
                            ? 'Basement Parking'
                            : level === 5 && isEncroached
                            ? 'Level 5 (Unpermitted)'
                            : level === 0
                            ? 'Ground Floor'
                            : `Floor Level ${level}`}
                        </span>
                      </div>

                      <div className="text-[10px] font-mono opacity-90">
                        {elev.toFixed(1)}m
                      </div>

                      {/* Encroachment Overhang Indicator Pin */}
                      {isEncroachingLevel && showEncroachment && (
                        <div className="absolute -left-10 bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" /> +2.3m
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Ground Plane Cadastral Boundary Overlay */}
                {showCadastral && (
                  <div className="w-80 h-2 bg-emerald-500/30 border-2 border-emerald-400 border-dashed rounded mt-2 flex items-center justify-center text-[9px] text-emerald-300 font-mono">
                    PARCEL BOUNDARY ({prop?.parcel_ref || 'PARCEL-REF'}) — {(prop?.base_elevation_m || 536.0)}m MSL
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Floating Legend Bar */}
            <div className="p-3 bg-slate-900/90 border-t border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-300">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCadastral}
                    onChange={(e) => setShowCadastral(e.target.checked)}
                    className="accent-govblue rounded"
                  />
                  <span>Cadastral Boundary</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showEncroachment}
                    onChange={(e) => setShowEncroachment(e.target.checked)}
                    className="accent-rose-500 rounded"
                  />
                  <span className="text-rose-400">Encroachment Overlay</span>
                </label>
              </div>

              <div className="text-[11px] font-mono text-slate-400">
                Click any floor plate to isolate vertical units
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Unit Dossier & Floor Slicing Inspector */}
        <div className="lg:col-span-4 space-y-4">
          {/* Floor Selection Control */}
          <div className="card">
            <h3 className="text-sm font-bold text-navy flex items-center gap-2 pb-2 border-b border-border">
              <Sliders className="w-4 h-4 text-govblue" />
              Vertical Floor Slicing
            </h3>
            <div className="pt-3 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Selected Level:</span>
                <span className="font-semibold text-navy">
                  {selectedFloor !== null ? `Level ${selectedFloor}` : `All ${distinctFloors.length} Levels Visible`}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  onClick={() => setSelectedFloor(null)}
                  className={`px-2.5 py-1 rounded text-xs font-medium ${
                    selectedFloor === null ? 'bg-govblue text-white' : 'bg-surface text-muted hover:bg-gray-100'
                  }`}
                >
                  All Levels
                </button>
                {distinctFloors.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      setSelectedFloor(lvl)
                      const match = floorUnits.find((u) => u.floor_level === lvl)
                      if (match) setSelectedUnit(match)
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-medium ${
                      selectedFloor === lvl ? 'bg-govblue text-white' : 'bg-surface text-dark hover:bg-gray-100'
                    }`}
                  >
                    {lvl < 0 ? `B${Math.abs(lvl)}` : lvl === 0 ? 'GF' : `L${lvl}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Unit Details Dossier */}
          {selectedUnit && (
            <div className="card border-govblue/30 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-govblue/10 text-govblue px-2 py-0.5 rounded font-semibold">
                    {selectedUnit.unit_number}
                  </span>
                  <h3 className="text-sm font-bold text-navy mt-1">{selectedUnit.name}</h3>
                </div>
                <span className={selectedUnit.status === 'VERIFIED' ? 'badge-verified text-[11px]' : 'badge-critical text-[11px]'}>
                  {selectedUnit.status}
                </span>
              </div>

              <div className="pt-3 space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted">Primary Usage:</span>
                  <span className="font-medium text-dark">{selectedUnit.usage}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted">Registered Tenant:</span>
                  <span className="font-semibold text-dark">{selectedUnit.tenant}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted">Carpet / Built-up Area:</span>
                  <span className="font-semibold text-dark">{selectedUnit.area_m2} m²</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted">Floor Elevation (MSL):</span>
                  <span className="font-mono text-dark">{selectedUnit.elevation_msl} m</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted">Clear Ceiling Height:</span>
                  <span className="font-mono text-dark">{selectedUnit.ceiling_m} m</span>
                </div>
              </div>

              {selectedUnit.floor_level === 5 && isEncroached && (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 leading-tight flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Discrepancy Note:</strong> Unpermitted floor addition overhangs side setback boundary by +2.3m. Flagged for compliance review.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Units in Selected View Table */}
          <div className="card">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
              Units in Sliced Plane ({activeFloorUnits.length})
            </h4>
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {activeFloorUnits.map((u) => (
                <div
                  key={u.unit_number}
                  onClick={() => setSelectedUnit(u)}
                  className={`p-2 rounded cursor-pointer transition-colors text-xs flex items-center justify-between border ${
                    selectedUnit?.unit_number === u.unit_number
                      ? 'bg-govblue/5 border-govblue text-navy font-semibold'
                      : 'bg-surface border-border/60 hover:bg-gray-50 text-dark'
                  }`}
                >
                  <div>
                    <span className="font-mono text-[11px] text-govblue mr-2">{u.unit_number}</span>
                    <span>{u.name}</span>
                  </div>
                  <span className="text-[10px] text-muted">{u.area_m2} m²</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reusable Digital Twin Modal */}
      <DigitalTwinModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialPropertyId={selectedPropertyId}
      />
    </div>
  )
}
