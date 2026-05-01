import { EntityManager } from "@mikro-orm/sqlite";
import { CacheType, ChatInputCommandInteraction, Colors, EmbedBuilder } from "discord.js";
import Fuse from "fuse.js";
import { SEARCH_TERMS_OPTION_NAME, searchCommandInfo } from "../commandInfo/search.js";
import { _ISearchItem, search } from "../search/search.js";
import { Command } from "./base.js";

export function getSearchCommand<SearchItemKind extends string, SearchHandlers extends { [K in SearchItemKind]: { class: (new () => _ISearchItem<K>) & Parameters<EntityManager["findOne"]>[0], response: (entity: InstanceType<SearchHandlers[K]["class"]>) => string } }>({ fuse, em, handlers }: { fuse: Fuse<_ISearchItem<SearchItemKind>>, em: EntityManager, handlers: SearchHandlers }) {
    return new Command({
        info: searchCommandInfo,
        run: async function (interaction: ChatInputCommandInteraction<CacheType>) {
            const input = interaction.options.getString(SEARCH_TERMS_OPTION_NAME)
            if (!input) {
                throw new Error(`No value provided for "${SEARCH_TERMS_OPTION_NAME}" option.`)
            }
            const result = search<SearchItemKind>({ fuse: fuse, search: input });
            const message = await (async () => {
                if (!result.success) {
                    return result.msg
                }
                const value = result.value
                const handler = handlers[value.kind]
                const entity = await em.findOne(handler.class, { id: result.value.id }, { populate: ["*"] })
                if (!entity) {
                    throw new Error(`Entity of kind ${value.kind} id ${value.id} not found.`)
                }
                const response = handler.response(entity)
                return response
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
