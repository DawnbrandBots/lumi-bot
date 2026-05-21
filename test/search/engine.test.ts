import type { EntityManager } from "@mikro-orm/sqlite";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import getSearchItems from "../../src/loaders/searchItems.ts";
import { FuseSearchEngine } from "../../src/search/engine.ts";
import type { ISearchEngine, ISearchItem } from "../../src/search/types.ts";
import { initTestOrm } from "../orm.ts";
import { NO_SEARCH_RESULT_INPUT, SEARCH_RANKING_CASES } from "./constants.ts";

let orm: Awaited<ReturnType<typeof initTestOrm>>;
let em: EntityManager;
let searchEngine: ISearchEngine<ISearchItem>;

beforeAll(async () => {
    orm = await initTestOrm();
    em = orm.em.fork();
    searchEngine = new FuseSearchEngine<ISearchItem>({ items: await getSearchItems(em) });
});

afterAll(async () => {
    await orm.close();
});

describe(FuseSearchEngine.name, () => {
    describe(FuseSearchEngine.prototype.searchOne.name, () => {
        for (const { expectedId, expectedName, inputs } of SEARCH_RANKING_CASES) {
            test.each(inputs)(`%s returns ${expectedName}`, (input) => {
                expect(searchEngine.searchOne(input)?.id).toBe(expectedId);
            });
        }

        test("returns undefined when there is no result", () => {
            expect(searchEngine.searchOne(NO_SEARCH_RESULT_INPUT)).toBeUndefined();
        });
    });

    describe(FuseSearchEngine.prototype.search.name, () => {
        for (const { expectedId, expectedName, inputs } of SEARCH_RANKING_CASES) {
            test.each(inputs)(`%s returns ${expectedName} as first result`, (input) => {
                expect(searchEngine.search(input)[0]?.id).toBe(expectedId);
            });
        }

        test("returns an empty array when there is no result", () => {
            expect(searchEngine.search(NO_SEARCH_RESULT_INPUT)).toEqual([]);
        });

        test('results for "Royal" include Royal Sword, Royal Sword + and Royal Scion', () => {
            const results = searchEngine.search("Royal");
            const resultIds = results.map((result) => result.id);
            expect(resultIds).toEqual(expect.arrayContaining(["ROYAL_SWORD", "ROYAL_SWORD_PLUS", "ROYAL_SCION"]));
        });

        test(`search limit works`, () => {
            // Arbitrary number smaller than the total number of weapons with "Sword" in their name.
            const limit = 3;
            const results = searchEngine.search("Sword", limit);
            expect(results.length).toBe(limit);
        });
    });
});
