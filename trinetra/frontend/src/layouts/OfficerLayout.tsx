import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, Upload, Cpu, Layers, GitBranch, Atom,
  CheckSquare, Fingerprint, QrCode, Map, LogOut, Menu, X,
  ChevronRight, AlertTriangle, TrendingUp, MessageSquare,
  Zap, Shield, Database
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/services/api'
import { clsx } from 'clsx'

const WORKFLOW_STEPS = [
  { label: '01 CAPTURE', path: '/officer/ingestion', icon: Upload },
  { label: '02 FUSE', path: '/officer/preprocessing', icon: Cpu },
  { label: '03 UNDERSTAND', path: '/officer/extraction', icon: Layers },
  { label: '04 GENERATE', path: '/officer/candidates', icon: GitBranch },
  { label: '05 OPTIMIZE', path: '/officer/qubo', icon: Atom },
  { label: '06 VERIFY', path: '/officer/validation', icon: CheckSquare },
  { label: '07 IDENTIFY', path: '/officer/ulpin', icon: Fingerprint },
]

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/officer/dashboard', icon: LayoutDashboard },
  { label: 'Data Ingestion', path: '/officer/ingestion', icon: Upload },
  { label: 'Preprocessing', path: '/officer/preprocessing', icon: Cpu },
  { label: 'AI Extraction', path: '/officer/extraction', icon: Layers },
  { label: 'Candidates', path: '/officer/candidates', icon: GitBranch },
  { label: 'QUBO Engine', path: '/officer/qubo', icon: Database },
  { label: 'QAOA Simulator', path: '/officer/qaoa', icon: Atom },
  { label: 'Validation', path: '/officer/validation', icon: CheckSquare },
  { label: 'ULPIN Generator', path: '/officer/ulpin', icon: Fingerprint },
  { label: 'QR Passport', path: '/officer/passport', icon: QrCode },
  { label: '3D GIS Explorer', path: '/gis/explorer', icon: Map },
  { label: 'Digital Twin', path: '/gis/twin', icon: Zap },
  { label: 'Encroachment', path: '/review/encroachment', icon: AlertTriangle },
  { label: 'Discrepancy', path: '/review/discrepancy', icon: TrendingUp },
  { label: 'GIS Assistant', path: '/assistant', icon: MessageSquare },
  { label: 'Validation Review', path: '/review/validation', icon: CheckSquare },
  { label: 'Demo Mode', path: '/demo', icon: Shield },
]

export default function OfficerLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className={clsx(
        'flex flex-col bg-navy transition-all duration-300 shrink-0',
        sidebarOpen ? 'w-64' : 'w-16'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
          <div className="w-8 h-8 rounded bg-teal flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs">T3</span>
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <div className="text-white font-bold text-sm tracking-wide">TRINETRA</div>
              <div className="text-white/50 text-xs">3D Property Intelligence</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="ml-auto text-white/60 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Demo banner */}
        {sidebarOpen && user?.is_demo && (
          <div className="mx-3 mt-3 px-2 py-1.5 bg-amber-500/20 border border-amber-400/30 rounded text-xs text-amber-300 font-medium">
            ⚠ DEMONSTRATION ENVIRONMENT
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 group',
                  isActive
                    ? 'bg-govblue text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )
              }
              title={!sidebarOpen ? label : undefined}
            >
              <Icon size={16} className="shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-white/10 p-3">
          {sidebarOpen && (
            <div className="mb-2 px-1">
              <div className="text-white text-sm font-medium truncate">{user?.full_name || user?.username}</div>
              <div className="text-white/40 text-xs capitalize truncate">
                {user?.role?.replace(/_/g, ' ')}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded text-white/60 hover:text-white hover:bg-white/5 text-sm transition-all"
            title="Logout"
          >
            <LogOut size={16} />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-border px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted font-medium">
              SIH26011 | Department of Land Resources | Ministry of Rural Development
            </span>
          </div>
          <div className="flex items-center gap-3">
            {user?.is_demo && (
              <span className="badge-synthetic text-xs">DEMO MODE</span>
            )}
            <NavLink to="/demo" className="btn btn-teal btn-sm">
              🚀 Start Demo
            </NavLink>
          </div>
        </header>

        {/* Workflow progress strip */}
        <div className="bg-white border-b border-border px-6 py-2 flex items-center gap-1 overflow-x-auto">
          {WORKFLOW_STEPS.map((step, i) => (
            <NavLink
              key={step.path}
              to={step.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-all',
                  isActive
                    ? 'bg-govblue text-white'
                    : 'text-muted hover:text-navy hover:bg-surface'
                )
              }
            >
              <step.icon size={12} />
              {step.label}
              {i < WORKFLOW_STEPS.length - 1 && (
                <ChevronRight size={12} className="text-border ml-1" />
              )}
            </NavLink>
          ))}
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
