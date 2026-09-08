import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Shield, Users, FileText, Activity, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/services/api'

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    logout(); navigate('/login')
  }

  const items = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: Shield },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Audit Logs', path: '/admin/audit', icon: FileText },
    { label: 'System Health', path: '/admin/health', icon: Activity },
  ]

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="w-60 bg-navy flex flex-col shrink-0">
        <div className="px-5 py-4 border-b border-white/10">
          <div className="text-white font-bold">TRINETRA</div>
          <div className="text-white/40 text-xs">System Administration</div>
        </div>
        <nav className="flex-1 py-4">
          {items.map(({ label, path, icon: Icon }) => (
            <NavLink key={path} to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${isActive ? 'bg-govblue text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`
              }>
              <Icon size={16} />{label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="text-white/60 text-xs mb-2">{user?.username}</div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-white/50 hover:text-white text-sm">
            <LogOut size={14} />Logout
          </button>
        </div>
      </aside>
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-border px-6 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-navy">System Administration</span>
          {user?.is_demo && <span className="badge-synthetic">DEMO MODE</span>}
        </header>
        <main className="p-6"><Outlet /></main>
      </div>
    </div>
  )
}
