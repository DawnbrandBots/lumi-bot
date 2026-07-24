# Lumi

A free and open-source Discord bot for Fire Emblem Shadows.

## Features

### Data lookup

Lumi displays Fire Emblem Shadows data in chat in reponse to use of the `/search` command or `@Lumi <SEARCH TERMS>`.

### Looking For Game (LFG) management

`/lfg` allows players to create server-scoped groups of up to three. Meant to organize for farming in Friend Battles.

## Discord permissions

| Permission                                 | Purpose                                         | Recommendation                                                                                         |
| ------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Send messages**                          | Replying to commands and pings.                 | If you want most commands to work properly in regular channels                                         |
| **Send messages in thread**                | Same reason as _Send messages_, but in threads. | If you want most commands to work properly in threads                                                  |
| **Read message history**                   | Being able to detect pings to act upon them.    | If you want users to be able to trigger `/help` and `/search` by mentioning the bot                    |
| **Mention @everyone, @here and All Roles** | Ping roles dedicated to LFG.                    | If roles you want the bot to be able to ping don't have "Allow everyone to @mention this role" enabled |

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

Game data is stored as JSON files under `/data/`. `yarn db:recreate` recreates an [sqlite](https://sqlite.org) database using these JSON files as source.
Bot features data is stored in a separate sqlite database. `yarn db:migrate` to create it.
The server connects to the main database and attaches the game data database in a single [MikroORM](https://mikro-orm.io/) connection.

Searchable game data is loaded into a [fuse.js](https://www.fusejs.io/) instance at startup, which is then used as source for the `/search` feature.

The server interacts with Discord using [discord.js](https://discord.js.org/).
