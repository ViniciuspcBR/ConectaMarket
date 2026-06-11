// src/pages/Pedidos.jsx
import { useEffect, useState } from "react";
import { pedidoService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import "./Pedidos.css";

const STATUS_OPTIONS = ["PENDENTE","CONFIRMADO","EM_PREPARO","ENVIADO","ENTREGUE","CANCELADO"];

function badgeStatus(s) {
  return { PENDENTE:"badge-orange", CONFIRMADO:"badge-blue",
           ENTREGUE:"badge-green",  CANCELADO:"badge-red",
           EM_PREPARO:"badge-blue", ENVIADO:"badge-blue" }[s] || "badge-blue";
}

// ── Modal de detalhes do pedido ──────────────────────────────────
function ModalDetalhe({ pedido, onFechar }) {
  if (!pedido) return null;
  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-box card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Pedido #{pedido.id}</h2>
          <button className="modal-fechar" onClick={onFechar}>✕</button>
        </div>

        <div className="modal-info-linha">
          <span>Status</span>
          <span className={`badge ${badgeStatus(pedido.status)}`}>{pedido.status}</span>
        </div>
        <div className="modal-info-linha">
          <span>Forma de Pagamento</span>
          <strong>{(pedido.formaPagamento || "—").replace(/_/g," ")}</strong>
        </div>
        <div className="modal-info-linha">
          <span>Data</span>
          <strong>{new Date(pedido.criadoEm).toLocaleDateString("pt-BR")}</strong>
        </div>
        {pedido.enderecoEntrega && (
          <div className="modal-info-linha">
            <span>Entrega</span>
            <strong style={{fontSize:"0.85rem"}}>{pedido.enderecoEntrega}</strong>
          </div>
        )}

        <hr style={{margin:"16px 0", border:"none", borderTop:"1px solid #e2e8f0"}} />

        <h3 style={{marginBottom:12, fontSize:"0.95rem"}}>Itens do Pedido</h3>
        <div className="modal-itens">
          {pedido.itens?.map((item, i) => (
            <div key={i} className="modal-item">
              <div className="modal-item-img">
                {item.produto?.imagem
                  ? <img src={item.produto.imagem} alt={item.produto?.nome} />
                  : <span>📦</span>}
              </div>
              <div className="modal-item-info">
                <p className="modal-item-nome">{item.produto?.nome || "Produto removido"}</p>
                <p className="modal-item-qtd">Quantidade: {item.quantidade}</p>
                <p className="modal-item-preco">
                  R$ {Number(item.precoUnit).toFixed(2)} × {item.quantidade} =
                  <strong> R$ {Number(item.subtotal).toFixed(2)}</strong>
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-total">
          <span>Total</span>
          <strong>R$ {Number(pedido.total).toFixed(2)}</strong>
        </div>
      </div>
    </div>
  );
}

export default function Pedidos() {
  const { usuario }  = useAuth();
  const { addToast } = useToast();

  const [pedidos,    setPedidos]    = useState([]);
  const [excluidos,  setExcluidos]  = useState([]);
  const [confirmarId, setConfirmarId] = useState(null);
  const [detalhe,    setDetalhe]    = useState(null);
  const [verExcluidos, setVerExcluidos] = useState(false);

  const isVendedor = ["ADMINISTRADOR","LOJISTA","FORNECEDOR"].includes(usuario?.role);

  async function carregar() {
    pedidoService.listar().then((r) => setPedidos(r.data)).catch(() => {});
    pedidoService.listarExcluidos().then((r) => setExcluidos(r.data)).catch(() => {});
  }

  useEffect(() => { carregar(); }, []);

  async function handleStatus(id, status) {
    try {
      await pedidoService.atualizarStatus(id, status);
      addToast(status === "CONFIRMADO"
        ? "Pedido confirmado! Estoque atualizado."
        : `Status atualizado para ${status}.`);
      carregar();
    } catch { addToast("Erro ao atualizar status.", "erro"); }
  }

  async function handleExcluir(id) {
    try {
      await pedidoService.excluir(id);
      setConfirmarId(null);
      addToast("Pedido removido do histórico.");
      carregar();
    } catch (err) {
      addToast(err.response?.data?.erro || "Erro ao excluir pedido.", "erro");
    }
  }

  const lista = verExcluidos ? excluidos : pedidos;

  return (
    <div>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24}}>
        <h1 className="page-title" style={{margin:0}}>
          📦 {isVendedor ? "Gerenciar Pedidos" : "Meus Pedidos"}
        </h1>
        <button
          className={verExcluidos ? "btn-primary btn-sm" : "btn-outline btn-sm"}
          onClick={() => setVerExcluidos(!verExcluidos)}>
          {verExcluidos ? "← Ver Ativos" : `🗑️ Excluídos (${excluidos.length})`}
        </button>
      </div>

      {verExcluidos && (
        <div style={{background:"#fef9c3", padding:"10px 16px", borderRadius:8, marginBottom:16, fontSize:"0.88rem", color:"#854d0e"}}>
          Mostrando pedidos removidos do histórico. Estes pedidos não estão mais ativos.
        </div>
      )}

      {lista.length === 0 ? (
        <div className="card" style={{textAlign:"center", color:"#94a3b8", padding:48}}>
          <p style={{fontSize:"2.5rem"}}>{verExcluidos ? "🗑️" : "📭"}</p>
          <p>{verExcluidos ? "Nenhum pedido excluído." : "Nenhum pedido encontrado."}</p>
        </div>
      ) : (
        <div className="pedidos-lista">
          {lista.map((p) => (
            <div key={p.id} className={`pedido-card card ${verExcluidos ? "pedido-card--excluido" : ""}`}>
              <div className="pedido-header">
                <span className="pedido-num">Pedido #{p.id}</span>
                <span className={`badge ${badgeStatus(p.status)}`}>{p.status}</span>
              </div>

              <p className="pedido-cliente">
                {isVendedor
                  ? `👤 Cliente: ${p.cliente?.nome}`
                  : `🏪 ${p.loja?.nome || "ConectaMarket"}`}
              </p>

              <div className="pedido-itens">
                {p.itens?.map((item, i) => (
                  <span key={i} className="pedido-item-nome">
                    {item.produto?.nome} ×{item.quantidade}
                  </span>
                ))}
              </div>

              <div className="pedido-footer">
                <span className="pedido-total">R$ {Number(p.total).toFixed(2)}</span>
                <span className="pedido-data">
                  {new Date(p.criadoEm).toLocaleDateString("pt-BR")}
                </span>
              </div>

              <div className="pedido-acoes">
                {/* Ver detalhes */}
                <button className="btn-outline btn-sm" onClick={() => setDetalhe(p)}>
                  🔍 Ver Detalhes
                </button>

                {/* Alterar status — só vendedor, só pedidos ativos */}
                {isVendedor && !verExcluidos && (
                  <select value={p.status}
                    onChange={(e) => handleStatus(p.id, e.target.value)}>
                    {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                )}

                {/* Excluir — só PENDENTE ou CANCELADO, só pedidos ativos */}
                {!verExcluidos && ["PENDENTE","CANCELADO"].includes(p.status) && (
                  confirmarId === p.id ? (
                    <div className="confirmar-exclusao">
                      <span>Confirmar?</span>
                      <button className="btn-danger btn-sm" onClick={() => handleExcluir(p.id)}>Sim</button>
                      <button className="btn-outline btn-sm" onClick={() => setConfirmarId(null)}>Não</button>
                    </div>
                  ) : (
                    <button className="btn-danger btn-sm" onClick={() => setConfirmarId(p.id)}>
                      🗑️ Excluir
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ModalDetalhe pedido={detalhe} onFechar={() => setDetalhe(null)} />
    </div>
  );
}
