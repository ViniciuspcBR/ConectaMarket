// src/pages/Catalogo.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { produtoService } from "../services/api";
import "./Catalogo.css";

const CATEGORIAS = [
  "Todas", "Saúde e Beleza", "Alimentos", "Agropecuária",
  "Vestuário", "Construção Civil", "Eletrônica", "Cultura", "Serviços",
];

export default function Catalogo() {
  const [produtos,   setProdutos]   = useState([]);
  const [busca,      setBusca]      = useState("");
  const [categoria,  setCategoria]  = useState("Todas");
  const [tipo,       setTipo]       = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    setCarregando(true);
    const params = {};
    if (busca)                    params.busca     = busca;
    if (categoria !== "Todas")    params.categoria = categoria;
    if (tipo)                     params.tipo      = tipo;

    produtoService.listar(params)
      .then((r) => setProdutos(r.data))
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, [busca, categoria, tipo]);

  return (
    <div>
      <h1 className="page-title">Catálogo de Produtos</h1>

      {/* Filtros */}
      <div className="catalogo-filtros card">
        <input
          placeholder="🔍 Buscar produto..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="">Todos os tipos</option>
          <option value="PRODUTO">Produto</option>
          <option value="SERVICO">Serviço</option>
        </select>
      </div>

      {/* Grid de produtos */}
      {carregando ? (
        <p style={{ color: "#94a3b8", marginTop: 24 }}>Carregando...</p>
      ) : produtos.length === 0 ? (
        <p style={{ color: "#94a3b8", marginTop: 24 }}>Nenhum produto encontrado.</p>
      ) : (
        <div className="catalogo-grid">
          {produtos.map((p) => (
            <Link to={`/catalogo/${p.id}`} key={p.id} className="produto-card card">
              <div className="produto-imagem">
                {p.imagem
                  ? <img src={p.imagem} alt={p.nome} />
                  : <span className="produto-sem-img">📦</span>
                }
              </div>
              <div className="produto-info">
                <p className="produto-nome">{p.nome}</p>
                <p className="produto-categoria">{p.categoria || "—"}</p>
                <p className="produto-preco">R$ {p.preco.toFixed(2)}</p>
                {p.mediaAvaliacao && (
                  <p className="produto-avaliacao">⭐ {p.mediaAvaliacao.toFixed(1)}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
