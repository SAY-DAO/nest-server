FROM node:18.14-alpine as builder

ENV NODE_ENV build

WORKDIR /usr/src/app

COPY . /usr/src/app

RUN yarn install --frozen-lockfile \
    && yarn run build

# ---

FROM node:18.14-alpine as production

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=builder /usr/src/app/dist /usr/src/app/dist
COPY .env ./.env

CMD ["node", "/usr/src/app/dist/main.js"]
