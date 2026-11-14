'use client';

import React, { useState, useEffect } from 'react';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { AdminTableSkeleton } from '@/components/admin/AdminSkeleton';
import { Plus, UserCheck, Key, Trash2, Shield, Mail, AlertCircle } from 'lucide-react';
import { useAdminContext } from '@/components/admin/AdminContext';

export default function UserAccountsPage() {
  const { onOpenMobileSidebar, userRole } = useAdminContext();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add User Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'staff' | 'owner'>('staff');

  // Reset Password Modal
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, name }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to create user account');
        return;
      }

      setAddModalOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      showToast(`✓ Created ${role} account for ${email}`);
      fetchUsers();
    } catch (err) {
      alert('Error creating user.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUserId) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: resetUserId, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to reset password');
        return;
      }

      setResetModalOpen(false);
      setNewPassword('');
      showToast(`✓ Password reset for ${resetEmail}`);
    } catch (err) {
      alert('Error resetting password.');
    }
  };

  const handleDeleteUser = async (id: string, userEmail: string) => {
    if (!confirm(`Delete account for ${userEmail}?`)) return;

    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to delete account');
        return;
      }

      showToast(`Removed account for ${userEmail}`);
      fetchUsers();
    } catch (err) {
      alert('Error deleting user.');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar
        title="Staff & Management Accounts"
        subtitle="Owner-only access control and password administration"
        onOpenMobileMenu={onOpenMobileSidebar}
        actions={
          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E0A526] hover:bg-[#c9921e] text-[#2B1D14] font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Account</span>
          </button>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl">
        
        {/* Toast */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-[#2F5D3A] text-white font-semibold text-xs shadow-lg flex items-center justify-between animate-in fade-in duration-200">
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="p-1 font-bold">✕</button>
          </div>
        )}

        {/* Roles explainer banner */}
        <div className="bg-[#FFFDF7] p-4 rounded-2xl border border-[#E8DCC4] flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#2F5D3A] shrink-0 mt-0.5" />
          <div className="text-xs text-[#6B5444] space-y-1">
            <p className="font-bold text-[#2B1D14]">Role Access Matrix</p>
            <p>
              • <strong>Owner:</strong> Full access to menu editing, pricing, settings, outlets, user accounts, and audit log undo.
            </p>
            <p>
              • <strong>Staff:</strong> Streamlined access restricted strictly to Today’s Availability, Live Kitchen Orders, and Dining Tables.
            </p>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <AdminTableSkeleton rows={3} />
        ) : (
          <div className="bg-[#FFFDF7] rounded-2xl border border-[#E8DCC4] overflow-hidden shadow-xs">
            <div className="p-4 bg-[#FAF6EC] border-b border-[#E8DCC4] flex items-center justify-between text-xs font-bold text-[#6B5444] uppercase tracking-wider">
              <span>User & Role</span>
              <span>Last Login & Actions</span>
            </div>

            <div className="divide-y divide-[#E8DCC4]">
              {users.map((u) => (
                <div
                  key={u._id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-[#FAF6EC]/50 transition-colors text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#2F5D3A]/10 text-[#2F5D3A] flex items-center justify-center font-bold">
                      {u.name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-sm text-[#2B1D14]">{u.name}</span>
                        <span
                          className={`text-[9px] uppercase font-extrabold px-2 py-0.2 rounded-full ${
                            u.role === 'owner' ? 'bg-[#E0A526] text-[#2B1D14]' : 'bg-neutral-200 text-neutral-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </div>
                      <p className="text-[#6B5444] font-mono text-[11px]">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-[#6B5444] hidden sm:block">
                      {u.lastLoginAt ? `Login: ${new Date(u.lastLoginAt).toLocaleDateString()}` : 'Never logged in'}
                    </span>

                    <button
                      onClick={() => {
                        setResetUserId(u._id);
                        setResetEmail(u.email);
                        setResetModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E8DCC4] text-[11px] font-semibold text-[#6B5444] hover:bg-[#FAF6EC] hover:text-[#2B1D14]"
                      title="Reset account password"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Reset Pass</span>
                    </button>

                    <button
                      onClick={() => handleDeleteUser(u._id, u.email)}
                      className="p-1.5 rounded-lg text-[#B3261E] hover:bg-[#B3261E]/10"
                      title="Delete account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Modal */}
        {addModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-[#FFFDF7] p-6 sm:p-8 rounded-3xl border border-[#E8DCC4] shadow-2xl max-w-sm w-full space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DCC4]">
                <h3 className="font-serif font-bold text-lg text-[#2B1D14]">Add Staff / Owner Account</h3>
                <button onClick={() => setAddModalOpen(false)} className="text-sm font-bold">✕</button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#2B1D14] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4] text-[#2B1D14]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1D14] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="staff@idliandmore.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4] text-[#2B1D14]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1D14] mb-1">Temporary Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4] text-[#2B1D14]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1D14] mb-1">Account Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4] text-[#2B1D14]"
                  >
                    <option value="staff">Staff (Availability, Live Orders, Tables Only)</option>
                    <option value="owner">Owner (Full System Access)</option>
                  </select>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-[#E8DCC4]">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#E8DCC4] font-semibold text-[#6B5444]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#2F5D3A] text-white font-bold shadow-xs hover:bg-[#1F3F28]"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {resetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-[#FFFDF7] p-6 rounded-3xl border border-[#E8DCC4] shadow-2xl max-w-sm w-full space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DCC4]">
                <h3 className="font-serif font-bold text-lg text-[#2B1D14]">Reset Account Password</h3>
                <button onClick={() => setResetModalOpen(false)} className="text-sm font-bold">✕</button>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
                <p className="text-[#6B5444]">
                  Resetting password for: <strong className="text-[#2B1D14]">{resetEmail}</strong>
                </p>

                <div>
                  <label className="block font-semibold text-[#2B1D14] mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4] text-[#2B1D14]"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-[#E8DCC4]">
                  <button
                    type="button"
                    onClick={() => setResetModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#E8DCC4] font-semibold text-[#6B5444]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#E0A526] text-[#2B1D14] font-bold shadow-xs hover:bg-[#c9921e]"
                  >
                    Set New Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
