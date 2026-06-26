// src/pages/NovoProduto.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { produtoService, lojaService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import "./Auth.css";

const CATEGORIAS = [
  "Saúde e Beleza","Alimentos","Agropecuária",
  "Vestuário","Construção Civil","Eletrônica","Cultura","Serviços",
];

export default function NovoProduto() {
  const navigate        = useNavigate();
  const { addToast }    = useToast();
  const { usuario }     = useAuth();
  const [lojas,  setLojas]  = useState([]);
  const [form, setForm] = useState({
    nome:"", descricao:"", preco:"", estoque:"",
    categoria:"Alimentos", tipo:"PRODUTO", imagem:"", lojaId:"",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Admin pode escolher qualquer loja; LOJISTA já tem a dele
    lojaService.listar().then((r) => setLojas(r.data)).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        preco:   parseFloat(form.preco),
        estoque: parseInt(form.estoque),
        lojaId:  form.lojaId ? Number(form.lojaId) : undefined,
      };
      await produtoService.criar(payload);
      addToast("Produto cadastrado com sucesso!");
      navigate("/vendas");
    } catch (err) {
      addToast(err.response?.data?.erro || "Erro ao cadastrar produto.", "erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">➕ Novo Produto</h1>
      <p style={{ color:"#64748b", marginBottom:20 }}>
        Para cadastrar vários de uma vez, use o{" "}
        <Link to="/produtos/lote" style={{ color:"#2563eb", fontWeight:600 }}>
          Cadastro em Lote
        </Link>.
      </p>

      <div className="card" style={{ maxWidth:600 }}>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>Nome do produto / serviço</label>
            <input value={form.nome}
              onChange={(e) => setForm({...form, nome:e.target.value})} required />
          </div>
          <div className="field">
            <label>Descrição</label>
            <textarea rows={3} value={form.descricao}
              onChange={(e) => setForm({...form, descricao:e.target.value})} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div className="field">
              <label>Preço (R$)</label>
              <input type="number" step="0.01" min="0" value={form.preco}
                onChange={(e) => setForm({...form, preco:e.target.value})} required />
            </div>
            <div className="field">
              <label>Estoque</label>
              <input type="number" min="0" value={form.estoque}
                onChange={(e) => setForm({...form, estoque:e.target.value})} required />
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div className="field">
              <label>Categoria</label>
              <select value={form.categoria}
                onChange={(e) => setForm({...form, categoria:e.target.value})}>
                {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Tipo</label>
              <select value={form.tipo}
                onChange={(e) => setForm({...form, tipo:e.target.value})}>
                <option value="PRODUTO">Produto</option>
                <option value="SERVICO">Serviço</option>
              </select>
            </div>
          </div>

          {/* Seletor de loja — visível para admin e lojista */}
          {(usuario?.role === "ADMINISTRADOR" || usuario?.role === "LOJISTA") && lojas.length > 0 && (
            <div className="field">
              <label>Vincular à Loja</label>
              <select value={form.lojaId}
                onChange={(e) => setForm({...form, lojaId:e.target.value})}>
                <option value="">— Sem loja (produto independente) —</option>
                {lojas.map((l) => (
                  <option key={l.id} value={l.id}>{l.nome}</option>
                ))}
              </select>
            </div>
          )}

          <div className="field">
            <label>URL da Imagem (opcional)</label>
            <input value={form.imagem} placeholder="https://..."
              onChange={(e) => setForm({...form, imagem:e.target.value})} />
          </div>
          <div style={{ display:"flex", gap:12 }}>
            <button type="button" className="btn-outline" onClick={() => navigate(-1)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Salvando..." : "Cadastrar Produto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
