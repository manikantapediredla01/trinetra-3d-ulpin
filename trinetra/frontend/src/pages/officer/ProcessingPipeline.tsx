import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, AlertCircle, Loader, Play, RefreshCw } from 'lucide-react'
import { preprocessingApi } from '@/services/api'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const STAGES = [
  { key: 'file_validation', label: 'File Validation', desc: 'Validate file integrity and format' },
  { key: 'crs_detection', label: 'CRS Detection', desc: 'Detect coordinate reference system' },
  { key: 'coordinate_normalization', label: 'Coordinate Normalization', desc: 'Normalize to WGS84' },
  { key: 'georeferencing', label: 'Georeferencing', desc: 'Apply GCPs and affine transform' },
  { key: 'noise_removal', label: 'Noise Removal', desc: 'Statistical outlier removal' },
  { key: 'duplicate_removal', label: 'Duplicate Removal', desc: 'Remove duplicate points' },
  { key: 'point_cloud_downsampling', label: 'Point Cloud Downsampling', desc: 'Voxel-based downsampling' },
  { key: 'metadata_extraction', label: 'Metadata Extraction', desc: 'Extract source metadata' },
  { key: 'quality_analysis', label: 'Quality Analysis', desc: 'Compute quality metrics' },
  { key: 'multi_source_registration', label: 'Multi-Source Registration', desc: 'Align all data sources' },
  { key: 'data_fusion', label: 'Data Fusion', desc: 'Fuse aligned sources into unified model' },
]

interface StageResult {
  stage_name: string
  status: string
  metrics: Record<string, unknown>
  completed_at: string
}

const statusIcon = (s: string) => {
  if (s === 'COMPLETED') return <CheckCircle size={16} className="text-verified" />
  if (s === 'FAILED') return <XCircle size={16} className="text-critical" />
  if (s === 'WARNING') return <AlertCircle size={16} className="text-warning" />
  if (s === 'PROCESSING') return <Loader size={16} className="text-govblue animate-spin" />
  return <div className="w-4 h-4 rounded-full border-2 border-border" />
}

export default function ProcessingPipeline() {
  const navigate = useNavigate()
  const [running, setRunning] = useState(false)
  const [stages, setStages] = useState<StageResult[]>([])
  const [activeStage, setActiveStage] = useState(-1)
  const [metrics, setMetrics] = useState<Record<string, unknown>>({})

  const runPipeline = async () => {
    setRunning(true)
    setStages([])
    setActiveStage(0)

    try {
      const { data } = await preprocessingApi.run(
        ['real-0', 'real-1', 'real-2'],
        'PROP-HYD-2024-001'
      )
      // Animate stage-by-stage display
      const results: StageResult[] = data.stages || []
      for (let i = 0; i < results.length; i++) {
        setActiveStage(i)
        setStages(results.slice(0, i + 1))
        await new Promise(r => setTimeout(r, 300))
      }
      setActiveStage(-1)
      setMetrics(data.stages?.[data.stages.length - 1]?.metrics || {})
      toast.success('Preprocessing complete! Proceed to AI Extraction.')
    } catch {
      // Demo fallback — simulate without backend
      for (let i = 0; i < STAGES.length; i++) {
        setActiveStage(i)
        await new Promise(r => setTimeout(r, 400))
        const stage = STAGES[i]
        setStages(prev => [...prev, {
          stage_name: stage.key,
          status: 'COMPLETED',
          metrics: getDemoMetrics(stage.key),
          completed_at: new Date().toISOString(),
        }])
      }
      setActiveStage(-1)
      toast.success('Preprocessing complete (demo mode)! Proceed to AI Extraction.')
    } finally {
      setRunning(false)
    }
  }

  const getDemoMetrics = (key: string): Record<string, unknown> => {
    const m: Record<string, Record<string, unknown>> = {
      file_validation: { files_valid: 7, files_invalid: 0 },
      crs_detection: { detected_crs: 'EPSG:4326', consistent: true },
      coordinate_normalization: { points: 284716, offset: 'none' },
      georeferencing: { gcps: 4, rmse_m: 0.23 },
      noise_removal: { removed: 5124, noise_pct: 1.8 },
      duplicate_removal: { removed: 312 },
      point_cloud_downsampling: { before: 279280, after: 138420, voxel_m: 0.05 },
      metadata_extraction: { density: '42.3 pts/m²', elevation: '534–555 m' },
      quality_analysis: { quality: '94%', completeness: '97%' },
      multi_source_registration: { sources: 4, rmse_m: 0.18 },
      data_fusion: { sources_fused: 4, output_crs: 'EPSG:4326', quality: '95%', is_synthetic: true },
    }
    return m[key] || {}
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Data Preprocessing Pipeline</h1>
          <p className="text-muted text-sm mt-1">11-stage geospatial preprocessing and data fusion</p>
        </div>
        <div className="flex gap-3">
          {stages.length > 0 && (
            <button onClick={() => { setStages([]); setActiveStage(-1) }} className="btn-secondary">
              <RefreshCw size={15} />Reset
            </button>
          )}
          <button onClick={runPipeline} disabled={running} className="btn-primary">
            {running
              ? <><Loader size={15} className="animate-spin" />Processing…</>
              : <><Play size={15} />Run Preprocessing</>
            }
          </button>
        </div>
      </div>

      <div className="demo-banner">
        ℹ️ Real data: COP30 DEM, TGRAC cadastral, IITH LiDAR. Remaining 95% is synthetic.
        All metrics labeled by data origin.
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pipeline stages */}
        <div className="lg:col-span-2 card">
          <h2 className="section-title text-sm mb-4">Pipeline Stages</h2>
          <div className="space-y-2">
            {STAGES.map((stage, i) => {
              const result = stages.find(s => s.stage_name === stage.key)
              const isActive = i === activeStage
              return (
                <div key={stage.key}
                  className={clsx(
                    'flex items-start gap-3 p-3 rounded-lg transition-all',
                    isActive && 'bg-govblue/5 border border-govblue/20',
                    result?.status === 'COMPLETED' && 'bg-verified/5',
                    result?.status === 'FAILED' && 'bg-critical/5',
                    !result && !isActive && 'bg-surface'
                  )}>
                  <div className="mt-0.5">{result ? statusIcon(result.status) : isActive ? <Loader size={16} className="text-govblue animate-spin" /> : <div className="w-4 h-4 rounded-full border-2 border-border" />}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-dark">{stage.label}</span>
                      <span className={clsx('text-xs font-medium',
                        result?.status === 'COMPLETED' ? 'text-verified' :
                        result?.status === 'FAILED' ? 'text-critical' :
                        isActive ? 'text-govblue' : 'text-muted'
                      )}>
                        {result?.status || (isActive ? 'PROCESSING…' : 'QUEUED')}
                      </span>
                    </div>
                    <div className="text-xs text-muted">{stage.desc}</div>
                    {result?.metrics && Object.keys(result.metrics).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(result.metrics).slice(0, 4).map(([k, v]) => (
                          <span key={k} className="text-xs bg-white border border-border px-2 py-0.5 rounded font-mono">
                            {k}: {String(v)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          {stages.length === STAGES.length && (
            <div className="mt-4">
              <button onClick={() => navigate('/officer/extraction')} className="btn-teal w-full justify-center">
                Proceed to AI Extraction →
              </button>
            </div>
          )}
        </div>

        {/* Metrics panel */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="section-title text-sm mb-3">LiDAR Metrics</h3>
            {[
              { label: 'Total Points', value: '284,716' },
              { label: 'Density', value: '42.3 pts/m²' },
              { label: 'Elevation Range', value: '534 – 555 m' },
              { label: 'Noise %', value: '1.8%' },
              { label: 'After Downsample', value: '138,420 pts' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
                <span className="text-xs text-muted">{label}</span>
                <span className="text-xs font-mono font-semibold text-dark">{value}</span>
              </div>
            ))}
            <div className="mt-2 badge-synthetic">SYNTHETIC DEMO DATA</div>
          </div>

          <div className="card">
            <h3 className="section-title text-sm mb-3">DEM Metrics</h3>
            {[
              { label: 'Resolution', value: '30 m' },
              { label: 'Elevation Range', value: '512 – 562 m' },
              { label: 'CRS', value: 'EPSG:4326' },
              { label: 'Source', value: 'COP30' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
                <span className="text-xs text-muted">{label}</span>
                <span className="text-xs font-mono font-semibold text-dark">{value}</span>
              </div>
            ))}
            <div className="mt-2 badge-real">REAL INPUT</div>
          </div>

          <div className="card">
            <h3 className="section-title text-sm mb-3">GIS Metrics</h3>
            {[
              { label: 'Parcel Count', value: '3,616' },
              { label: 'Geometry Valid', value: '100%' },
              { label: 'CRS', value: 'EPSG:4326' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
                <span className="text-xs text-muted">{label}</span>
                <span className="text-xs font-mono font-semibold text-dark">{value}</span>
              </div>
            ))}
            <div className="mt-2 badge-real">REAL INPUT</div>
          </div>
        </div>
      </div>
    </div>
  )
}
