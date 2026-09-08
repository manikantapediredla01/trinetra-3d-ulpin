import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Search, QrCode, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/services/api'

export default function CitizenLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const handleLogout = async () => { try { await authApi.logout() } catch {} logout(); navigate('/login') }
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-navy text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal rounded flex items-center justify-center font-bold text-sm">T3</div>
          <div>
            <div className="font-semibold text-sm">TRINETRA</div>
            <div className="text-white/50 text-xs">Citizen Property Portal</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user?.is_demo && <span className="bg-amber-500/20 text-amber-300 px-2 py-1 rounded text-xs">DEMO</span>}
          <button onClick={handleLogout} className="text-white/60 hover:text-white flex items-center gap-1 text-sm"><LogOut size={14} />Logout</button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-6"><Outlet /></main>
    </div>
  )
}
