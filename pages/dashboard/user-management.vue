<template>
  <div class="um-page">
    <header class="page-header">
      <div>
        <h1>User Management</h1>
        <p>Manage users, roles, and permissions across your organization</p>
      </div>
      <div class="header-actions">
        <button type="button" class="btn btn-ghost" @click="exportUsers">
          <UIcon dynamic name="i-heroicons-arrow-down-tray" /> Export
        </button>
        <button type="button" class="btn btn-primary" @click="openAddUser">
          <UIcon dynamic name="i-heroicons-plus" /> Add User
        </button>
      </div>
    </header>

    <!-- Summary stats -->
    <div class="stats-row">
      <div class="stat">
        <span class="stat-label">Total users</span>
        <span class="stat-value">{{ users.length }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Admins</span>
        <span class="stat-value">{{ countByRole('admin') }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Vendors</span>
        <span class="stat-value">{{ countByRole('vendor') }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Buyers</span>
        <span class="stat-value">{{ countByRole('buyer') }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Pending invites</span>
        <span class="stat-value">{{ countByStatus('invited') }}</span>
      </div>
    </div>

    <div v-if="toast" class="toast toast-success" role="status">
      <UIcon dynamic name="i-heroicons-check-circle" />
      <span>{{ toast }}</span>
    </div>

    <!-- Users card -->
    <section class="card">
      <div class="table-header">
        <h3>Team members</h3>
        <div class="filters">
          <div class="search-box">
            <UIcon dynamic name="i-heroicons-magnifying-glass" />
            <input v-model="searchQuery" type="text" placeholder="Search by name or email…" />
          </div>
          <select v-model="roleFilter">
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="vendor">Vendor</option>
            <option value="buyer">Buyer</option>
          </select>
          <select v-model="statusFilter">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="invited">Invited</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div class="table-wrap">
        <table class="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last active</th>
              <th class="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in filteredUsers" :key="u.id">
              <td>
                <div class="user-cell">
                  <div class="avatar" :style="{ backgroundColor: u.color }">
                    {{ initials(u.name) }}
                  </div>
                  <div>
                    <div class="user-name">{{ u.name }}</div>
                    <div class="user-email">{{ u.email }}</div>
                  </div>
                </div>
              </td>
              <td>
                <select
                  class="role-select"
                  :class="`role-${u.role}`"
                  :value="u.role"
                  @change="(e) => changeRole(u, (e.target as HTMLSelectElement).value as Role)"
                >
                  <option value="admin">Admin</option>
                  <option value="vendor">Vendor</option>
                  <option value="buyer">Buyer</option>
                </select>
              </td>
              <td>
                <span class="status-pill" :class="`is-${u.status}`">{{ statusLabel(u.status) }}</span>
              </td>
              <td class="muted">{{ u.lastActive }}</td>
              <td class="col-actions">
                <button type="button" class="icon-btn" title="Resend invite" v-if="u.status === 'invited'" @click="resendInvite(u)">
                  <UIcon dynamic name="i-heroicons-paper-airplane" />
                </button>
                <button type="button" class="icon-btn" :title="u.status === 'suspended' ? 'Reactivate' : 'Suspend'" @click="toggleSuspend(u)">
                  <UIcon dynamic :name="u.status === 'suspended' ? 'i-heroicons-play' : 'i-heroicons-pause'" />
                </button>
                <button type="button" class="icon-btn danger" title="Remove user" @click="removeUser(u)">
                  <UIcon dynamic name="i-heroicons-trash" />
                </button>
              </td>
            </tr>
            <tr v-if="!filteredUsers.length">
              <td colspan="5" class="empty">
                <UIcon dynamic name="i-heroicons-users" />
                <p>No users match your filters.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Add user modal -->
    <div v-if="showAddUser" class="modal-backdrop" @click.self="showAddUser = false">
      <div class="modal">
        <div class="modal-head">
          <h3>Invite new user</h3>
          <button type="button" class="icon-btn" @click="showAddUser = false">
            <UIcon dynamic name="i-heroicons-x-mark" />
          </button>
        </div>
        <form class="modal-body" @submit.prevent="submitAddUser">
          <div class="field">
            <label>Full name</label>
            <input v-model="newUser.name" type="text" required placeholder="Jane Doe" />
          </div>
          <div class="field">
            <label>Email</label>
            <input v-model="newUser.email" type="email" required placeholder="jane@company.com" />
          </div>
          <div class="field">
            <label>Role</label>
            <select v-model="newUser.role">
              <option value="admin">Admin — full platform access</option>
              <option value="vendor">Vendor — manage listings</option>
              <option value="buyer">Buyer — discover &amp; compare</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" @click="showAddUser = false">Cancel</button>
            <button type="submit" class="btn btn-primary">
              <UIcon dynamic name="i-heroicons-paper-airplane" /> Send invite
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

useSeoMeta({
  title: 'User Management — SaaSWorld',
  description: 'Manage team members, user roles, and permissions for your organization.'
})

definePageMeta({ layout: false })

type Role = 'admin' | 'vendor' | 'buyer'
type Status = 'active' | 'invited' | 'suspended'

interface User {
  id: string
  name: string
  email: string
  role: Role
  status: Status
  lastActive: string
  color: string
}

const users = ref<User[]>([
  { id: '1', name: 'Alex Morgan', email: 'alex@saasworld.com', role: 'admin', status: 'active', lastActive: '2m ago', color: '#0073e6' },
  { id: '2', name: 'Priya Shah', email: 'priya@acme.io', role: 'vendor', status: 'active', lastActive: '18m ago', color: '#14b8a6' },
  { id: '3', name: 'Marco Silva', email: 'marco@nova.dev', role: 'vendor', status: 'active', lastActive: '2h ago', color: '#f97316' },
  { id: '4', name: 'Lisa Chen', email: 'lisa@vertex.co', role: 'buyer', status: 'active', lastActive: '5h ago', color: '#a855f7' },
  { id: '5', name: 'Tomás Rivera', email: 'tomas@orbit.ai', role: 'buyer', status: 'invited', lastActive: '—', color: '#ef4444' },
  { id: '6', name: 'Noor Al-Sayed', email: 'noor@finch.app', role: 'vendor', status: 'suspended', lastActive: '3d ago', color: '#64748b' },
  { id: '7', name: 'Jamie Park', email: 'jamie@kite.io', role: 'buyer', status: 'active', lastActive: '1d ago', color: '#eab308' }
])

const searchQuery = ref('')
const roleFilter = ref<'' | Role>('')
const statusFilter = ref<'' | Status>('')
const toast = ref('')

const filteredUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return users.value.filter(u => {
    if (roleFilter.value && u.role !== roleFilter.value) return false
    if (statusFilter.value && u.status !== statusFilter.value) return false
    if (!q) return true
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })
})

function countByRole(role: Role) { return users.value.filter(u => u.role === role).length }
function countByStatus(status: Status) { return users.value.filter(u => u.status === status).length }

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}
function statusLabel(s: Status) { return s.charAt(0).toUpperCase() + s.slice(1) }

function flash(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = ''), 2500)
}

function changeRole(u: User, role: Role) {
  u.role = role
  flash(`Updated ${u.name}'s role to ${role}.`)
}

function toggleSuspend(u: User) {
  u.status = u.status === 'suspended' ? 'active' : 'suspended'
  flash(`${u.name} ${u.status === 'suspended' ? 'suspended' : 'reactivated'}.`)
}

function resendInvite(u: User) {
  flash(`Invite resent to ${u.email}.`)
}

function removeUser(u: User) {
  if (!window.confirm(`Remove ${u.name}? This cannot be undone.`)) return
  users.value = users.value.filter(x => x.id !== u.id)
  flash(`${u.name} removed.`)
}

function exportUsers() {
  const rows = [
    ['Name', 'Email', 'Role', 'Status', 'Last active'],
    ...users.value.map(u => [u.name, u.email, u.role, u.status, u.lastActive])
  ]
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  flash('Users exported as CSV.')
}

// Add user modal
const showAddUser = ref(false)
const newUser = reactive<{ name: string; email: string; role: Role }>({ name: '', email: '', role: 'buyer' })

function openAddUser() {
  newUser.name = ''
  newUser.email = ''
  newUser.role = 'buyer'
  showAddUser.value = true
}

function submitAddUser() {
  const colors = ['#0073e6', '#14b8a6', '#f97316', '#a855f7', '#eab308', '#ef4444']
  users.value.unshift({
    id: Date.now().toString(),
    name: newUser.name.trim(),
    email: newUser.email.trim(),
    role: newUser.role,
    status: 'invited',
    lastActive: '—',
    color: colors[users.value.length % colors.length]
  })
  showAddUser.value = false
  flash(`Invite sent to ${newUser.email}.`)
}
</script>

<style scoped>
.um-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.25rem;
  letter-spacing: -0.01em;
}
.page-header p { color: #64748b; font-size: 0.95rem; margin: 0; }
.header-actions { display: flex; gap: 0.5rem; }

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: inherit;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color 150ms ease, border-color 150ms ease;
}
.btn :deep(svg) { width: 16px; height: 16px; }
.btn-primary { background: #0073e6; color: #fff; }
.btn-primary:hover { background: #005cb8; }
.btn-ghost { background: #fff; color: #334155; border-color: #e2e8f0; }
.btn-ghost:hover { background: #f8fafc; }

.stats-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.875rem;
}
.stat {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.875rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  font-weight: 600;
}
.stat-value { font-size: 1.5rem; font-weight: 700; color: #0f172a; }

.toast {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}
.toast :deep(svg) { width: 18px; height: 18px; }

.card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.table-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.table-header h3 { font-size: 1rem; font-weight: 600; color: #0f172a; margin: 0; }
.filters { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
.filters select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.85rem;
  background: #fff;
  color: #334155;
  cursor: pointer;
  font-family: inherit;
}
.filters select:focus { outline: none; border-color: #0073e6; box-shadow: 0 0 0 3px rgba(0,115,230,0.15); }

.search-box { position: relative; display: flex; align-items: center; }
.search-box :deep(svg) { position: absolute; left: 0.75rem; width: 16px; height: 16px; color: #94a3b8; pointer-events: none; }
.search-box input {
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.85rem;
  background: #fff;
  min-width: 240px;
  font-family: inherit;
  color: #0f172a;
}
.search-box input:focus { outline: none; border-color: #0073e6; box-shadow: 0 0 0 3px rgba(0,115,230,0.15); }

.table-wrap { overflow-x: auto; }
.users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.users-table thead th {
  text-align: left;
  padding: 0.65rem 1.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}
.users-table tbody td {
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}
.users-table tbody tr:last-child td { border-bottom: 0; }
.users-table tbody tr:hover { background: #f8fafc; }
.muted { color: #64748b; }

.user-cell { display: flex; align-items: center; gap: 0.75rem; }
.avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.user-name { font-weight: 600; color: #0f172a; }
.user-email { font-size: 0.8rem; color: #64748b; }

.role-select {
  padding: 0.3rem 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #fff;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-family: inherit;
}
.role-select.role-admin { background: #fef3c7; color: #92400e; border-color: #fde68a; }
.role-select.role-vendor { background: #e0f2fe; color: #075985; border-color: #bae6fd; }
.role-select.role-buyer { background: #f1f5f9; color: #475569; border-color: #e2e8f0; }

.status-pill {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.status-pill.is-active { background: #ecfdf5; color: #047857; }
.status-pill.is-invited { background: #fff7ed; color: #c2410c; }
.status-pill.is-suspended { background: #fef2f2; color: #b91c1c; }

.col-actions { text-align: right; white-space: nowrap; }
.icon-btn {
  background: transparent;
  border: 1px solid transparent;
  padding: 0.35rem;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease;
}
.icon-btn :deep(svg) { width: 16px; height: 16px; }
.icon-btn:hover { background: #f1f5f9; color: #0f172a; }
.icon-btn.danger:hover { background: #fef2f2; color: #b91c1c; }

.empty { text-align: center; padding: 3rem 1rem; color: #94a3b8; }
.empty :deep(svg) { width: 40px; height: 40px; margin-bottom: 0.5rem; color: #cbd5e1; }
.empty p { margin: 0; font-size: 0.875rem; }

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}
.modal {
  background: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 50px -10px rgba(15, 23, 42, 0.3);
  overflow: hidden;
}
.modal-head {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.modal-head h3 { margin: 0; font-size: 1.05rem; font-weight: 600; color: #0f172a; }
.modal-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.875rem; }
.field { display: flex; flex-direction: column; gap: 0.3rem; }
.field label { font-size: 0.8rem; font-weight: 500; color: #334155; }
.field input,
.field select {
  padding: 0.55rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  color: #0f172a;
  background: #fff;
}
.field input:focus,
.field select:focus { outline: none; border-color: #0073e6; box-shadow: 0 0 0 3px rgba(0,115,230,0.15); }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; }

@media (max-width: 900px) {
  .stats-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .search-box input { min-width: 0; width: 100%; }
}
</style>
