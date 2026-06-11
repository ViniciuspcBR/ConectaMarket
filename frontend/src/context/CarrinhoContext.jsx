// src/context/CarrinhoContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const CarrinhoContext = createContext(null);

export function CarrinhoProvider({ children }) {
  const [itens, setItens] = useState(() => {
    try { return JSON.parse(localStorage.getItem("carrinho") || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("carrinho", JSON.stringify(itens));
  }, [itens]);

  function adicionar(produto, quantidade = 1) {
    setItens((prev) => {
      const existe = prev.find((i) => i.id === produto.id);
      if (existe) {
        return prev.map((i) =>
          i.id === produto.id ? { ...i, quantidade: i.quantidade + quantidade } : i
        );
      }
      return [...prev, { ...produto, quantidade }];
    });
  }

  function remover(id) {
    setItens((prev) => prev.filter((i) => i.id !== id));
  }

  function alterarQuantidade(id, quantidade) {
    if (quantidade <= 0) return remover(id);
    setItens((prev) => prev.map((i) => i.id === id ? { ...i, quantidade } : i));
  }

  function limpar() { setItens([]); }

  const total    = itens.reduce((acc, i) => acc + i.preco * i.quantidade, 0);
  const qtdTotal = itens.reduce((acc, i) => acc + i.quantidade, 0);

  return (
    <CarrinhoContext.Provider value={{ itens, adicionar, remover, alterarQuantidade, limpar, total, qtdTotal }}>
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() { return useContext(CarrinhoContext); }
