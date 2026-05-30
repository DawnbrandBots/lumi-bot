# Lumi

A free and open-source Discord bot for Fire Emblem Shadows.

## Features

### Data lookup

Lumi displays Fire Emblem Shadows data in chat in reponse to use of the `/search` command or `@Lumi <SEARCH TERMS>`.

### Looking For Game (LFG) management

`/lfg` allows players to create server-scoped groups of up to three. Meant to organize for farming in Friends Battles.

## Discord permissions

| Permission                  | Purpose                                         | Recommendation |
| --------------------------- | ----------------------------------------------- | -------------- |
| **Send messages**           | Replying to commands and pings.                 | Required       |
| **Send messages in thread** | Same reason as _Send messages_, but in threads. | Optional       |
| **Read message history**    | Being able to detect pings to act upon them.    | Recommended    |

## Getting started

### Running locally with Node

1. Install Node.js 24+ LTS with Yarn v1. [Fast Node Manager](https://github.com/Schniz/fnm) is a good option for managing multiple installations.
1. `cp .env.template .env`, fill in secrets and change default values at your convenience.
1. ```
   yarn
   yarn build
   yarn register user-install
   yarn db:recreate
   yarn db:migrate
   yarn start
   ```

### Running locally with Docker Compose

1. `cp .env.docker.template .env.docker`, fill in secrets and change default values at your convenience.
1. `docker compose --env-file .env.docker up --build`

## Running tests

1. `cp .env.test.template .env.test` and change default values at your convenience.
1. `yarn test`

## Inner workings

Game data is stored as JSON files under `/data/`. `yarn db:recreate` creates an sqlite3 database using these JSON files as source. The server reads the data at runtime using [MikroORM](https://mikro-orm.io/).

Searchable game data is loaded into a [fuse.js](https://www.fusejs.io/) instance at startup, which is then used as source for the `/search` feature.

The server interacts with Discord using [discord.js](https://discord.js.org/).
