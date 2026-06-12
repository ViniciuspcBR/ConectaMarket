// src/pages/Catalogo.jsx
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { produtoService, lojaService } from "../services/api";
import "./Catalogo.css";

const CATEGORIAS = [
  "Todas", "Saúde e Beleza", "Alimentos", "Agropecuária",
  "Vestuário", "Construção Civil", "Eletrônica", "Cultura", "Serviços",
];

export default function Catalogo() {
  const [searchParams, setSearchParams] = useSearchParams();
  const lojaId = searchParams.get("lojaId");
  const tipoUrl = searchParams.get("tipo");

  const [produtos,   setProdutos]   = useState([]);
  const [busca,      setBusca]      = useState("");
  const [categoria,  setCategoria]  = useState("Todas");
  const [tipo,       setTipo]       = useState(tipoUrl || "");
  const [carregando, setCarregando] = useState(true);
  const [lojaInfo,   setLojaInfo]   = useState(null);

  // Carrega info da loja se vier filtro por loja
  useEffect(() => {
    if (lojaId) {
      lojaService.buscarPorId(lojaId).then((r) => setLojaInfo(r.data)).catch(() => {});
    } else {
      setLojaInfo(null);
    }
  }, [lojaId]);

  useEffect(() => {
    setCarregando(true);
    const params = {};
    if (busca)                    params.busca     = busca;
    if (categoria !== "Todas")    params.categoria = categoria;
    if (tipo)                     params.tipo      = tipo;
    if (lojaId)                   params.lojaId    = lojaId;

    produtoService.listar(params)
      .then((r) => setProdutos(r.data))
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, [busca, categoria, tipo, lojaId]);

  function limparFiltroLoja() {
    const novo = new URLSearchParams(searchParams);
    novo.delete("lojaId");
    novo.delete("tipo");
    setSearchParams(novo);
    setTipo("");
  }

  return (
    <div>
      <h1 className="page-title">Catálogo de Produtos</h1>

      {/* Filtro ativo de loja */}
      {lojaInfo && (
        <div className="filtro-loja-ativo card">
          <span>🏪 Mostrando produtos de: <strong>{lojaInfo.nome}</strong></span>
          <button className="btn-outline btn-sm" onClick={limparFiltroLoja}>
            ✕ Remover filtro
          </button>
        </div>
      )}


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
                  ? <img src={p.imagem} alt={p.nome}
                      onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                  : null
                }
                <span className="produto-sem-img" style={{display: p.imagem ? "none" : "flex"}}>📦</span>
                {p.campanhaAtiva && p.precoComDesconto && (
                  <span className="produto-desconto-badge">
                    -{p.campanhaAtiva.valor}%
                  </span>
                )}
              </div>
              <div className="produto-info">
                <p className="produto-nome">{p.nome}</p>
                <p className="produto-categoria">{p.categoria || "—"}</p>
                {p.campanhaAtiva && p.precoComDesconto ? (
                  <>
                    <p className="produto-preco-original">R$ {p.preco.toFixed(2)}</p>
                    <p className="produto-preco produto-preco--desconto">
                      R$ {p.precoComDesconto.toFixed(2)}
                    </p>
                    <p className="produto-campanha-nome">🎯 {p.campanhaAtiva.nome}</p>
                  </>
                ) : (
                  <p className="produto-preco">R$ {p.preco.toFixed(2)}</p>
                )}
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
