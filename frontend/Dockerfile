# Etapa de construcción
FROM node:20-alpine AS build
WORKDIR /app

# Copiar solo package.json y package-lock.json para aprovechar cache de npm install
COPY package*.json ./
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Construir la app React (generar carpeta build)
RUN npm run build

# Etapa de producción: servidor Nginx
FROM nginx:stable-alpine

# Copiar build generado
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuración personalizada de Nginx para proxy reverso
COPY src/config/nginx.conf /etc/nginx/nginx.conf

# Exponer puerto 80 para servir contenido
EXPOSE 80

# Comando para ejecutar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]


