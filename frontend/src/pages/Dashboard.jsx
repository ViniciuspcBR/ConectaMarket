// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { pedidoService, produtoService, campanhaService } from "../services/api";
import "./Dashboard.css";

function badgeStatus(s) {
  return { PENDENTE:"badge-orange", CONFIRMADO:"badge-blue",
           ENTREGUE:"badge-green",  CANCELADO:"badge-red" }[s] || "badge-blue";
}

export default function Dashboard() {
  const { usuario } = useAuth();
  const navigate    = useNavigate();
  const isAdmin     = usuario?.role === "ADMINISTRADOR";
  const isVendedor  = ["ADMINISTRADOR","LOJISTA","FORNECEDOR","EMPREENDEDOR"].includes(usuario?.role);

  const [pedidos,   setPedidos]   = useState([]);
  const [campanhas, setCampanhas] = useState([]);

  useEffect(() => {
    pedidoService.listar().then((r) => setPedidos(r.data)).catch(() => {});
    campanhaService.listar().then((r) => setCampanhas(r.data)).catch(() => {});
  }, []);

  // Métricas diferentes por perfil
  const meusPedidos    = isAdmin ? pedidos : pedidos.filter((p) => p.clienteId === usuario?.id);
  const totalGasto     = meusPedidos.filter((p) => p.status !== "CANCELADO").reduce((a,p) => a+p.total, 0);
  const pendentes      = pedidos.filter((p) => p.status === "PENDENTE").length;
  const entregues      = pedidos.filter((p) => p.status === "ENTREGUE").length;
  const receitaTotal   = pedidos.filter((p) => p.status === "ENTREGUE").reduce((a,p) => a+p.total, 0);

  return (
    <div>
      <h1 className="page-title">Olá, {usuario?.nome} 👋</h1>
      <p style={{color:"#64748b", marginBottom:24, marginTop:-16}}>
        Bem-vindo ao <strong>ConectaMarket</strong> — Marketplace Colaborativo ABADEUS
      </p>

      {/* Cards — diferentes por perfil */}
      <div className="dashboard-cards">
        {isAdmin ? (
          // Admin vê visão geral do sistema
          <>
            <div className="dash-card dash-card--blue card">
              <p className="dash-label">Total de Pedidos</p>
              <p className="dash-value">{pedidos.length}</p>
            </div>
            <div className="dash-card dash-card--orange card">
              <p className="dash-label">Aguardando</p>
              <p className="dash-value">{pendentes}</p>
            </div>
            <div className="dash-card dash-card--green card">
              <p className="dash-label">Entregues</p>
              <p className="dash-value">{entregues}</p>
            </div>
            <div className="dash-card dash-card--purple card">
              <p className="dash-label">Receita Total</p>
              <p className="dash-value" style={{fontSize:"1.3rem"}}>R$ {receitaTotal.toFixed(2)}</p>
            </div>
          </>
        ) : isVendedor ? (
          // Vendedor vê seus números de vendas
          <>
            <div className="dash-card dash-card--blue card">
              <p className="dash-label">Pedidos Recebidos</p>
              <p className="dash-value">{pedidos.length}</p>
            </div>
            <div className="dash-card dash-card--orange card">
              <p className="dash-label">Pendentes</p>
              <p className="dash-value">{pendentes}</p>
            </div>
            <div className="dash-card dash-card--green card">
              <p className="dash-label">Entregues</p>
              <p className="dash-value">{entregues}</p>
            </div>
            <div className="dash-card dash-card--purple card">
              <p className="dash-label">Receita</p>
              <p className="dash-value" style={{fontSize:"1.3rem"}}>R$ {receitaTotal.toFixed(2)}</p>
            </div>
          </>
        ) : (
          // Cliente vê seus próprios dados
          <>
            <div className="dash-card dash-card--blue card">
              <p className="dash-label">Meus Pedidos</p>
              <p className="dash-value">{meusPedidos.length}</p>
            </div>
            <div className="dash-card dash-card--orange card">
              <p className="dash-label">Pendentes</p>
              <p className="dash-value">{meusPedidos.filter(p=>p.status==="PENDENTE").length}</p>
            </div>
            <div className="dash-card dash-card--green card">
              <p className="dash-label">Entregues</p>
              <p className="dash-value">{meusPedidos.filter(p=>p.status==="ENTREGUE").length}</p>
            </div>
            <div className="dash-card dash-card--purple card">
              <p className="dash-label">Total Gasto</p>
              <p className="dash-value" style={{fontSize:"1.3rem"}}>R$ {totalGasto.toFixed(2)}</p>
            </div>
          </>
        )}
      </div>

      {/* Campanhas ativas */}
      {campanhas.length > 0 && (
        <div className="card" style={{marginTop:24, background:"linear-gradient(135deg,#1e293b,#2563eb)", color:"#fff"}}>
          <h2 style={{fontSize:"1rem", marginBottom:12}}>🎯 Campanhas Ativas</h2>
          <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
            {campanhas.map((c) => (
              <div key={c.id} style={{background:"rgba(255,255,255,0.12)", borderRadius:8, padding:"8px 16px"}}>
                <strong>{c.nome}</strong>
                <p style={{fontSize:"0.82rem", opacity:0.85, marginTop:2}}>
                  {c.tipo !== "BRINDE" ? `${c.valor}% de ${c.tipo}` : "Brinde especial"}
                  {" — "}aplica-se automaticamente nos produtos vinculados
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Atalhos rápidos */}
      <div className="card" style={{marginTop:24}}>
        <h2 style={{marginBottom:16, fontSize:"1.05rem"}}>🚀 Acesso Rápido</h2>
        <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
          <button className="btn-primary" onClick={() => navigate("/catalogo")}>🛍️ Catálogo</button>
          <button className="btn-outline" onClick={() => navigate("/marketplace")}>🏪 Marketplace</button>
          <button className="btn-outline" onClick={() => navigate("/pedidos")}>📦 Pedidos</button>
          <button className="btn-outline" onClick={() => navigate("/carrinho")}>🛒 Carrinho</button>
          {isAdmin && <button className="btn-outline" onClick={() => navigate("/admin")}>🔧 Admin</button>}
        </div>
      </div>

      {/* Últimos pedidos */}
      <div className="card" style={{marginTop:24}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16}}>
          <h2 style={{fontSize:"1.05rem"}}>
            {isAdmin || isVendedor ? "Últimos Pedidos do Sistema" : "Meus Últimos Pedidos"}
          </h2>
          <button className="btn-outline btn-sm" onClick={() => navigate("/pedidos")}>Ver todos</button>
        </div>
        {pedidos.length === 0 ? (
          <p style={{color:"#94a3b8"}}>Nenhum pedido ainda.</p>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>#</th>
                {(isAdmin || isVendedor) && <th>Cliente</th>}
                <th>Itens</th>
                <th>Total</th>
                <th>Pagamento</th>
                <th>Status</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.slice(0,8).map((p) => (
                <tr key={p.id}>
                  <td>#{p.id}</td>
                  {(isAdmin || isVendedor) && <td style={{fontSize:"0.83rem"}}>{p.cliente?.nome}</td>}
                  <td style={{fontSize:"0.83rem", maxWidth:180}}>
                    {p.itens?.map((i) => i.produto?.nome).filter(Boolean).join(", ").slice(0,50) || "—"}
                  </td>
                  <td>R$ {Number(p.total).toFixed(2)}</td>
                  <td style={{fontSize:"0.82rem"}}>{(p.formaPagamento||"—").replace(/_/g," ")}</td>
                  <td><span className={`badge ${badgeStatus(p.status)}`}>{p.status}</span></td>
                  <td style={{fontSize:"0.82rem"}}>{new Date(p.criadoEm).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
