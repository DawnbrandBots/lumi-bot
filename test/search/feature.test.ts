import type { EntityManager } from "@mikro-orm/sqlite";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { SEARCH_MAX_INPUT_LENGTH } from "../../src/bot/constants.ts";
import SEARCH_CONFIGS from "../../src/loaders/searchConfigs.ts";
import getSearchItems from "../../src/loaders/searchItems.ts";
import { FuseSearchEngine } from "../../src/search/engine.ts";
import searchFeature from "../../src/search/feature.ts";
import {
    ESearchFeatureReturnKind,
    type ISearchEngine,
    type TSearchItem,
} from "../../src/search/types.ts";
import { initTestOrm } from "../orm.ts";
import typedGuardExpectToBe from "../utils/expectTypeGuard.ts";
import { NO_SEARCH_RESULT_INPUT } from "./constants.ts";

let orm: Awaited<ReturnType<typeof initTestOrm>>;
let em: EntityManager;
type SearchItem = TSearchItem;
let searchEngine: ISearchEngine<SearchItem>;

beforeAll(async () => {
    orm = await initTestOrm();
    em = orm.em.fork();
    searchEngine = new FuseSearchEngine<SearchItem>({ items: await getSearchItems(em) });
});

afterAll(async () => {
    await orm.close();
});

describe(searchFeature.name, () => {
    test("no result", async () => {
        const result = await searchFeature({
            input: NO_SEARCH_RESULT_INPUT,
            searchEngine,
            configs: SEARCH_CONFIGS,
            em,
        });

        expect(result).toEqual({
            kind: ESearchFeatureReturnKind.NO_RESULT,
        });
    });

    test("missing from database", async () => {
        const missingSearchItem: SearchItem = {
            id: "MISSING_ID",
            kind: "weapon",
            name: "Missing Weapon",
            aliases: ["Missing Weapon"],
        };
        const mockedSearchEngine: ISearchEngine<SearchItem> = {
            search: vi.fn(),
            searchOne: vi.fn().mockReturnValue(missingSearchItem),
        };
        const findOne = vi.fn().mockResolvedValue(null);
        const mockedEntityManager = {
            findOne,
        } as unknown as EntityManager;

        const result = await searchFeature({
            input: "Missing Weapon",
            searchEngine: mockedSearchEngine,
            configs: SEARCH_CONFIGS,
            em: mockedEntityManager,
        });

        expect(result).toEqual({
            kind: ESearchFeatureReturnKind.FOUND_BY_ENGINE_BUT_NOT_BY_DB,

            value: {
                kind: missingSearchItem.kind,
                id: missingSearchItem.id,
            },
        });
        expect(findOne).toHaveBeenCalledWith(
            SEARCH_CONFIGS.weapon.class,
            { id: missingSearchItem.id },
            { populate: SEARCH_CONFIGS.weapon.populate },
        );
    });

    test("input too long", async () => {
        const result = await searchFeature({
            input: "x".repeat(SEARCH_MAX_INPUT_LENGTH + 1),
            searchEngine,
            configs: SEARCH_CONFIGS,
            em,
        });

        expect(result).toEqual({
            kind: ESearchFeatureReturnKind.INPUT_TOO_LONG,
        });
    });

    test("success", async () => {
        const input = "Royal Sword";
        const searchItem = searchEngine.searchOne(input);
        expect(searchItem).toBeDefined();

        const result = await searchFeature({
            input,
            searchEngine,
            configs: SEARCH_CONFIGS,
            em,
        });

        typedGuardExpectToBe(result.kind, ESearchFeatureReturnKind.SUCCESS);
        expect(result.value.searchItem).toEqual(searchItem);
        expect(result.value.entity.id).toBe(searchItem?.id);
    });
});
