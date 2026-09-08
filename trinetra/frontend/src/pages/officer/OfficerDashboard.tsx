import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Upload, Cpu, Layers, GitBranch, Atom, CheckSquare,
  Fingerprint, QrCode, Map, TrendingUp, AlertTriangle,
  Activity, Database, Zap, ArrowRight, Play
} from 'lucide-react'
import { propertiesApi, demoApi } from '@/services/api'
import toast from 'react-hot-toast'
import { useState } from 'react'

const PIPELINE_STEPS = [
  { id: 1, label: 'Data Ingestion', path: '/officer/ingestion', icon: Upload, color: 'text-govblue bg-govblue/10' },
  { id: 2, label: 'Preprocessing', path: '/officer/preprocessing', icon: Cpu, color: 'text-teal bg-teal/10' },
  { id: 3, label: 'AI Extraction', path: '/officer/extraction', icon: Layers, color: 'text-govblue bg-govblue/10' },
  { id: 4, label: 'Candidates', path: '/officer/candidates', icon: GitBranch, color: 'text-indigo-700 bg-indigo-50' },
  { id: 5, label: 'QUBO Engine', path: '/officer/qubo', icon: Database, color: 'text-teal bg-teal/10' },
  { id: 6, label: 'QAOA Simulator', path: '/officer/qaoa', icon: Atom, color: 'text-indigo-700 bg-indigo-50' },
  { id: 7, label: 'Validation', path: '/officer/validation', icon: CheckSquare, color: 'text-verified bg-verified/10' },
  { id: 8, label: 'ULPIN Generator', path: '/officer/ulpin', icon: Fingerprint, color: 'text-navy bg-navy/10' },
  { id: 9, label: 'QR Passport', path: '/officer/passport', icon: QrCode, color: 'text-teal bg-teal/10' },
  { id: 10, label: '3D Digital Twin', path: '/gis/twin', icon: Zap, color: 'text-govblue bg-govblue/10' },
]

const QUICK_STATS = [
  { label: 'Total Properties', value: '1', icon: Database, color: 'text-navy' },
  { label: '3D Verified', value: '0', icon: CheckSquare, color: 'text-verified' },
  { label: 'Pending Review', value: '1', icon: Activity, color: 'text-warning' },
  { label: 'Encroachments', value: '1', icon: AlertTriangle, color: 'text-critical' },
  { label: 'Discrepancies', value: '2', icon: TrendingUp, color: 'text-warning' },
  { label: 'Avg Confidence', value: '—', icon: Layers, color: 'text-teal' },
]

export default function OfficerDashboard() {
  const navigate = useNavigate()
  const [loadingDemo, setLoadingDemo] = useState(false)

  const handleStartDemo = async () => {
    setLoadingDemo(true)
    try {
      await demoApi.loadDemo()
      toast.success('Demo property loaded! Navigate to Data Ingestion to begin.')
      navigate('/officer/ingestion')
    } catch {
      toast.error('Could not load demo. Ensure backend is running.')
    } finally {
      setLoadingDemo(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Officer Dashboard</h1>
          <p className="text-muted text-sm mt-1">Survey / GIS Officer — 3D Property Processing Platform</p>
        </div>
        <button
          onClick={handleStartDemo}
          disabled={loadingDemo}
          className="btn-teal btn-lg"
        >
          {loadingDemo
            ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Loading…</span>
            : <><Play size={18} /> Start Demo</>
          }
        </button>
      </div>

      {/* Demo property banner */}
      <div className="bg-gradient-to-r from-govblue to-teal rounded-xl p-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">Active Demo Property</div>
            <div className="text-2xl font-bold">Srinivas Commercial Complex</div>
            <div className="text-white/80 text-sm mt-1">Survey No. 123/4 · Banjara Hills · Hyderabad · Telangana</div>
            <div className="flex flex-wrap gap-3 mt-3">
              <span className="bg-white/15 px-2.5 py-1 rounded text-xs">5 Floors + Basement</span>
              <span className="bg-white/15 px-2.5 py-1 rounded text-xs">12 Units</span>
              <span className="bg-white/15 px-2.5 py-1 rounded text-xs">PROP-HYD-2024-001</span>
              <span className="bg-yellow-400/30 border border-yellow-400/30 px-2.5 py-1 rounded text-xs font-medium">⚠ SYNTHETIC DEMO DATA</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/gis/twin')}
            className="btn bg-white/20 text-white border border-white/30 hover:bg-white/30 shrink-0"
          >
            <Zap size={16} />View 3D Twin
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {QUICK_STATS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <Icon size={18} className={color} />
            <div className="stat-value mt-1">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Pipeline steps */}
      <div>
        <h2 className="section-title mb-4">
          <Activity size={18} className="text-govblue" />
          Processing Pipeline
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PIPELINE_STEPS.map(({ id, label, path, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => navigate(path)}
              className="card-hover flex flex-col items-start gap-2 text-left group"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
              <div>
                <div className="text-xs text-muted font-mono">STEP {String(id).padStart(2, '0')}</div>
                <div className="text-sm font-semibold text-navy group-hover:text-govblue transition-colors">
                  {label}
                </div>
              </div>
              <ArrowRight size={14} className="text-border group-hover:text-govblue transition-colors ml-auto" />
            </button>
          ))}
        </div>
      </div>

      {/* Real data summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="section-title text-sm mb-4">
            <Database size={16} className="text-teal" />
            Data Sources Available
          </h3>
          <div className="space-y-2">
            {[
              { label: 'Copernicus COP30 DEM', type: 'DEM', origin: 'REAL INPUT', size: '39 MB' },
              { label: 'TGRAC HMDA Cadastral', type: 'GIS', origin: 'REAL INPUT', size: '3.3 MB' },
              { label: 'IITH LiDAR Ground Dataset', type: 'LiDAR', origin: 'REAL INPUT', size: '5.8 MB' },
              { label: 'TGRAC Water/Sewer Network', type: 'Utility', origin: 'REAL INPUT', size: '71+ MB' },
              { label: 'GHMC Docket Buildings', type: 'GIS', origin: 'REAL INPUT', size: '7.5 MB' },
              { label: 'Synthetic Building Point Cloud', type: 'LiDAR', origin: 'SYNTHETIC DEMO', size: '—' },
            ].map(({ label, type, origin, size }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <div className="text-sm text-dark font-medium">{label}</div>
                  <div className="text-xs text-muted">{type} · {size}</div>
                </div>
                <span className={origin === 'REAL INPUT' ? 'badge-real' : 'badge-synthetic'}>
                  {origin}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="section-title text-sm mb-4">
            <CheckSquare size={16} className="text-verified" />
            Demo Property Status
          </h3>
          <div className="space-y-3">
            {[
              { step: 'Data Ingestion', status: 'Ready', color: 'badge-info' },
              { step: 'Preprocessing', status: 'Queued', color: 'badge-pending' },
              { step: 'AI Extraction', status: 'Queued', color: 'badge-pending' },
              { step: 'Candidate Generation', status: 'Queued', color: 'badge-pending' },
              { step: 'QUBO Formulation', status: 'Queued', color: 'badge-pending' },
              { step: 'QAOA Simulation', status: 'Queued', color: 'badge-pending' },
              { step: 'Validation', status: 'Pending', color: 'badge-pending' },
              { step: 'ULPIN Generation', status: 'Locked', color: 'badge-pending' },
            ].map(({ step, status, color }) => (
              <div key={step} className="validation-row">
                <span className="text-sm text-dark">{step}</span>
                <span className={color}>{status}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-warning/5 border border-warning/20 rounded text-xs text-warning">
            ⚠ ULPIN generation is locked until all validation checks pass.
          </div>
        </div>
      </div>
    </div>
  )
}
