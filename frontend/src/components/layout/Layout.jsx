// src/components/layout/Layout.jsx
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCarrinho } from "../../context/CarrinhoContext";
import "./Layout.css";

const VENDEDOR = ["LOJISTA","FORNECEDOR","EMPREENDEDOR","ADMINISTRADOR"];

export default function Layout() {
  const { usuario, logout } = useAuth();
  const { qtdTotal }        = useCarrinho();
  const navigate = useNavigate();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">🤝</span>
          <span className="logo-text">ConectaMarket</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/"             end className={navClass}>📊 Dashboard</NavLink>
          <NavLink to="/catalogo"         className={navClass}>🛍️ Catálogo</NavLink>
          <NavLink to="/carrinho"         className={navClass}>
            🛒 Carrinho {qtdTotal > 0 && <span className="cart-badge">{qtdTotal}</span>}
          </NavLink>
          <NavLink to="/pedidos"          className={navClass}>📦 Pedidos</NavLink>
          <NavLink to="/marketplace"      className={navClass}>🏪 Marketplace</NavLink>

          {VENDEDOR.includes(usuario?.role) && <>
            <div className="nav-divider">Vendas</div>
            <NavLink to="/vendas"          className={navClass}>💰 Painel de Vendas</NavLink>
            <NavLink to="/produtos/novo"   className={navClass}>➕ Novo Produto</NavLink>
            <NavLink to="/produtos/lote"   className={navClass}>📋 Cadastro em Lote</NavLink>
            <NavLink to="/campanhas"       className={navClass}>🎯 Campanhas</NavLink>
          </>}

          {usuario?.role === "ADMINISTRADOR" && <>
            <div className="nav-divider">Administração</div>
            <NavLink to="/admin"           className={navClass}>🔧 Painel Admin</NavLink>
          </>}

          <div className="nav-divider">Conta</div>
          <NavLink to="/perfil"            className={navClass}>👤 Meu Perfil</NavLink>
        </nav>

        <div className="sidebar-footer">
          <p className="sidebar-user">{usuario?.nome}</p>
          <span className="badge badge-blue">{usuario?.role}</span>
          <button className="btn-logout" onClick={() => { logout(); navigate("/login"); }}>Sair</button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

const navClass = ({ isActive }) => "nav-item" + (isActive ? " nav-item--active" : "");
