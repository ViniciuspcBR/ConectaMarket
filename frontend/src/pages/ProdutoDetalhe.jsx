// src/pages/ProdutoDetalhe.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { produtoService, avaliacaoService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCarrinho } from "../context/CarrinhoContext";
import { useToast } from "../context/ToastContext";
import "./ProdutoDetalhe.css";

export default function ProdutoDetalhe() {
  const { id }          = useParams();
  const navigate        = useNavigate();
  const { usuario }     = useAuth();
  const { adicionar }   = useCarrinho();
  const { addToast }    = useToast();
  const [produto,    setProduto]    = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [avaliacao,  setAvaliacao]  = useState({ nota:5, comentario:"" });

  useEffect(() => {
    produtoService.buscarPorId(id).then((r) => setProduto(r.data));
  }, [id]);

  function handleAdicionarCarrinho() {
    adicionar(produto, quantidade);
    addToast(`"${produto.nome}" adicionado ao carrinho! 🛒`);
  }

  async function handleAvaliar(e) {
    e.preventDefault();
    try {
      await avaliacaoService.criar({ produtoId: produto.id, ...avaliacao });
      addToast("Avaliação enviada!");
      produtoService.buscarPorId(id).then((r) => setProduto(r.data));
    } catch { addToast("Erro ao enviar avaliação.", "erro"); }
  }

  if (!produto) return <p style={{padding:32}}>Carregando...</p>;

  const mediaAvaliacao = produto.avaliacoes?.length > 0
    ? produto.avaliacoes.reduce((a, v) => a + v.nota, 0) / produto.avaliacoes.length
    : null;

  return (
    <div>
      <button className="btn-outline btn-sm" style={{marginBottom:16}} onClick={() => navigate(-1)}>
        ← Voltar
      </button>

      <div className="detalhe-layout">
        <div className="detalhe-imagem card">
          {produto.imagem
            ? <img src={produto.imagem} alt={produto.nome} />
            : <span style={{fontSize:"5rem"}}>📦</span>}
        </div>

        <div className="detalhe-info card">
          <h1>{produto.nome}</h1>
          <p className="detalhe-categoria">
            {produto.categoria} · <span className="badge badge-blue">{produto.tipo}</span>
          </p>

          {mediaAvaliacao && (
            <p style={{marginTop:6, color:"#64748b", fontSize:"0.9rem"}}>
              {"⭐".repeat(Math.round(mediaAvaliacao))} {mediaAvaliacao.toFixed(1)} ({produto.avaliacoes.length} avaliações)
            </p>
          )}

          <p className="detalhe-preco">R$ {produto.preco.toFixed(2)}</p>
          {produto.descricao && <p className="detalhe-desc">{produto.descricao}</p>}

          <p className="detalhe-estoque">
            {produto.estoque > 0
              ? <span style={{color:"#16a34a"}}>✅ Em estoque ({produto.estoque} disponíveis)</span>
              : <span style={{color:"#dc2626"}}>⚠️ Fora de estoque</span>}
          </p>

          {produto.estoque > 0 && (
            <div className="detalhe-compra">
              <div className="qtd-control">
                <button onClick={() => setQuantidade(Math.max(1, quantidade - 1))}>−</button>
                <span>{quantidade}</span>
                <button onClick={() => setQuantidade(Math.min(produto.estoque, quantidade + 1))}>+</button>
              </div>
              <button className="btn-primary" onClick={handleAdicionarCarrinho}>
                🛒 Adicionar ao Carrinho
              </button>
              <button className="btn-success" onClick={() => { handleAdicionarCarrinho(); navigate("/carrinho"); }}>
                ⚡ Comprar Agora
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Avaliações */}
      <div className="card" style={{marginTop:24}}>
        <h2 style={{marginBottom:16}}>Avaliações dos Clientes</h2>
        {produto.avaliacoes?.length === 0 && (
          <p style={{color:"#94a3b8"}}>Nenhuma avaliação ainda. Seja o primeiro!</p>
        )}
        {produto.avaliacoes?.map((a, i) => (
          <div key={i} className="avaliacao-item">
            <div style={{display:"flex", justifyContent:"space-between"}}>
              <strong>{a.usuario?.nome}</strong>
              <span>{"⭐".repeat(a.nota)}</span>
            </div>
            {a.comentario && <p>{a.comentario}</p>}
          </div>
        ))}

        {usuario && (
          <form onSubmit={handleAvaliar} className="avaliacao-form" style={{marginTop:24}}>
            <h3>Deixe sua avaliação</h3>
            <select value={avaliacao.nota}
              onChange={(e) => setAvaliacao({...avaliacao, nota:Number(e.target.value)})}>
              {[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} ⭐</option>)}
            </select>
            <textarea rows={3} placeholder="Comentário (opcional)"
              value={avaliacao.comentario}
              onChange={(e) => setAvaliacao({...avaliacao, comentario:e.target.value})} />
            <button type="submit" className="btn-primary" style={{alignSelf:"flex-start"}}>Enviar Avaliação</button>
          </form>
        )}
      </div>
    </div>
  );
}
