# frontend/Dockerfile

# Etapa 1 — Build do React
FROM node:20-alpine AS build

WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2 — Servir com Nginx
FROM nginx:alpine

# Copia o build para o nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configuração do nginx para React Router + proxy para API
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
