import { CacheType, ChatInputCommandInteraction, Colors, EmbedBuilder } from "discord.js";
import Fuse from "fuse.js";
import { SEARCH_TERMS_OPTION_NAME, searchCommandInfo } from "../commandInfo/search.js";
import { search, SearchItem } from "../search/search.js";
import { Command } from "./base.js";

export function getSearchCommand({ fuse }: { fuse: Fuse<SearchItem> }) {
    return new Command({
        info: searchCommandInfo,
        run: function (interaction: ChatInputCommandInteraction<CacheType>) {
            const input = interaction.options.getString(SEARCH_TERMS_OPTION_NAME)
            if (!input) {
                throw new Error(`No value provided for "${SEARCH_TERMS_OPTION_NAME}" option.`)
            }
            const result = search({ fuse: fuse, search: input });
            const message = (() => {
                if (!result.success) {
                    return result.msg
                }
                const value = result.value
                if (value.kind === "disciple") {
                    return `**${value.name}** is a ${value.weaponType.name}-wielding ${value.movementType.name}`
                } else if (value.kind === "weapon") {
                    return `**${value.name}** is a level ${value.level} ${value.weaponType.name}.`
                } else {
                    throw new Error(`Unhandled value kind for search.`)
                }
            })();
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.DarkGold)
                        .setTitle("Lumi")
                        .setDescription(message)
                        .setFooter({ text: "Fire Emblem" }),
                ],
            })
        }
    })
}
