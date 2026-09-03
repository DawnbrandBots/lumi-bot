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

## Running Lumi

### Locally with Node

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

### Locally with Docker Compose

1. `cp .env.docker.template .env.docker`, fill in secrets and override default values (set in `docker-compose.yaml`) at your convenience.
1. `docker compose --env-file .env.docker up --build`

## Running tests

1. `cp .env.test.template .env.test` and change default values at your convenience.
1. `yarn test`

## Deployment

### On any device, with or without Docker

Lumi does not require more setup than described in [Running Lumi](#running-lumi) to allow other Discord clients to reach it, as it receives requests from [Discord's Gateway API](https://docs.discord.com/developers/events/gateway) exclusively. No need for the host to be publicly reachable from the Internet.

### GitHub Actions

The `.github/deploy.yml` GitHub Actions workflow will run `docker-compose.yaml` on a remote device exposed through [Tailscale](https://tailscale.com/):

- [Tailscale quickstart](https://tailscale.com/docs/how-to/quickstart)
- [Configure remote access for Docker daemon](https://docs.docker.com/engine/daemon/remote-access/)

<!-- TODO: may need to mention the github-actions tag -->

Required variables to set in [`Settings` > `Secrets and variables` > `Actions`](https://github.com/DawnbrandBots/lumi-bot/settings/secrets/actions):

- **Secrets**:
    - `DISCORD_TOKEN`: As described in [Running Lumi](#running-lumi).
    - `TS_DEPLOY_HOST`: IP of host device in Tailscale network. Get it [from the dashboard](https://console.tailscale.com/admin/machines) or by running `tailscale ip -4`.
    - `TS_DEPLOY_PORT`: Docker Daemon port on host device. `2375` by default.
    - `TS_OAUTH_CLIENT_ID`: Shown under "Client ID" in [Trust Credentials](https://console.tailscale.com/admin/settings/trust-credentials).
    - `TS_OAUTH_SECRET`: Shown only once when creating a credential from [Trust Credentials](https://console.tailscale.com/admin/settings/trust-credentials).
- **Variables**:
    - `DOCKER_COMPOSE_PROJECT_NAME`: passed to `docker compose`'s `--project-name` option.

## Inner workings

Game data is stored as JSON files under `/data/`. `yarn db:recreate` recreates an [sqlite](https://sqlite.org) database using these JSON files as source.
Bot features data is stored in a separate sqlite database. `yarn db:migrate` to create it.
The server connects to the main database and attaches the game data database in a single [MikroORM](https://mikro-orm.io/) connection.

Searchable game data is loaded into a [fuse.js](https://www.fusejs.io/) instance at startup, which is then used as source for the `/search` feature.

The server interacts with Discord using [discord.js](https://discord.js.org/).
