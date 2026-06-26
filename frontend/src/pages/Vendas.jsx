// src/pages/Vendas.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { pedidoService, produtoService } from "../services/api";
import { useToast } from "../context/ToastContext";
import "./Vendas.css";

export default function Vendas() {
  const navigate     = useNavigate();
  const { addToast } = useToast();
  const [pedidos,     setPedidos]     = useState([]);
  const [produtos,    setProdutos]    = useState([]);
  const [confirmarId, setConfirmarId] = useState(null);

  async function carregar() {
    produtoService.listar({ meus: true }).then((r) => setProdutos(r.data));
    pedidoService.listar().then((r) => setPedidos(r.data));
  }

  useEffect(() => { carregar(); }, []);

  async function handleRemoverProduto(id) {
    try {
      await produtoService.remover(id);
      setConfirmarId(null);
      addToast("Produto desativado com sucesso.");
      carregar();
    } catch {
      addToast("Erro ao desativar produto.", "erro");
    }
  }

  const totalVendas = pedidos.filter((p) => p.status === "ENTREGUE").reduce((a, p) => a + p.total, 0);
  const pendentes   = pedidos.filter((p) => p.status === "PENDENTE").length;
  const entregues   = pedidos.filter((p) => p.status === "ENTREGUE").length;
  const semEstoque  = produtos.filter((p) => p.estoque === 0).length;

  // Calcula qtd vendida e receita por produto (apenas pedidos ENTREGUE)
  const statsPorProduto = {};
  pedidos
    .filter((p) => p.status === "ENTREGUE")
    .forEach((pedido) => {
      (pedido.itens || []).forEach((item) => {
        if (!statsPorProduto[item.produtoId]) {
          statsPorProduto[item.produtoId] = { qtd: 0, receita: 0 };
        }
        statsPorProduto[item.produtoId].qtd     += item.quantidade;
        statsPorProduto[item.produtoId].receita += item.subtotal;
      });
    });

  return (
    <div>
      <h1 className="page-title">💰 Painel de Vendas</h1>

      {/* Cards de resumo */}
      <div className="dashboard-cards">
        <div className="dash-card dash-card--green card">
          <p className="dash-label">Receita Total</p>
          <p className="dash-value">R$ {totalVendas.toFixed(2)}</p>
        </div>
        <div className="dash-card dash-card--orange card">
          <p className="dash-label">Pedidos Pendentes</p>
          <p className="dash-value">{pendentes}</p>
        </div>
        <div className="dash-card dash-card--blue card">
          <p className="dash-label">Pedidos Entregues</p>
          <p className="dash-value">{entregues}</p>
        </div>
        <div className="dash-card dash-card--purple card">
          <p className="dash-label">Produtos s/ Estoque</p>
          <p className="dash-value">{semEstoque}</p>
        </div>
      </div>

      {/* Tabela de produtos */}
      <div className="card" style={{ marginTop:32 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <h2 style={{ fontSize:"1.1rem" }}>Meus Produtos</h2>
          <div style={{ display:"flex", gap:10 }}>
            <button className="btn-outline" onClick={() => navigate("/produtos/lote")}>
              📋 Cadastrar em Lote
            </button>
            <button className="btn-primary" onClick={() => navigate("/produtos/novo")}>
              ➕ Novo Produto
            </button>
          </div>
        </div>

        {produtos.length === 0 ? (
          <p style={{ color:"#94a3b8" }}>Nenhum produto cadastrado ainda.</p>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Tipo</th>
                <th>Qtd. Vendida</th>
                <th>Receita Gerada</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => {
                const stats = statsPorProduto[p.id] || { qtd: 0, receita: 0 };
                return (
                  <tr key={p.id}>
                    <td>{p.nome}</td>
                    <td>{p.categoria || "—"}</td>
                    <td>R$ {p.preco.toFixed(2)}</td>
                    <td>
                      <span style={{ color: p.estoque === 0 ? "#dc2626" : p.estoque < 5 ? "#ea580c" : "#16a34a", fontWeight:700 }}>
                        {p.estoque === 0 ? "⚠️ Sem estoque" : p.estoque}
                      </span>
                    </td>
                    <td>{p.tipo}</td>
                    <td>
                      <span style={{ fontWeight: stats.qtd > 0 ? 700 : 400, color: stats.qtd > 0 ? "#1d4ed8" : "#94a3b8" }}>
                        {stats.qtd > 0 ? `${stats.qtd} un.` : "—"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: stats.receita > 0 ? 700 : 400, color: stats.receita > 0 ? "#16a34a" : "#94a3b8" }}>
                        {stats.receita > 0 ? `R$ ${stats.receita.toFixed(2)}` : "—"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display:"flex", gap:8 }}>
                        <button className="btn-outline btn-sm"
                          onClick={() => navigate(`/produtos/${p.id}/editar`)}>
                          ✏️ Editar
                        </button>
                        {confirmarId === p.id ? (
                          <>
                            <button className="btn-danger btn-sm" onClick={() => handleRemoverProduto(p.id)}>Confirmar</button>
                            <button className="btn-outline btn-sm" onClick={() => setConfirmarId(null)}>Cancelar</button>
                          </>
                        ) : (
                          <button className="btn-danger btn-sm" onClick={() => setConfirmarId(p.id)}>
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
