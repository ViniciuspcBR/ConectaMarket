// src/pages/Registro.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/api";
import "./Auth.css";

const ROLES = [
  { value: "CLIENTE",      label: "Cliente Final" },
  { value: "EMPREENDEDOR", label: "Empreendedor" },
  { value: "LOJISTA",      label: "Lojista" },
  { value: "FORNECEDOR",   label: "Fornecedor" },
];

export default function Registro() {
  const [form, setForm]     = useState({ nome: "", email: "", senha: "", telefone: "", role: "CLIENTE" });
  const [erro, setErro]     = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      await authService.registro(form);
      navigate("/login");
    } catch (err) {
      setErro(err.response?.data?.erro || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <span className="auth-logo">🤝</span>
          <h1>Criar Conta</h1>
          <p>Faça parte do ConectaMarket</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>Nome completo</label>
            <input name="nome" value={form.nome} onChange={handleChange}
              placeholder="Seu nome" required />
          </div>
          <div className="field">
            <label>E-mail</label>
            <input name="email" type="email" value={form.email}
              onChange={handleChange} placeholder="seu@email.com" required />
          </div>
          <div className="field">
            <label>Telefone</label>
            <input name="telefone" value={form.telefone} onChange={handleChange}
              placeholder="(48) 99999-9999" />
          </div>
          <div className="field">
            <label>Perfil</label>
            <select name="role" value={form.role} onChange={handleChange}>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Senha</label>
            <input name="senha" type="password" value={form.senha}
              onChange={handleChange} placeholder="Min. 6 caracteres" required />
          </div>

          {erro && <p className="auth-erro">{erro}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Criando..." : "Criar Conta"}
          </button>
        </form>

        <p className="auth-link">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
