import type { APIEmbed, BaseMessageOptions } from "discord.js";
import { createErrorMessage, createNegativeMessage, createPositiveMessage } from "../bot/message.ts";
import type { ISingleEmbedMessageOptions } from "../bot/types.ts";
import {
    SEARCH_ALIASES_FOOTER_PREFIX,
    SEARCH_ENTITY_KIND_FIELD_NAME,
    SEARCH_ID_FIELD_NAME,
    SEARCH_INPUT_TITLE,
    SEARCH_MISSING_DATABASE_RESULT_TITLE,
    SEARCH_YIELDED_NO_RESULT_DESCRIPTION,
} from "./constants.ts";
import mapDiscipleToMessage from "./mappers/disciple.ts";
import mapMusicToMessage from "./mappers/music.ts";
import mapSpellToMessage from "./mappers/spell.ts";
import mapWeaponToMessage from "./mappers/weapon.ts";
import mapWeaponSkillToMessage from "./mappers/weaponSkill.ts";
import type { TSearchEntity, TSearchItem } from "./types.ts";
import { type TSearchFeatureSuccessValue, type TSearchKind } from "./types.ts";

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

export function mapSearchFeatureSuccessValueToMessages<Kind extends TSearchKind>(
    value: TSearchFeatureSuccessValue<Kind>,
) {
    const footer: APIEmbed["footer"] =
        // Showing aliases when there is only one is redundant.
        value.searchItem.aliases.length > 1
            ? {
                  text: `${SEARCH_ALIASES_FOOTER_PREFIX} ${value.searchItem.aliases.join(", ")}`,
              }
            : undefined;

    const {
        reply: { embed, ...otherReplyProps },
        followUps,
    } = SEARCH_MAPPERS[value.kind](value.entity);
    return { reply: { embed: { ...embed, footer }, ...otherReplyProps }, followUps };
}

function mapSearchFeatureReturnToMessages(
    arg:
        | { entity: TSearchEntity<TSearchKind> | null; searchItem: TSearchItem }
        | {
              entity: null;
              searchItem: null;
          },
) {
    if (arg.entity) {
        const { reply, followUps } = mapSearchFeatureSuccessValueToMessages({
            entity: arg.entity,
            searchItem: arg.searchItem,
            kind: arg.searchItem.kind,
        });
        return { reply: createPositiveMessage(reply), followUps };
    } else if (!arg.searchItem) {
        // TODO: duplicated
        return {
            reply: createNegativeMessage({
                embed: {
                    title: SEARCH_INPUT_TITLE,
                    description: SEARCH_YIELDED_NO_RESULT_DESCRIPTION,
                },
            }),
        };
    } else {
        return {
            reply: createErrorMessage({
                embed: {
                    title: SEARCH_MISSING_DATABASE_RESULT_TITLE,
                    fields: [
                        { name: SEARCH_ENTITY_KIND_FIELD_NAME, value: arg.searchItem.kind, inline: true },
                        { name: SEARCH_ID_FIELD_NAME, value: arg.searchItem.id, inline: true },
                    ],
                },
            }),
        };
    }
}

export default mapSearchFeatureReturnToMessages;
