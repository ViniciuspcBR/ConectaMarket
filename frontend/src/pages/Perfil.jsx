// src/pages/Perfil.jsx
import { useState, useEffect } from "react";
import { usuarioService, carteiraService, brindeService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import "./Auth.css";
import "./Perfil.css";

const STATUS_BRINDE_LABEL = {
  PENDENTE:  "Aguardando entrega",
  ENTREGUE:  "Entregue ✓",
  CANCELADO: "Cancelado",
};

export default function Perfil() {
  const { usuario, login, token } = useAuth();
  const { addToast } = useToast();
  const [form,      setForm]      = useState({ nome:"", telefone:"" });
  const [loading,   setLoading]   = useState(false);
  const [carteira,  setCarteira]  = useState(null);
  const [brindes,   setBrindes]   = useState([]);

  useEffect(() => {
    usuarioService.perfil().then(({ data }) => {
      setForm({ nome: data.nome, telefone: data.telefone || "" });
    });
    carteiraService.minha().then(({ data }) => setCarteira(data)).catch(() => {});
    brindeService.meus().then(({ data }) => setBrindes(data)).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await usuarioService.atualizarPerfil(form);
      login(token, { ...usuario, nome: data.nome });
      addToast("Perfil atualizado com sucesso!");
    } catch {
      addToast("Erro ao atualizar perfil.", "erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">👤 Meu Perfil</h1>

      <div className="perfil-grid">
        {/* ── Dados pessoais ── */}
        <div className="card" style={{ maxWidth:480 }}>
          <div style={{ marginBottom:24, padding:"16px", background:"#f8fafc", borderRadius:8 }}>
            <p style={{ fontSize:"0.85rem", color:"#64748b", marginBottom:6 }}>E-mail</p>
            <p style={{ fontWeight:600 }}>{usuario?.email}</p>
            <p style={{ fontSize:"0.85rem", color:"#64748b", marginTop:12, marginBottom:6 }}>Perfil</p>
            <span className="badge badge-blue">{usuario?.role}</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label>Nome completo</label>
              <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
            </div>
            <div className="field">
              <label>Telefone</label>
              <input value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                placeholder="(48) 99999-9999" />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </form>
        </div>

        {/* ── Carteira de Cashback ── */}
        <div className="card carteira-card">
          <div className="carteira-header">
            <span style={{ fontSize:"1.6rem" }}>💰</span>
            <div>
              <h2 style={{ fontSize:"1rem", margin:0 }}>Minha Carteira</h2>
              <p style={{ fontSize:"0.78rem", color:"#94a3b8", margin:0 }}>Pontos de cashback acumulados</p>
            </div>
          </div>

          <p className="carteira-saldo">
            R$ {(carteira?.saldo ?? 0).toFixed(2)}
          </p>

          <p style={{ fontSize:"0.8rem", color:"#64748b", marginBottom:12 }}>
            Você recebe cashback automaticamente quando um pedido com produtos em campanha de cashback é <strong>entregue</strong>.
          </p>

          {carteira?.transacoes?.length > 0 ? (
            <div className="carteira-historico">
              <h3 style={{ fontSize:"0.85rem", marginBottom:8 }}>Histórico</h3>
              {carteira.transacoes.map((t) => (
                <div key={t.id} className="carteira-transacao">
                  <div>
                    <p className="carteira-transacao-desc">{t.descricao || t.tipo}</p>
                    <p className="carteira-transacao-data">{new Date(t.criadoEm).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <span className={`carteira-valor ${t.tipo === "CASHBACK" ? "carteira-valor--positivo" : "carteira-valor--negativo"}`}>
                    {t.tipo === "CASHBACK" ? "+" : "−"} R$ {t.valor.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize:"0.82rem", color:"#94a3b8" }}>Nenhum cashback recebido ainda.</p>
          )}
        </div>

        {/* ── Meus Brindes ── */}
        <div className="card brindes-card">
          <div className="carteira-header">
            <span style={{ fontSize:"1.6rem" }}>🎁</span>
            <div>
              <h2 style={{ fontSize:"1rem", margin:0 }}>Meus Brindes</h2>
              <p style={{ fontSize:"0.78rem", color:"#94a3b8", margin:0 }}>Brindes ganhos em campanhas</p>
            </div>
          </div>

          {brindes.length === 0 ? (
            <p style={{ fontSize:"0.82rem", color:"#94a3b8" }}>
              Nenhum brinde ainda. Brindes são liberados quando um pedido com produto em campanha de brinde é <strong>entregue</strong>.
            </p>
          ) : (
            <div className="brindes-lista">
              {brindes.map((b) => (
                <div key={b.id} className="brinde-item">
                  <div className="brinde-img">
                    {b.produto?.imagem
                      ? <img src={b.produto.imagem} alt={b.produto.nome} />
                      : <span>🎁</span>}
                  </div>
                  <div style={{ flex:1 }}>
                    <p className="brinde-nome">{b.produto?.nome}</p>
                    <p className="brinde-campanha">Campanha: {b.campanha?.nome}</p>
                  </div>
                  <span className={`badge ${b.status === "ENTREGUE" ? "badge-green" : b.status === "CANCELADO" ? "badge-red" : "badge-orange"}`}>
                    {STATUS_BRINDE_LABEL[b.status] ?? b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
