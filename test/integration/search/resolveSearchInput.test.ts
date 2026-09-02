import type { EntityManager } from "@mikro-orm/sqlite";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { SEARCH_MAX_INPUT_LENGTH } from "../../../src/application/search/constants.ts";
import type { TSearchQueries } from "../../../src/application/search/queries.types.ts";
import { ESearchResultKind } from "../../../src/application/search/types.ts";
import type { TSearchUseCaseDependencies } from "../../../src/application/search/useCases.types.ts";
import { resolveSearchInput } from "../../../src/application/search/useCases/resolveSearchInput.ts";
import { composeQueries } from "../../../src/composition/infrastructure/queries.ts";
import { createSearchEngine } from "../../../src/composition/infrastructure/search.ts";
import type { TSearchIndexEntry } from "../../../src/domain/search/types.ts";
import { getGameDataEntityForSearchResult } from "../../../src/infrastructure/persistence/mikroOrm/queries/getGameDataEntityForSearchResult.ts";
import type { ISearchEngine } from "../../../src/infrastructure/search/types.ts";
import { initTestGameOrm } from "../../utils/orm.ts";
import { NO_SEARCH_RESULT_INPUT } from "./constants.ts";

let orm: Awaited<ReturnType<typeof initTestGameOrm>>;
let em: EntityManager;
let searchEngine: ISearchEngine<TSearchIndexEntry>;

function getSearchQueries(arg: {
    readonly getBestSearchIndexEntry?: TSearchQueries["getBestSearchIndexEntry"];
    readonly getEntityByKindAndId?: TSearchQueries["getEntityByKindAndId"];
}): TSearchUseCaseDependencies {
    const applicationQueries = composeQueries({ em, searchEngine });
    const searchQueries: TSearchQueries = {
        getBestSearchIndexEntry: arg.getBestSearchIndexEntry ?? applicationQueries.search.getBestSearchIndexEntry,
        getEntityByKindAndId: arg.getEntityByKindAndId ?? applicationQueries.search.getEntityByKindAndId,
        getSearchIndexEntries: applicationQueries.search.getSearchIndexEntries,
    };

    return {
        queries: { ...applicationQueries, search: searchQueries },
    };
}

beforeAll(async () => {
    orm = await initTestGameOrm();
    em = orm.em.fork();
    searchEngine = await createSearchEngine({ em });
});

afterAll(async () => {
    await orm.close();
});

describe(resolveSearchInput.name, () => {
    test("no result", async () => {
        const result = await resolveSearchInput(getSearchQueries({}), NO_SEARCH_RESULT_INPUT);

        expect(result).toEqual({
            kind: ESearchResultKind.NO_RESULT,
        });
    });

    test("missing from database", async () => {
        const missingSearchItem: TSearchIndexEntry = {
            id: "MISSING_ID",
            kind: "weapon",
            name: "Missing Weapon",
            aliases: ["Missing Weapon"],
        };
        const mockedSearchEngine: ISearchEngine<TSearchIndexEntry> = {
            search: vi.fn(),
            searchOne: vi.fn().mockReturnValue(missingSearchItem),
        };
        const findOne = vi.fn().mockResolvedValue(null);
        const mockedEntityManager = {
            findOne,
        } as unknown as EntityManager;

        const result = await resolveSearchInput(
            getSearchQueries({
                getBestSearchIndexEntry: (input) => mockedSearchEngine.searchOne(input),
                getEntityByKindAndId: (arg) => getGameDataEntityForSearchResult({ em: mockedEntityManager }, arg),
            }),
            "Missing Weapon",
        );

        expect(result).toEqual({
            kind: ESearchResultKind.FOUND_BY_ENGINE_BUT_NOT_BY_DB,
            value: {
                kind: missingSearchItem.kind,
                id: missingSearchItem.id,
            },
        });
    });

    test("input too long", async () => {
        const result = await resolveSearchInput(getSearchQueries({}), "x".repeat(SEARCH_MAX_INPUT_LENGTH + 1));

        expect(result).toEqual({
            kind: ESearchResultKind.INPUT_TOO_LONG,
        });
    });

    test("success", async () => {
        const input = "Royal Sword";
        const searchItem = searchEngine.searchOne(input);
        expect(searchItem).toBeDefined();

        const result = await resolveSearchInput(getSearchQueries({}), input);

        expect(result).toMatchObject({
            kind: ESearchResultKind.SUCCESS,
            value: {
                searchItem,
                entity: {
                    id: searchItem?.id,
                },
            },
        });
    });
});
