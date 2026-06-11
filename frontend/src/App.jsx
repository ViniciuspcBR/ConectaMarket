// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth }     from "./context/AuthContext";
import { ToastProvider }             from "./context/ToastContext";
import { CarrinhoProvider }          from "./context/CarrinhoContext";

import Layout                from "./components/layout/Layout";
import Login                 from "./pages/Login";
import Registro              from "./pages/Registro";
import Dashboard             from "./pages/Dashboard";
import Catalogo              from "./pages/Catalogo";
import ProdutoDetalhe        from "./pages/ProdutoDetalhe";
import Carrinho              from "./pages/Carrinho";
import Checkout              from "./pages/Checkout";
import Pedidos               from "./pages/Pedidos";
import Vendas                from "./pages/Vendas";
import Marketplace           from "./pages/Marketplace";
import NovoProduto           from "./pages/NovoProduto";
import EditarProduto         from "./pages/EditarProduto";
import CadastroProdutosLote  from "./pages/CadastroProdutosLote";
import Campanhas             from "./pages/Campanhas";
import Perfil                from "./pages/Perfil";
import Admin                 from "./pages/Admin";

function RotaPrivada({ children }) {
  const { usuario, carregando } = useAuth();
  if (carregando) return <p style={{padding:32}}>Carregando...</p>;
  return usuario ? children : <Navigate to="/login" replace />;
}

function RotaAdmin({ children }) {
  const { usuario, carregando } = useAuth();
  if (carregando) return <p style={{padding:32}}>Carregando...</p>;
  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.role !== "ADMINISTRADOR") return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { usuario } = useAuth();
  return (
    <Routes>
      <Route path="/login"    element={usuario ? <Navigate to="/" /> : <Login />} />
      <Route path="/registro" element={usuario ? <Navigate to="/" /> : <Registro />} />

      <Route path="/" element={<RotaPrivada><Layout /></RotaPrivada>}>
        <Route index                       element={<Dashboard />} />
        <Route path="catalogo"             element={<Catalogo />} />
        <Route path="catalogo/:id"         element={<ProdutoDetalhe />} />
        <Route path="carrinho"             element={<Carrinho />} />
        <Route path="checkout"             element={<Checkout />} />
        <Route path="pedidos"              element={<Pedidos />} />
        <Route path="vendas"               element={<Vendas />} />
        <Route path="marketplace"          element={<Marketplace />} />
        <Route path="produtos/novo"        element={<NovoProduto />} />
        <Route path="produtos/lote"        element={<CadastroProdutosLote />} />
        <Route path="produtos/:id/editar"  element={<EditarProduto />} />
        <Route path="campanhas"            element={<Campanhas />} />
        <Route path="perfil"               element={<Perfil />} />
        <Route path="admin"                element={<RotaAdmin><Admin /></RotaAdmin>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CarrinhoProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </CarrinhoProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
