// src/pages/CadastroProdutosLote.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { produtoService } from "../services/api";
import { useToast } from "../context/ToastContext";
import "./CadastroProdutosLote.css";

const CATEGORIAS = [
  "Saúde e Beleza","Alimentos","Agropecuária",
  "Vestuário","Construção Civil","Eletrônica","Cultura","Serviços",
];

const LINHA_VAZIA = () => ({
  nome:"", descricao:"", preco:"", estoque:"", categoria:"Alimentos", tipo:"PRODUTO", imagem:""
});

export default function CadastroProdutosLote() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [linhas, setLinhas] = useState([LINHA_VAZIA(), LINHA_VAZIA(), LINHA_VAZIA()]);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  function atualizar(idx, campo, valor) {
    setLinhas((prev) => prev.map((l, i) => i === idx ? { ...l, [campo]: valor } : l));
  }

  function adicionarLinha() {
    if (linhas.length >= 50) return addToast("Máximo de 50 produtos por lote.", "erro");
    setLinhas((prev) => [...prev, LINHA_VAZIA()]);
  }

  function removerLinha(idx) {
    if (linhas.length === 1) return;
    setLinhas((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validos = linhas.filter((l) => l.nome.trim() && l.preco);
    if (validos.length === 0) return addToast("Preencha ao menos um produto.", "erro");

    setLoading(true);
    try {
      const { data } = await produtoService.criarLote({ produtos: validos });
      setResultado(data);
      addToast(`${data.criados.length} produtos cadastrados!`);
    } catch (err) {
      addToast(err.response?.data?.erro || "Erro ao cadastrar lote.", "erro");
    } finally {
      setLoading(false);
    }
  }

  if (resultado) {
    return (
      <div>
        <h1 className="page-title">✅ Cadastro em Lote Concluído</h1>
        <div className="card">
          <p style={{ marginBottom:16, color:"#16a34a", fontWeight:700 }}>
            {resultado.criados.length} produtos cadastrados com sucesso!
          </p>
          <table className="lote-tabela">
            <thead><tr><th>ID</th><th>Nome</th><th>Preço</th><th>Estoque</th><th>Categoria</th></tr></thead>
            <tbody>
              {resultado.criados.map((p) => (
                <tr key={p.id}>
                  <td>#{p.id}</td>
                  <td>{p.nome}</td>
                  <td>R$ {Number(p.preco).toFixed(2)}</td>
                  <td>{p.estoque}</td>
                  <td>{p.categoria}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display:"flex", gap:12, marginTop:20 }}>
            <button className="btn-outline" onClick={() => { setResultado(null); setLinhas([LINHA_VAZIA()]); }}>
              Cadastrar mais
            </button>
            <button className="btn-primary" onClick={() => navigate("/vendas")}>
              Ver em Vendas
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">📋 Cadastro em Lote</h1>
      <p style={{ color:"#64748b", marginBottom:20 }}>
        Cadastre vários produtos de uma vez. Máximo de 50 por envio.
        Linhas em branco (sem nome) serão ignoradas.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="card lote-scroll">
          <table className="lote-tabela lote-tabela--input">
            <thead>
              <tr>
                <th>#</th>
                <th>Nome *</th>
                <th>Preço (R$) *</th>
                <th>Estoque</th>
                <th>Categoria</th>
                <th>Tipo</th>
                <th>Descrição</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l, idx) => (
                <tr key={idx}>
                  <td className="lote-num">{idx + 1}</td>
                  <td>
                    <input value={l.nome} onChange={(e) => atualizar(idx,"nome",e.target.value)}
                      placeholder="Nome do produto" />
                  </td>
                  <td>
                    <input type="number" step="0.01" min="0" value={l.preco}
                      onChange={(e) => atualizar(idx,"preco",e.target.value)} placeholder="0.00" />
                  </td>
                  <td>
                    <input type="number" min="0" value={l.estoque}
                      onChange={(e) => atualizar(idx,"estoque",e.target.value)} placeholder="0" />
                  </td>
                  <td>
                    <select value={l.categoria} onChange={(e) => atualizar(idx,"categoria",e.target.value)}>
                      {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </td>
                  <td>
                    <select value={l.tipo} onChange={(e) => atualizar(idx,"tipo",e.target.value)}>
                      <option value="PRODUTO">Produto</option>
                      <option value="SERVICO">Serviço</option>
                    </select>
                  </td>
                  <td>
                    <input value={l.descricao}
                      onChange={(e) => atualizar(idx,"descricao",e.target.value)}
                      placeholder="Opcional" />
                  </td>
                  <td>
                    <button type="button" className="btn-danger lote-del"
                      onClick={() => removerLinha(idx)} title="Remover linha">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display:"flex", gap:12, marginTop:16, flexWrap:"wrap" }}>
          <button type="button" className="btn-outline" onClick={adicionarLinha}>
            + Adicionar Linha
          </button>
          <button type="button" className="btn-outline"
            onClick={() => setLinhas([...linhas, ...Array(5).fill(null).map(LINHA_VAZIA)])}>
            + Adicionar 5 Linhas
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Enviando..." : `Cadastrar ${linhas.filter(l=>l.nome.trim()).length} Produto(s)`}
          </button>
        </div>
      </form>
    </div>
  );
}
