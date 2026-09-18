# ==========================================
# Etapa 1: Construcción (Build Stage)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./

# Instalar dependencias limpias
RUN npm ci

# Copiar todo el código fuente
COPY . .

# Argumentos de entorno para Vite (inyección en build time)
ARG VITE_API_URL=https://api.mycitas.online/api
ARG VITE_API_PROD_URL=https://api.mycitas.online/api

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_PROD_URL=$VITE_API_PROD_URL

# Generar el bundle de producción
RUN npm run build

# ==========================================
# Etapa 2: Servidor de Producción (Nginx)
# ==========================================
FROM nginx:1.27-alpine AS production

# Copiar la configuración personalizada de Nginx para SPA (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos compilados de la etapa de construcción
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer el puerto HTTP
EXPOSE 80

# Iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
