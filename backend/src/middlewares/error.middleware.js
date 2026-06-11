// src/middlewares/error.middleware.js
function errorMiddleware(err, req, res, next) {
  console.error("❌ Erro:", err.message);

  const status = err.status || 500;
  res.status(status).json({
    erro: err.message || "Erro interno do servidor.",
  });
}

module.exports = errorMiddleware;
