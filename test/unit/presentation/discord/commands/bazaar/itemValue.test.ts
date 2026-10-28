import { describe, expect, test } from "vitest";
import { EWeaponVariant } from "../../../../../../src/domain/game/models/weaponVariant.types.ts";
import {
    formatListableItemValue,
    parseListableItemValue,
} from "../../../../../../src/presentation/discord/commands/bazaar/itemValue.ts";

describe("Bazaar item values", () => {
    test.each([
        [{ kind: "weapon", weaponId: "ROYAL_SWORD_PLUS", variant: EWeaponVariant.ATK }, "w:ROYAL_SWORD_PLUS:ATK"],
        [{ kind: "soul", discipleId: "LYN" }, "s:LYN"],
    ] as const)("round-trips $kind", (item, encoded) => {
        expect(formatListableItemValue(item)).toBe(encoded);
        expect(parseListableItemValue(encoded)).toEqual(item);
    });

    test.each(["", "weapon", "w:", "w:weapon:UNKNOWN", "w:weapon:ATK:extra", "s:"])(
        "rejects malformed value %j",
        (value) => {
            expect(parseListableItemValue(value)).toBeNull();
        },
    );
});
