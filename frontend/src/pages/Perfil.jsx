// src/pages/Perfil.jsx
import { useState, useEffect } from "react";
import { usuarioService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import "./Auth.css";

export default function Perfil() {
  const { usuario, login, token } = useAuth();
  const { addToast } = useToast();
  const [form,    setForm]    = useState({ nome:"", telefone:"" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    usuarioService.perfil().then(({ data }) => {
      setForm({ nome: data.nome, telefone: data.telefone || "" });
    });
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
      <div className="card" style={{ maxWidth:480 }}>

        {/* Info somente leitura */}
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
    </div>
  );
}
