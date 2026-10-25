import { describe, expect, test } from "vitest";
import { EListingSide } from "../../../../../../src/domain/bazaar/models/listing.types.ts";
import { EWeaponVariant } from "../../../../../../src/domain/game/models/weaponVariant.types.ts";
import {
    formatBazaarListPageValue,
    parseBazaarListPageValue,
} from "../../../../../../src/presentation/discord/commands/bazaar/listPageValue.ts";

describe("Bazaar list page values", () => {
    test("round-trips pagination state while deriving the guild from the interaction", () => {
        const state = {
            filter: {
                guildId: "original-guild",
                ownerId: "owner-1",
                side: EListingSide.PURCHASE,
                item: { kind: "weapon", weaponId: "weapon-1", variant: EWeaponVariant.HP },
            },
            page: 2,
        } as const;

        expect(parseBazaarListPageValue(formatBazaarListPageValue(state), "interaction-guild")).toEqual({
            ...state,
            filter: { ...state.filter, guildId: "interaction-guild" },
        });
    });

    test.each(["unrelated", "bazaar-list:|SALE|||invalid", "bazaar-list:|UNKNOWN|||0", "bazaar-list:|SALE||bad|0"])(
        "rejects malformed value %j",
        (value) => {
            expect(parseBazaarListPageValue(value, "guild-1")).toBeNull();
        },
    );
});
