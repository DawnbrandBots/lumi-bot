# Lumi

A free and open-source Discord bot for Fire Emblem Shadows.

## Features

Lumi displays Fire Emblem Shadows data in chat in reponse to use of the `/search` command or `@Lumi <SEARCH TERMS>`.

## Discord permissions

| Permission                                                                     | Purpose                                         | Recommendation |
| ------------------------------------------------------------------------------ | ----------------------------------------------- | -------------- |
| - **Send messages**: Replying to commands and pings.                           | Replying to commands and pings.                 | Required       |
| - **Send messages in thread**: Same reason as _Send messages_, but in threads. | Same reason as _Send messages_, but in threads. | Optional       |
| - **Read message history**: Being able to detect pings to act upon them.       | Being able to detect pings to act upon them.    | Recommended    |

## Getting started

1. Install Node.js 24+ LTS with Yarn v1. [Fast Node Manager](https://github.com/Schniz/fnm) is a good option for managing multiple installations.
1. `yarn`
1. Create a `.env` file with the Discord token for your bot, e.g.
    ```env
    DEBUG=* # optional
    DISCORD_TOKEN=HERE.PLS
    ```
1. `yarn build`
1. `yarn register user-install`
1. `yarn db:recreate`
1. `yarn start`

## Inner workings

Game data is stored as JSON files under `/data/`. `yarn db:recreate` creates an sqlite3 database using these JSON files as source. The server reads the data at runtime using [MikroORM](https://mikro-orm.io/).

Searchable game data is loaded into a [fuse.js](https://www.fusejs.io/) instance at startup, which is then used as source for the `/search` feature.

The server interacts with Discord using [discord.js](https://discord.js.org/).
