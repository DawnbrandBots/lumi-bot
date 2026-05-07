import debug from "debug";
import { ActivityType, Client, Colors, EmbedBuilder, Events, GatewayIntentBits } from "discord.js";

import { ICommand } from "./commands/base.js";
import { helpCommand } from "./commands/help.js";
import { getSearchCommand } from "./commands/search.js";


import { MikroORM } from "@mikro-orm/sqlite";


import searchFeature, { createFuse } from "./features/search.ts";
import mikroOrmConfig from './mikro-orm.config.ts';
import { Color, Direction, Disciple, MovementType, Spell, Stat, StatChange, Weapon, WeaponSkill, WeaponType } from "./models.js";
import discipleSearchHandler from "./searchHandlers/disciple.ts";
import spellSearchHandler from "./searchHandlers/spell.ts";
import weaponSearchHandler from "./searchHandlers/weapon.ts";
import weaponSkillSearchHandler from "./searchHandlers/weaponSkill.ts";

const orm = await MikroORM.init(mikroOrmConfig)
const em = orm.em.fork()

// No need to populate entities. We only care about the id, name and kind for the sake of the search.
const weapons = await em.findAll(Weapon)
const disciples = await em.findAll(Disciple)
const weaponSkills = await em.findAll(WeaponSkill)
const spells = await em.findAll(Spell)

await em.findAll(Color)
await em.findAll(Stat)
await em.findAll(StatChange)
await em.findAll(Direction)
await em.findAll(WeaponType)
await em.findAll(MovementType)

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
    const startingBotMentionStr = `<@${bot.user.id}> `
    if (!interaction.content.startsWith(startingBotMentionStr) || interaction.content.length - startingBotMentionStr.length > 32) {
        return
    }
    const input = interaction.content.slice(startingBotMentionStr.length)
    const searchResult = await searchFeature({ em, fuse, handlers, input })
    await interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(Colors.DarkGold)
                .setTitle("Lumi")
                .setDescription(searchResult)
                .setFooter({ text: "Fire Emblem" }),
        ],
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
