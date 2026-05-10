import debug from "debug";
import { ActivityType, Client, Events, GatewayIntentBits } from "discord.js";

import { ICommand } from "./commands/base.js";
import { helpCommand } from "./commands/help.js";
import { getSearchCommand } from "./commands/search.js";

import { MikroORM } from "@mikro-orm/sqlite";

import helpFeature from "./features/help.ts";
import searchFeature, { createFuse } from "./features/search.ts";
import mikroOrmConfig from './mikro-orm.config.ts';
import { Disciple } from "./models/game/classes/disciple.ts";
import { Spell } from "./models/game/classes/spell.ts";
import { Weapon } from "./models/game/classes/weapon.ts";
import { WeaponSkill } from "./models/game/classes/weaponSkill.ts";
import discipleSearchHandler from "./searchHandlers/disciple.ts";
import spellSearchHandler from "./searchHandlers/spell.ts";
import weaponSearchHandler from "./searchHandlers/weapon.ts";
import weaponSkillSearchHandler from "./searchHandlers/weaponSkill.ts";

const orm = await MikroORM.init(mikroOrmConfig)
const em = orm.em.fork()

// No need to populate entities. We only care about the id, name and kind for the sake of the search.
const weapons: Weapon[] = await em.findAll(Weapon)
const disciples: Disciple[] = await em.findAll(Disciple)
const weaponSkills: WeaponSkill[] = await em.findAll(WeaponSkill)
const spells: Spell[] = await em.findAll(Spell)

const fuseItems = [...weapons, ...disciples, ...weaponSkills, ...spells]
const fuse = createFuse({ items: fuseItems })

const log = debug("bot");

const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });

bot.on(Events.ClientReady, () => {
    log(`Logged in as ${bot.user?.tag} - ${bot.user?.id}`);
    bot.user?.setActivity("Umbra serves the shadow", { type: ActivityType.Custom });
});

const handlers = {
    "disciple": discipleSearchHandler,
    "weapon": weaponSearchHandler,
    "weaponSkill": weaponSkillSearchHandler,
    "spell": spellSearchHandler
} as const

const commands: Record<string, ICommand> = {
    search: getSearchCommand({ fuse, em, handlers }),
    help: helpCommand
}

bot.on(Events.MessageCreate, async interaction => {
    log(interaction)

    if (interaction.author.bot) {
        return
    }
    const mentionedUsers = interaction.mentions.parsedUsers
    if (!bot.user) {
        throw new Error("Bot should have a user property when monitoring messages")
    }
    if (!mentionedUsers.has(bot.user.id)) {
        return
    }
    const startingBotMentionStr = `<@${bot.user.id}>`
    if (interaction.content === startingBotMentionStr) {
        const help = helpFeature()
        await interaction.reply({ embeds: [help] })
        return
    }
    const startingBotMentionAndSpaceStr = startingBotMentionStr + " "
    if (!interaction.content.startsWith(startingBotMentionAndSpaceStr)) {
        return
    }
    const input = interaction.content.slice(startingBotMentionAndSpaceStr.length)
    const embed = await searchFeature({ em, fuse, handlers, input })
    await interaction.reply({
        embeds: [embed],
    })
})

bot.on(Events.InteractionCreate, async (interaction) => {
    log(interaction);

    if (!interaction.isChatInputCommand()) {
        return;
    }

    const command = commands[interaction.commandName] || helpCommand
    await command.run(interaction)
});

// Implicitly use DISCORD_TOKEN
await bot.login();
