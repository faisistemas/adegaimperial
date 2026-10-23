import React, { useState } from 'react';
import { 
  Tag, Plus, Edit2, Trash2, Layers, Percent, 
  CheckCircle2, AlertCircle, X, Search, Package 
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { CategoryItem } from '../../types';

export const CategoriasTab: React.FC = () => {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useAdega();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Error/Feedback alert
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form
  const [formData, setFormData] = useState<Partial<CategoryItem>>({
    name: '',
    slug: '',
    description: '',
    color: 'amber',
    defaultMarkupPercent: 60,
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: 'amber',
      defaultMarkupPercent: 60,
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormData({ ...cat });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const trimmedName = formData.name.trim();
    const slug = formData.slug?.trim() || trimmedName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    if (editingCategory) {
      updateCategory({
        ...editingCategory,
        name: trimmedName,
        slug,
        description: formData.description?.trim() || '',
        color: formData.color || 'amber',
        defaultMarkupPercent: Number(formData.defaultMarkupPercent) || 50,
      });
    } else {
      // Check if duplicate slug
      const exists = categories.some(c => c.slug === slug || c.name.toLowerCase() === trimmedName.toLowerCase());
      if (exists) {
        setErrorMessage(`Já existe uma categoria cadastrada com o nome ou identificador "${slug}".`);
        return;
      }

      addCategory({
        id: `cat-${Date.now()}`,
        name: trimmedName,
        slug,
        description: formData.description?.trim() || '',
        color: formData.color || 'amber',
        defaultMarkupPercent: Number(formData.defaultMarkupPercent) || 60,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (categoryId: string) => {
    const res = deleteCategory(categoryId);
    if (!res.success) {
      setErrorMessage(res.message || 'Erro ao excluir categoria.');
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Alert banner if any error */}
      {errorMessage && (
        <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-4 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="p-1 rounded text-rose-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header controls */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por categoria..."
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Categoria</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat) => {
          const linkedProducts = products.filter(
            (p) => p.category === cat.slug || p.category === cat.id || p.category.toLowerCase() === cat.name.toLowerCase()
          );

          return (
            <div
              key={cat.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:border-zinc-700/80 transition-all shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{cat.name}</h4>
                      <p className="text-[10px] font-mono text-zinc-500">slug: #{cat.slug}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      title="Editar Categoria"
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Excluir Categoria"
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-500/20 hover:text-rose-400 text-zinc-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 mt-3 line-clamp-2">
                  {cat.description || 'Sem descrição cadastrada.'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Package className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="font-semibold text-white">{linkedProducts.length}</span>
                  <span className="text-[11px]">produtos vinculados</span>
                </div>

                <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-amber-400 font-mono text-[11px] font-bold">
                  <Percent className="w-3 h-3" />
                  <span>+{cat.defaultMarkupPercent ?? 60}% markup</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: CRIAR / EDITAR CATEGORIA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-400" />
                <span>{editingCategory ? 'Editar Categoria' : 'Cadastrar Nova Categoria'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Nome da Categoria *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Cervejas Especiais & Artesanais"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Identificador / Slug (Opcional)</label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Ex: cervejas_especiais (automático se vazio)"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-400 font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva os produtos contemplados nesta categoria..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Markup Padrão Sugerido (%)</label>
                <input
                  type="number"
                  min={0}
                  value={formData.defaultMarkupPercent ?? 60}
                  onChange={(e) => setFormData({ ...formData, defaultMarkupPercent: Number(e.target.value) })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-amber-400 font-mono font-bold text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Salvar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
