// src/pages/Marketplace.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { lojaService, produtoService } from "../services/api";
import "./Marketplace.css";

export default function Marketplace() {
  const navigate = useNavigate();
  const [lojas,    setLojas]    = useState([]);
  const [servicos, setServicos] = useState([]);
  const [aba,      setAba]      = useState("lojas");

  useEffect(() => {
    lojaService.listar().then((r) => setLojas(r.data));
    produtoService.listar({ tipo: "SERVICO" }).then((r) => setServicos(r.data));
  }, []);

  return (
    <div>
      <h1 className="page-title">Marketplace Comunitário</h1>
      <p style={{color:"#64748b", marginBottom:24}}>
        Conectando empreendedores e comunidade local de Criciúma.
      </p>

      <div className="mk-abas">
        <button className={aba === "lojas"    ? "aba-ativa" : ""} onClick={() => setAba("lojas")}>🏪 Lojas</button>
        <button className={aba === "servicos" ? "aba-ativa" : ""} onClick={() => setAba("servicos")}>🔧 Serviços</button>
      </div>

      {/* LOJAS — exibe só produtos (não serviços) */}
      {aba === "lojas" && (
        <div className="mk-grid">
          {lojas.length === 0 && <p style={{color:"#94a3b8"}}>Nenhuma loja cadastrada.</p>}
          {lojas.map((l) => (
            <div key={l.id} className="mk-card card">
              <div className="mk-card-logo">
                {l.logo ? <img src={l.logo} alt={l.nome} /> : <span>🏪</span>}
              </div>
              <h3>{l.nome}</h3>
              <p>{l.descricao || "Loja parceira ConectaMarket"}</p>
              {l.endereco && <p style={{fontSize:"0.78rem", color:"#94a3b8", marginTop:4}}>📍 {l.endereco}</p>}
              <button
                className="btn-primary"
                style={{marginTop:14, width:"100%"}}
                onClick={() => navigate(`/catalogo?lojaId=${l.id}&tipo=PRODUTO`)}>
                Ver Produtos
              </button>
            </div>
          ))}
        </div>
      )}

      {/* SERVIÇOS */}
      {aba === "servicos" && (
        <div className="mk-grid">
          {servicos.length === 0 && <p style={{color:"#94a3b8"}}>Nenhum serviço cadastrado.</p>}
          {servicos.map((p) => (
            <div key={p.id} className="mk-card card" style={{cursor:"pointer"}}
              onClick={() => navigate(`/catalogo/${p.id}`)}>
              <div className="mk-card-logo">
                {p.imagem ? <img src={p.imagem} alt={p.nome} style={{width:64,height:64,borderRadius:"50%",objectFit:"cover"}} /> : <span>🔧</span>}
              </div>
              <h3>{p.nome}</h3>
              <p>{p.descricao}</p>
              <p className="mk-preco">R$ {Number(p.preco).toFixed(2)}</p>
              {p.empreendedor && (
                <p style={{fontSize:"0.78rem", color:"#94a3b8", marginTop:4}}>
                  por {p.empreendedor.nomeNegocio}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
