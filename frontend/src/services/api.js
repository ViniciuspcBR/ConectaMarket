// src/services/api.js
import axios from "axios";

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Logout automático quando o token expirar
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      // Redireciona para login sem depender do React Router
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login:    (d) => api.post("/auth/login",    d),
  registro: (d) => api.post("/auth/registro", d),
};

export const produtoService = {
  listar:      (params) => api.get("/produtos",        { params }),
  buscarPorId: (id)     => api.get(`/produtos/${id}`),
  criar:       (d)      => api.post("/produtos",       d),
  criarLote:   (d)      => api.post("/produtos/lote",  d),
  atualizar:   (id, d)  => api.put(`/produtos/${id}`,  d),
  remover:     (id)     => api.delete(`/produtos/${id}`),
};

export const pedidoService = {
  listar:           ()        => api.get("/pedidos"),
  listarExcluidos:  ()        => api.get("/pedidos/excluidos"),
  buscarPorId:      (id)      => api.get(`/pedidos/${id}`),
  criar:            (d)       => api.post("/pedidos",               d),
  atualizarStatus:  (id, s)   => api.patch(`/pedidos/${id}/status`, { status: s }),
  excluir:          (id)      => api.delete(`/pedidos/${id}`),
};

export const lojaService = {
  listar:      ()       => api.get("/lojas"),
  buscarPorId: (id)     => api.get(`/lojas/${id}`),
  criar:       (d)      => api.post("/lojas",      d),
  atualizar:   (id, d)  => api.put(`/lojas/${id}`, d),
};

export const fornecedorService = {
  listar:      ()       => api.get("/fornecedores"),
  buscarPorId: (id)     => api.get(`/fornecedores/${id}`),
  criar:       (d)      => api.post("/fornecedores",      d),
  atualizar:   (id, d)  => api.put(`/fornecedores/${id}`, d),
};

export const campanhaService = {
  listar:       ()       => api.get("/campanhas"),
  listarMinhas: ()       => api.get("/campanhas/minhas"),
  criar:        (d)      => api.post("/campanhas",      d),
  atualizar:    (id, d)  => api.put(`/campanhas/${id}`, d),
};

export const avaliacaoService = {
  listarPorProduto: (pid) => api.get(`/avaliacoes/produto/${pid}`),
  criar:            (d)   => api.post("/avaliacoes", d),
};

export const usuarioService = {
  perfil:          ()  => api.get("/usuarios/perfil"),
  atualizarPerfil: (d) => api.put("/usuarios/perfil", d),
};

export const carteiraService = {
  minha: () => api.get("/carteira"),
};

export const brindeService = {
  meus:            ()     => api.get("/brindes"),
  marcarEntregue:  (id)   => api.patch(`/brindes/${id}/entregar`),
};

export default api;
