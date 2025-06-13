FROM node:18-alpine

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação e correção dos aliases
RUN npm run build

# Expor porta
EXPOSE 3001

# Comando para iniciar
CMD ["node", "dist/server.js"]
