import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload, FileType, CheckCircle, AlertCircle, Clock,
  Database, Map, Cpu, Mountain, Satellite, Waves
} from 'lucide-react'
import { datasetsApi, preprocessingApi } from '@/services/api'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const SOURCE_TYPES = [
  { id: 'lidar', label: 'LiDAR', desc: 'LAS / LAZ point cloud files', icon: Waves, accept: '.las,.laz', color: 'text-govblue bg-govblue/10' },
  { id: 'gis', label: 'GIS Parcel', desc: 'GeoJSON, Shapefile ZIP, GeoPackage', icon: Map, accept: '.geojson,.json,.zip,.gpkg', color: 'text-teal bg-teal/10' },
  { id: 'dem', label: 'DEM / DSM', desc: 'GeoTIFF elevation data', icon: Mountain, accept: '.tif,.tiff', color: 'text-indigo-700 bg-indigo-50' },
  { id: 'drone', label: 'Drone Imagery', desc: 'Aerial PNG/JPG/GeoTIFF', icon: Satellite, accept: '.png,.jpg,.jpeg,.tif,.tiff', color: 'text-warning bg-warning/10' },
  { id: 'floorplan', label: 'Floor Plans', desc: 'PDF or image floor plan', icon: FileType, accept: '.pdf,.png,.jpg,.jpeg', color: 'text-navy bg-navy/10' },
  { id: 'gnss', label: 'GNSS / CORS', desc: 'CSV or RINEX reference data', icon: Database, accept: '.csv,.24o,.rnx', color: 'text-verified bg-verified/10' },
]

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  status: 'uploading' | 'done' | 'error'
  origin: 'REAL_INPUT' | 'SYNTHETIC_DEMO'
  crs?: string
  source?: string
}

export default function DataIngestion() {
  const navigate = useNavigate()
  const [uploads, setUploads] = useState<UploadedFile[]>([])
  const [selectedType, setSelectedType] = useState('lidar')
  const [source, setSource] = useState('')
  const [crs, setCrs] = useState('EPSG:4326')
  const [isSynthetic, setIsSynthetic] = useState(false)
  const [running, setRunning] = useState(false)

  // Pre-populate with real data available
  const REAL_DATASETS = [
    { name: 'opentopography_cop30_hyderabad.tif', type: 'dem', size: 14676950, origin: 'REAL_INPUT' as const, source: 'OpenTopography COP30', crs: 'EPSG:4326' },
    { name: 'tgrac_hmda_cadastral_arcgis.json', type: 'gis', size: 3286671, origin: 'REAL_INPUT' as const, source: 'TGRAC ArcGIS', crs: 'EPSG:4326' },
    { name: 'IITH_LiDAR_ground_dataset_labelled_raw.zip', type: 'lidar', size: 5790279, origin: 'REAL_INPUT' as const, source: 'IIT Hyderabad LiDAR', crs: 'EPSG:32644' },
    { name: 'ghmc_docket_buildings.geojson', type: 'gis', size: 7494889, origin: 'REAL_INPUT' as const, source: 'GHMC Docket', crs: 'EPSG:4326' },
    { name: 'SOI_CORS_locations.parquet', type: 'gnss', size: 81289, origin: 'REAL_INPUT' as const, source: 'Survey of India CORS', crs: 'EPSG:4326' },
    { name: 'synthetic_building_pointcloud.las', type: 'lidar', size: 2400000, origin: 'SYNTHETIC_DEMO' as const, source: 'TRINETRA Demo Generator', crs: 'EPSG:4326' },
    { name: 'tgbpass_floorplan_GHMC_0224.pdf', type: 'floorplan', size: 415131, origin: 'REAL_INPUT' as const, source: 'TG-bPASS Portal', crs: 'N/A' },
  ]

  const loadRealDatasets = () => {
    const loaded: UploadedFile[] = REAL_DATASETS.map((d, i) => ({
      id: `real-${i}`,
      name: d.name,
      type: d.type,
      size: d.size,
      status: 'done',
      origin: d.origin,
      crs: d.crs,
      source: d.source,
    }))
    setUploads(loaded)
    toast.success(`${loaded.length} available datasets loaded for demo`)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    for (const file of files) {
      const id = Math.random().toString(36).slice(2)
      setUploads(prev => [...prev, {
        id, name: file.name, type: selectedType, size: file.size,
        status: 'uploading', origin: isSynthetic ? 'SYNTHETIC_DEMO' : 'REAL_INPUT',
        crs, source
      }])
      try {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('source_type', selectedType)
        fd.append('source', source)
        fd.append('crs', crs)
        fd.append('is_synthetic', String(isSynthetic))
        await datasetsApi.upload(fd)
        setUploads(prev => prev.map(u => u.id === id ? { ...u, status: 'done' } : u))
        toast.success(`${file.name} uploaded`)
      } catch {
        setUploads(prev => prev.map(u => u.id === id ? { ...u, status: 'error' } : u))
        toast.error(`Failed to upload ${file.name}`)
      }
    }
  }

  const handleRunPreprocessing = async () => {
    const datasetIds = uploads.filter(u => u.status === 'done').map(u => u.id)
    if (datasetIds.length === 0) {
      toast.error('Load or upload datasets first')
      return
    }
    setRunning(true)
    try {
      await preprocessingApi.run(datasetIds, 'PROP-HYD-2024-001')
      toast.success('Preprocessing started! Navigate to Processing Pipeline to monitor.')
      navigate('/officer/preprocessing')
    } catch {
      toast.error('Could not start preprocessing. Ensure backend is running.')
    } finally {
      setRunning(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes > 1e6) return `${(bytes / 1e6).toFixed(1)} MB`
    if (bytes > 1e3) return `${(bytes / 1e3).toFixed(0)} KB`
    return `${bytes} B`
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Data Ingestion Center</h1>
          <p className="text-muted text-sm mt-1">Upload survey datasets for 3D property processing</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadRealDatasets} className="btn-secondary">
            <Database size={16} />Load Available Real Datasets
          </button>
          <button
            onClick={handleRunPreprocessing}
            disabled={running || uploads.filter(u => u.status === 'done').length === 0}
            className="btn-primary"
          >
            {running
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Starting…</>
              : <><Cpu size={16} />Run Preprocessing</>
            }
          </button>
        </div>
      </div>

      {/* Data composition notice */}
      <div className="demo-banner">
        ℹ️ This demo uses ~5% real data (DEM, LiDAR, cadastral) + ~95% synthetic data.
        All synthetic data is clearly labeled.
      </div>

      {/* Source type selector */}
      <div className="card">
        <h2 className="section-title text-sm mb-4"><Upload size={16} className="text-govblue" />Select Dataset Type & Upload</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
          {SOURCE_TYPES.map(({ id, label, desc, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => setSelectedType(id)}
              className={clsx(
                'p-3 rounded-lg border-2 text-left transition-all',
                selectedType === id ? 'border-govblue bg-govblue/5' : 'border-border hover:border-govblue/30'
              )}
            >
              <div className={`w-8 h-8 rounded mb-2 flex items-center justify-center ${color}`}>
                <Icon size={16} />
              </div>
              <div className="text-sm font-semibold text-navy">{label}</div>
              <div className="text-xs text-muted mt-0.5">{desc}</div>
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="label">Source / Organization</label>
            <input className="input" placeholder="e.g. TGRAC, Survey of India"
              value={source} onChange={e => setSource(e.target.value)} />
          </div>
          <div>
            <label className="label">CRS (Coordinate Reference System)</label>
            <select className="input" value={crs} onChange={e => setCrs(e.target.value)}>
              <option value="EPSG:4326">EPSG:4326 (WGS84)</option>
              <option value="EPSG:32644">EPSG:32644 (UTM Zone 44N)</option>
              <option value="EPSG:32645">EPSG:32645 (UTM Zone 45N)</option>
              <option value="EPSG:43N">EPSG:43N (Indian)</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 cursor-pointer pb-2">
              <input type="checkbox" checked={isSynthetic} onChange={e => setIsSynthetic(e.target.checked)} />
              <span className="text-sm text-dark">Mark as Synthetic Demo Data</span>
            </label>
          </div>
        </div>

        {/* Drop zone */}
        <label className="block border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-govblue hover:bg-govblue/5 transition-all group">
          <Upload size={32} className="text-muted group-hover:text-govblue mx-auto mb-3 transition-colors" />
          <div className="text-sm font-medium text-dark mb-1">Drop files here or click to browse</div>
          <div className="text-xs text-muted">
            Accepted: {SOURCE_TYPES.find(t => t.id === selectedType)?.accept}
          </div>
          <input
            type="file"
            multiple
            className="hidden"
            accept={SOURCE_TYPES.find(t => t.id === selectedType)?.accept}
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {/* Dataset list */}
      {uploads.length > 0 && (
        <div className="card">
          <h2 className="section-title text-sm mb-4">
            <Database size={16} className="text-teal" />
            Dataset Inventory ({uploads.length} files)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['File', 'Type', 'Size', 'CRS', 'Source', 'Data Origin', 'Status'].map(h => (
                    <th key={h} className="tbl-header text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {uploads.map(u => (
                  <tr key={u.id} className="hover:bg-surface transition-colors">
                    <td className="tbl-cell font-mono text-xs max-w-xs truncate">{u.name}</td>
                    <td className="tbl-cell">
                      <span className="badge-info capitalize">{u.type}</span>
                    </td>
                    <td className="tbl-cell text-xs">{formatSize(u.size)}</td>
                    <td className="tbl-cell text-xs font-mono">{u.crs || '—'}</td>
                    <td className="tbl-cell text-xs text-muted truncate max-w-xs">{u.source || '—'}</td>
                    <td className="tbl-cell">
                      <span className={u.origin === 'REAL_INPUT' ? 'badge-real' : 'badge-synthetic'}>
                        {u.origin === 'REAL_INPUT' ? 'REAL INPUT' : 'SYNTHETIC DEMO'}
                      </span>
                    </td>
                    <td className="tbl-cell">
                      {u.status === 'done' && <span className="flex items-center gap-1 text-xs text-verified"><CheckCircle size={12} />Ready</span>}
                      {u.status === 'uploading' && <span className="flex items-center gap-1 text-xs text-govblue"><Clock size={12} />Uploading…</span>}
                      {u.status === 'error' && <span className="flex items-center gap-1 text-xs text-critical"><AlertCircle size={12} />Error</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 bg-surface rounded border border-border text-xs text-muted">
            <strong className="text-dark">Data Provenance:</strong> All REAL INPUT files originate from verified
            public sources (OpenTopography, TGRAC, IITH). SYNTHETIC DEMO data is generated by the TRINETRA
            Demo Generator and must not be treated as authoritative government data.
          </div>
        </div>
      )}
    </div>
  )
}
