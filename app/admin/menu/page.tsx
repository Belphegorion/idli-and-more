'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { AdminTableSkeleton } from '@/components/admin/AdminSkeleton';
import { VegIcon } from '@/components/CulturalMotifs';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  RotateCcw,
  Download,
  Upload,
  Check,
  Flame,
  Sparkles,
  FileText,
  SlidersHorizontal,
  Loader2,
} from 'lucide-react';
import { upload } from '@vercel/blob/client';
import { useAdminContext } from '@/components/admin/AdminContext';

export default function FoodManagementPage() {
  const { onOpenMobileSidebar, userRole } = useAdminContext();
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  // Bulk actions state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkPriceType, setBulkPriceType] = useState<'percentage' | 'fixed'>('percentage');
  const [bulkPriceValue, setBulkPriceValue] = useState<number>(10);
  const [bulkTargetCat, setBulkTargetCat] = useState<string>('');

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const [name, setName] = useState('');
  const [nameHindi, setNameHindi] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(200);
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [inStock, setInStock] = useState(true);
  const [isChefPick, setIsChefPick] = useState(false);
  const [orderNum, setOrderNum] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // CSV Import Modal state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [previewCsvItems, setPreviewCsvItems] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    try {
      const res = await fetch(`/api/admin/menu?archived=${activeTab === 'archived'}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to load menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  // Open modal for new item
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setName('');
    setNameHindi('');
    setDescription('');
    setPrice(180);
    setCategoryId(categories[0]?._id || '');
    setImageUrl('https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80');
    setIsVeg(true);
    setInStock(true);
    setIsChefPick(false);
    setOrderNum(items.length + 1);
    setTags([]);
    setModalOpen(true);
  };

  // Open modal for editing item
  const handleOpenEditModal = (item: any) => {
    setEditingItem(item);
    setName(item.name);
    setNameHindi(item.nameHindi || '');
    setDescription(item.description || '');
    setPrice(item.price);
    setCategoryId(item.categoryId?._id || item.categoryId || '');
    setImageUrl(item.imageUrl || '');
    setIsVeg(item.isVeg !== false);
    setInStock(item.inStock !== false);
    setIsChefPick(item.isChefPick === true);
    setOrderNum(item.order || 0);
    setTags(item.tags || []);
    setModalOpen(true);
  };

  // Browser-side WebP image compression helper before upload via direct Vercel Blob
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);

      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((res, rej) => {
        img.onload = () => res(true);
        img.onerror = rej;
      });

      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 1200;
      const scale = Math.min(1, MAX_WIDTH / img.width);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Convert canvas to WebP Blob (target ~100-300KB)
      const webpBlob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/webp', 0.82)
      );

      if (!webpBlob) {
        throw new Error('Failed to generate WebP image blob');
      }

      // Safe filename: sanitized base name + timestamp.webp
      const cleanBaseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      const uploadFilename = `menu/${cleanBaseName}_${Date.now()}.webp`;
      const webpFile = new File([webpBlob], uploadFilename, { type: 'image/webp' });

      // Immediate visual preview in UI
      const localPreviewUrl = canvas.toDataURL('image/webp', 0.82);
      setImageUrl(localPreviewUrl);

      // Upload directly from browser to Vercel Blob using client upload token endpoint
      try {
        const newBlob = await upload(uploadFilename, webpFile, {
          access: 'public',
          handleUploadUrl: '/api/admin/upload-token',
        });
        if (newBlob?.url) {
          setImageUrl(newBlob.url);
        }
      } catch (uploadErr) {
        // If Vercel Blob token is mock/unset in dev environment, keep the high-quality local WebP preview
        console.warn('Vercel Blob cloud upload skipped/mocked, using local preview:', uploadErr);
      }
    } catch (err) {
      console.error('Image processing/upload error:', err);
      alert('Failed to process or upload image. Please try another image.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Save Item (Create or Update)
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      nameHindi,
      description,
      price: Number(price),
      categoryId,
      imageUrl,
      isVeg,
      inStock,
      isChefPick,
      order: Number(orderNum),
      tags,
    };

    try {
      if (editingItem) {
        // PUT update
        const res = await fetch('/api/admin/menu', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingItem._id, ...payload }),
        });
        if (res.ok) {
          setModalOpen(false);
          fetchItems();
        }
      } else {
        // POST create
        const res = await fetch('/api/admin/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setModalOpen(false);
          fetchItems();
        }
      }
    } catch (err) {
      console.error('Save menu item error:', err);
    }
  };

  // Soft delete / Archive item
  const handleArchiveItem = async (id: string, itemName: string) => {
    if (!confirm(`Are you sure you want to archive "${itemName}"? (Can be restored anytime from the Archived tab)`)) return;

    try {
      const res = await fetch(`/api/admin/menu?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchItems();
      }
    } catch (err) {
      console.error('Archive error:', err);
    }
  };

  // Restore archived item
  const handleRestoreItem = async (id: string) => {
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restore',
          itemIds: [id],
        }),
      });
      if (res.ok) {
        fetchItems();
      }
    } catch (err) {
      console.error('Restore error:', err);
    }
  };

  // Bulk actions executor
  const handleExecuteBulkAction = async () => {
    if (selectedIds.length === 0 || !bulkAction) return;

    const body: any = {
      action: bulkAction,
      itemIds: selectedIds,
    };

    if (bulkAction === 'set_stock') body.inStock = true;
    if (bulkAction === 'mark_sold_out') {
      body.action = 'set_stock';
      body.inStock = false;
    }
    if (bulkAction === 'change_category') body.categoryId = bulkTargetCat || categories[0]?._id;
    if (bulkAction === 'adjust_price') {
      body.priceAdjustmentType = bulkPriceType;
      body.priceAdjustmentValue = Number(bulkPriceValue);
    }

    try {
      const res = await fetch('/api/admin/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSelectedIds([]);
        setBulkAction('');
        fetchItems();
      }
    } catch (err) {
      console.error('Bulk action error:', err);
    }
  };

  // Robust CSV parser supporting quotes, commas, and proper header alignment
  const parseCsvLine = (text: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  // CSV file parser for preview
  const handleCsvFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = (evt.target?.result as string) || '';
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) return;

      const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
      const nameIdx = headers.findIndex((h) => h === 'name');
      const nameHindiIdx = headers.findIndex((h) => h === 'namehindi');
      const catIdx = headers.findIndex((h) => h === 'category');
      const priceIdx = headers.findIndex((h) => h === 'price');
      const inStockIdx = headers.findIndex((h) => h === 'instock');
      const isVegIdx = headers.findIndex((h) => h === 'isveg');
      const isChefPickIdx = headers.findIndex((h) => h === 'ischefpick');
      const tagsIdx = headers.findIndex((h) => h === 'tags');
      const descIdx = headers.findIndex((h) => h === 'description');

      const parsedItems = lines.slice(1).map((line) => {
        const parts = parseCsvLine(line);
        const nameVal = (nameIdx >= 0 ? parts[nameIdx] : parts[1]) || '';
        const priceVal = Number(priceIdx >= 0 ? parts[priceIdx] : parts[4]) || 0;
        const catVal = (catIdx >= 0 ? parts[catIdx] : parts[3]) || '';
        const descVal = (descIdx >= 0 ? parts[descIdx] : parts[9]) || '';
        const hindiVal = (nameHindiIdx >= 0 ? parts[nameHindiIdx] : parts[2]) || '';
        const tagsVal = (tagsIdx >= 0 ? parts[tagsIdx] : parts[8]) || '';

        // Match category by name or fallback to first
        const matchedCat = categories.find(
          (c) => c.name.toLowerCase() === catVal.toLowerCase() || c._id === catVal
        );

        return {
          name: nameVal,
          nameHindi: hindiVal,
          price: priceVal,
          description: descVal,
          categoryId: matchedCat?._id || categories[0]?._id,
          categoryName: matchedCat?.name || categories[0]?.name || 'Menu',
          isVeg: isVegIdx >= 0 ? parts[isVegIdx].toUpperCase() !== 'FALSE' : true,
          inStock: inStockIdx >= 0 ? parts[inStockIdx].toUpperCase() !== 'FALSE' : true,
          isChefPick: isChefPickIdx >= 0 ? parts[isChefPickIdx].toUpperCase() === 'TRUE' : false,
          tags: tagsVal ? tagsVal.split(',').map((t) => t.trim()).filter(Boolean) : [],
        };
      }).filter((i) => i.name && i.price > 0);

      setPreviewCsvItems(parsedItems);
    };
    reader.readAsText(file);
  };

  // Apply CSV import
  const handleApplyCsvImport = async () => {
    if (previewCsvItems.length === 0) return;
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'import_csv',
          items: previewCsvItems,
        }),
      });

      if (res.ok) {
        setImportModalOpen(false);
        setPreviewCsvItems([]);
        fetchItems();
      }
    } catch (err) {
      console.error('Import error:', err);
    }
  };

  const filteredItems = items.filter((item) => {
    const itemCat = item.categoryId?._id || item.categoryId || '';
    const matchesCat = selectedCat === 'all' || itemCat === selectedCat;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.nameHindi && item.nameHindi.includes(search));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar
        title="Food & Menu Management"
        subtitle="Catalog, pricing, tags, categories, and direct CSV tools"
        onOpenMobileMenu={onOpenMobileSidebar}
        actions={
          <div className="flex items-center gap-2">
            <a
              href="/api/admin/menu?export=csv"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8DCC4] text-xs font-semibold text-[#6B5444] hover:text-[#2B1D14] hover:bg-[#FAF6EC] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>

            <button
              onClick={() => setImportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8DCC4] text-xs font-semibold text-[#6B5444] hover:text-[#2B1D14] hover:bg-[#FAF6EC] transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import CSV</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E0A526] hover:bg-[#c9921e] text-[#2B1D14] font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Dish</span>
            </button>
          </div>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl">
        
        {/* Active vs Archived Tabs */}
        <div className="flex gap-2 border-b border-[#E8DCC4] pb-2">
          <button
            onClick={() => {
              setActiveTab('active');
              setSelectedIds([]);
            }}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'active'
                ? 'bg-[#2F5D3A] text-white'
                : 'text-[#6B5444] hover:text-[#2B1D14]'
            }`}
          >
            Active Dishes
          </button>
          <button
            onClick={() => {
              setActiveTab('archived');
              setSelectedIds([]);
            }}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'archived'
                ? 'bg-[#2F5D3A] text-white'
                : 'text-[#6B5444] hover:text-[#2B1D14]'
            }`}
          >
            Archived / Soft-Deleted
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-[#FFFDF7] p-4 rounded-2xl border border-[#E8DCC4] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#6B5444] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes by name or hindi translation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4] text-xs text-[#2B1D14] focus:outline-hidden focus:ring-2 focus:ring-[#2F5D3A]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DCC4] text-xs text-[#2B1D14] font-medium"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Action Ribbon (appears if items checked) */}
        {selectedIds.length > 0 && (
          <div className="bg-[#1F3F28] text-white p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
            <span className="text-xs font-bold">
              {selectedIds.length} dishes selected
            </span>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white text-[#2B1D14] font-medium text-xs"
              >
                <option value="">Select Bulk Action</option>
                <option value="set_stock">Mark In Stock</option>
                <option value="mark_sold_out">Mark Sold Out</option>
                <option value="change_category">Change Category</option>
                <option value="adjust_price">Adjust Price</option>
                <option value="archive">Archive Selected</option>
              </select>

              {bulkAction === 'change_category' && (
                <select
                  value={bulkTargetCat}
                  onChange={(e) => setBulkTargetCat(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-white text-[#2B1D14] font-medium text-xs"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              )}

              {bulkAction === 'adjust_price' && (
                <div className="flex items-center gap-1.5">
                  <select
                    value={bulkPriceType}
                    onChange={(e) => setBulkPriceType(e.target.value as any)}
                    className="px-2 py-1.5 rounded-lg bg-white text-[#2B1D14] text-xs"
                  >
                    <option value="percentage">% Change</option>
                    <option value="fixed">Fixed ₹</option>
                  </select>
                  <input
                    type="number"
                    value={bulkPriceValue}
                    onChange={(e) => setBulkPriceValue(Number(e.target.value))}
                    className="w-16 px-2 py-1.5 rounded-lg bg-white text-[#2B1D14] text-xs font-bold"
                  />
                </div>
              )}

              <button
                onClick={handleExecuteBulkAction}
                className="px-4 py-1.5 rounded-lg bg-[#E0A526] text-[#2B1D14] font-bold text-xs hover:bg-[#c9921e] cursor-pointer"
              >
                Apply to {selectedIds.length} Dishes
              </button>
            </div>
          </div>
        )}

        {/* Menu Table */}
        {loading ? (
          <AdminTableSkeleton rows={6} />
        ) : (
          <div className="bg-[#FFFDF7] rounded-2xl border border-[#E8DCC4] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF6EC] border-b border-[#E8DCC4] text-[#6B5444] uppercase font-bold text-[10px] tracking-wider">
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredItems.length && filteredItems.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(filteredItems.map((i) => i._id));
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                      />
                    </th>
                    <th className="p-3 w-16">Photo</th>
                    <th className="p-3">Dish Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock State</th>
                    <th className="p-3">Tags & Badges</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E8DCC4]">
                  {filteredItems.map((item) => {
                    const isSelected = selectedIds.includes(item._id);

                    return (
                      <tr
                        key={item._id}
                        className={`hover:bg-[#FAF6EC]/60 transition-colors ${
                          !item.inStock ? 'opacity-70 bg-neutral-50/50' : ''
                        }`}
                      >
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIds([...selectedIds, item._id]);
                              } else {
                                setSelectedIds(selectedIds.filter((id) => id !== item._id));
                              }
                            }}
                          />
                        </td>

                        <td className="p-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#FAF6EC] border border-[#E8DCC4]">
                            <img
                              src={item.imageUrl || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=200&q=80'}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-[#2B1D14] flex items-center gap-1.5">
                            <VegIcon className="w-3 h-3 shrink-0" />
                            <span>{item.name}</span>
                          </div>
                          {item.nameHindi && (
                            <span className="font-hindi text-[11px] text-[#6B5444] block">
                              {item.nameHindi}
                            </span>
                          )}
                          <p className="text-[11px] text-[#6B5444] line-clamp-1 max-w-xs">
                            {item.description}
                          </p>
                        </td>

                        <td className="p-3 font-semibold text-[#6B5444]">
                          {item.categoryId?.name || 'Uncategorized'}
                        </td>

                        <td className="p-3 font-serif font-bold text-sm text-[#2B1D14]">
                          ₹{item.price}
                        </td>

                        <td className="p-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.inStock
                                ? 'bg-[#2F5D3A]/10 text-[#2F5D3A]'
                                : 'bg-[#B3261E]/10 text-[#B3261E]'
                            }`}
                          >
                            {item.inStock ? 'In Stock' : 'Sold Out'}
                          </span>
                        </td>

                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {item.isChefPick && (
                              <span className="bg-[#E0A526] text-[#2B1D14] text-[9px] font-extrabold px-1.5 py-0.2 rounded-xs">
                                Chef's Pick
                              </span>
                            )}
                            {item.tags?.map((t: string) => (
                              <span
                                key={t}
                                className="bg-[#E8DCC4]/60 text-[#6B5444] text-[9px] px-1.5 py-0.2 rounded-xs font-medium"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {activeTab === 'archived' ? (
                              <button
                                onClick={() => handleRestoreItem(item._id)}
                                className="p-1.5 rounded-lg bg-[#2F5D3A]/10 text-[#2F5D3A] hover:bg-[#2F5D3A]/20"
                                title="Restore to active menu"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleOpenEditModal(item)}
                                  className="p-1.5 rounded-lg text-[#6B5444] hover:text-[#2B1D14] hover:bg-[#FAF6EC]"
                                  title="Edit dish details"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleArchiveItem(item._id, item.name)}
                                  className="p-1.5 rounded-lg text-[#B3261E] hover:bg-[#B3261E]/10"
                                  title="Soft delete / archive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add / Edit Dish Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-[#FFFDF7] p-6 sm:p-8 rounded-3xl border border-[#E8DCC4] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DCC4]">
                <h3 className="font-serif font-bold text-lg text-[#2B1D14]">
                  {editingItem ? 'Edit Dish Details' : 'Add New Menu Dish'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 text-sm font-bold text-[#6B5444] hover:text-[#2B1D14]"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#2B1D14] mb-1">
                      Dish Name (English)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Masala Thatte Idli"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E8DCC4] bg-[#FAF6EC] text-[#2B1D14]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#2B1D14] mb-1">
                      Name (Hindi Font)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. मसाला थट्टे इडली"
                      value={nameHindi}
                      onChange={(e) => setNameHindi(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E8DCC4] bg-[#FAF6EC] text-[#2B1D14] font-hindi"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#2B1D14] mb-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-[#E8DCC4] bg-[#FAF6EC] text-[#2B1D14] font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#2B1D14] mb-1">
                      Category
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E8DCC4] bg-[#FAF6EC] text-[#2B1D14]"
                    >
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1D14] mb-1">
                    Dish Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Short description of taste, ingredients, and accompanying chutneys"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCC4] bg-[#FAF6EC] text-[#2B1D14]"
                  />
                </div>

                {/* Photo Upload & Preview */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-[#2B1D14]">
                      Dish Photo (Client WebP Compressed & Direct Blob Upload)
                    </label>
                    {isUploadingImage && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2F5D3A] animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Uploading to Blob...
                      </span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploadingImage}
                    onChange={handleFileChange}
                    className="w-full text-xs text-[#6B5444] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#2F5D3A]/10 file:text-[#2F5D3A] hover:file:bg-[#2F5D3A]/20"
                  />
                  {imageUrl && (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-[#E8DCC4] mt-2 shadow-xs group">
                      <img src={imageUrl} alt="Dish Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] text-center py-0.5 font-mono truncate px-1">
                        {imageUrl.startsWith('data:') ? 'WebP local preview' : 'Vercel Blob'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Flags: Veg, Chef's pick, In-stock */}
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStock}
                      onChange={(e) => setInStock(e.target.checked)}
                    />
                    <span className="font-semibold text-[#2B1D14]">Currently In Stock</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChefPick}
                      onChange={(e) => setIsChefPick(e.target.checked)}
                    />
                    <span className="font-semibold text-[#2B1D14]">Chef's Pick / Featured</span>
                  </label>
                </div>

                {/* Tags selector */}
                <div>
                  <label className="block font-semibold text-[#2B1D14] mb-1">
                    Tags (Select applicable)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Spicy', 'Bestseller', 'Ghee', 'Cheesy', 'Fried', 'Traditional'].map((t) => {
                      const isTagSelected = tags.includes(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            if (isTagSelected) setTags(tags.filter((x) => x !== t));
                            else setTags([...tags, t]);
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                            isTagSelected
                              ? 'bg-[#2F5D3A] text-white'
                              : 'bg-[#FAF6EC] text-[#6B5444] border border-[#E8DCC4]'
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-[#E8DCC4]">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#E8DCC4] text-xs font-semibold text-[#6B5444]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#E0A526] hover:bg-[#c9921e] text-[#2B1D14] font-bold text-xs shadow-xs"
                  >
                    {editingItem ? 'Save Updates' : 'Add Dish'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CSV Import Modal with Preview */}
        {importModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-[#FFFDF7] p-6 rounded-3xl border border-[#E8DCC4] shadow-2xl max-w-lg w-full space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DCC4]">
                <h3 className="font-serif font-bold text-lg text-[#2B1D14]">Import Menu from CSV</h3>
                <button onClick={() => setImportModalOpen(false)} className="text-sm font-bold">✕</button>
              </div>

              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleCsvFileChosen}
                className="w-full text-xs text-[#6B5444]"
              />

              {previewCsvItems.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#2B1D14]">
                    Previewing {previewCsvItems.length} items to import:
                  </span>
                  <div className="max-h-48 overflow-y-auto border border-[#E8DCC4] rounded-xl p-2 space-y-1 bg-[#FAF6EC] text-xs">
                    {previewCsvItems.slice(0, 10).map((it, idx) => (
                      <div key={idx} className="flex justify-between text-[#2B1D14]">
                        <span>{it.name}</span>
                        <span className="font-bold">₹{it.price}</span>
                      </div>
                    ))}
                    {previewCsvItems.length > 10 && (
                      <p className="text-[10px] text-[#6B5444] text-center pt-1">
                        ...and {previewCsvItems.length - 10} more dishes
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E8DCC4] text-xs font-semibold text-[#6B5444]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyCsvImport}
                  disabled={previewCsvItems.length === 0}
                  className="px-5 py-2 rounded-xl bg-[#2F5D3A] text-white font-bold text-xs shadow-xs hover:bg-[#1F3F28] disabled:opacity-50"
                >
                  Confirm & Import ({previewCsvItems.length} dishes)
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
