// src/pages/Admin.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import "./Admin.css";

const ABAS   = ["Resumo","Usuários","Lojas","Produtos","Pedidos"];
const ROLES  = ["ADMINISTRADOR","LOJISTA","FORNECEDOR","EMPREENDEDOR","CLIENTE"];
const STATUS = ["PENDENTE","CONFIRMADO","EM_PREPARO","ENVIADO","ENTREGUE","CANCELADO","DEVOLVIDO"];

const ENDPOINTS = {
  "Resumo":   "/admin/resumo",
  "Usuários": "/admin/usuarios",
  "Lojas":    "/admin/lojas",
  "Produtos": "/admin/produtos",
  "Pedidos":  "/admin/pedidos",
};

function BadgeStatus({ s }) {
  const cor = { PENDENTE:"badge-orange", CONFIRMADO:"badge-blue",
                ENTREGUE:"badge-green",  CANCELADO:"badge-red", DEVOLVIDO:"badge-red" }[s] || "badge-blue";
  return <span className={`badge ${cor}`}>{s}</span>;
}

export default function Admin() {
  const { addToast } = useToast();
  const navigate     = useNavigate();
  const [aba,    setAba]    = useState("Resumo");
  const [dados,  setDados]  = useState(null);
  const [erro,   setErro]   = useState(null);
  const [novaLoja, setNovaLoja] = useState({ nome:"", descricao:"", cnpj:"", endereco:"", usuarioId:"" });
  const [showFormLoja, setShowFormLoja] = useState(false);
  const [editandoLojaId, setEditandoLojaId] = useState(null);
  const [usuariosLista, setUsuariosLista] = useState([]);

  // Carrega lista de usuários para o seletor do formulário de loja
  useEffect(() => {
    api.get("/admin/usuarios").then((r) => setUsuariosLista(r.data)).catch(() => {});
  }, []);

  const carregar = useCallback(async (abaAtual) => {
    setErro(null);
    try {
      const { data } = await api.get(ENDPOINTS[abaAtual]);
      setDados({ aba: abaAtual, valor: data });
    } catch (e) {
      const msg = e.response?.data?.erro || "Erro ao carregar dados.";
      setErro(msg);
      setDados(null);
      addToast(msg, "erro");
    }
  }, [addToast]);

  // Único efeito: ao trocar de aba, limpa e recarrega
  useEffect(() => {
    setDados(null);
    carregar(aba);
  }, [aba, carregar]);

  // Só renderiza se os dados carregados correspondem à aba atual
  const dadosAtuais = dados && dados.aba === aba ? dados.valor : null;

  // ── Ações ──────────────────────────────────────────────────────
  async function acao(fn, mensagem, abaRecarregar) {
    try {
      await fn();
      addToast(mensagem);
      carregar(abaRecarregar);
    } catch (e) {
      addToast(e.response?.data?.erro || "Erro na operação.", "erro");
    }
  }

  const toggleUsuario    = (id, ativo)   => acao(() => api.put(`/admin/usuarios/${id}`, { ativo: !ativo }),         ativo ? "Usuário desativado." : "Usuário ativado.",     "Usuários");
  const alterarRole      = (id, role)    => acao(() => api.put(`/admin/usuarios/${id}`, { role }),                   "Perfil atualizado.",                                   "Usuários");
  const toggleLoja       = (id, ativa)   => acao(() => api.put(`/admin/lojas/${id}`,    { ativa: !ativa }),          ativa ? "Loja desativada." : "Loja ativada.",            "Lojas");
  const criarLoja = () => {
    if (editandoLojaId) {
      acao(() => api.put(`/admin/lojas/${editandoLojaId}`, novaLoja), "Loja atualizada!", "Lojas");
    } else {
      acao(() => api.post("/lojas", novaLoja), "Loja criada com sucesso!", "Lojas");
    }
    setNovaLoja({ nome:"", descricao:"", cnpj:"", endereco:"", usuarioId:"" });
    setShowFormLoja(false);
    setEditandoLojaId(null);
  };
  const toggleProduto    = (id, ativo)   => acao(() => api.put(`/produtos/${id}`,       { ativo: !ativo }),          ativo ? "Produto desativado." : "Produto ativado.",      "Produtos");
  const alterarStatusPed = (id, status)  => acao(() => api.patch(`/pedidos/${id}/status`, { status }),              "Status atualizado.",                                   "Pedidos");

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div>
      <h1 className="page-title">🔧 Painel Administrativo</h1>

      {/* Abas */}
      <div className="admin-abas">
        {ABAS.map((a) => (
          <button key={a}
            className={`admin-aba ${aba === a ? "admin-aba--ativa" : ""}`}
            onClick={() => setAba(a)}>
            {a}
          </button>
        ))}
      </div>

      {/* Estados de carregamento/erro */}
      {!dadosAtuais && !erro && <p style={{color:"#94a3b8", padding:"20px 0"}}>Carregando...</p>}
      {erro   && <p style={{color:"#dc2626", padding:"20px 0"}}>❌ {erro}</p>}

      {dadosAtuais && (
        <>
          {/* ── RESUMO ─────────────────────────────────────────── */}
          {aba === "Resumo" && (
            <div>
              <div className="admin-cards">
                {[
                  { label:"Usuários",       valor: dadosAtuais.totalUsuarios, cor:"#2563eb" },
                  { label:"Produtos Ativos",valor: dadosAtuais.totalProdutos, cor:"#16a34a" },
                  { label:"Total Pedidos",  valor: dadosAtuais.totalPedidos,  cor:"#7c3aed" },
                  { label:"Lojas Ativas",   valor: dadosAtuais.totalLojas,    cor:"#ea580c" },
                ].map((c) => (
                  <div key={c.label} className="admin-card card">
                    <p className="admin-label">{c.label}</p>
                    <p className="admin-valor" style={{color: c.cor}}>{c.valor}</p>
                  </div>
                ))}
                <div className="admin-card card">
                  <p className="admin-label">Receita (Entregues)</p>
                  <p className="admin-valor" style={{color:"#16a34a", fontSize:"1.4rem"}}>
                    R$ {dadosAtuais.receitaTotal.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="card" style={{marginTop:24}}>
                <h3 style={{marginBottom:16}}>Pedidos por Status</h3>
                <div className="status-grid">
                  {dadosAtuais.pedidosPorStatus.map((p) => (
                    <div key={p.status} className="status-item">
                      <BadgeStatus s={p.status} />
                      <strong>{p._count.status}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── USUÁRIOS ───────────────────────────────────────── */}
          {aba === "Usuários" && Array.isArray(dadosAtuais) && (
            <div className="card overflow-x">
              <p className="admin-count">{dadosAtuais.length} usuário(s) encontrado(s)</p>
              <table className="admin-tabela">
                <thead>
                  <tr>
                    <th>#</th><th>Nome</th><th>E-mail</th>
                    <th>Perfil</th><th>Status</th><th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {dadosAtuais.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.nome}</td>
                      <td style={{fontSize:"0.83rem"}}>{u.email}</td>
                      <td>
                        <select
                          value={u.role}
                          onChange={(e) => alterarRole(u.id, e.target.value)}
                          style={{padding:"4px 8px", fontSize:"0.82rem", borderRadius:6}}>
                          {ROLES.map((r) => <option key={r}>{r}</option>)}
                        </select>
                      </td>
                      <td>
                        <span className={`badge ${u.ativo ? "badge-green" : "badge-red"}`}>
                          {u.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`btn-sm ${u.ativo ? "btn-danger" : "btn-success"}`}
                          onClick={() => toggleUsuario(u.id, u.ativo)}>
                          {u.ativo ? "Desativar" : "Ativar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── LOJAS ──────────────────────────────────────────── */}
          {aba === "Lojas" && Array.isArray(dadosAtuais) && (
            <div className="card overflow-x">
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14}}>
                <p className="admin-count">{dadosAtuais.length} loja(s) encontrada(s)</p>
                <button className="btn-primary btn-sm" onClick={() => { setShowFormLoja(!showFormLoja); setEditandoLojaId(null); setNovaLoja({ nome:"", descricao:"", cnpj:"", endereco:"", usuarioId:"" }); }}>
                  {showFormLoja ? "✕ Cancelar" : "➕ Nova Loja"}
                </button>
              </div>

              {showFormLoja && (
                <div style={{background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8, padding:20, marginBottom:20}}>
                  <h3 style={{marginBottom:16, fontSize:"0.95rem"}}>{editandoLojaId ? "✏️ Editar Loja" : "Cadastrar Nova Loja"}</h3>
                  <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
                    <div>
                      <label style={{fontSize:"0.82rem", display:"block", marginBottom:4}}>Nome da Loja *</label>
                      <input value={novaLoja.nome} onChange={(e) => setNovaLoja({...novaLoja, nome: e.target.value})} placeholder="Ex: Mercado Central" />
                    </div>
                    <div>
                      <label style={{fontSize:"0.82rem", display:"block", marginBottom:4}}>CNPJ</label>
                      <input value={novaLoja.cnpj} onChange={(e) => setNovaLoja({...novaLoja, cnpj: e.target.value})} placeholder="00.000.000/0001-00" />
                    </div>
                    <div style={{gridColumn:"1/-1"}}>
                      <label style={{fontSize:"0.82rem", display:"block", marginBottom:4}}>Descrição</label>
                      <input value={novaLoja.descricao} onChange={(e) => setNovaLoja({...novaLoja, descricao: e.target.value})} placeholder="Breve descrição da loja" />
                    </div>
                    <div style={{gridColumn:"1/-1"}}>
                      <label style={{fontSize:"0.82rem", display:"block", marginBottom:4}}>Endereço</label>
                      <input value={novaLoja.endereco} onChange={(e) => setNovaLoja({...novaLoja, endereco: e.target.value})} placeholder="Rua, número, bairro" />
                    </div>
                    <div>
                      <label style={{fontSize:"0.82rem", display:"block", marginBottom:4}}>Proprietário da Loja</label>
                      <select value={novaLoja.usuarioId} onChange={(e) => setNovaLoja({...novaLoja, usuarioId: e.target.value})}>
                        <option value="">— Selecione um usuário —</option>
                        {usuariosLista.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.nome} ({u.email}) — {u.role}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button className="btn-primary" style={{marginTop:16}} onClick={criarLoja} disabled={!novaLoja.nome}>
                    {editandoLojaId ? "Salvar Alterações" : "Cadastrar Loja"}
                  </button>
                </div>
              )}
              <table className="admin-tabela">
                <thead>
                  <tr><th>#</th><th>Nome</th><th>Proprietário</th><th>Produtos</th><th>Status</th><th>Ações</th></tr>
                </thead>
                <tbody>
                  {dadosAtuais.map((l) => (
                    <tr key={l.id}>
                      <td>{l.id}</td>
                      <td>{l.nome}</td>
                      <td style={{fontSize:"0.83rem"}}>{l.usuario?.nome}</td>
                      <td>{l._count?.produtos ?? 0}</td>
                      <td>
                        <span className={`badge ${l.ativa ? "badge-green" : "badge-red"}`}>
                          {l.ativa ? "Ativa" : "Inativa"}
                        </span>
                      </td>
                      <td>
                        <div style={{display:"flex", gap:8}}>
                          <button
                            className="btn-sm btn-outline"
                            onClick={() => {
                              setNovaLoja({ nome:l.nome, descricao:l.descricao||"", cnpj:l.cnpj||"", endereco:l.endereco||"", usuarioId:l.usuarioId });
                              setEditandoLojaId(l.id);
                              setShowFormLoja(true);
                              window.scrollTo({ top: 0, behavior:"smooth" });
                            }}>
                            ✏️ Editar
                          </button>
                          <button
                            className={`btn-sm ${l.ativa ? "btn-danger" : "btn-success"}`}
                            onClick={() => toggleLoja(l.id, l.ativa)}>
                            {l.ativa ? "Desativar" : "Ativar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── PRODUTOS ───────────────────────────────────────── */}
          {aba === "Produtos" && Array.isArray(dadosAtuais) && (
            <div className="card overflow-x">
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14}}>
                <p className="admin-count">{dadosAtuais.length} produto(s)</p>
                <button className="btn-primary btn-sm" onClick={() => navigate("/produtos/novo")}>
                  ➕ Novo Produto
                </button>
              </div>
              <table className="admin-tabela">
                <thead>
                  <tr>
                    <th>#</th><th>Nome</th><th>Categoria</th>
                    <th>Preço</th><th>Estoque</th><th>Tipo</th><th>Status</th><th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {dadosAtuais.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.nome}</td>
                      <td style={{fontSize:"0.82rem"}}>{p.categoria || "—"}</td>
                      <td>R$ {Number(p.preco).toFixed(2)}</td>
                      <td style={{color: p.estoque === 0 ? "#dc2626" : "#16a34a", fontWeight:700}}>
                        {p.estoque}
                      </td>
                      <td>
                        <span className="badge badge-blue" style={{fontSize:"0.72rem"}}>{p.tipo}</span>
                      </td>
                      <td>
                        <span className={`badge ${p.ativo ? "badge-green" : "badge-red"}`}>
                          {p.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td>
                        <div style={{display:"flex", gap:6}}>
                          <button className="btn-outline btn-sm"
                            onClick={() => navigate(`/produtos/${p.id}/editar`)}>
                            ✏️
                          </button>
                          <button
                            className={`btn-sm ${p.ativo ? "btn-danger" : "btn-success"}`}
                            onClick={() => toggleProduto(p.id, p.ativo)}>
                            {p.ativo ? "Desativar" : "Ativar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── PEDIDOS ────────────────────────────────────────── */}
          {aba === "Pedidos" && Array.isArray(dadosAtuais) && (
            <div className="card overflow-x">
              <p className="admin-count">{dadosAtuais.length} pedido(s)</p>
              <table className="admin-tabela">
                <thead>
                  <tr>
                    <th>#</th><th>Cliente</th><th>Total</th>
                    <th>Pagamento</th><th>Status</th><th>Data</th><th>Alterar Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dadosAtuais.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td style={{fontSize:"0.83rem"}}>{p.cliente?.nome}</td>
                      <td>R$ {Number(p.total).toFixed(2)}</td>
                      <td style={{fontSize:"0.82rem"}}>
                        {(p.formaPagamento || "—").replace(/_/g," ")}
                      </td>
                      <td><BadgeStatus s={p.status} /></td>
                      <td style={{fontSize:"0.82rem"}}>
                        {new Date(p.criadoEm).toLocaleDateString("pt-BR")}
                      </td>
                      <td>
                        <select
                          value={p.status}
                          onChange={(e) => alterarStatusPed(p.id, e.target.value)}
                          style={{padding:"4px 8px", fontSize:"0.82rem", borderRadius:6}}>
                          {STATUS.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
