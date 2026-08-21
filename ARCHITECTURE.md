# Architecture

## `src/`

Contains source code for the bot's runtime. `src/`'s direct subdirectories represent DDD layers.

### DDD Layers

#### `domain/`

Contains the code representing _business_ concepts and rules that the bot's features manipulate.

`domain/` code has no reference to code outside of itself.

#### `presentation/`

Contains code for handling platform-specific requests sent to the bot. The bot currently only handles requests coming from Discord clients, which is why `presentation/`'s only direct subdirectory is `discord/`. The bot may later offer other ways to interact with it, such as a REST API of its own.

Each `presentation/`'s subdirectory contains code for handling the multiple ways a platform's clients may send requests to the bot. In the case of `discord/`, Lumi may reply to requests sent in the form of regular messages or [interactions](https://docs.discord.com/developers/interactions/overview) (e.g. slash commands, message components, autocomplete).

Following DDD principles, the only other layer which API `presentation/` may interact with is `application/`.

#### `application/`

Contains the core logic for the bot. Its code enforces that received input respects `domain/` rules then may run tasks involving `domain/` models by calling upon `infrastructure/`'s API.

`application/` code has no knowledge of how it was called (which is `presentation/`'s concern) nor of how the bot interacts with the outside world (which is `infastructure/`'s concern).

Each `application/` subdirectory contains code for individual features of the bot. e.g. `admin/` for Discord server admin controls, `search/` for the game data search feature and `lfg/` for the _looking for game_/_friend battles_ room management feature.

Each feature directory has a `useCases/` subdirectory containing the API that may be called by the `presentation/` layer. Each feature directory may also have a `services/` subdirectory containing shared code not meant to be accessed by `presentation/`.

Following DDD principles, the only other layers which API `application/` may interact with are `application/` and `domain/`.

#### `composition/`

The **composition root** is responsible for creating module instances and linking them together.

### Concepts seen in multiple layers

#### Mappers

`domain/` and `application/` do not contain references to other layers. `infrastructure/` and `presentation/` must provide/return instances of `application/` models to interact with it, and may also have to translate `application/` models intances to another model that a client or another API understands.

Mappers are functions which only purpose is creating an object which conforms to a layer's interface from another object conforming to an interface from another layer.

For example, Lumi may reply to the `/search` command sent from Discord with data about Kurt.

```ts
// Not actual code from src/, for illustration purposes only.

/** A simplistic representation of what Discord expects bots to send them to create a chat message to respond a slash command. */
interface IDiscordSlashCommandReply {
    /** Text that will appear in the Discord message sent by the bot as a reply to a slash command. */
    content: string;
}

/** A simplistic domain model for data about Fire Emblem Shadows disciples. */
interface IDiscipleData {
    name: string;
    epithet: string;
    favoriteWeaponName: string;
}

/**
 * IDiscipleData cannot be returned as is to Discord because it does not conform to the expected model.
 * This mapper is responsible for creating an instance of IDiscordSlashCommandReply from an instance of IDiscipleData so that Discord accepts the reply from the bot and Discord users may see Kurt's data presented in a Discord message.
 */
function mapDiscipleDataToDiscordSlashCommandReply(data: IDiscipleData): IDiscordSlashCommandReply {
    return {
        content: `**${data.name}, ${data.epithet}**\n${data.name}'s favorite weapon is ${data.favoriteWeaponName}.`,
    };
}
```

## `data/`

Contains Fire Emblem Shadows game data in the form of JSON files.

## `scripts/`

Contains files meant to be run from the CLI. Each script should have at least one `package.json` `scripts` entry pointing at it.
