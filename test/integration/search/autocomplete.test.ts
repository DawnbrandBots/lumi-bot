import type { EntityManager } from "@mikro-orm/sqlite";
import type { AutocompleteInteraction, CacheType } from "discord.js";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import type { TSearchIndexEntry } from "../../../src/domain/search/types.ts";
import type { ISearchEngine } from "../../../src/infrastructure/search/engine.ts";
import { FuseSearchEngine } from "../../../src/infrastructure/search/engine.ts";
import getSearchItems from "../../../src/loaders/searchItems.ts";
import { getSearchAutocomplete } from "../../../src/presentation/discord/autocomplete/search.ts";
import { SEARCH_TERMS_OPTION_NAME } from "../../../src/presentation/discord/commands/search/constants.ts";
import { initTestGameOrm } from "../../utils/orm.ts";
import { NO_SEARCH_RESULT_INPUT, SEARCH_RANKING_CASES, SEARCH_RANKING_KNOWN_FAILURE_CASES } from "./constants.ts";

let orm: Awaited<ReturnType<typeof initTestGameOrm>>;
let em: EntityManager;
let searchEngine: ISearchEngine<TSearchIndexEntry>;
let searchAutocomplete: ReturnType<typeof getSearchAutocomplete>;
const SEARCH_AUTOCOMPLETE_RESULTS_LIMIT = 5;

function getMockAutocompleteInteraction(input: string, optionName: string) {
    return {
        options: {
            getFocused: (full: boolean) => (full ? { name: optionName, value: input } : input),
        },
    } as unknown as AutocompleteInteraction<CacheType>;
}

beforeAll(async () => {
    orm = await initTestGameOrm();
    em = orm.em.fork();
    searchEngine = new FuseSearchEngine<TSearchIndexEntry>({ items: await getSearchItems(em) });
    searchAutocomplete = getSearchAutocomplete({
        getSearchIndexEntries: (arg) => searchEngine.search(arg.input, arg.limit),
    });
});

afterAll(async () => {
    await orm.close();
});

describe("search autocomplete", () => {
    for (const { expectedName, inputs } of SEARCH_RANKING_CASES) {
        test.each(inputs)(`%s returns ${expectedName} as first choice`, async (input) => {
            expect(
                (
                    await searchAutocomplete[SEARCH_TERMS_OPTION_NAME](
                        getMockAutocompleteInteraction(input, SEARCH_TERMS_OPTION_NAME),
                    )
                )[0],
            ).toEqual({
                name: expectedName,
                value: expectedName,
            });
        });
    }

    for (const { expectedName, inputs } of SEARCH_RANKING_KNOWN_FAILURE_CASES) {
        test.fails.each(inputs)(`%s returns ${expectedName} as first choice`, async (input) => {
            expect(
                (
                    await searchAutocomplete[SEARCH_TERMS_OPTION_NAME](
                        getMockAutocompleteInteraction(input, SEARCH_TERMS_OPTION_NAME),
                    )
                )[0],
            ).toEqual({
                name: expectedName,
                value: expectedName,
            });
        });
    }

    test("returns an empty array on empty input", async () => {
        expect(
            await searchAutocomplete[SEARCH_TERMS_OPTION_NAME](
                getMockAutocompleteInteraction("", SEARCH_TERMS_OPTION_NAME),
            ),
        ).toEqual([]);
    });

    test("returns an empty array when there is no result", async () => {
        expect(
            await searchAutocomplete[SEARCH_TERMS_OPTION_NAME](
                getMockAutocompleteInteraction(NO_SEARCH_RESULT_INPUT, SEARCH_TERMS_OPTION_NAME),
            ),
        ).toEqual([]);
    });

    test(`returns at most ${SEARCH_AUTOCOMPLETE_RESULTS_LIMIT} choices mapped from item names`, async () => {
        const choices = await searchAutocomplete[SEARCH_TERMS_OPTION_NAME](
            getMockAutocompleteInteraction("Sword", SEARCH_TERMS_OPTION_NAME),
        );

        expect(choices).toHaveLength(SEARCH_AUTOCOMPLETE_RESULTS_LIMIT);
    });
});
