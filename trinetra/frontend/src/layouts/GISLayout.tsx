import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Map, Zap, Layers, GitBranch, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/services/api'

export default function GISLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const handleLogout = async () => { try { await authApi.logout() } catch {} logout(); navigate('/login') }
  const items = [
    { label: '3D GIS Explorer', path: '/gis/explorer', icon: Map },
    { label: 'Digital Twin', path: '/gis/twin', icon: Zap },
    { label: 'Utility Layers', path: '/gis/utilities', icon: Layers },
    { label: 'Change Detection', path: '/gis/change-detection', icon: GitBranch },
  ]
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="w-56 bg-navy flex flex-col shrink-0">
        <div className="px-4 py-4 border-b border-white/10">
          <div className="text-white font-bold text-sm">TRINETRA</div>
          <div className="text-white/40 text-xs">3D GIS Platform</div>
        </div>
        <nav className="flex-1 py-3">
          {items.map(({ label, path, icon: Icon }) => (
            <NavLink key={path} to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isActive ? 'bg-govblue text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`
              }><Icon size={15} />{label}</NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="text-white/50 text-xs mb-1">{user?.full_name}</div>
          <button onClick={handleLogout} className="text-white/40 hover:text-white text-xs flex items-center gap-1"><LogOut size={12} />Logout</button>
        </div>
      </aside>
      <div className="flex-1 overflow-hidden flex flex-col">
        <header className="bg-white border-b border-border px-5 py-2.5 flex items-center justify-between shrink-0">
          <span className="text-sm font-semibold text-navy">3D GIS & Digital Property Twin</span>
          {user?.is_demo && <span className="badge-synthetic text-xs">DEMO MODE</span>}
        </header>
        <main className="flex-1 overflow-hidden"><Outlet /></main>
      </div>
    </div>
  )
}
