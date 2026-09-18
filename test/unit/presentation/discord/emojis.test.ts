import { describe, expect, test } from "vitest";
import type { TEmoji } from "../../../../src/presentation/discord/emojis.ts";
import { createGetEmoji } from "../../../../src/presentation/discord/emojis.ts";

const EMOJIS = [
    {
        id: "1",
        name: "WEAPON_TYPE_SWORD",
    },
    {
        id: "3",
        name: "MOVEMENT_TYPE_INFANTRY",
    },
] satisfies TEmoji[];

describe(createGetEmoji.name, () => {
    test.each([
        ["weaponType", "SWORD", EMOJIS[0]],
        ["movementType", "INFANTRY", EMOJIS[1]],
        ["weaponType", "UNKNOWN", undefined],
    ] as const)("returns the %s emoji for %s", (kind, id, expected) => {
        expect(createGetEmoji(EMOJIS)(kind, id)).toBe(expected);
    });
});
