import React, { useState, useEffect } from 'react'
import {
  X, Layers, Box, Eye, EyeOff, Shield, QrCode, AlertTriangle,
  CheckCircle, Sliders, RotateCcw, ChevronRight, ExternalLink,
  Building, MapPin, Compass
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { propertiesApi } from '@/services/api'

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

interface DigitalTwinModalProps {
  isOpen: boolean
  onClose: () => void
  initialPropertyId?: string
}

export default function DigitalTwinModal({
  isOpen,
  onClose,
  initialPropertyId = 'PROP-HYD-2024-001'
}: DigitalTwinModalProps) {
  const navigate = useNavigate()
  const [properties, setProperties] = useState<any[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(initialPropertyId)
  const [propertyData, setPropertyData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const [selectedFloor, setSelectedFloor] = useState<number | null>(null)
  const [selectedUnit, setSelectedUnit] = useState<FloorUnitInfo | null>(null)
  const [wireframeMode, setWireframeMode] = useState(false)
  const [showCadastral, setShowCadastral] = useState(true)
  const [showEncroachment, setShowEncroachment] = useState(true)
  const [explodeView, setExplodeView] = useState(false)
  const [rotationAngle, setRotationAngle] = useState(25)

  // Fetch properties list on mount
  useEffect(() => {
    if (!isOpen) return
    propertiesApi.list()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setProperties(res.data)
        }
      })
      .catch(() => {})
  }, [isOpen])

  // Fetch single property details when selectedPropertyId changes
  useEffect(() => {
    if (!isOpen || !selectedPropertyId) return
    setLoading(true)
    propertiesApi.get(selectedPropertyId)
      .then((res) => {
        setPropertyData(res.data)
        if (res.data?.floor_units?.length > 0) {
          setSelectedUnit(res.data.floor_units[0])
          setSelectedFloor(res.data.floor_units[0].floor_level)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isOpen, selectedPropertyId])

  useEffect(() => {
    if (initialPropertyId) {
      setSelectedPropertyId(initialPropertyId)
    }
  }, [initialPropertyId])

  if (!isOpen) return null

  const prop = propertyData?.property || {}
  const floorUnits: FloorUnitInfo[] = propertyData?.floor_units || prop?.floors || []
  const distinctFloors = Array.from(new Set(floorUnits.map((u) => u.floor_level))).sort((a, b) => b - a)

  const isEncroached = prop?.encroachment?.has_encroachment || prop?.status === 'FLAGGED'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  3D Digital Twin Modal
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  LoD-2 Volumetric Model
                </span>
                {isEncroached ? (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-400" /> Encroachment Flagged
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400" /> Certified Compliant
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                {prop?.name || '3D Digital Twin'}
              </h2>
            </div>
          </div>

          {/* Property Switcher Dropdown */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg">
              <span className="text-xs text-slate-400 font-medium">Select Twin:</span>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-cyan-300 outline-none cursor-pointer"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.name} ({p.floor_count} Floors)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Cols: Interactive 3D Isometric Stacking Canvas */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden relative flex-1 flex flex-col justify-between shadow-inner min-h-[460px]">
              {/* Top Viewport Toolbar */}
              <div className="p-3 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-cyan-400 font-mono flex items-center gap-1 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
                    <Box className="w-3.5 h-3.5" /> {prop?.floor_count || floorUnits.length} Levels Extruded
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Height: {prop?.height_m || 20}m MSL
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setExplodeView(!explodeView)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      explodeView ? 'bg-cyan-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    <Sliders className="w-3 h-3 inline mr-1" /> Explode
                  </button>
                  <button
                    onClick={() => setWireframeMode(!wireframeMode)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      wireframeMode ? 'bg-cyan-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    Wireframe
                  </button>
                  <button
                    onClick={() => setRotationAngle((r) => (r + 45) % 360)}
                    className="px-2.5 py-1 rounded text-xs bg-slate-800 text-slate-200 hover:bg-slate-700"
                    title="Rotate 45°"
                  >
                    <RotateCcw className="w-3 h-3 inline mr-1" /> Rotate
                  </button>
                </div>
              </div>

              {/* 3D Visualizer Stack */}
              <div className="relative flex-1 flex items-center justify-center p-6 select-none overflow-hidden min-h-[340px]">
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 50% 50%, #008C95 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />

                <div
                  className="flex flex-col items-center transition-all duration-500 py-4"
                  style={{
                    transform: `perspective(800px) rotateX(15deg) rotateY(${rotationAngle}deg)`,
                    gap: explodeView ? '14px' : '4px',
                  }}
                >
                  {/* Roof Slab */}
                  <div className="w-60 h-3.5 bg-slate-700 border border-slate-500 rounded-t flex items-center justify-center text-[9px] text-slate-300 font-mono shadow">
                    ROOF PARAPET ({(prop?.base_elevation_m || 536.0) + (prop?.height_m || 22.4)}m MSL)
                  </div>

                  {/* Floor Slabs */}
                  {distinctFloors.map((level) => {
                    const isSelected = selectedFloor === level
                    const isFlaggedLevel = level === 5 && isEncroached
                    const isBasement = level < 0

                    let bgStyle = 'bg-sky-600/40 border-sky-400/60 text-sky-100 hover:border-cyan-300'
                    if (isSelected) {
                      bgStyle = 'bg-cyan-400 text-slate-950 font-bold border-white shadow-[0_0_20px_rgba(6,182,212,0.6)]'
                    } else if (isFlaggedLevel && showEncroachment) {
                      bgStyle = 'bg-rose-600/70 border-rose-400 text-white animate-pulse'
                    } else if (isBasement) {
                      bgStyle = 'bg-amber-900/50 border-amber-600/60 text-amber-200'
                    }

                    const elev = (prop?.base_elevation_m || 536.0) + level * 3.2

                    return (
                      <div
                        key={level}
                        onClick={() => {
                          setSelectedFloor(level)
                          const matching = floorUnits.find((u) => u.floor_level === level)
                          if (matching) setSelectedUnit(matching)
                        }}
                        className={`w-60 h-10 border transition-all duration-200 cursor-pointer rounded flex items-center justify-between px-3 relative ${bgStyle} ${
                          wireframeMode ? '!bg-transparent !border-cyan-400 !border-dashed' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold">
                            {level < 0 ? `B${Math.abs(level)}` : level === 0 ? 'GF' : `L${level}`}
                          </span>
                          <span className="text-[11px] font-medium truncate max-w-[120px]">
                            {level < 0
                              ? 'Basement Parking'
                              : level === 5 && isEncroached
                              ? 'Level 5 (Unpermitted)'
                              : level === 0
                              ? 'Ground Floor'
                              : `Level ${level}`}
                          </span>
                        </div>

                        <div className="text-[10px] font-mono opacity-90">
                          {elev.toFixed(1)}m
                        </div>

                        {/* Encroachment Indicator Pin */}
                        {isFlaggedLevel && showEncroachment && (
                          <div className="absolute -left-12 bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> +2.3m
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Parcel Ground Boundary */}
                  {showCadastral && (
                    <div className="w-72 h-2.5 bg-emerald-500/20 border-2 border-emerald-400 border-dashed rounded mt-2 flex items-center justify-center text-[8px] text-emerald-300 font-mono">
                      CADASTRAL PARCEL ({prop?.parcel_ref || 'PARCEL-REF'})
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Controls Bar */}
              <div className="p-3 bg-slate-900 border-t border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-300">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={showCadastral}
                      onChange={(e) => setShowCadastral(e.target.checked)}
                      className="accent-cyan-500 rounded"
                    />
                    <span>Cadastral Boundary</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs">
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
                  Click any level to inspect vertical stratum
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Selected Floor & Unit Intelligence Dossier */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              {/* ULPIN & Parcel Tag */}
              <div className="p-3.5 bg-slate-800/60 border border-slate-700 rounded-xl space-y-2">
                <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                  Assigned 3D ULPIN
                </div>
                <div className="font-mono text-base font-bold text-cyan-400 break-all bg-slate-950/80 px-3 py-1.5 rounded border border-cyan-900/50">
                  {prop?.ulpin || 'IN-3D-HYD0-2024-0001'}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-slate-400">Parcel: </span>
                    <span className="font-medium text-slate-200">{prop?.parcel_ref || 'HYD/BH/123/4'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Zone: </span>
                    <span className="font-medium text-slate-200">{prop?.city || 'Hyderabad'}</span>
                  </div>
                </div>
              </div>

              {/* Selected Floor Unit Dossier */}
              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    Level {selectedFloor !== null ? selectedFloor : 'Overview'} Specification
                  </h3>
                  {selectedUnit?.status === 'FLAGGED' ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-900/60 text-rose-300 border border-rose-700">
                      FLAGGED
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                      VERIFIED
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Unit Number:</span>
                    <span className="font-mono font-semibold text-cyan-300">{selectedUnit?.unit_number || 'U-0001'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Designation / Usage:</span>
                    <span className="font-medium text-slate-200">{selectedUnit?.usage || prop?.building_type || 'Commercial Office'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Floor Plate Area:</span>
                    <span className="font-mono font-semibold text-slate-200">{selectedUnit?.area_m2 || prop?.horizontal_extent_m2 || 252} m²</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Datum Elevation (MSL):</span>
                    <span className="font-mono font-semibold text-slate-200">{selectedUnit?.elevation_msl || prop?.base_elevation_m || 536.0} m</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Clear Ceiling Height:</span>
                    <span className="font-mono font-semibold text-slate-200">{selectedUnit?.ceiling_m || 3.2} m</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Current Occupant / Tenant:</span>
                    <span className="font-medium text-cyan-200">{selectedUnit?.tenant || 'Registered Occupant'}</span>
                  </div>
                </div>
              </div>

              {/* Quantum QAOA & Encroachment Note */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Quantum Optimization & Topology
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {prop?.qaoa_solution || 'Bitstring 0010000 (Candidate C2 — Optimal energy -4.85)'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  onClose()
                  navigate('/officer/passport')
                }}
                className="btn-secondary text-xs flex-1 justify-center py-2 bg-slate-800 border-slate-700 hover:bg-slate-700 text-white"
              >
                <QrCode className="w-3.5 h-3.5 mr-1" /> Full Passport
              </button>
              <button
                onClick={() => {
                  onClose()
                  navigate('/gis/explorer')
                }}
                className="btn-primary text-xs flex-1 justify-center py-2"
              >
                <Compass className="w-3.5 h-3.5 mr-1" /> View in 3D GIS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
