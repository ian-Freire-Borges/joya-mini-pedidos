FROM node:24-alpine AS build
WORKDIR /app
COPY frontend/package*.json ./
# npm ci exige lockfile: gerar e versionar quando o registry estiver acessível.
RUN npm install --no-audit --no-fund
COPY frontend/ ./
RUN npm test && npm run build
FROM nginx:stable-alpine
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
