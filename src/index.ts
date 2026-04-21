import debug from "debug";
import { ActivityType, Client, Colors, EmbedBuilder, Events, GatewayIntentBits } from "discord.js";

import colorDtos from "../data/colors.json" with { type: "json" };
import weaponTypeDtos from "../data/weaponTypes.json" with { type: "json" };
import weaponDtos from "../json/weapon/weapons.json" with { type: "json" };

import initData from "./data/init.js";
import { searchTermsOptionName, searchCommandName } from "./commands/search.js";
import { createFuse, search } from "./search/search.js";
import z from "zod";
import { color, weapon, weaponType } from "./search/validate.js";

const validatedColorDtos = z.array(color).parse(colorDtos)
const validatedWeaponTypeDtos = z.array(weaponType).parse(weaponTypeDtos)
const validatedWeaponDtos = z.array(weapon).parse(weaponDtos)

const { weapons } = initData({
    colorDtos: validatedColorDtos,
    weaponTypeDtos: validatedWeaponTypeDtos,
    weaponDtos: validatedWeaponDtos
});
const fuse = createFuse({ items: weapons })

const log = debug("bot");

const bot = new Client({ intents: [GatewayIntentBits.Guilds] });

bot.on(Events.ClientReady, () => {
    log(`Logged in as ${bot.user?.tag} - ${bot.user?.id}`);
    bot.user?.setActivity("Umbra serves the shadow", { type: ActivityType.Custom });
});

bot.on(Events.InteractionCreate, async (interaction) => {
    log(interaction);
    if (!interaction.isChatInputCommand()) {
        return;
    }
    if (interaction.commandName === searchCommandName) {
        const input = interaction.options.getString(searchTermsOptionName)
        if (!input) {
            throw new Error(`No value provided for "${searchTermsOptionName}" option.`)
        }
        const result = search({ fuse, search: input });
        const message = (() => {
            if (!result.success) {
                return result.msg
            }
            const value = result.value
            if (value.kind === "weapon") {
                return `**${value.name}** is a level ${value.level} ${value.type.name}.`
            } else {
                throw new Error(`Unhandled value kind for search.`)
            }
        })();
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.DarkGold)
                    .setTitle("Lumi")
                    .setDescription(message)
                    .setFooter({ text: "Fire Emblem" }),
            ],
        });
    } else {
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.DarkGold)
                    .setTitle("Lumi")
                    .setDescription("Umbra serves the shadow")
                    .setFooter({ text: "Fire Emblem" }),
            ],
        });
    }
});

// Implicitly use DISCORD_TOKEN
await bot.login();
