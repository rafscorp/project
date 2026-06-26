"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Search, Filter, Edit, Trash2, Package, X, UploadCloud, Loader2, Image as ImageIcon, FileUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Papa from "papaparse";

type Product = {
  id: string;
  name: string;
  categoryId?: string;
  price: number;
  comparePrice?: number;
  stock: number;
  condition: string;
  active: boolean;
  sku?: string;
  description?: string;
  imageUrl?: string;
};

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    comparePrice: "",
    stock: "1",
    condition: "NEW",
    sku: "",
    description: "",
    imageUrl: "",
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // CSV Import State
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch("/api/produtos");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error("Failed to fetch products:", e);
    } finally {
      setLoading(false);
    }
  }

  function openModal(product?: Product) {
    if (product) {
      setIsEditing(product.id);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        comparePrice: product.comparePrice ? product.comparePrice.toString() : "",
        stock: product.stock.toString(),
        condition: product.condition,
        sku: product.sku || "",
        description: product.description || "",
        imageUrl: product.imageUrl || "",
      });
    } else {
      setIsEditing(null);
      setFormData({ 
        name: "", price: "", comparePrice: "", stock: "1", 
        condition: "NEW", sku: "", description: "", imageUrl: "" 
      });
    }
    setError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem não pode passar de 5MB.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        throw new Error("Erro no upload da imagem");
      }

      const result = await res.json();
      setFormData(prev => ({ ...prev, imageUrl: result.url }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleCsvImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await fetch("/api/produtos/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ products: results.data })
          });
          
          const data = await res.json();
          if (res.ok) {
            alert(`✅ Importação concluída! ${data.count} produtos foram cadastrados com sucesso.`);
            fetchProducts();
          } else {
            alert(`❌ Erro na importação: ${data.error}`);
            if (data.errors && data.errors.length > 0) {
              console.error("Erros na importação:", data.errors);
              alert(`Algumas linhas continham erros. Verifique o console para mais detalhes. Exemplo (Linha ${data.errors[0].row}): Ocorreu um erro de validação.`);
            }
          }
        } catch (err) {
          console.error(err);
          alert("❌ Ocorreu um erro inesperado ao enviar o arquivo.");
        } finally {
          setIsImporting(false);
          if (csvInputRef.current) csvInputRef.current.value = "";
        }
      },
      error: (err) => {
        console.error(err);
        alert("❌ Ocorreu um erro ao ler o arquivo CSV.");
        setIsImporting(false);
        if (csvInputRef.current) csvInputRef.current.value = "";
      }
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const url = isEditing ? `/api/produtos/${isEditing}` : "/api/produtos";
    const method = isEditing ? "PUT" : "POST";

    // Clean up empty optional fields
    const payload = {
      ...formData,
      comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
      sku: formData.sku || undefined,
      description: formData.description || undefined,
      imageUrl: formData.imageUrl || undefined,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao salvar produto");
      }

      await fetchProducts();
      closeModal();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta peça? (Isso não afetará notas fiscais antigas)")) return;
    
    try {
      const res = await fetch(`/api/produtos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir");
      setProducts(products.filter(p => p.id !== id));
    } catch (e) {
      alert("Falha ao excluir peça.");
    }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-foreground">Estoque da Loja</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas peças na Prateleira Digital.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input 
            type="file" 
            accept=".csv" 
            ref={csvInputRef} 
            className="hidden" 
            onChange={handleCsvImport} 
          />
          <Button 
            variant="outline" 
            onClick={() => csvInputRef.current?.click()} 
            disabled={isImporting}
            className="border-border-subtle text-foreground/80 hover:text-foreground"
          >
            {isImporting ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <FileUp className="h-5 w-5 mr-2 text-blue-400" />}
            {isImporting ? "Importando..." : "Importar Planilha"}
          </Button>
          <Button onClick={() => openModal()} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 shadow-lg shadow-emerald-500/20">
            <Plus className="h-5 w-5 mr-2" /> Cadastrar Peça
          </Button>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-border-subtle bg-panel/40">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar pelo nome da peça ou SKU..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-background border border-border-subtle rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
            />
          </div>
          <Button variant="outline" className="border-border-subtle text-foreground/80 hover:text-foreground px-6">
            <Filter className="h-5 w-5 mr-2" /> Filtros
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-muted-foreground text-sm">
                <th className="pb-4 font-semibold px-4 w-12">Foto</th>
                <th className="pb-4 font-semibold px-4">Peça</th>
                <th className="pb-4 font-semibold px-4">SKU</th>
                <th className="pb-4 font-semibold px-4">Condição</th>
                <th className="pb-4 font-semibold px-4">Preço (R$)</th>
                <th className="pb-4 font-semibold px-4">Estoque</th>
                <th className="pb-4 font-semibold px-4">Status</th>
                <th className="pb-4 font-semibold px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="text-foreground/80">
              {loading ? (
                <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">Carregando estoque...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">Nenhuma peça encontrada.</td></tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-border-subtle hover:bg-zinc-800/30 transition-colors group">
                    <td className="py-4 px-4">
                      <div className="w-12 h-12 rounded-lg bg-zinc-800 border border-border-subtle overflow-hidden flex items-center justify-center">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-zinc-600" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-foreground">{product.name}</td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{product.sku || '-'}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold border ${
                        product.condition === 'NEW' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                        product.condition === 'RECONDITIONED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-zinc-500/10 text-muted-foreground border-zinc-500/20'
                      }`}>
                        {product.condition === 'NEW' ? 'Novo' : product.condition === 'USED' ? 'Usado' : 'Recondicionado'}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium flex flex-col justify-center">
                      {product.comparePrice && (
                        <span className="text-xs text-muted-foreground line-through">R$ {Number(product.comparePrice).toFixed(2)}</span>
                      )}
                      <span className={product.comparePrice ? "text-emerald-400 font-bold" : ""}>
                        R$ {Number(product.price).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={product.stock <= 0 ? "text-red-400 font-bold" : ""}>
                        {product.stock} un
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        product.active
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {product.active ? 'Vitrine' : 'Oculto'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(product)} className="p-2 bg-zinc-800 hover:bg-zinc-700 text-muted-foreground hover:text-white rounded-lg transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastro/Edição de Produto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-panel border border-border-subtle w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-background shrink-0">
              <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-500" />
                {isEditing ? "Editar Peça" : "Cadastrar Nova Peça"}
              </h2>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
                  {error}
                </div>
              )}

              {/* Upload de Imagem */}
              <div>
                <label className="block text-sm font-bold text-foreground/80 mb-2">Foto da Peça</label>
                <div 
                  className={`border-2 border-dashed rounded-2xl overflow-hidden relative group transition-all
                    ${formData.imageUrl ? 'border-emerald-500/50 h-48 bg-background' : 'border-zinc-700 hover:border-emerald-500/50 h-32 bg-panel/50'}`}
                >
                  <input 
                    type="file" 
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  {formData.imageUrl ? (
                    <>
                      <img src={formData.imageUrl} alt="Produto" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-white/20 text-foreground hover:bg-white/10 backdrop-blur-md"
                        >
                          <Edit className="h-4 w-4 mr-2" /> Trocar Foto
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div 
                      className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {isUploading ? (
                        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mb-2" />
                      ) : (
                        <UploadCloud className="h-8 w-8 text-muted-foreground group-hover:text-emerald-400 transition-colors mb-2" />
                      )}
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground/80">
                        {isUploading ? "Enviando..." : "Clique para subir a foto da peça"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dados Básicos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input 
                    label="Nome da Peça *" 
                    placeholder="Ex: Amortecedor Dianteiro Gol G5"
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    required 
                  />
                </div>
                
                <Input 
                  label="Código SKU (Opcional)" 
                  placeholder="Ex: AMORT-001"
                  value={formData.sku} 
                  onChange={(e) => setFormData({...formData, sku: e.target.value})} 
                />

                <div>
                  <label className="block text-sm font-bold text-foreground/80 mb-2">Condição</label>
                  <select 
                    value={formData.condition} 
                    onChange={(e) => setFormData({...formData, condition: e.target.value})}
                    className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
                  >
                    <option value="NEW">Novo (Na caixa)</option>
                    <option value="USED">Usado (Desmanche/Ferro Velho)</option>
                    <option value="RECONDITIONED">Recondicionado</option>
                  </select>
                </div>
              </div>

              {/* Preços e Estoque */}
              <div className="p-5 bg-background/50 border border-border-subtle rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input 
                  label="Preço de Venda (R$) *" 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00"
                  value={formData.price} 
                  onChange={(e) => setFormData({...formData, price: e.target.value})} 
                  required 
                />
                
                <Input 
                  label="Preço Anterior (De: R$)" 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00"
                  value={formData.comparePrice} 
                  onChange={(e) => setFormData({...formData, comparePrice: e.target.value})} 
                />

                <Input 
                  label="Qtd em Estoque *" 
                  type="number" 
                  min="0"
                  value={formData.stock} 
                  onChange={(e) => setFormData({...formData, stock: e.target.value})} 
                  required 
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-bold text-foreground/80 mb-2">Descrição e Aplicação</label>
                <textarea 
                  rows={3}
                  placeholder="Detalhes da peça e modelos compatíveis..."
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border-subtle">
                <Button type="button" variant="outline" onClick={closeModal} className="h-12 border-border-subtle text-foreground/80 hover:text-white hover:bg-zinc-800">
                  Cancelar
                </Button>
                <Button type="submit" loading={saving} className="h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  {isEditing ? "Salvar Alterações" : "Cadastrar Peça"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
