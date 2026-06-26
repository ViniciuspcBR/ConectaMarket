// src/pages/EditarProduto.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { produtoService, lojaService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import "./Auth.css";

const CATEGORIAS = [
  "Saúde e Beleza","Alimentos","Agropecuária",
  "Vestuário","Construção Civil","Eletrônica","Cultura","Serviços",
];

export default function EditarProduto() {
  const { id }          = useParams();
  const navigate        = useNavigate();
  const { addToast }    = useToast();
  const { usuario }     = useAuth();
  const [form,   setForm]   = useState(null);
  const [lojas,  setLojas]  = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    produtoService.buscarPorId(id).then(({ data }) => {
      setForm({
        nome:      data.nome,
        descricao: data.descricao || "",
        preco:     data.preco,
        estoque:   data.estoque,
        categoria: data.categoria || "Alimentos",
        tipo:      data.tipo,
        imagem:    data.imagem || "",
        ativo:     data.ativo,
        lojaId:    data.lojaId || "",
      });
    });
    lojaService.listar().then((r) => setLojas(r.data)).catch(() => {});
  }, [id]);

  function handleChange(e) {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await produtoService.atualizar(id, {
        ...form,
        preco:   parseFloat(form.preco),
        estoque: parseInt(form.estoque),
        lojaId:  form.lojaId ? Number(form.lojaId) : null,
      });
      addToast("Produto atualizado com sucesso!");
      navigate("/vendas");
    } catch {
      addToast("Erro ao atualizar produto.", "erro");
    } finally {
      setLoading(false);
    }
  }

  if (!form) return <p style={{ padding: 32 }}>Carregando...</p>;

  return (
    <div>
      <h1 className="page-title">✏️ Editar Produto</h1>
      <div className="card" style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>Nome</label>
            <input name="nome" value={form.nome} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Descrição</label>
            <textarea name="descricao" rows={3} value={form.descricao} onChange={handleChange} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div className="field">
              <label>Preço (R$)</label>
              <input name="preco" type="number" step="0.01" min="0"
                value={form.preco} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Estoque</label>
              <input name="estoque" type="number" min="0"
                value={form.estoque} onChange={handleChange} required />
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div className="field">
              <label>Categoria</label>
              <select name="categoria" value={form.categoria} onChange={handleChange}>
                {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Tipo</label>
              <select name="tipo" value={form.tipo} onChange={handleChange}>
                <option value="PRODUTO">Produto</option>
                <option value="SERVICO">Serviço</option>
              </select>
            </div>
          </div>

          {/* Seletor de loja */}
          {(usuario?.role === "ADMINISTRADOR" || usuario?.role === "LOJISTA") && lojas.length > 0 && (
            <div className="field">
              <label>Vincular à Loja</label>
              <select name="lojaId" value={form.lojaId} onChange={handleChange}>
                <option value="">— Sem loja (produto independente) —</option>
                {lojas.map((l) => (
                  <option key={l.id} value={l.id}>{l.nome}</option>
                ))}
              </select>
            </div>
          )}

          <div className="field">
            <label>URL da Imagem</label>
            <input name="imagem" value={form.imagem} onChange={handleChange} placeholder="https://..." />
          </div>
          <div className="field" style={{ flexDirection:"row", alignItems:"center", gap:10 }}>
            <input name="ativo" type="checkbox" checked={form.ativo} onChange={handleChange}
              style={{ width:"auto" }} />
            <label style={{ margin:0 }}>Produto ativo (visível no catálogo)</label>
          </div>
          <div style={{ display:"flex", gap:12, marginTop:8 }}>
            <button type="button" className="btn-outline" onClick={() => navigate(-1)}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
