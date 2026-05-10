ARG NODE_VERSION=lts
FROM node:${NODE_VERSION} AS base
WORKDIR /app
COPY package*.json yarn.lock ./
RUN cat /etc/os-release /etc/debian_version && node --version && yarn --prod

FROM base AS dev
RUN yarn

FROM dev AS build
COPY . .
RUN yarn build

FROM base
ARG REVISION
LABEL org.opencontainers.image.title="Lumi Discord bot"
LABEL org.opencontainers.image.authors=bastionbotdev@gmail.com
LABEL org.opencontainers.image.source=https://github.com/DawnbrandBots/lumi-bot
LABEL org.opencontainers.image.licenses=AGPL-3.0-or-later
LABEL org.opencontainers.image.revision=${REVISION}
ENV REVISION=${REVISION}
WORKDIR /app
COPY --from=build /app/dist .
COPY COPYING .
USER node
CMD ["node", "--enable-source-maps", "."]
