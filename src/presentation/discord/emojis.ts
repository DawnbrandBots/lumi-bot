import type { APIApplicationEmoji } from "discord.js";
import { indexByKey } from "../../utils/indexById.ts";

const KIND_TO_NAME_PREFIX = {
    weaponType: "WEAPON_TYPE",
    movementType: "MOVEMENT_TYPE",
} as const;

export type TEmojiEntityKind = keyof typeof KIND_TO_NAME_PREFIX;

export type TEmoji = Pick<APIApplicationEmoji, "id" | "name">;

export type TGetEmoji = (kind: TEmojiEntityKind, id: string) => TEmoji | undefined;

function getEmojiName(kind: TEmojiEntityKind, id: string) {
    return `${KIND_TO_NAME_PREFIX[kind]}_${id}`;
}

export function createGetEmoji(emojis: ReadonlyArray<TEmoji>): TGetEmoji {
    const emojisByName = indexByKey(emojis, "name");

    return (kind, id) => emojisByName[getEmojiName(kind, id)];
}
