// src/pages/Campanhas.jsx
import { useState, useEffect } from "react";
import { campanhaService, produtoService } from "../services/api";
import { useToast } from "../context/ToastContext";
import "./Campanhas.css";

const FORM_VAZIO = {
  nome:"", descricao:"", tipo:"DESCONTO", valor:"",
  inicio:"", fim:"", produtoIds:[], brindeProdutoId:"",
};

const EXPLICACAO = {
  DESCONTO: "O valor percentual é descontado automaticamente do preço no momento da compra.",
  CASHBACK: "O cliente recebe de volta o percentual definido em pontos (R$) na Carteira, liberados quando o pedido é marcado como ENTREGUE. O preço pago não muda.",
  BRINDE:   "O cliente recebe um produto/serviço do seu catálogo como brinde quando o pedido é marcado como ENTREGUE. Escolha abaixo qual produto será o brinde.",
};

export default function Campanhas() {
  const { addToast } = useToast();
  const [campanhas,   setCampanhas]   = useState([]);
  const [produtos,    setProdutos]    = useState([]);
  const [form,        setForm]        = useState(FORM_VAZIO);
  const [modoForm,    setModoForm]    = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [buscaProd,   setBuscaProd]   = useState("");
  const [buscaBrinde, setBuscaBrinde] = useState("");
  const [erro,        setErro]        = useState("");

  async function carregar() {
    try {
      const [rc, rp] = await Promise.all([
        campanhaService.listarMinhas(),
        produtoService.listar({ meus: true }),
      ]);
      setCampanhas(rc.data);
      setProdutos(rp.data);
    } catch (err) {
      const msg = err.response?.data?.erro || "Erro ao carregar campanhas.";
      setErro(msg);
      addToast(msg, "erro");
    }
  }

  useEffect(() => { carregar(); }, []);

  function abrirNovo() {
    setForm(FORM_VAZIO);
    setModoForm("novo");
    setBuscaProd("");
    setBuscaBrinde("");
  }

  function abrirEditar(c) {
    setForm({
      nome:       c.nome,
      descricao:  c.descricao || "",
      tipo:       c.tipo,
      valor:      c.valor,
      inicio:     c.inicio?.slice(0,10) || "",
      fim:        c.fim?.slice(0,10)    || "",
      produtoIds: c.produtos?.map((p) => p.produtoId) || [],
      brindeProdutoId: c.brindeProduto?.id || "",
    });
    setModoForm(c.id);
    setBuscaProd("");
    setBuscaBrinde("");
  }

  function toggleProduto(id) {
    setForm((f) => ({
      ...f,
      produtoIds: f.produtoIds.includes(id)
        ? f.produtoIds.filter((x) => x !== id)
        : [...f.produtoIds, id],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.produtoIds.length === 0) return addToast("Selecione ao menos um produto.", "erro");
    if (form.tipo === "BRINDE" && !form.brindeProdutoId) {
      return addToast("Selecione qual produto será dado de brinde.", "erro");
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        valor: form.tipo === "BRINDE" ? 0 : Number(form.valor),
        brindeProdutoId: form.tipo === "BRINDE" ? form.brindeProdutoId : null,
      };
      if (modoForm === "novo") {
        await campanhaService.criar(payload);
        addToast("Campanha criada com sucesso!");
      } else {
        await campanhaService.atualizar(modoForm, payload);
        addToast("Campanha atualizada com sucesso!");
      }
      setModoForm(null);
      carregar();
    } catch {
      addToast("Erro ao salvar campanha.", "erro");
    } finally {
      setLoading(false);
    }
  }

  async function handleDesativar(id) {
    try {
      await campanhaService.atualizar(id, { ativa: false });
      addToast("Campanha desativada.");
      carregar();
    } catch { addToast("Erro ao desativar.", "erro"); }
  }

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(buscaProd.toLowerCase())
  );

  const produtosBrindeFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(buscaBrinde.toLowerCase())
  );

  return (
    <div>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24}}>
        <h1 className="page-title" style={{margin:0}}>🎯 Campanhas</h1>
        {modoForm === null && (
          <button className="btn-primary" onClick={abrirNovo}>➕ Nova Campanha</button>
        )}
      </div>

      {/* ── Informativo sobre como funcionam ── */}
      <div style={{background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:8, padding:"12px 16px", marginBottom:20, fontSize:"0.88rem", color:"#1e40af"}}>
        <strong>ℹ️ Como funcionam as campanhas?</strong>
        <ul style={{margin:"8px 0 0 18px", padding:0}}>
          <li><strong>Desconto:</strong> {EXPLICACAO.DESCONTO}</li>
          <li><strong>Cashback:</strong> {EXPLICACAO.CASHBACK}</li>
          <li><strong>Brinde:</strong> {EXPLICACAO.BRINDE}</li>
        </ul>
      </div>

      {/* ── Formulário (novo ou editar) ── */}
      {modoForm !== null && (
        <div className="card" style={{marginBottom:28}}>
          <h2 style={{marginBottom:16, fontSize:"1.05rem"}}>
            {modoForm === "novo" ? "Nova Campanha" : "Editar Campanha"}
          </h2>
          <form onSubmit={handleSubmit} className="campanha-form">
            <div className="field">
              <label>Nome da campanha</label>
              <input value={form.nome} onChange={(e) => setForm({...form, nome:e.target.value})} required />
            </div>
            <div className="field">
              <label>Descrição</label>
              <textarea rows={2} value={form.descricao}
                onChange={(e) => setForm({...form, descricao:e.target.value})} />
            </div>
            <div className="campanha-row">
              <div className="field">
                <label>Tipo</label>
                <select value={form.tipo} onChange={(e) => setForm({...form, tipo:e.target.value})}>
                  <option value="DESCONTO">Desconto (%)</option>
                  <option value="CASHBACK">Cashback (%)</option>
                  <option value="BRINDE">Brinde (produto)</option>
                </select>
              </div>

              {form.tipo !== "BRINDE" && (
                <div className="field">
                  <label>Valor (%)</label>
                  <input type="number" min="0" max="100" step="0.1" value={form.valor}
                    onChange={(e) => setForm({...form, valor:e.target.value})} required />
                </div>
              )}

              <div className="field">
                <label>Início</label>
                <input type="date" value={form.inicio}
                  onChange={(e) => setForm({...form, inicio:e.target.value})} required />
              </div>
              <div className="field">
                <label>Fim</label>
                <input type="date" value={form.fim}
                  onChange={(e) => setForm({...form, fim:e.target.value})} required />
              </div>
            </div>

            {/* Explicação contextual do tipo escolhido */}
            <div className="campanha-tipo-info">
              {EXPLICACAO[form.tipo]}
            </div>

            {/* Seletor de produto-brinde — só aparece para tipo BRINDE */}
            {form.tipo === "BRINDE" && (
              <div className="field">
                <label>Qual produto será dado de brinde?</label>
                <input
                  placeholder="🔍 Buscar produto para brinde..."
                  value={buscaBrinde}
                  onChange={(e) => setBuscaBrinde(e.target.value)}
                  style={{marginBottom:8}}
                />
                <div className="campanha-produtos">
                  {produtosBrindeFiltrados.length === 0 && (
                    <p style={{color:"#94a3b8", fontSize:"0.85rem"}}>Nenhum produto encontrado.</p>
                  )}
                  {produtosBrindeFiltrados.map((p) => (
                    <label key={p.id}
                      className={`prod-check ${String(form.brindeProdutoId) === String(p.id) ? "prod-check--ativo" : ""}`}>
                      <input type="radio" name="brindeProduto" checked={String(form.brindeProdutoId) === String(p.id)}
                        onChange={() => setForm({...form, brindeProdutoId: p.id})} />
                      <span>{p.nome}</span>
                      <span style={{fontSize:"0.75rem", color:"#94a3b8", marginLeft:"auto"}}>
                        {p.categoria}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="field">
              <label>
                Produtos que participam da campanha
                <span style={{color:"#64748b", fontWeight:400, marginLeft:8}}>
                  ({form.produtoIds.length} selecionado{form.produtoIds.length !== 1 ? "s" : ""})
                </span>
              </label>
              {form.tipo === "BRINDE" && (
                <p style={{fontSize:"0.78rem", color:"#94a3b8", marginTop:-2, marginBottom:6}}>
                  Ao comprar e receber um destes produtos, o cliente ganha o brinde selecionado acima.
                </p>
              )}
              {/* Busca de produtos */}
              <input
                placeholder="🔍 Buscar produto..."
                value={buscaProd}
                onChange={(e) => setBuscaProd(e.target.value)}
                style={{marginBottom:8}}
              />
              <div className="campanha-produtos">
                {produtosFiltrados.length === 0 && (
                  <p style={{color:"#94a3b8", fontSize:"0.85rem"}}>
                    {buscaProd ? "Nenhum produto encontrado." : "Nenhum produto cadastrado."}
                  </p>
                )}
                {produtosFiltrados.map((p) => (
                  <label key={p.id}
                    className={`prod-check ${form.produtoIds.includes(p.id) ? "prod-check--ativo" : ""}`}>
                    <input type="checkbox" checked={form.produtoIds.includes(p.id)}
                      onChange={() => toggleProduto(p.id)} />
                    <span>{p.nome}</span>
                    <span style={{fontSize:"0.75rem", color:"#94a3b8", marginLeft:"auto"}}>
                      R$ {Number(p.preco).toFixed(2)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{display:"flex", gap:12}}>
              <button type="button" className="btn-outline" onClick={() => setModoForm(null)}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Salvando..." : modoForm === "novo" ? "Criar Campanha" : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Lista de campanhas ── */}
      {campanhas.length === 0 ? (
        <div className="card" style={{textAlign:"center", color:"#94a3b8", padding:48}}>
          <p style={{fontSize:"2.5rem"}}>🎯</p>
          <p>Nenhuma campanha ativa no momento.</p>
        </div>
      ) : (
        <div className="campanha-lista">
          {campanhas.map((c) => (
            <div key={c.id} className="campanha-card card">
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
                <div>
                  <h3>{c.nome}</h3>
                  <p style={{color:"#64748b", fontSize:"0.88rem", marginTop:4}}>{c.descricao}</p>
                </div>
                <span className="badge badge-green">{c.tipo}</span>
              </div>
              <div className="campanha-info">
                {c.tipo === "BRINDE"
                  ? <span>🎁 Brinde: <strong>{c.brindeProduto?.nome || "—"}</strong></span>
                  : <span>💰 {c.tipo === "CASHBACK" ? "Cashback" : "Desconto"} de {c.valor}%</span>}
                <span>📅 {new Date(c.inicio).toLocaleDateString("pt-BR")} → {new Date(c.fim).toLocaleDateString("pt-BR")}</span>
                <span>🛍️ {c.produtos?.length || 0} produto(s) participantes</span>
                <span className={`badge ${c.ativa ? "badge-green" : "badge-red"}`}>{c.ativa ? "Ativa" : "Inativa"}</span>
              </div>
              <div style={{display:"flex", gap:10, marginTop:12}}>
                <button className="btn-outline btn-sm" onClick={() => abrirEditar(c)}>
                  ✏️ Editar
                </button>
                {c.ativa && (
                  <button className="btn-danger btn-sm" onClick={() => handleDesativar(c.id)}>
                    Desativar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
