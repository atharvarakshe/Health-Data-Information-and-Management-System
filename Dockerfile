FROM node:18-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

FROM base AS production
CMD ["node", "src/index.js"]
