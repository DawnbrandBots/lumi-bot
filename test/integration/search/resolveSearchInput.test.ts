import type { EntityManager } from "@mikro-orm/sqlite";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { SEARCH_MAX_INPUT_LENGTH } from "../../../src/application/search/constants.ts";
import { resolveSearchInput } from "../../../src/application/search/resolveSearchInput.ts";
import { generateSearchIndexEntries } from "../../../src/application/search/searchAliases.ts";
import { ESearchResultKind } from "../../../src/application/search/types.ts";
import type { TSearchIndexEntry } from "../../../src/domain/search/types.ts";
import { searchItemInDb } from "../../../src/infrastructure/game/persistence/searchItemInDb.ts";
import type { ISearchEngine } from "../../../src/infrastructure/search/engine.ts";
import { FuseSearchEngine } from "../../../src/infrastructure/search/engine.ts";
import { getEntitiesForGeneratingSearchAliases } from "../../../src/infrastructure/search/getEntitiesForGeneratingSearchAliases.ts";
import { initTestGameOrm } from "../../utils/orm.ts";
import { NO_SEARCH_RESULT_INPUT } from "./constants.ts";

let orm: Awaited<ReturnType<typeof initTestGameOrm>>;
let em: EntityManager;
let searchEngine: ISearchEngine<TSearchIndexEntry>;

beforeAll(async () => {
    orm = await initTestGameOrm();
    em = orm.em.fork();
    searchEngine = new FuseSearchEngine<TSearchIndexEntry>({
        items: generateSearchIndexEntries(await getEntitiesForGeneratingSearchAliases({ em })),
    });
});

afterAll(async () => {
    await orm.close();
});

describe(resolveSearchInput.name, () => {
    test("no result", async () => {
        const result = await resolveSearchInput(
            {
                getBestSearchIndexEntry: searchEngine.searchOne.bind(searchEngine),
                getEntityByKindAndId: (arg) => searchItemInDb({ em }, arg),
            },
            NO_SEARCH_RESULT_INPUT,
        );

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
            {
                getBestSearchIndexEntry: (input) => mockedSearchEngine.searchOne(input),
                getEntityByKindAndId: (arg) => searchItemInDb({ em: mockedEntityManager }, arg),
            },
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
        const result = await resolveSearchInput(
            {
                getBestSearchIndexEntry: searchEngine.searchOne.bind(searchEngine),
                getEntityByKindAndId: (arg) => searchItemInDb({ em }, arg),
            },
            "x".repeat(SEARCH_MAX_INPUT_LENGTH + 1),
        );

        expect(result).toEqual({
            kind: ESearchResultKind.INPUT_TOO_LONG,
        });
    });

    test("success", async () => {
        const input = "Royal Sword";
        const searchItem = searchEngine.searchOne(input);
        expect(searchItem).toBeDefined();

        const result = await resolveSearchInput(
            {
                getBestSearchIndexEntry: searchEngine.searchOne.bind(searchEngine),
                getEntityByKindAndId: (arg) => searchItemInDb({ em }, arg),
            },
            input,
        );

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
