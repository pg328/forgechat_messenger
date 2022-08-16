# syntax=docker/dockerfile:1

FROM node:16-alpine

WORKDIR /app

COPY package.json /app/package.json

COPY package-lock.json /app/package-lock.json

RUN npm install

COPY wss.mjs /app/wss.mjs

CMD ["node", "/app/wss.mjs"]
