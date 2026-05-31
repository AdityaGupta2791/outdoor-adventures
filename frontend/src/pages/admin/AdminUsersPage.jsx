import { useState, useMemo } from 'react'
import { Search, Trash2 } from 'lucide-react'
import Button from '../../components/Button'
import {
  useAdminUsers,
  useAdminUpdateUserRole,
  useAdminDeleteUser,
} from '../../features/admin/admin.hooks'
import { useAuth } from '../../features/auth/auth.hooks'
import { useDebounce } from '../../hooks/useDebounce'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

function AdminUsersPage() {
  useDocumentTitle('Admin · Users')
  const { user: currentUser } = useAuth()
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(roleFilter && { role: roleFilter }),
    }),
    [page, debouncedSearch, roleFilter],
  )

  const { data, isLoading } = useAdminUsers(params)
  const updateRole = useAdminUpdateUserRole()
  const deleteUser = useAdminDeleteUser()

  const toggleRole = (user) => {
    const nextRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
    const verb = nextRole === 'ADMIN' ? 'promote' : 'demote'
    if (window.confirm(`Are you sure you want to ${verb} ${user.email} to ${nextRole}?`)) {
      updateRole.mutate({ id: user.id, role: nextRole })
    }
  }

  const handleDelete = (user) => {
    const bookingsLine =
      user._count.bookings > 0
        ? `\n\n⚠ This will also delete all ${user._count.bookings} of their booking${user._count.bookings === 1 ? '' : 's'} and associated payments. Seats from active bookings will be returned to inventory.`
        : ''
    if (
      window.confirm(
        `Permanently delete ${user.email}? This cannot be undone.${bookingsLine}`,
      )
    ) {
      deleteUser.mutate(user.id, {
        onError: (err) => {
          window.alert(err?.response?.data?.error?.message || 'Failed to delete user')
        },
      })
    }
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-brand-text">Users</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Registered accounts. Promote a user to admin or remove their admin role.
        </p>
      </header>

      <div className="mb-5 bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
          <input
            type="search"
            placeholder="Search by name or email…"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value)
              setPage(1)
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none text-sm transition-colors"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none text-sm transition-colors"
        >
          <option value="">All roles</option>
          <option value="USER">Users</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-brand-cream/60 text-xs uppercase tracking-wider text-brand-muted">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">User</th>
                <th className="text-left px-5 py-3 font-semibold">Email</th>
                <th className="text-center px-5 py-3 font-semibold">Bookings</th>
                <th className="text-left px-5 py-3 font-semibold">Joined</th>
                <th className="text-left px-5 py-3 font-semibold">Role</th>
                <th className="text-right px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : data?.users.map((u) => {
                    const isSelf = u.id === currentUser?.id
                    return (
                      <tr key={u.id} className="hover:bg-brand-cream/40">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-brand-primary text-white text-sm font-semibold flex items-center justify-center">
                              {(u.name || '?').charAt(0).toUpperCase()}
                            </span>
                            <div className="font-semibold text-brand-text">
                              {u.name}
                              {isSelf && (
                                <span className="ml-2 text-xs text-brand-muted">(you)</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-brand-muted">{u.email}</td>
                        <td className="px-5 py-3 text-center text-brand-muted">
                          {u._count.bookings}
                        </td>
                        <td className="px-5 py-3 text-brand-muted text-xs">
                          {new Date(u.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              u.role === 'ADMIN'
                                ? 'bg-brand-primary/10 text-brand-primary'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => toggleRole(u)}
                              disabled={isSelf || updateRole.isPending}
                            >
                              {u.role === 'ADMIN' ? 'Demote' : 'Promote'}
                            </Button>
                            <button
                              type="button"
                              onClick={() => handleDelete(u)}
                              disabled={isSelf || deleteUser.isPending}
                              className="p-2 rounded-lg text-brand-muted hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-brand-muted"
                              title={isSelf ? "You can't delete your own account" : 'Delete user'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
              {!isLoading && data?.users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-brand-muted">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-black/5 text-sm">
            <span className="text-brand-muted">
              Page {data.pagination.page} of {data.pagination.totalPages} · {data.pagination.total}{' '}
              total
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUsersPage
