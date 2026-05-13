import type { EntityManager } from "@mikro-orm/core";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import type { ISearchItem } from "../src/features/search.ts";
import getSearchables from "../src/loaders/searchables.ts";
import { FuseSearchEngine, type ISearchEngine } from "../src/loaders/searchEngine.ts";
import { initTestOrm } from "./orm.ts";

let orm: Awaited<ReturnType<typeof initTestOrm>>;
let em: EntityManager;
let searchEngine: ISearchEngine<ISearchItem>;

beforeAll(async () => {
    orm = await initTestOrm();
    em = orm.em.fork();
    searchEngine = new FuseSearchEngine<ISearchItem>({ items: await getSearchables(em) });
});

afterAll(async () => {
    await orm.close();
});

describe(FuseSearchEngine.name, () => {
    // Searching for something, even with upper/lowercase and/or typos, missing vowels, as long as characters are not
    // too different between input and the thing's name, should return that thing still.
    test.each(["Royal Sword", "Sword Royal", "royalsword", "ROYAL SWORD"])("%s returns Royal Sword", (input) => {
        expect(searchEngine.searchOne(input)?.id).toBe("ROYAL_SWORD");
    });

    // "+" in names could not weight enough to appear first in results,
    // so the implementation should handle them specially.
    test.each(["Royal Sword +", "Sword + Royal", "royalsword+", "ROYAL SWORD +", "Royal +", "Royal Sword Plus"])(
        "%s returns Royal Sword +",
        (input) => {
            expect(searchEngine.searchOne(input)?.id).toBe("ROYAL_SWORD_PLUS");
        },
    );

    // Spell names can include + as well.
    // Spells can also be searched by acronym.
    test.each(["Thunder Shield Break + Cavalry", "TSB+", "TSB+C", "TSBPC", "tsbpc"])(
        "%s returns Thunder Shield Break + Cavalry",
        (input) => {
            expect(searchEngine.searchOne(input)?.id).toBe("THUNDER_SHIELD_BREAK_PLUS_CAVALRY");
        },
    );

    // There used to be a bug where weapons with level < 6 would not be retrieved by the DB,
    // therefore ensure that simply retrieving one weapon per level works.
    test.each([
        ["Basic Claws", "BASIC_CLAWS"],
        ["Iron Axe", "IRON_AXE"],
        ["Kadomatsu Sword", "KADOMATSU_SWORD"],
        ["Carved Axe", "CARVED_AXE"],
        ["Mochi Stone", "MOCHI_STONE"],
        ["Aerial Lance", "AERIAL_LANCE"],
        ["Aerial Lance +", "AERIAL_LANCE_PLUS"],
    ])("finds exact weapon name %s", (input, expectedId) => {
        expect(searchEngine.searchOne(input)?.id).toBe(expectedId);
    });
});
