import type { APIEmbed, BaseMessageOptions } from "discord.js";
import { SEARCH_MAX_INPUT_LENGTH } from "../../../application/search/constants.ts";
import type { TSearchSuccessValue } from "../../../application/search/types.ts";
import { ESearchResultKind } from "../../../application/search/types.ts";
import type { TResolveSearchInput } from "../../../application/search/useCases.types.ts";
import type { TSearchEntity, TSearchKind } from "../../../domain/search/types.ts";
import { createErrorMessage, createNegativeMessage, createPositiveMessage } from "../message.ts";
import type { ISingleEmbedMessageOptions } from "../message.types.ts";
import mapDiscipleToMessage from "./search/disciple.ts";
import mapMusicToMessage from "./search/music.ts";
import mapSpellToMessage from "./search/spell.ts";
import mapWeaponToMessage from "./search/weapon.ts";
import mapWeaponSkillToMessage from "./search/weaponSkill.ts";

export type TSearchMapperReturnType = { reply: ISingleEmbedMessageOptions; followUps?: BaseMessageOptions[] };
export type ISearchMapper<Kind extends TSearchKind> = (entity: TSearchEntity<Kind>) => TSearchMapperReturnType;
export type ISearchMappers = { [Kind in TSearchKind]: ISearchMapper<Kind> };

const SEARCH_MAPPERS: ISearchMappers = {
    disciple: mapDiscipleToMessage,
    weapon: mapWeaponToMessage,
    weaponSkill: mapWeaponSkillToMessage,
    spell: mapSpellToMessage,
    music: mapMusicToMessage,
};

export function mapSearchSuccessValueToMessages<Kind extends TSearchKind>(value: TSearchSuccessValue<Kind>) {
    const footer: APIEmbed["footer"] =
        // Showing aliases when there is only one is redundant.
        value.searchItem.aliases.length > 1
            ? {
                  text: `Search aliases: ${value.searchItem.aliases.join(", ")}`,
              }
            : undefined;

    const {
        reply: { embed, ...otherReplyProps },
        followUps,
    } = SEARCH_MAPPERS[value.kind](value.entity);
    return { reply: { embed: { ...embed, footer }, ...otherReplyProps }, followUps };
}

function mapSearchResultToMessages(result: Awaited<ReturnType<TResolveSearchInput>>) {
    switch (result.kind) {
        case ESearchResultKind.SUCCESS: {
            const { reply, followUps } = mapSearchSuccessValueToMessages(result.value);
            return { reply: createPositiveMessage(reply), followUps };
        }
        case ESearchResultKind.INPUT_TOO_LONG:
            return {
                reply: createNegativeMessage({
                    embed: {
                        description: `Input too long. Maximum is ${SEARCH_MAX_INPUT_LENGTH} characters.`,
                    },
                }),
            };
        case ESearchResultKind.NO_RESULT:
            return {
                reply: createNegativeMessage({
                    embed: {
                        description: "Search yielded no result",
                    },
                }),
            };
        case ESearchResultKind.FOUND_BY_ENGINE_BUT_NOT_BY_DB:
            return {
                reply: createErrorMessage({
                    embed: {
                        description: "Result found in search engine but not in database",
                        fields: [
                            { name: "Entity kind", value: result.value.kind, inline: true },
                            { name: "Id", value: result.value.id, inline: true },
                        ],
                    },
                }),
            };
    }
}

export default mapSearchResultToMessages;
