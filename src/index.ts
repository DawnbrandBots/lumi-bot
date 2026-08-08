import type { EntityManager, FilterQuery } from "@mikro-orm/core";
import debug from "debug";
import { ActivityType, Events, userMention } from "discord.js";
import { getAdminCommand } from "./admin/command/handlers.ts";
import { AdminFeature } from "./admin/feature.ts";
import { getCommandAutocompleteHandler, getCommandRunHandler } from "./bot/commands/handlers.ts";
import type { TCommandRegistry } from "./bot/commands/types.ts";
import { DISCORD_BOT_ACTIVITY } from "./bot/constants.ts";
import type { TGetEntityByKindAndId } from "./game/feature.types.ts";
import type { TGetEntityByKindAndId as TGetEntityByKindAndIdInfra } from "./game/infra.types.ts";
import { getHelpCommand } from "./help/command/handlers.ts";
import helpFeature from "./help/feature.ts";
import mapHelpFeatureReturnToMessage from "./help/mapper.ts";
import { getLfgCommand } from "./lfg/command/handlers.ts";
import { LfgFeature } from "./lfg/feature.ts";
import { getLfgManageCommand } from "./lfgManage/command/handlers.ts";
import { getLinksCommand } from "./links/command/handlers.ts";
import getBot from "./loaders/bot.ts";
import type { TAllCommandApiInfo } from "./loaders/commandRuntimeInfo.ts";
import getOrm from "./loaders/orm.ts";
import SEARCH_CONFIGS from "./loaders/searchConfigs.ts";
import getSearchItems from "./loaders/searchItems.ts";
import { appMikroOrmConfig } from "./mikro-orm.config.ts";
import { getSearchCommand } from "./search/command/handlers.ts";
import { FuseSearchEngine } from "./search/engine.ts";
import type { TSearch, TSearchOne } from "./search/feature.types.ts";
import mapSearchFeatureReturnToMessages from "./search/mapper.ts";
import type { ISearchConfigs, TSearchEntity, TSearchKind } from "./search/types.ts";
import isKeyOfExactObject from "./utils/isKeyOfExactObject.ts";

const log = debug("bot");

const orm = await getOrm(appMikroOrmConfig);
const em = orm.em.fork();

const searchItems = await getSearchItems(em);
const searchEngine = new FuseSearchEngine({ items: searchItems });
const bot = getBot();

const adminFeature = new AdminFeature({ em });
const lfgFeature = new LfgFeature({ em });

function getFromEntityManager<Kind extends TSearchKind>({
    em,
    config,
    query,
}: {
    em: EntityManager;
    config: ISearchConfigs[Kind];
    query: FilterQuery<TSearchEntity<Kind>>;
}): Promise<TSearchEntity<Kind> | null> {
    return em.findOne(config.class, query, {
        populate: (config.populate ?? ["*"]) as never,
    });
}

async function searchItemInDb<Kind extends TSearchKind>({
    configs,
    em,
    searchItem,
}: {
    configs: ISearchConfigs;
    em: EntityManager;
    searchItem: { kind: Kind; id: string };
}) {
    // TODO: figure out the correct types here
    const config = configs[searchItem.kind];
    const query = { id: searchItem.id } as FilterQuery<TSearchEntity<Kind>>;
    return getFromEntityManager({ em, config, query });
}

const searchOneInfra: TSearchOne = searchEngine.searchOne.bind(searchEngine);
const searchOne: TSearchOne = searchOneInfra;
const searchInfra: TSearch = (arg) => searchEngine.search(arg.input, arg.limit);
const search: TSearch = searchInfra;

const getEntityByKindAndIdFromDbInfra: TGetEntityByKindAndIdInfra = <Kind extends TSearchKind>(arg: {
    kind: Kind;
    id: string;
}) => searchItemInDb<Kind>({ configs: SEARCH_CONFIGS, em, searchItem: arg });
const getEntityByKindAndId: TGetEntityByKindAndId = getEntityByKindAndIdFromDbInfra;

const commands = {
    admin: getAdminCommand({ adminFeature }),
    search: getSearchCommand({ searchOne, search, getEntityByKindAndId }),
    help: getHelpCommand(),
    links: getLinksCommand(),
    lfg: getLfgCommand({ adminFeature, lfgFeature }),
    "lfg-manage": getLfgManageCommand({ adminFeature, lfgFeature }),
} satisfies TCommandRegistry<TAllCommandApiInfo>;

bot.on(Events.ClientReady, (client) => {
    log(`Logged in as ${bot.user?.tag} - ${bot.user?.id}`);
    client.user.setActivity(DISCORD_BOT_ACTIVITY, { type: ActivityType.Custom });
});

bot.on(Events.MessageCreate, async (interaction) => {
    log(interaction);

    if (interaction.author.bot) {
        return;
    }
    const mentionedUsers = interaction.mentions.parsedUsers;
    if (!mentionedUsers.has(interaction.client.user.id)) {
        return;
    }
    const botMention = userMention(interaction.client.user.id);
    if (interaction.content === botMention) {
        const message = mapHelpFeatureReturnToMessage(helpFeature());
        await interaction.reply(message);
        return;
    }
    const startingBotMentionAndSpaceStr = botMention + " ";
    if (!interaction.content.startsWith(startingBotMentionAndSpaceStr)) {
        return;
    }
    const input = interaction.content.slice(startingBotMentionAndSpaceStr.length);
    const searchItem = await searchOne(input);
    const entity = searchItem ? await getEntityByKindAndId(searchItem) : null;
    const mapperInput: Parameters<typeof mapSearchFeatureReturnToMessages>[0] = searchItem
        ? { entity, searchItem }
        : { entity: null, searchItem: null };
    const { reply, followUps } = mapSearchFeatureReturnToMessages(mapperInput);
    await interaction.reply(reply);
    for (const followUp of followUps ?? []) {
        await interaction.reply(followUp);
    }
});

bot.on(Events.InteractionCreate, async (interaction) => {
    log(interaction);

    if (interaction.isChatInputCommand()) {
        if (!isKeyOfExactObject(commands, interaction.commandName)) {
            // TODO: this should be reported in another PR
            return;
        }
        const command = commands[interaction.commandName];
        const run = getCommandRunHandler(command, interaction);
        if (!run) {
            // TODO: this should be reported in another PR
            return;
        }
        await run(interaction);
        return;
    } else if (interaction.isAutocomplete()) {
        if (!isKeyOfExactObject(commands, interaction.commandName)) {
            // TODO: this should be reported in another PR
            return;
        }
        const command = commands[interaction.commandName];
        const autocomplete = getCommandAutocompleteHandler(command, interaction);
        const choices = await autocomplete?.(interaction);
        if (!choices) {
            // TODO: this should be reported in another PR
            await interaction.respond([]);
            return;
        }
        await interaction.respond(choices);
        return;
    }
});

// Implicitly use DISCORD_TOKEN
await bot.login();
