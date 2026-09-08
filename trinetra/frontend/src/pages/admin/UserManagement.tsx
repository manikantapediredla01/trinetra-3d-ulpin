import { useState } from 'react'
import {
  Users, UserPlus, Shield, CheckCircle, XCircle,
  Lock, Search, Filter, Key, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

interface UserItem {
  id: string
  username: string
  full_name: string
  email: string
  role: string
  organization: string
  department: string
  is_active: boolean
  last_login: string
}

const SEEDED_USERS: UserItem[] = [
  { id: 'usr-01', username: 'gis.officer', full_name: 'Dr. Rajesh Rao', email: 'rajesh.gis@dolr.gov.in', role: 'survey_gis_officer', organization: 'Department of Land Resources', department: 'Geospatial Surveys', is_active: true, last_login: '2026-09-07 11:20' },
  { id: 'usr-02', username: 'land.authority', full_name: 'Shri S. K. Sharma, IAS', email: 'sk.sharma@dolr.gov.in', role: 'land_record_authority', organization: 'Ministry of Rural Development', department: 'Land Administration', is_active: true, last_login: '2026-09-07 09:45' },
  { id: 'usr-03', username: 'admin.trinetra', full_name: 'System Root Admin', email: 'root@trinetra.gov.in', role: 'system_administrator', organization: 'NIC / TRINETRA PMU', department: 'IT Infrastructure', is_active: true, last_login: '2026-09-07 14:10' },
  { id: 'usr-04', username: 'urban.planner', full_name: 'Pooja Verma', email: 'pooja.verma@ghmc.gov.in', role: 'urban_infrastructure_planner', organization: 'GHMC Hyderabad', department: 'Town Planning & Utilities', is_active: true, last_login: '2026-09-06 16:30' },
  { id: 'usr-05', username: 'review.officer', full_name: 'V. Krishna Murthy', email: 'v.krishna@tgrac.gov.in', role: 'authorized_reviewer', organization: 'TGRAC Revenue Tribunal', department: 'Boundary Disputes Cell', is_active: true, last_login: '2026-09-07 10:15' },
  { id: 'usr-06', username: 'citizen.demo', full_name: 'M. Srinivas Reddy', email: 'srinivas.reddy@gmail.com', role: 'authorized_citizen', organization: 'Citizen Portal', department: 'Property Owner (Banjara Hills)', is_active: true, last_login: '2026-09-05 18:00' },
]

export default function UserManagement() {
  const [users, setUsers] = useState<UserItem[]>(SEEDED_USERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUser, setNewUser] = useState({
    username: '',
    full_name: '',
    email: '',
    role: 'survey_gis_officer',
    organization: 'Department of Land Resources',
    department: 'Survey Wing',
  })

  const handleToggleActive = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, is_active: !u.is_active } : u))
    )
    toast.success('User status updated successfully')
  }

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUser.username || !newUser.full_name) {
      toast.error('Please enter username and full name')
      return
    }
    const created: UserItem = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      username: newUser.username,
      full_name: newUser.full_name,
      email: newUser.email || `${newUser.username}@dolr.gov.in`,
      role: newUser.role,
      organization: newUser.organization,
      department: newUser.department,
      is_active: true,
      last_login: 'Never',
    }
    setUsers([created, ...users])
    setShowAddModal(false)
    toast.success(`User ${newUser.username} created successfully!`)
  }

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="card p-5 bg-white border-border flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-critical text-xs font-semibold">SECURITY DIRECTORY</span>
            <span className="badge-info text-xs font-mono">RBAC ACCESS CONTROL</span>
          </div>
          <h1 className="text-2xl font-bold text-navy">
            User Credentials & Role Management
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Manage authenticated credentials, department assignments, and access levels across government stakeholders.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-xs"
        >
          <UserPlus className="w-3.5 h-3.5 mr-1" /> Add Government User
        </button>
      </div>

      {/* User Directory Table Card */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted" />
            <input
              type="text"
              placeholder="Search user, name, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-8 text-xs"
            />
          </div>

          <span className="text-xs text-muted">
            Total Users: <strong className="text-navy">{filtered.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto pt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted font-medium">
                <th className="pb-2">User / Identity</th>
                <th className="pb-2">Assigned Role</th>
                <th className="pb-2">Department / Organization</th>
                <th className="pb-2">Last Login</th>
                <th className="pb-2">Account Status</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="py-3">
                    <div className="font-bold text-navy">{u.full_name}</div>
                    <div className="font-mono text-[11px] text-govblue">@{u.username}</div>
                  </td>
                  <td className="py-3">
                    <span className="badge bg-govblue/10 text-govblue font-mono text-[10px] font-semibold">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="text-dark font-medium">{u.organization}</div>
                    <div className="text-[11px] text-muted">{u.department}</div>
                  </td>
                  <td className="py-3 font-mono text-muted">{u.last_login}</td>
                  <td className="py-3">
                    <span
                      className={`badge ${
                        u.is_active ? 'badge-verified' : 'badge-critical'
                      } text-[10px]`}
                    >
                      {u.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleToggleActive(u.id)}
                      className={`btn-sm ${
                        u.is_active ? 'btn-secondary text-critical' : 'btn-primary'
                      }`}
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-base font-bold text-navy">Add New Government User</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-muted hover:text-dark text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-muted font-medium mb-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ro.hyderabad"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-muted font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sri Ramesh Kumar"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-muted font-medium mb-1">Government Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="input"
                >
                  <option value="survey_gis_officer">survey_gis_officer (GIS Officer)</option>
                  <option value="land_record_authority">land_record_authority (Authority)</option>
                  <option value="urban_infrastructure_planner">urban_infrastructure_planner (Planner)</option>
                  <option value="authorized_reviewer">authorized_reviewer (Reviewer)</option>
                  <option value="system_administrator">system_administrator (Admin)</option>
                  <option value="authorized_citizen">authorized_citizen (Citizen)</option>
                </select>
              </div>

              <div>
                <label className="block text-muted font-medium mb-1">Department</label>
                <input
                  type="text"
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  className="input"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
