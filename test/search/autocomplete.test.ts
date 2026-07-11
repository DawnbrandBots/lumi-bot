import type { EntityManager } from "@mikro-orm/sqlite";
import type { AutocompleteInteraction, CacheType } from "discord.js";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { SEARCH_TERMS_OPTION_NAME } from "../../src/bot/constants.ts";
import SEARCH_HANDLERS from "../../src/loaders/searchHandlers.ts";
import getSearchItems from "../../src/loaders/searchItems.ts";
import { getSearchCommand } from "../../src/search/command.ts";
import { SEARCH_AUTOCOMPLETE_RESULTS_LIMIT } from "../../src/search/constants.ts";
import { FuseSearchEngine } from "../../src/search/engine.ts";
import type { ISearchEngine, ISearchItem, TSearchableEntity } from "../../src/search/types.ts";
import { initTestGameOrm } from "../orm.ts";
import { NO_SEARCH_RESULT_INPUT, SEARCH_RANKING_CASES } from "./constants.ts";

let orm: Awaited<ReturnType<typeof initTestGameOrm>>;
let em: EntityManager;
type SearchItem = ISearchItem & { kind: TSearchableEntity["kind"] };
let searchEngine: ISearchEngine<SearchItem>;
let searchCommand: ReturnType<typeof getSearchCommand<TSearchableEntity>>;

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
    searchEngine = new FuseSearchEngine<SearchItem>({ items: await getSearchItems(em) });
    searchCommand = getSearchCommand<TSearchableEntity>({ searchEngine, em, handlers: SEARCH_HANDLERS });
});

afterAll(async () => {
    await orm.close();
});

describe("search autocomplete", () => {
    for (const { expectedName, inputs } of SEARCH_RANKING_CASES) {
        test.each(inputs)(`%s returns ${expectedName} as first choice`, async (input) => {
            expect(
                (
                    await searchCommand.autocomplete?.(getMockAutocompleteInteraction(input, SEARCH_TERMS_OPTION_NAME))
                )?.[0],
            ).toEqual({
                name: expectedName,
                value: expectedName,
            });
        });
    }

    test("returns an empty array when there is no result", async () => {
        expect(
            await searchCommand.autocomplete?.(
                getMockAutocompleteInteraction(NO_SEARCH_RESULT_INPUT, SEARCH_TERMS_OPTION_NAME),
            ),
        ).toEqual([]);
    });

    test(`returns at most ${SEARCH_AUTOCOMPLETE_RESULTS_LIMIT} choices mapped from item names`, async () => {
        const choices = await searchCommand.autocomplete?.(
            getMockAutocompleteInteraction("Sword", SEARCH_TERMS_OPTION_NAME),
        );

        expect(choices).toHaveLength(SEARCH_AUTOCOMPLETE_RESULTS_LIMIT);
    });
});
