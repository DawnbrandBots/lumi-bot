import type { EntityManager } from "@mikro-orm/sqlite";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { SEARCH_TERMS_OPTION_NAME } from "../../src/bot/constants.ts";
import type { TCommandAutocomplete } from "../../src/bot/types.ts";
import SEARCH_HANDLERS from "../../src/loaders/searchHandlers.ts";
import getSearchItems from "../../src/loaders/searchItems.ts";
import { getSearchCommand } from "../../src/search/command.ts";
import { AUTOCOMPLETE_RESULTS_LIMIT } from "../../src/search/constants.ts";
import { FuseSearchEngine } from "../../src/search/engine.ts";
import type { ISearchEngine, ISearchItem, TSearchableEntity } from "../../src/search/types.ts";
import { initTestOrm } from "../orm.ts";
import { NO_SEARCH_RESULT_INPUT, SEARCH_RANKING_CASES } from "./constants.ts";

let orm: Awaited<ReturnType<typeof initTestOrm>>;
let em: EntityManager;
type SearchItem = ISearchItem & { kind: TSearchableEntity["kind"] };
let searchEngine: ISearchEngine<SearchItem>;
let autocomplete: TCommandAutocomplete;

beforeAll(async () => {
    orm = await initTestOrm();
    em = orm.em.fork();
    searchEngine = new FuseSearchEngine<SearchItem>({ items: await getSearchItems(em) });

    const searchCommand = getSearchCommand<TSearchableEntity>({ searchEngine, em, handlers: SEARCH_HANDLERS });
    const searchAutocomplete = searchCommand.autocomplete?.[SEARCH_TERMS_OPTION_NAME];
    if (!searchAutocomplete) {
        throw new Error(`No autocomplete registered for "${SEARCH_TERMS_OPTION_NAME}".`);
    }
    autocomplete = searchAutocomplete;
});

afterAll(async () => {
    await orm.close();
});

describe("search autocomplete", () => {
    for (const { expectedName, inputs } of SEARCH_RANKING_CASES) {
        test.each(inputs)(`%s returns ${expectedName} as first choice`, async (input) => {
            expect((await autocomplete(input))[0]).toEqual({ name: expectedName, value: expectedName });
        });
    }

    test("returns an empty array when there is no result", async () => {
        expect(await autocomplete(NO_SEARCH_RESULT_INPUT)).toEqual([]);
    });

    test(`returns at most ${AUTOCOMPLETE_RESULTS_LIMIT} choices mapped from item names`, async () => {
        const choices = await autocomplete("Sword");

        expect(choices.length).toBeLessThanOrEqual(AUTOCOMPLETE_RESULTS_LIMIT);
        expect(choices).toHaveLength(AUTOCOMPLETE_RESULTS_LIMIT);
    });
});
