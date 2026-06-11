import type { EntityManager } from "@mikro-orm/sqlite";
import type { AutocompleteInteraction, CacheType } from "discord.js";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import {
    BAZAAR_ALLOWED_WEAPON_LEVELS,
    BAZAAR_AUTOCOMPLETE_RESULTS_LIMIT,
    BAZAAR_ITEM_OPTION_NAME,
} from "../../src/bazaar/constants.ts";
import { getBazaarCommand } from "../../src/bazaar/command.ts";
import { BazaarFeature } from "../../src/bazaar/feature.ts";
import { Weapon } from "../../src/game/models/weapon.ts";
import getBazaarSearchItems from "../../src/loaders/bazaarSearchItems.ts";
import { FuseSearchEngine } from "../../src/search/engine.ts";
import type { ISearchEngine, ISearchItem } from "../../src/search/types.ts";
import { initTestGameOrm, initTestLumiOrm } from "../orm.ts";

let gameOrm: Awaited<ReturnType<typeof initTestGameOrm>>;
let lumiOrm: Awaited<ReturnType<typeof initTestLumiOrm>>;
let gameEm: EntityManager;
let searchEngine: ISearchEngine<ISearchItem & { kind: "weapon" }>;
let bazaarCommand: ReturnType<typeof getBazaarCommand>;

function getMockAutocompleteInteraction(input: string, optionName: string) {
    return {
        options: {
            getFocused: (full: boolean) => (full ? { name: optionName, value: input } : input),
        },
    } as unknown as AutocompleteInteraction<CacheType>;
}

beforeAll(async () => {
    gameOrm = await initTestGameOrm();
    lumiOrm = await initTestLumiOrm();
    gameEm = gameOrm.em.fork();
    const searchItems = await getBazaarSearchItems(gameEm);
    searchEngine = new FuseSearchEngine({ items: searchItems });
    bazaarCommand = getBazaarCommand({
        bazaarFeature: new BazaarFeature({ em: lumiOrm.em.fork(), gameEm }),
        gameEm,
        weaponSearchEngine: searchEngine,
    });
});

afterAll(async () => {
    await gameOrm.close();
    await lumiOrm.close(true);
});

describe("bazaar autocomplete", () => {
    test("returns only weapons allowed in Bazaar", async () => {
        const searchItems = await getBazaarSearchItems(gameEm);

        expect(searchItems.length).toBeGreaterThan(0);
        for (const item of searchItems) {
            const weapon = await gameEm.findOneOrFail(Weapon, { id: item.id });
            expect(BAZAAR_ALLOWED_WEAPON_LEVELS).toContain(weapon.level);
        }
    });

    test("maps weapon names to autocomplete choices", async () => {
        const choices = await bazaarCommand.autocomplete?.(
            getMockAutocompleteInteraction("Royal Sword", BAZAAR_ITEM_OPTION_NAME),
        );

        expect(choices?.[0]).toEqual({ name: "Royal Sword", value: "Royal Sword" });
    });

    test(`returns at most ${BAZAAR_AUTOCOMPLETE_RESULTS_LIMIT} choices`, async () => {
        const choices = await bazaarCommand.autocomplete?.(
            getMockAutocompleteInteraction("Sword", BAZAAR_ITEM_OPTION_NAME),
        );

        expect(choices?.length).toBeLessThanOrEqual(BAZAAR_AUTOCOMPLETE_RESULTS_LIMIT);
    });
});
