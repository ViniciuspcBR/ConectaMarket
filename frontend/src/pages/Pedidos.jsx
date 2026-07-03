// src/pages/Pedidos.jsx
import { useEffect, useState } from "react";
import { pedidoService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import "./Pedidos.css";

const STATUS_OPTIONS = ["PENDENTE","CONFIRMADO","EM_PREPARO","ENVIADO","ENTREGUE","CANCELADO","DEVOLVIDO"];

function badgeStatus(s) {
  return { PENDENTE:"badge-orange", CONFIRMADO:"badge-blue",
           ENTREGUE:"badge-green",  CANCELADO:"badge-red", DEVOLVIDO:"badge-red",
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
          <strong>{({
            PIX:                     "PIX",
            CARTAO_CREDITO:          "Cartão de Crédito",
            CARTAO_DEBITO:           "Cartão de Débito",
            BOLETO:                  "Boleto Bancário",
            CARTEIRA:                "💰 Carteira (100% cashback)",
            CARTEIRA_PIX:            "💰 Carteira + PIX",
            CARTEIRA_CARTAO_CREDITO: "💰 Carteira + Cartão de Crédito",
            CARTEIRA_CARTAO_DEBITO:  "💰 Carteira + Cartão de Débito",
            CARTEIRA_BOLETO:         "💰 Carteira + Boleto",
          }[pedido.formaPagamento] || pedido.formaPagamento || "—")}</strong>
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
  const [modalDevolucao, setModalDevolucao] = useState(null); // pedido sendo devolvido
  const [motivoDevolucao, setMotivoDevolucao] = useState("");

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

  async function handleDevolucao() {
    if (!motivoDevolucao.trim()) {
      addToast("Descreva o motivo da devolução.", "erro");
      return;
    }
    try {
      await pedidoService.atualizarStatus(modalDevolucao.id, "DEVOLVIDO");
      addToast("Solicitação de devolução enviada com sucesso.");
      setModalDevolucao(null);
      setMotivoDevolucao("");
      carregar();
    } catch { addToast("Erro ao solicitar devolução.", "erro"); }
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
                <div style={{display:"flex", alignItems:"center", gap:10}}>
                  <span className="pedido-data">
                    {new Date(p.criadoEm).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>

              <div className="pedido-acoes">
                {/* Ver detalhes + Solicitar devolução na mesma linha */}
                <button className="btn-outline btn-sm" onClick={() => setDetalhe(p)}>
                  🔍 Ver Detalhes
                </button>

                {usuario?.role === "CLIENTE" && !verExcluidos && p.status === "ENTREGUE" && (
                  <button
                    onClick={() => { setModalDevolucao(p); setMotivoDevolucao(""); }}
                    style={{background:"#fee2e2", color:"#dc2626", border:"1px solid #dc2626", borderRadius:6, cursor:"pointer", padding:"6px 14px", fontSize:"0.82rem", fontWeight:600}}>
                    Solicitar Devolução
                  </button>
                )}

                {/* Alterar status — só vendedor, só pedidos ativos */}
                {isVendedor && !verExcluidos && (
                  <select value={p.status}
                    onChange={(e) => handleStatus(p.id, e.target.value)}>
                    {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                )}

                {/* Excluir — só PENDENTE ou CANCELADO, só pedidos ativos */}
                {!verExcluidos && ["PENDENTE","CANCELADO","DEVOLVIDO"].includes(p.status) && (
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

      {/* Modal de Devolução */}
      {modalDevolucao && (
        <div className="modal-overlay" onClick={() => setModalDevolucao(null)}>
          <div className="modal-box card" onClick={(e) => e.stopPropagation()} style={{maxWidth:440}}>
            <div className="modal-header">
              <h2>↩️ Solicitar Devolução</h2>
              <button className="modal-fechar" onClick={() => setModalDevolucao(null)}>✕</button>
            </div>
            <p style={{color:"#64748b", marginBottom:16, fontSize:"0.9rem"}}>
              Pedido <strong>#{modalDevolucao.id}</strong> — R$ {Number(modalDevolucao.total).toFixed(2)}
            </p>
            <div className="field">
              <label style={{fontWeight:600, display:"block", marginBottom:8}}>
                Motivo da devolução *
              </label>
              <textarea
                rows={4}
                value={motivoDevolucao}
                onChange={(e) => setMotivoDevolucao(e.target.value)}
                placeholder="Descreva o motivo da devolução..."
                style={{width:"100%", padding:"10px 12px", borderRadius:8, border:"1px solid #cbd5e1", fontSize:"0.9rem", resize:"vertical"}}
              />
            </div>
            <div style={{display:"flex", gap:12, marginTop:16, justifyContent:"flex-end"}}>
              <button className="btn-outline" onClick={() => setModalDevolucao(null)}>Cancelar</button>
              <button className="btn-danger" onClick={handleDevolucao}>
                Confirmar Devolução
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
