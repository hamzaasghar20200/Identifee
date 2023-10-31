ARG NODE_VERSION=16-alpine
FROM node:${NODE_VERSION}

WORKDIR /idf-app

COPY package*.json ./
COPY .env.example .env

COPY . .

RUN npm install
RUN npm run build

CMD ["node", "./dist/start.js"]
EXPOSE 8080/tcp