import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Upload, Cpu, Layers, GitBranch, Atom,
  CheckSquare, Fingerprint, QrCode, Map, LogOut, Menu, X,
  ChevronRight, AlertTriangle, TrendingUp, MessageSquare,
  Zap, Shield, Database, Activity, BarChart2, Users, FileText,
  Wifi, WifiOff, Building2
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/services/api'
import { clsx } from 'clsx'

const WORKFLOW_STEPS = [
  { label: '01 CAPTURE', path: '/officer/ingestion', icon: Upload },
  { label: '02 PREPROCESS', path: '/officer/preprocessing', icon: Cpu },
  { label: '03 EXTRACT', path: '/officer/extraction', icon: Layers },
  { label: '04 CANDIDATES', path: '/officer/candidates', icon: GitBranch },
  { label: '05 QUBO', path: '/officer/qubo', icon: Database },
  { label: '06 QAOA', path: '/officer/qaoa', icon: Atom },
  { label: '07 VALIDATE', path: '/officer/validation', icon: CheckSquare },
  { label: '08 ULPIN', path: '/officer/ulpin', icon: Fingerprint },
]

interface NavSection {
  heading: string
  items: { label: string; path: string; icon: React.ElementType; badge?: string }[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    heading: 'Command',
    items: [
      { label: 'Dashboard', path: '/officer/dashboard', icon: LayoutDashboard },
      { label: 'Demo Walkthrough', path: '/demo', icon: Shield },
    ],
  },
  {
    heading: 'Processing Pipeline',
    items: [
      { label: 'Data Ingestion', path: '/officer/ingestion', icon: Upload },
      { label: 'Preprocessing', path: '/officer/preprocessing', icon: Cpu },
      { label: 'AI Extraction', path: '/officer/extraction', icon: Layers },
      { label: 'Candidates', path: '/officer/candidates', icon: GitBranch },
      { label: 'QUBO Engine', path: '/officer/qubo', icon: Database },
      { label: 'QAOA Simulator', path: '/officer/qaoa', icon: Atom },
      { label: 'Validation', path: '/officer/validation', icon: CheckSquare },
      { label: 'ULPIN Generator', path: '/officer/ulpin', icon: Fingerprint },
      { label: 'QR Passport', path: '/officer/passport', icon: QrCode },
    ],
  },
  {
    heading: '3D GIS',
    items: [
      { label: '3D GIS Explorer', path: '/gis/explorer', icon: Map, badge: '5 Bldgs' },
      { label: 'Digital Twin', path: '/gis/twin', icon: Zap },
      { label: 'Utility Layers', path: '/gis/utilities', icon: Building2 },
      { label: 'Change Detection', path: '/gis/change-detection', icon: TrendingUp },
    ],
  },
  {
    heading: 'Review & Intelligence',
    items: [
      { label: 'Encroachment', path: '/review/encroachment', icon: AlertTriangle },
      { label: 'Discrepancy', path: '/review/discrepancy', icon: TrendingUp },
      { label: 'GIS Assistant', path: '/assistant', icon: MessageSquare, badge: 'AI' },
    ],
  },
  {
    heading: 'Analytics',
    items: [
      { label: 'Confidence Score', path: '/analytics/confidence', icon: BarChart2 },
      { label: 'QAOA Benchmark', path: '/analytics/qaoa', icon: Activity },
    ],
  },
]

export default function OfficerLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const r = await fetch('http://localhost:8000/healthz')
        setBackendOnline(r.ok)
      } catch {
        setBackendOnline(false)
      }
    }
    checkHealth()
    const t = setInterval(checkHealth, 30000)
    return () => clearInterval(t)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
    authApi.logout().catch(() => {})
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className={clsx(
        'flex flex-col bg-navy transition-all duration-300 shrink-0 relative',
        sidebarOpen ? 'w-64' : 'w-16'
      )}>
        {/* Logo + toggle */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal to-govblue flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white font-black text-xs tracking-tight">T3</span>
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden flex-1">
              <div className="text-white font-bold text-sm tracking-wide">TRINETRA</div>
              <div className="text-white/40 text-[10px] uppercase tracking-wider">3D Property Intelligence</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="ml-auto text-white/50 hover:text-white transition-colors p-0.5"
          >
            {sidebarOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>

        {/* Backend status */}
        {sidebarOpen && (
          <div className={clsx(
            'mx-3 mt-2.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium flex items-center gap-1.5 border',
            backendOnline === true
              ? 'bg-teal/10 border-teal/30 text-teal-300'
              : backendOnline === false
                ? 'bg-red-900/30 border-red-500/30 text-red-400'
                : 'bg-white/5 border-white/10 text-white/30'
          )}>
            {backendOnline === true ? <Wifi size={10} /> : <WifiOff size={10} />}
            {backendOnline === true ? 'API Online — TRINETRA v1.0' : backendOnline === false ? 'API Offline' : 'Checking...'}
          </div>
        )}

        {/* Demo banner */}
        {sidebarOpen && user?.is_demo && (
          <div className="mx-3 mt-2 px-2.5 py-1.5 bg-amber-500/15 border border-amber-400/25 rounded-lg text-[10px] text-amber-300 font-medium">
            ⚠ DEMONSTRATION ENVIRONMENT
          </div>
        )}

        {/* Navigation sections */}
        <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin space-y-1">
          {NAV_SECTIONS.map((section) => (
            <div key={section.heading}>
              {sidebarOpen && (
                <div className="px-4 pt-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-white/25 select-none">
                  {section.heading}
                </div>
              )}
              {section.items.map(({ label, path, icon: Icon, badge }) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-4 py-2 text-[13px] transition-all duration-100 group relative',
                      isActive
                        ? 'bg-govblue/90 text-white font-semibold'
                        : 'text-white/55 hover:text-white hover:bg-white/6'
                    )
                  }
                  title={!sidebarOpen ? label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-teal rounded-r" />
                      )}
                      <Icon size={15} className="shrink-0" />
                      {sidebarOpen && (
                        <>
                          <span className="truncate flex-1">{label}</span>
                          {badge && (
                            <span className="text-[9px] bg-teal/20 text-teal-300 border border-teal/30 px-1.5 py-0.5 rounded font-bold">
                              {badge}
                            </span>
                          )}
                        </>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-white/10 p-3 shrink-0">
          {sidebarOpen && (
            <div className="mb-2.5 px-1">
              <div className="text-white text-xs font-semibold truncate">{user?.full_name || user?.username}</div>
              <div className="text-white/35 text-[10px] capitalize truncate mt-0.5">
                {user?.role?.replace(/_/g, ' ')}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-white/45 hover:text-white hover:bg-white/5 text-xs transition-all"
            title="Logout"
          >
            <LogOut size={14} />
            {sidebarOpen && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-border px-6 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted font-medium hidden md:block">
              TRINETRA · National 3D Spatial Data Infrastructure
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            {user?.is_demo && (
              <span className="badge-synthetic text-xs">DEMO</span>
            )}
            <NavLink to="/assistant" className="btn btn-ghost btn-sm border border-border text-xs flex items-center gap-1.5">
              <MessageSquare size={13} className="text-govblue" /> GIS AI
            </NavLink>
            <NavLink to="/demo" className="btn btn-teal btn-sm text-xs flex items-center gap-1.5">
              <Zap size={13} /> Run Demo
            </NavLink>
          </div>
        </header>

        {/* Pipeline breadcrumb strip */}
        <div className="bg-slate-50 border-b border-border px-4 py-1.5 flex items-center gap-0.5 overflow-x-auto scrollbar-none shrink-0">
          {WORKFLOW_STEPS.map((step, i) => {
            const isActive = location.pathname === step.path
            return (
              <NavLink
                key={step.path}
                to={step.path}
                className={clsx(
                  'flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-medium whitespace-nowrap transition-all',
                  isActive
                    ? 'bg-govblue text-white shadow-xs'
                    : 'text-muted hover:text-navy hover:bg-white'
                )}
              >
                <step.icon size={10} />
                {step.label}
                {i < WORKFLOW_STEPS.length - 1 && (
                  <ChevronRight size={10} className={isActive ? 'text-white/50' : 'text-border'} />
                )}
              </NavLink>
            )
          })}
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
