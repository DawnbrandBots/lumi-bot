import debug from "debug";
import { Events } from "discord.js";
import { composeAdminFeature } from "./composition/application/admin/feature.ts";
import { composeLfgUseCases } from "./composition/application/lfg/useCases.ts";
import { composeSearchUseCases } from "./composition/application/search/useCases.ts";
import { composeDiscordCommands } from "./composition/presentation/discord/commands.ts";
import getBot from "./loaders/bot.ts";
import getOrm from "./loaders/orm.ts";
import { appMikroOrmConfig } from "./mikro-orm.config.ts";
import { handleClientReady } from "./presentation/discord/eventHandlers/clientReady.ts";
import { handleInteractionCreate } from "./presentation/discord/eventHandlers/interactionCreate.ts";
import type { THandleInteractionCreate } from "./presentation/discord/eventHandlers/interactionCreate.types.ts";
import { handleAutocompleteInteraction } from "./presentation/discord/eventHandlers/interactions/autocomplete.ts";
import type { THandleAutocompleteInteraction } from "./presentation/discord/eventHandlers/interactions/autocomplete.types.ts";
import { handleCommandInteraction } from "./presentation/discord/eventHandlers/interactions/command.ts";
import type { THandleCommandInteraction } from "./presentation/discord/eventHandlers/interactions/command.types.ts";
import { handleMessageCreate } from "./presentation/discord/eventHandlers/messageCreate.ts";
import type { THandleMessageCreate } from "./presentation/discord/eventHandlers/messageCreate.types.ts";

const log = debug("index.ts");

const orm = await getOrm(appMikroOrmConfig);
const em = orm.em.fork();

const bot = getBot();

const adminFeature = composeAdminFeature({ em });
const lfgUseCases = composeLfgUseCases(em);
const searchUseCases = await composeSearchUseCases({ em });
const commands = composeDiscordCommands({ adminFeature, lfgUseCases, searchUseCases });

bot.on(Events.ClientReady, handleClientReady);

const messageCreateHandler: THandleMessageCreate = (interaction) =>
    handleMessageCreate({ interaction, resolveSearchInput: searchUseCases.resolveSearchInput });
bot.on(Events.MessageCreate, messageCreateHandler);

const commandInteractionHandler: THandleCommandInteraction = (interaction) =>
    handleCommandInteraction({ commands, interaction });
const autocompleteInteractionHandler: THandleAutocompleteInteraction = (interaction) =>
    handleAutocompleteInteraction({ commands, interaction });
const interactionCreateHandler: THandleInteractionCreate = (interaction) =>
    handleInteractionCreate({
        handleAutocompleteInteraction: autocompleteInteractionHandler,
        handleCommandInteraction: commandInteractionHandler,
        interaction,
    });
bot.on(Events.InteractionCreate, interactionCreateHandler);

// Implicitly use DISCORD_TOKEN
await bot.login();

log("index.ts done!");
