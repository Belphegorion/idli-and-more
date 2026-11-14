'use client';

import React, { useState, useEffect } from 'react';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { AdminTableSkeleton } from '@/components/admin/AdminSkeleton';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, FolderTree, AlertCircle } from 'lucide-react';
import { useAdminContext } from '@/components/admin/AdminContext';

export default function CategoriesPage() {
  const { onOpenMobileSidebar, userRole } = useAdminContext();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any | null>(null);
  const [name, setName] = useState('');

  // Delete Relocation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingCat, setDeletingCat] = useState<any | null>(null);
  const [moveDestinationId, setMoveDestinationId] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCat(null);
    setName('');
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: any) => {
    setEditingCat(cat);
    setName(cat.name);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCat) {
        const res = await fetch('/api/admin/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingCat._id, name }),
        });
        if (res.ok) {
          setModalOpen(false);
          fetchCategories();
        }
      } else {
        const res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        if (res.ok) {
          setModalOpen(false);
          fetchCategories();
        }
      }
    } catch (err) {
      console.error('Save category error:', err);
    }
  };

  // Reorder up / down
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const reordered = [...categories];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const payload = reordered.map((cat, idx) => ({ id: cat._id, order: idx }));
    setCategories(reordered); // optimistic update

    try {
      await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reorder: true, categories: payload }),
      });
    } catch (err) {
      fetchCategories();
    }
  };

  // Delete initiated
  const handleDeleteClick = async (cat: any) => {
    if (cat.itemCount > 0) {
      setDeletingCat(cat);
      // Pick first destination category that isn't this one
      const destination = categories.find((c) => c._id !== cat._id);
      setMoveDestinationId(destination?._id || '');
      setDeleteModalOpen(true);
      return;
    }

    if (!confirm(`Delete category "${cat.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${cat._id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCategories();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Confirm delete with item migration
  const handleConfirmMoveAndDelete = async () => {
    if (!deletingCat || !moveDestinationId) return;

    try {
      const res = await fetch(
        `/api/admin/categories?id=${deletingCat._id}&moveTo=${moveDestinationId}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        setDeleteModalOpen(false);
        setDeletingCat(null);
        fetchCategories();
      } else {
        const data = await res.json();
        setDeleteError(data.error);
      }
    } catch (err) {
      setDeleteError('Failed to migrate items and delete category.');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar
        title="Menu Categories"
        subtitle="Organize dishes into sections and control display sequence"
        onOpenMobileMenu={onOpenMobileSidebar}
        actions={
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E0A526] hover:bg-[#c9921e] text-[#2B1D14] font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Category</span>
          </button>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl">
        
        {loading ? (
          <AdminTableSkeleton rows={4} />
        ) : (
          <div className="bg-[#FFFDF7] rounded-2xl border border-[#E8DCC4] overflow-hidden shadow-xs">
            <div className="p-4 bg-[#FAF6EC] border-b border-[#E8DCC4] flex items-center justify-between text-xs font-bold text-[#6B5444] uppercase tracking-wider">
              <span>Category Name & Dishes</span>
              <span>Sequence & Actions</span>
            </div>

            <div className="divide-y divide-[#E8DCC4]">
              {categories.map((cat, index) => (
                <div
                  key={cat._id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-[#FAF6EC]/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#2F5D3A]/10 text-[#2F5D3A] flex items-center justify-center font-bold text-xs">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#2B1D14]">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-[#6B5444]">
                        Slug: <span className="font-mono">{cat.slug}</span> ·{' '}
                        <span className="font-bold text-[#2F5D3A]">{cat.itemCount || 0} active dishes</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Reorder Buttons */}
                    <div className="flex items-center bg-[#FAF6EC] rounded-lg border border-[#E8DCC4] p-0.5">
                      <button
                        onClick={() => handleMoveOrder(index, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:bg-[#FFFDF7] rounded disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(index, 'down')}
                        disabled={index === categories.length - 1}
                        className="p-1 hover:bg-[#FFFDF7] rounded disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-2 rounded-lg text-[#6B5444] hover:text-[#2B1D14] hover:bg-[#FAF6EC] cursor-pointer"
                      title="Rename Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteClick(cat)}
                      className="p-2 rounded-lg text-[#B3261E] hover:bg-[#B3261E]/10 cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add / Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-[#FFFDF7] p-6 rounded-3xl border border-[#E8DCC4] shadow-2xl max-w-sm w-full space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DCC4]">
                <h3 className="font-serif font-bold text-lg text-[#2B1D14]">
                  {editingCat ? 'Rename Category' : 'Create Category'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-sm font-bold">✕</button>
              </div>

              <form onSubmit={handleSave} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#2B1D14] mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Traditional Podi Tawa"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4] text-[#2B1D14]"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-[#E8DCC4]">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#E8DCC4] font-semibold text-[#6B5444]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#E0A526] text-[#2B1D14] font-bold shadow-xs hover:bg-[#c9921e]"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Move Items and Delete Modal */}
        {deleteModalOpen && deletingCat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-[#FFFDF7] p-6 rounded-3xl border border-[#E8DCC4] shadow-2xl max-w-md w-full space-y-4">
              <div className="flex items-center gap-2 text-[#B3261E]">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <h3 className="font-serif font-bold text-lg text-[#2B1D14]">
                  Cannot Delete: Dishes Exist
                </h3>
              </div>

              <p className="text-xs text-[#6B5444] leading-relaxed">
                Category <strong>"{deletingCat.name}"</strong> currently has <strong>{deletingCat.itemCount} active dishes</strong>. Where would you like to move these dishes before removing this category?
              </p>

              {deleteError && (
                <div className="p-2.5 bg-[#B3261E]/10 rounded-xl text-xs text-[#B3261E]">
                  {deleteError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#2B1D14] mb-1">
                  Destination Category:
                </label>
                <select
                  value={moveDestinationId}
                  onChange={(e) => setMoveDestinationId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4] text-xs text-[#2B1D14]"
                >
                  {categories
                    .filter((c) => c._id !== deletingCat._id)
                    .map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-[#E8DCC4]">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E8DCC4] text-xs font-semibold text-[#6B5444]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmMoveAndDelete}
                  className="px-5 py-2 rounded-xl bg-[#B3261E] text-white text-xs font-bold shadow-xs hover:bg-red-800"
                >
                  Move Dishes & Delete Category
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
