FROM node:22-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./


COPY prisma ./prisma

RUN npm install

COPY tsconfig*.json ./

COPY src ./src

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]