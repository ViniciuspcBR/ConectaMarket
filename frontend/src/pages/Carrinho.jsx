// src/pages/Carrinho.jsx
import { useNavigate } from "react-router-dom";
import { useCarrinho } from "../context/CarrinhoContext";
import "./Carrinho.css";

export default function Carrinho() {
  const { itens, remover, alterarQuantidade, total, limpar } = useCarrinho();
  const navigate = useNavigate();

  if (itens.length === 0) {
    return (
      <div>
        <h1 className="page-title">🛒 Carrinho</h1>
        <div className="card carrinho-vazio">
          <p style={{ fontSize:"3rem" }}>🛒</p>
          <p>Seu carrinho está vazio.</p>
          <button className="btn-primary" onClick={() => navigate("/catalogo")}>
            Ver Catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">🛒 Carrinho</h1>
      <div className="carrinho-layout">
        {/* Lista de itens */}
        <div className="carrinho-itens">
          {itens.map((item) => (
            <div key={item.id} className="carrinho-item card">
              <div className="carrinho-img">
                {item.imagem
                  ? <img src={item.imagem} alt={item.nome} />
                  : <span>📦</span>}
              </div>
              <div className="carrinho-info">
                <p className="carrinho-nome">{item.nome}</p>
                <p className="carrinho-categoria">{item.categoria}</p>
                <p className="carrinho-preco">R$ {item.preco.toFixed(2)} cada</p>
              </div>
              <div className="carrinho-qtd">
                <button onClick={() => alterarQuantidade(item.id, item.quantidade - 1)}>−</button>
                <span>{item.quantidade}</span>
                <button onClick={() => alterarQuantidade(item.id, item.quantidade + 1)}>+</button>
              </div>
              <div className="carrinho-subtotal">
                R$ {(item.preco * item.quantidade).toFixed(2)}
              </div>
              <button className="carrinho-remover" onClick={() => remover(item.id)}>✕</button>
            </div>
          ))}
        </div>

        {/* Resumo */}
        <div className="carrinho-resumo card">
          <h2>Resumo do Pedido</h2>
          <div className="resumo-linha">
            <span>Subtotal ({itens.length} {itens.length === 1 ? "item" : "itens"})</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>
          <div className="resumo-linha resumo-total">
            <span>Total</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>
          <button className="btn-primary resumo-btn"
            onClick={() => navigate("/checkout")}>
            Finalizar Compra
          </button>
          <button className="btn-outline resumo-btn"
            onClick={() => navigate("/catalogo")}>
            Continuar Comprando
          </button>
          <button className="btn-danger resumo-btn"
            onClick={limpar}>
            Limpar Carrinho
          </button>
        </div>
      </div>
    </div>
  );
}
