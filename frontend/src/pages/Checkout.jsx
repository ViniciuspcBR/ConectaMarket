// src/pages/Checkout.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCarrinho } from "../context/CarrinhoContext";
import { useToast } from "../context/ToastContext";
import { pedidoService } from "../services/api";
import "./Checkout.css";

const FORMAS = [
  { valor: "PIX",            label: "PIX",              icone: "⚡", desc: "Aprovação imediata" },
  { valor: "CARTAO_CREDITO", label: "Cartão de Crédito", icone: "💳", desc: "Parcelamento disponível" },
  { valor: "CARTAO_DEBITO",  label: "Cartão de Débito",  icone: "💳", desc: "Débito à vista" },
  { valor: "BOLETO",         label: "Boleto Bancário",   icone: "📄", desc: "Vencimento em 3 dias úteis" },
];

export default function Checkout() {
  const { itens, total, limpar } = useCarrinho();
  const { addToast } = useToast();
  const navigate     = useNavigate();

  const [formaPagamento, setFormaPagamento] = useState("PIX");
  const [endereco, setEndereco] = useState({
    rua:"", numero:"", bairro:"", cidade:"Criciúma", estado:"SC", cep:""
  });
  const [etapa,        setEtapa]        = useState(1);
  const [loading,      setLoading]      = useState(false);
  const [pedidoCriado, setPedidoCriado] = useState(null);

  // Campos do cartão — separados com nomes neutros para evitar autocomplete indesejado
  const [numeroCartao,   setNumeroCartao]   = useState("");
  const [nomeCartao,     setNomeCartao]     = useState("");
  const [validadeCartao, setValidadeCartao] = useState("");
  const [cvvCartao,      setCvvCartao]      = useState("");
  const [parcelas,       setParcelas]       = useState("1");

  if (itens.length === 0 && !pedidoCriado) {
    navigate("/carrinho"); return null;
  }

  // Formata número do cartão com espaços (ex: 1234 5678 9012 3456)
  function formatarNumeroCartao(valor) {
    const numeros = valor.replace(/\D/g, "").slice(0, 16);
    return numeros.replace(/(.{4})/g, "$1 ").trim();
  }

  // Formata validade MM/AA
  function formatarValidade(valor) {
    const numeros = valor.replace(/\D/g, "").slice(0, 4);
    if (numeros.length >= 3) return numeros.slice(0,2) + "/" + numeros.slice(2);
    return numeros;
  }

  async function finalizar() {
    setLoading(true);
    try {
      const endStr = `${endereco.rua}, ${endereco.numero} — ${endereco.bairro}, ${endereco.cidade}/${endereco.estado} CEP ${endereco.cep}`;
      const { data } = await pedidoService.criar({
        observacao:      `Entrega: ${endStr}`,
        enderecoEntrega: endStr,
        formaPagamento,
        itens: itens.map((i) => ({ produtoId: i.id, quantidade: i.quantidade })),
      });
      setPedidoCriado(data);
      limpar();
      setEtapa(3);
    } catch (err) {
      addToast(err.response?.data?.erro || "Erro ao finalizar pedido.", "erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">💳 Finalizar Compra</h1>

      {/* Progresso */}
      <div className="checkout-steps">
        {["Entrega","Pagamento","Confirmação"].map((s, i) => (
          <div key={s} className={`step ${etapa > i ? "step--done" : ""} ${etapa === i+1 ? "step--active" : ""}`}>
            <span className="step-num">{etapa > i+1 ? "✓" : i+1}</span>
            <span>{s}</span>
          </div>
        ))}
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">

          {/* ── ETAPA 1 — Endereço ── */}
          {etapa === 1 && (
            <div className="card">
              <h2 className="checkout-titulo">📍 Endereço de Entrega</h2>
              <div className="checkout-form">
                <div className="field-row">
                  <div className="field">
                    <label>CEP</label>
                    <input
                      autoComplete="postal-code"
                      value={endereco.cep}
                      placeholder="88800-000"
                      onChange={(e) => setEndereco({...endereco, cep: e.target.value})}
                    />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field" style={{flex:3}}>
                    <label>Rua / Avenida</label>
                    <input
                      autoComplete="street-address"
                      value={endereco.rua}
                      placeholder="Rua das Flores"
                      onChange={(e) => setEndereco({...endereco, rua: e.target.value})}
                      required
                    />
                  </div>
                  <div className="field" style={{flex:1}}>
                    <label>Número</label>
                    <input
                      autoComplete="off"
                      value={endereco.numero}
                      placeholder="123"
                      onChange={(e) => setEndereco({...endereco, numero: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Bairro</label>
                    <input
                      autoComplete="off"
                      value={endereco.bairro}
                      placeholder="Cristo Redentor"
                      onChange={(e) => setEndereco({...endereco, bairro: e.target.value})}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Cidade</label>
                    <input
                      autoComplete="address-level2"
                      value={endereco.cidade}
                      onChange={(e) => setEndereco({...endereco, cidade: e.target.value})}
                    />
                  </div>
                  <div className="field" style={{flex:"0 0 80px"}}>
                    <label>UF</label>
                    <input
                      autoComplete="address-level1"
                      value={endereco.estado}
                      maxLength={2}
                      onChange={(e) => setEndereco({...endereco, estado: e.target.value})}
                    />
                  </div>
                </div>
                <button
                  className="btn-primary"
                  style={{marginTop:8}}
                  onClick={() => setEtapa(2)}
                  disabled={!endereco.rua || !endereco.numero || !endereco.bairro}
                >
                  Continuar para Pagamento →
                </button>
              </div>
            </div>
          )}

          {/* ── ETAPA 2 — Pagamento ── */}
          {etapa === 2 && (
            <div className="card">
              <h2 className="checkout-titulo">💳 Forma de Pagamento</h2>

              <div className="formas-grid">
                {FORMAS.map((f) => (
                  <button
                    key={f.valor}
                    className={`forma-btn ${formaPagamento === f.valor ? "forma-btn--ativo" : ""}`}
                    onClick={() => setFormaPagamento(f.valor)}
                  >
                    <span className="forma-icone">{f.icone}</span>
                    <span className="forma-label">{f.label}</span>
                    <span className="forma-desc">{f.desc}</span>
                  </button>
                ))}
              </div>

              {/* PIX */}
              {formaPagamento === "PIX" && (
                <div className="pix-box">
                  <div className="pix-qr">
                    <div className="pix-qr-inner">
                      <p style={{fontSize:"3rem"}}>⚡</p>
                      <p style={{fontWeight:700}}>PIX ConectaMarket</p>
                      <p style={{fontSize:"0.85rem", color:"#64748b"}}>Chave: marketplace@abadeus.com</p>
                    </div>
                  </div>
                  <p className="pix-instrucao">
                    Escaneie o QR Code ou copie a chave PIX. O pedido será confirmado após o pagamento.
                  </p>
                </div>
              )}

              {/* Cartão de Crédito ou Débito */}
              {(formaPagamento === "CARTAO_CREDITO" || formaPagamento === "CARTAO_DEBITO") && (
                <div className="cartao-form">
                  {/* Número */}
                  <div className="field">
                    <label>Número do Cartão</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      value={numeroCartao}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      onChange={(e) => setNumeroCartao(formatarNumeroCartao(e.target.value))}
                    />
                  </div>
                  {/* Nome */}
                  <div className="field">
                    <label>Nome impresso no Cartão</label>
                    <input
                      type="text"
                      autoComplete="cc-name"
                      value={nomeCartao}
                      placeholder="NOME SOBRENOME"
                      onChange={(e) => setNomeCartao(e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="field-row">
                    {/* Validade */}
                    <div className="field">
                      <label>Validade</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        value={validadeCartao}
                        placeholder="MM/AA"
                        maxLength={5}
                        onChange={(e) => setValidadeCartao(formatarValidade(e.target.value))}
                      />
                    </div>
                    {/* CVV — type text, NÃO password */}
                    <div className="field">
                      <label>CVV</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        value={cvvCartao}
                        placeholder="123"
                        maxLength={4}
                        onChange={(e) => setCvvCartao(e.target.value.replace(/\D/g, "").slice(0,4))}
                      />
                    </div>
                    {/* Parcelas apenas no crédito */}
                    {formaPagamento === "CARTAO_CREDITO" && (
                      <div className="field">
                        <label>Parcelas</label>
                        <select value={parcelas} onChange={(e) => setParcelas(e.target.value)}>
                          {[1,2,3,4,5,6,10,12].map((n) => (
                            <option key={n} value={n}>
                              {n}x de R$ {(total / n).toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Boleto */}
              {formaPagamento === "BOLETO" && (
                <div className="boleto-box">
                  <p style={{fontSize:"2rem"}}>📄</p>
                  <p>O boleto será gerado após confirmar o pedido.</p>
                  <p style={{fontSize:"0.85rem", color:"#94a3b8"}}>
                    Vencimento em 3 dias úteis. Confirmação em até 2 dias úteis após o pagamento.
                  </p>
                </div>
              )}

              <div style={{display:"flex", gap:12, marginTop:20}}>
                <button className="btn-outline" onClick={() => setEtapa(1)}>← Voltar</button>
                <button className="btn-primary" onClick={finalizar} disabled={loading}>
                  {loading ? "Processando..." : "Confirmar Pedido"}
                </button>
              </div>
            </div>
          )}

          {/* ── ETAPA 3 — Confirmação ── */}
          {etapa === 3 && pedidoCriado && (
            <div className="card confirmacao">
              <div className="confirmacao-icone">✅</div>
              <h2>Pedido Realizado!</h2>
              <p>Seu pedido <strong>#{pedidoCriado.id}</strong> foi registrado com sucesso.</p>
              <div className="confirmacao-info">
                <div>
                  <span>Pagamento</span>
                  <strong>{formaPagamento.replace(/_/g," ")}</strong>
                </div>
                <div>
                  <span>Total</span>
                  <strong>R$ {pedidoCriado.total.toFixed(2)}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>PENDENTE</strong>
                </div>
              </div>
              <div style={{display:"flex", gap:12, marginTop:24}}>
                <button className="btn-outline" onClick={() => navigate("/pedidos")}>Ver Pedidos</button>
                <button className="btn-primary" onClick={() => navigate("/catalogo")}>Continuar Comprando</button>
              </div>
            </div>
          )}
        </div>

        {/* Resumo lateral */}
        {etapa < 3 && (
          <div className="card checkout-resumo">
            <h3>Resumo</h3>
            {itens.map((i) => (
              <div key={i.id} className="resumo-item">
                <span>{i.nome} ×{i.quantidade}</span>
                <span>R$ {(i.preco * i.quantidade).toFixed(2)}</span>
              </div>
            ))}
            <div className="resumo-total-line">
              <span>Total</span>
              <strong>R$ {total.toFixed(2)}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
