import type { EntityManager } from "@mikro-orm/core";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { ErrorFeatureResponse, SuccessFeatureResponse } from "../src/features/featureResponse.ts";
import searchFeature, {
    ENTITY_KIND_FIELD_NAME,
    ID_FIELD_NAME,
    INPUT_TITLE,
    INPUT_TOO_LONG_DESCRIPTION,
    INVALID_INPUT_TITLE,
    type ISearchItem,
    MISSING_DATABASE_RESULT_TITLE,
    SEARCH_ALIASES_FOOTER_PREFIX,
    SEARCH_YIELDED_NO_RESULT_DESCRIPTION,
} from "../src/features/search.ts";
import { FuseSearchEngine, type ISearchEngine } from "../src/loaders/searchEngine.ts";
import getSearchItems, { type TSearchableEntity } from "../src/loaders/searchItems.ts";
import { SEARCH_MAX_INPUT_LENGTH } from "../src/models/discord/constants.ts";
import SEARCH_HANDLERS from "../src/searchHandlers/all.ts";
import { initTestOrm } from "./orm.ts";

let orm: Awaited<ReturnType<typeof initTestOrm>>;
let em: EntityManager;
let searchEngine: ISearchEngine<ISearchItem>;
type SearchItem = ISearchItem & { kind: TSearchableEntity["kind"] };

beforeAll(async () => {
    orm = await initTestOrm();
    em = orm.em.fork();
    searchEngine = new FuseSearchEngine<ISearchItem>({ items: await getSearchItems(em) });
});

afterAll(async () => {
    await orm.close();
});

describe(searchFeature.name, () => {
    test("returns an error when search yields no result", async () => {
        const response = await searchFeature<TSearchableEntity>({
            input: "qzxv qzxv qzxv",
            searchEngine,
            handlers: SEARCH_HANDLERS,
            em,
        });

        expect(response).toBeInstanceOf(ErrorFeatureResponse);
        expect((response as ErrorFeatureResponse).report).toBe(false);
        expect(response.embeds?.[0]).toMatchObject({
            title: INPUT_TITLE,
            description: SEARCH_YIELDED_NO_RESULT_DESCRIPTION,
        });
    });

    test("returns an error when search finds a result missing from the database", async () => {
        const missingSearchItem: SearchItem = {
            id: "MISSING_ID",
            kind: "weapon",
            aliases: ["Missing Weapon"],
        };
        const mockedSearchEngine: ISearchEngine<SearchItem> = {
            searchOne: vi.fn().mockReturnValue(missingSearchItem),
        };
        const mockedEntityManager = {
            findOne: vi.fn().mockResolvedValue(null),
        } as unknown as EntityManager;

        const response = await searchFeature<TSearchableEntity>({
            input: "Missing Weapon",
            searchEngine: mockedSearchEngine,
            handlers: SEARCH_HANDLERS,
            em: mockedEntityManager,
        });

        expect(response).toBeInstanceOf(ErrorFeatureResponse);
        expect((response as ErrorFeatureResponse).report).toBe(false);
        expect(response.embeds?.[0]).toMatchObject({
            title: MISSING_DATABASE_RESULT_TITLE,
            fields: [
                { name: ENTITY_KIND_FIELD_NAME, value: missingSearchItem.kind, inline: true },
                { name: ID_FIELD_NAME, value: missingSearchItem.id, inline: true },
            ],
        });
        expect(mockedEntityManager.findOne).toHaveBeenCalledWith(
            SEARCH_HANDLERS.weapon.class,
            { id: missingSearchItem.id },
            { populate: SEARCH_HANDLERS.weapon.populate },
        );
    });

    test("returns an error when input is too long", async () => {
        const response = await searchFeature<TSearchableEntity>({
            input: "x".repeat(SEARCH_MAX_INPUT_LENGTH + 1),
            searchEngine,
            handlers: SEARCH_HANDLERS,
            em,
        });

        expect(response).toBeInstanceOf(ErrorFeatureResponse);
        expect((response as ErrorFeatureResponse).report).toBe(false);
        expect(response.embeds?.[0]).toMatchObject({
            title: INVALID_INPUT_TITLE,
            description: INPUT_TOO_LONG_DESCRIPTION,
        });
    });

    describe("footer", () => {
        test("multiple aliases => footer present", async () => {
            const input = "TSBPC";
            const searchItem = searchEngine.searchOne(input);
            expect(searchItem?.aliases.length).toBeGreaterThan(1);

            const response = await searchFeature<TSearchableEntity>({
                input,
                searchEngine,
                handlers: SEARCH_HANDLERS,
                em,
            });

            expect(response).toBeInstanceOf(SuccessFeatureResponse);
            expect((response as SuccessFeatureResponse).embeds?.[0]?.footer?.text).toBe(
                `${SEARCH_ALIASES_FOOTER_PREFIX} ${searchItem?.aliases.join(", ")}`,
            );
        });

        test("single alias => footer absent", async () => {
            const input = "Royal Sword";
            const searchItem = searchEngine.searchOne(input);
            expect(searchItem?.aliases).toHaveLength(1);

            const response = await searchFeature<TSearchableEntity>({
                input,
                searchEngine,
                handlers: SEARCH_HANDLERS,
                em,
            });

            expect(response).toBeInstanceOf(SuccessFeatureResponse);
            expect((response as SuccessFeatureResponse).embeds?.[0]?.footer).toBeUndefined();
        });
    });
});
