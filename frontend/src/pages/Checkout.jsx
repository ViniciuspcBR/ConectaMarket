// src/pages/Checkout.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCarrinho } from "../context/CarrinhoContext";
import { useToast } from "../context/ToastContext";
import { pedidoService, carteiraService } from "../services/api";
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
  const [errosEndereco, setErrosEndereco] = useState({});

  // Campos do cartão
  const [numeroCartao,   setNumeroCartao]   = useState("");
  const [nomeCartao,     setNomeCartao]     = useState("");
  const [validadeCartao, setValidadeCartao] = useState("");
  const [cvvCartao,      setCvvCartao]      = useState("");
  const [parcelas,       setParcelas]       = useState("1");
  const [errosCartao,    setErrosCartao]    = useState({});

  // Cashback da carteira
  const [saldoCarteira,  setSaldoCarteira]  = useState(0);
  const [usarCashback,   setUsarCashback]   = useState(false);
  const [valorCashback,  setValorCashback]  = useState(0);

  useEffect(() => {
    carteiraService.minha().then((r) => {
      setSaldoCarteira(r.data.saldo || 0);
    }).catch(() => {});
  }, []);

  if (itens.length === 0 && !pedidoCriado) {
    navigate("/carrinho"); return null;
  }

  const descontoCashback = usarCashback ? Math.min(saldoCarteira, total, valorCashback || saldoCarteira) : 0;
  const totalComDesconto = Math.max(0, total - descontoCashback);

  function formatarNumeroCartao(valor) {
    const numeros = valor.replace(/\D/g, "").slice(0, 16);
    return numeros.replace(/(.{4})/g, "$1 ").trim();
  }

  function formatarValidade(valor) {
    const numeros = valor.replace(/\D/g, "").slice(0, 4);
    if (numeros.length >= 3) return numeros.slice(0,2) + "/" + numeros.slice(2);
    return numeros;
  }

  function validarEndereco() {
    const erros = {};
    if (!endereco.rua.trim())    erros.rua    = "Rua obrigatória";
    if (!endereco.numero.trim()) erros.numero = "Número obrigatório";
    if (!endereco.bairro.trim()) erros.bairro = "Bairro obrigatório";
    if (!endereco.cep.trim())    erros.cep    = "CEP obrigatório";
    setErrosEndereco(erros);
    return Object.keys(erros).length === 0;
  }

  function validarCartao() {
    const usaCartao = formaPagamento === "CARTAO_CREDITO" || formaPagamento === "CARTAO_DEBITO";
    if (!usaCartao) return true;
    const erros = {};
    const numLimpo = numeroCartao.replace(/\s/g, "");
    if (numLimpo.length < 16)        erros.numero  = "Número do cartão inválido (16 dígitos)";
    if (!nomeCartao.trim())          erros.nome    = "Nome no cartão obrigatório";
    if (validadeCartao.length < 5)   erros.validade = "Validade inválida (MM/AA)";
    if (cvvCartao.length < 3)        erros.cvv     = "CVV inválido (3-4 dígitos)";
    setErrosCartao(erros);
    return Object.keys(erros).length === 0;
  }

  function avancarParaPagamento() {
    if (validarEndereco()) setEtapa(2);
  }

  async function finalizar() {
    if (!validarCartao()) return;
    setLoading(true);
    try {
      const endStr = `${endereco.rua}, ${endereco.numero} — ${endereco.bairro}, ${endereco.cidade}/${endereco.estado} CEP ${endereco.cep}`;
      const { data } = await pedidoService.criar({
        observacao:      `Entrega: ${endStr}`,
        enderecoEntrega: endStr,
        formaPagamento,
        usarCashback:    descontoCashback > 0 ? descontoCashback : 0,
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
                      className={errosEndereco.cep ? "input-erro" : ""}
                      onChange={(e) => { setEndereco({...endereco, cep: e.target.value}); setErrosEndereco((prev) => ({...prev, cep: ""})); }}
                    />
                    {errosEndereco.cep && <span className="campo-erro">{errosEndereco.cep}</span>}
                  </div>
                </div>
                <div className="field-row">
                  <div className="field" style={{flex:3}}>
                    <label>Rua / Avenida</label>
                    <input
                      autoComplete="street-address"
                      value={endereco.rua}
                      placeholder="Rua das Flores"
                      className={errosEndereco.rua ? "input-erro" : ""}
                      onChange={(e) => { setEndereco({...endereco, rua: e.target.value}); setErrosEndereco((prev) => ({...prev, rua: ""})); }}
                    />
                    {errosEndereco.rua && <span className="campo-erro">{errosEndereco.rua}</span>}
                  </div>
                  <div className="field" style={{flex:1}}>
                    <label>Número</label>
                    <input
                      autoComplete="off"
                      value={endereco.numero}
                      placeholder="123"
                      className={errosEndereco.numero ? "input-erro" : ""}
                      onChange={(e) => { setEndereco({...endereco, numero: e.target.value}); setErrosEndereco((prev) => ({...prev, numero: ""})); }}
                    />
                    {errosEndereco.numero && <span className="campo-erro">{errosEndereco.numero}</span>}
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Bairro</label>
                    <input
                      autoComplete="off"
                      value={endereco.bairro}
                      placeholder="Cristo Redentor"
                      className={errosEndereco.bairro ? "input-erro" : ""}
                      onChange={(e) => { setEndereco({...endereco, bairro: e.target.value}); setErrosEndereco((prev) => ({...prev, bairro: ""})); }}
                    />
                    {errosEndereco.bairro && <span className="campo-erro">{errosEndereco.bairro}</span>}
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
                  onClick={avancarParaPagamento}
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

              {/* Cashback disponível */}
              {saldoCarteira > 0 && (
                <div style={{
                  background:"#f0fdf4", border:"1px solid #86efac",
                  borderRadius:8, padding:"12px 16px", marginBottom:16
                }}>
                  <label style={{display:"flex", alignItems:"center", gap:10, cursor:"pointer"}}>
                    <input
                      type="checkbox"
                      checked={usarCashback}
                      onChange={(e) => setUsarCashback(e.target.checked)}
                      style={{width:18, height:18}}
                    />
                    <span style={{fontWeight:600, color:"#15803d"}}>
                      💰 Usar saldo da Carteira (R$ {saldoCarteira.toFixed(2)} disponível)
                    </span>
                  </label>
                  {usarCashback && (
                    <div style={{marginTop:10}}>
                      <label style={{fontSize:"0.85rem", color:"#166534", display:"block", marginBottom:4}}>
                        Quanto deseja usar? (máximo R$ {Math.min(saldoCarteira, total).toFixed(2)})
                      </label>
                      <input
                        type="number"
                        min="0.01"
                        max={Math.min(saldoCarteira, total)}
                        step="0.01"
                        value={valorCashback}
                        onChange={(e) => setValorCashback(Number(e.target.value))}
                        placeholder={`Ex: ${Math.min(saldoCarteira, total).toFixed(2)}`}
                        style={{width:140}}
                      />
                      <p style={{fontSize:"0.82rem", color:"#166534", marginTop:6}}>
                        Desconto aplicado: <strong>R$ {descontoCashback.toFixed(2)}</strong>
                        {" "}→ Total a pagar: <strong>R$ {totalComDesconto.toFixed(2)}</strong>
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="formas-grid">
                {FORMAS.map((f) => (
                  <button
                    key={f.valor}
                    className={`forma-btn ${formaPagamento === f.valor ? "forma-btn--ativo" : ""}`}
                    onClick={() => { setFormaPagamento(f.valor); setErrosCartao({}); }}
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
                  <div className="field">
                    <label>Número do Cartão</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      value={numeroCartao}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      className={errosCartao.numero ? "input-erro" : ""}
                      onChange={(e) => { setNumeroCartao(formatarNumeroCartao(e.target.value)); setErrosCartao((p) => ({...p, numero:""})); }}
                    />
                    {errosCartao.numero && <span className="campo-erro">{errosCartao.numero}</span>}
                  </div>
                  <div className="field">
                    <label>Nome impresso no Cartão</label>
                    <input
                      type="text"
                      autoComplete="cc-name"
                      value={nomeCartao}
                      placeholder="NOME SOBRENOME"
                      className={errosCartao.nome ? "input-erro" : ""}
                      onChange={(e) => { setNomeCartao(e.target.value.toUpperCase()); setErrosCartao((p) => ({...p, nome:""})); }}
                    />
                    {errosCartao.nome && <span className="campo-erro">{errosCartao.nome}</span>}
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label>Validade</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        value={validadeCartao}
                        placeholder="MM/AA"
                        maxLength={5}
                        className={errosCartao.validade ? "input-erro" : ""}
                        onChange={(e) => { setValidadeCartao(formatarValidade(e.target.value)); setErrosCartao((p) => ({...p, validade:""})); }}
                      />
                      {errosCartao.validade && <span className="campo-erro">{errosCartao.validade}</span>}
                    </div>
                    <div className="field">
                      <label>CVV</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        value={cvvCartao}
                        placeholder="123"
                        maxLength={4}
                        className={errosCartao.cvv ? "input-erro" : ""}
                        onChange={(e) => { setCvvCartao(e.target.value.replace(/\D/g, "").slice(0,4)); setErrosCartao((p) => ({...p, cvv:""})); }}
                      />
                      {errosCartao.cvv && <span className="campo-erro">{errosCartao.cvv}</span>}
                    </div>
                    {formaPagamento === "CARTAO_CREDITO" && (
                      <div className="field">
                        <label>Parcelas</label>
                        <select value={parcelas} onChange={(e) => setParcelas(e.target.value)}>
                          {[1,2,3,4,5,6,10,12].map((n) => (
                            <option key={n} value={n}>
                              {n}x de R$ {(totalComDesconto / n).toFixed(2)}
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
                {pedidoCriado.usoCashback > 0 && (
                  <div>
                    <span>Cashback usado</span>
                    <strong style={{color:"#16a34a"}}>− R$ {pedidoCriado.usoCashback.toFixed(2)}</strong>
                  </div>
                )}
                <div>
                  <span>Total pago</span>
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
              <span>Subtotal</span>
              <strong>R$ {total.toFixed(2)}</strong>
            </div>
            {descontoCashback > 0 && (
              <div className="resumo-total-line" style={{color:"#16a34a"}}>
                <span>Cashback</span>
                <strong>− R$ {descontoCashback.toFixed(2)}</strong>
              </div>
            )}
            <div className="resumo-total-line" style={{borderTop:"2px solid #e2e8f0", paddingTop:8, marginTop:4}}>
              <span><strong>Total</strong></span>
              <strong style={{fontSize:"1.1rem"}}>R$ {totalComDesconto.toFixed(2)}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
