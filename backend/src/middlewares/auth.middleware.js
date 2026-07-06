// src/middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token não fornecido." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload;
    next();
  } catch (err) {
    return res.status(401).json({ erro: "Token inválido ou expirado." });
  }
}

// Middleware opcional — tenta autenticar mas não bloqueia se não tiver token
function authOpcional(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      req.usuario = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
    } catch (_) {}
  }
  next();
}

// Verifica se o usuário tem o perfil necessário
function autorizar(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.role)) {
      return res.status(403).json({ erro: "Acesso não permitido para este perfil." });
    }
    next();
  };
}

module.exports = { authMiddleware, autorizar, authOpcional };
