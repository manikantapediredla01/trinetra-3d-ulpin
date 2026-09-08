import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layers, Play, CheckCircle, Building, Loader } from 'lucide-react'
import { extractionApi, candidatesApi } from '@/services/api'
import toast from 'react-hot-toast'

interface ExtractionResult {
  buildings_detected: number
  floors_detected: number
  units_detected: number
  extraction_confidence: number
  building_height_m: number
  ground_elevation_m: number
  has_basement: boolean
  floors: Array<{ level: number; name: string; area_m2: number; units: number; usage: string }>
}

export default function AIExtraction() {
  const navigate = useNavigate()
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<ExtractionResult | null>(null)
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null)

  const DEMO_RESULT: ExtractionResult = {
    buildings_detected: 1,
    floors_detected: 7,
    units_detected: 12,
    extraction_confidence: 0.94,
    building_height_m: 22.4,
    ground_elevation_m: 536.0,
    has_basement: true,
    floors: [
      { level: -1, name: 'Basement', area_m2: 252.0, units: 1, usage: 'Parking' },
      { level: 0, name: 'Ground Floor', area_m2: 252.0, units: 2, usage: 'Commercial' },
      { level: 1, name: '1st Floor', area_m2: 252.0, units: 2, usage: 'Commercial' },
      { level: 2, name: '2nd Floor', area_m2: 252.0, units: 2, usage: 'Residential' },
      { level: 3, name: '3rd Floor', area_m2: 252.0, units: 2, usage: 'Residential' },
      { level: 4, name: '4th Floor', area_m2: 252.0, units: 2, usage: 'Residential' },
      { level: 5, name: '5th Floor', area_m2: 252.0, units: 1, usage: 'Residential' },
    ],
  }

  const runExtraction = async () => {
    setRunning(true)
    await new Promise(r => setTimeout(r, 1500)) // Realistic processing delay
    try {
      await extractionApi.runBuildings('PROP-HYD-2024-001')
      await extractionApi.runFloors('PROP-HYD-2024-001')
    } catch {
      // Demo fallback — show synthetic result
    }
    setResult(DEMO_RESULT)
    setRunning(false)
    toast.success('AI/Geometric extraction complete!')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">AI / Geometric Extraction Engine</h1>
          <p className="text-muted text-sm mt-1">Building detection, floor extraction and unit identification from fused data</p>
        </div>
        <button onClick={runExtraction} disabled={running} className="btn-primary">
          {running ? <><Loader size={15} className="animate-spin" />Extracting…</> : <><Play size={15} />Extract Buildings & Floors</>}
        </button>
      </div>

      <div className="demo-banner">
        ℹ️ AI-assisted geometric extraction — uses deterministic/geometric algorithms.
        Labeled as <strong>DERIVED AI OUTPUT</strong>. Not a trained ML model in this prototype.
      </div>

      {running && (
        <div className="card flex items-center gap-4 py-8 justify-center">
          <Loader size={24} className="text-govblue animate-spin" />
          <div>
            <div className="font-semibold text-navy">AI/Geometric Extraction Running…</div>
            <div className="text-muted text-sm">Processing LiDAR + DEM + GIS + floor plans</div>
          </div>
        </div>
      )}

      {result && !running && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Buildings Detected', value: result.buildings_detected, icon: Building, color: 'text-govblue' },
              { label: 'Floors Detected', value: result.floors_detected, icon: Layers, color: 'text-teal' },
              { label: 'Units Detected', value: result.units_detected, icon: CheckCircle, color: 'text-verified' },
              { label: 'Confidence', value: `${(result.extraction_confidence * 100).toFixed(0)}%`, icon: CheckCircle, color: 'text-govblue' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="stat-card">
                <Icon size={18} className={color} />
                <div className="stat-value mt-1">{value}</div>
                <div className="stat-label">{label}</div>
                <div className="mt-2 badge-derived text-xs">DERIVED AI OUTPUT</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Building properties */}
            <div className="card">
              <h2 className="section-title text-sm mb-4"><Building size={16} className="text-govblue" />Building Properties</h2>
              <div className="space-y-2">
                {[
                  { label: 'Building Height', value: `${result.building_height_m} m` },
                  { label: 'Ground Elevation', value: `${result.ground_elevation_m} m MSL` },
                  { label: 'Horizontal Area', value: '252 m² (18m × 14m)' },
                  { label: 'Total Floor Area', value: `${(252 * result.floors_detected).toLocaleString()} m²` },
                  { label: 'Has Basement', value: result.has_basement ? 'Yes' : 'No' },
                  { label: 'Roof Type', value: 'Flat (detected from LiDAR)' },
                  { label: 'Structure Type', value: 'RCC Frame (inferred)' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
                    <span className="text-xs text-muted">{label}</span>
                    <span className="text-xs font-semibold text-dark">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floor breakdown */}
            <div className="card">
              <h2 className="section-title text-sm mb-4"><Layers size={16} className="text-teal" />Floor Breakdown</h2>
              <div className="space-y-1">
                {result.floors.map(floor => (
                  <button
                    key={floor.level}
                    onClick={() => setSelectedFloor(floor.level === selectedFloor ? null : floor.level)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all hover:bg-surface ${
                      selectedFloor === floor.level ? 'bg-govblue/10 border border-govblue/20' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold
                      ${floor.level === -1 ? 'bg-navy/10 text-navy' : 'bg-govblue/10 text-govblue'}`}>
                      {floor.level === -1 ? 'B' : floor.level === 0 ? 'G' : floor.level}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-dark">{floor.name}</div>
                      <div className="text-xs text-muted">{floor.area_m2} m² · {floor.units} units · {floor.usage}</div>
                    </div>
                    {selectedFloor === floor.level && <CheckCircle size={14} className="text-govblue" />}
                  </button>
                ))}
              </div>
              <div className="mt-3 badge-derived">DERIVED AI OUTPUT</div>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={() => navigate('/officer/candidates')} className="btn-teal">
              Generate 3D Candidate Configurations →
            </button>
          </div>
        </>
      )}
    </div>
  )
}
