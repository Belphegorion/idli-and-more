'use client';

import React, { useState, useEffect } from 'react';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { AdminTableSkeleton } from '@/components/admin/AdminSkeleton';
import { History, RotateCcw, Filter, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAdminContext } from '@/components/admin/AdminContext';

export default function AuditLogPage() {
  const { onOpenMobileSidebar, userRole } = useAdminContext();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEntity, setFilterEntity] = useState('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const url = filterEntity === 'all' ? '/api/admin/audit' : `/api/admin/audit?entity=${filterEntity}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterEntity]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Undo price or stock change
  const handleUndo = async (auditId: string, actionName: string) => {
    if (!confirm(`Revert this change (${actionName})?`)) return;

    try {
      const res = await fetch('/api/admin/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditId }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to undo change');
        return;
      }

      showToast(`✓ ${data.message}`);
      fetchLogs();
    } catch (err) {
      alert('Error performing undo.');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar
        title="Audit Trail & Rollback History"
        subtitle="Immutable log of menu, price, stock, and settings mutations with 1-click Undo"
        onOpenMobileMenu={onOpenMobileSidebar}
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl">
        
        {/* Toast */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-[#2F5D3A] text-white font-semibold text-xs shadow-lg flex items-center justify-between animate-in fade-in duration-200">
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="p-1 font-bold">✕</button>
          </div>
        )}

        {/* Filter bar */}
        <div className="bg-[#FFFDF7] p-4 rounded-2xl border border-[#E8DCC4] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#6B5444]">Filter Entity:</span>
            <select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4] text-[#2B1D14] font-medium"
            >
              <option value="all">All Changes</option>
              <option value="MenuItem">Menu Dishes (Price & Stock)</option>
              <option value="SiteSettings">Restaurant Settings</option>
              <option value="Table">Dining Tables</option>
              <option value="Category">Categories</option>
            </select>
          </div>

          <span className="text-[#6B5444]">
            Total Entries: <strong className="text-[#2B1D14]">{logs.length}</strong>
          </span>
        </div>

        {/* Logs Table */}
        {loading ? (
          <AdminTableSkeleton rows={6} />
        ) : logs.length === 0 ? (
          <div className="bg-[#FFFDF7] p-16 rounded-3xl border border-[#E8DCC4] text-center space-y-2">
            <History className="w-12 h-12 text-[#2F5D3A] mx-auto opacity-40" />
            <p className="font-serif font-bold text-lg text-[#2B1D14]">No audit entries found</p>
            <p className="text-xs text-[#6B5444]">
              System changes to menu prices, stock toggles, and settings will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => {
              const canUndo =
                log.entity === 'MenuItem' &&
                (log.action.includes('STOCK') || log.action.includes('UPDATE') || log.before?.price !== undefined) &&
                !log.action.startsWith('UNDO');

              return (
                <div
                  key={log._id}
                  className="bg-[#FFFDF7] p-4 rounded-2xl border border-[#E8DCC4] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#2B1D14]">{log.action}</span>
                      <span className="px-2 py-0.2 rounded-full bg-[#FAF6EC] text-[#6B5444] border border-[#E8DCC4] text-[10px] font-mono">
                        {log.entity}
                      </span>
                    </div>

                    <p className="text-[#6B5444] text-[11px]">
                      By <strong className="text-[#2B1D14]">{log.actorId}</strong> · {new Date(log.at).toLocaleString()}
                    </p>

                    {/* Diff Preview */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
                      {log.before && Object.keys(log.before).length > 0 && (
                        <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                          Before: {JSON.stringify(log.before).slice(0, 70)}
                        </span>
                      )}
                      {log.after && Object.keys(log.after).length > 0 && (
                        <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
                          After: {JSON.stringify(log.after).slice(0, 70)}
                        </span>
                      )}
                    </div>
                  </div>

                  {canUndo && (
                    <button
                      onClick={() => handleUndo(log._id, log.action)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E0A526] text-[#2B1D14] hover:bg-[#E0A526]/10 font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0 self-start sm:self-center"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#E0A526]" />
                      <span>Undo Change</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}
