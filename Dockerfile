# syntax=docker/dockerfile:1

FROM node:16-alpine
ENV NODE_ENV=production

WORKDIR /app

COPY package.json ./

COPY yarn.lock ./

COPY tsconfig.server.json ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn prisma generate

EXPOSE 443

CMD ["yarn", "dev:ws"]