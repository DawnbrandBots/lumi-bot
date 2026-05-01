import { CacheType, ChatInputCommandInteraction, Colors, EmbedBuilder } from "discord.js";
import Fuse from "fuse.js";
import { SEARCH_TERMS_OPTION_NAME, searchCommandInfo } from "../commandInfo/search.js";
import { DISCIPLE_MAX_LEVEL, DISCIPLE_MINIMUM_RELEVANT_LEVEL } from "../constants.ts";
import { search, SearchItem } from "../search/search.js";
import { toAsciiTable } from "../utils/table.ts";
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
                    // TODO: adding at least a thumbnail with the character's face would be nice
                    const columnCountAsideFromHeaderAndLevel1 = DISCIPLE_MAX_LEVEL - DISCIPLE_MINIMUM_RELEVANT_LEVEL + 1
                    const baseStatsTable = [
                        ["Level", 1, ...Array.from({ length: columnCountAsideFromHeaderAndLevel1 }, (_, i) => i + DISCIPLE_MINIMUM_RELEVANT_LEVEL)],
                        ["HP", value.getHp({ level: 1 }), ...Array.from({ length: columnCountAsideFromHeaderAndLevel1 }, (_, i) => value.getHp({ level: i + DISCIPLE_MINIMUM_RELEVANT_LEVEL }))],
                        ["Atk", value.getAtk({ level: 1 }), ...Array.from({ length: columnCountAsideFromHeaderAndLevel1 }, (_, i) => value.getAtk({ level: i + DISCIPLE_MINIMUM_RELEVANT_LEVEL }))],
                    ]
                    const baseStatsTableAscii = toAsciiTable({ data: baseStatsTable, cellPadding: 3 })
                    return `**${value.name}** is a ${value.weaponType.name}-wielding ${value.movementType.name} disciple.\n\`\`\`\n${baseStatsTableAscii}\n\`\`\``
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
