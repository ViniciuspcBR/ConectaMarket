// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api";
import "./Auth.css";

export default function Login() {
  const [form, setForm]     = useState({ email: "", senha: "" });
  const [erro, setErro]     = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const { data } = await authService.login(form);
      login(data.token, data.usuario);
      navigate("/");
    } catch (err) {
      setErro(err.response?.data?.erro || "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <span className="auth-logo">🤝</span>
          <h1>ConectaMarket</h1>
          <p>Entre na sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>E-mail</label>
            <input name="email" type="email" value={form.email}
              onChange={handleChange} placeholder="seu@email.com" required />
          </div>
          <div className="field">
            <label>Senha</label>
            <input name="senha" type="password" value={form.senha}
              onChange={handleChange} placeholder="••••••••" required />
          </div>

          {erro && <p className="auth-erro">{erro}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="auth-link">
          Não tem conta? <Link to="/registro">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
