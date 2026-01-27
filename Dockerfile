# Stage 1: Build the Angular application
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install --force
COPY . .
RUN npm run build --prod

# Stage 2: Serve the built application with Nginx
FROM nginx:alpine
# Elimina la configuración por defecto de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Crea un nuevo archivo de configuración
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist/portal-transuaminca/browser/  /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
