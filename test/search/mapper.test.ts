import type { EntityManager } from "@mikro-orm/sqlite";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { SEARCH_MAX_INPUT_LENGTH } from "../../src/bot/constants.ts";
import { EMessageKind } from "../../src/bot/types.ts";
import SEARCH_HANDLERS from "../../src/loaders/searchHandlers.ts";
import getSearchItems from "../../src/loaders/searchItems.ts";
import {
    ENTITY_KIND_FIELD_NAME,
    ID_FIELD_NAME,
    INPUT_TITLE,
    INPUT_TOO_LONG_DESCRIPTION,
    INVALID_INPUT_TITLE,
    MISSING_DATABASE_RESULT_TITLE,
    SEARCH_ALIASES_FOOTER_PREFIX,
    SEARCH_YIELDED_NO_RESULT_DESCRIPTION,
} from "../../src/search/constants.ts";
import { FuseSearchEngine } from "../../src/search/engine.ts";
import searchFeature from "../../src/search/feature.ts";
import mapSearchFeatureReturnToMessages from "../../src/search/mapper.ts";
import type { ISearchEngine, ISearchItem, TSearchableEntity } from "../../src/search/types.ts";
import { initTestOrm } from "../orm.ts";
import typedGuardExpectToBe from "../utils/expectTypeGuard.ts";
import { NO_SEARCH_RESULT_INPUT } from "./constants.ts";

let orm: Awaited<ReturnType<typeof initTestOrm>>;
let em: EntityManager;
type SearchItem = ISearchItem & { kind: TSearchableEntity["kind"] };
let searchEngine: ISearchEngine<SearchItem>;

beforeAll(async () => {
    orm = await initTestOrm();
    em = orm.em.fork();
    searchEngine = new FuseSearchEngine<SearchItem>({ items: await getSearchItems(em) });
});

afterAll(async () => {
    await orm.close();
});

describe(mapSearchFeatureReturnToMessages.name, () => {
    test("maps no result to an error message", async () => {
        const result = await searchFeature<TSearchableEntity>({
            input: NO_SEARCH_RESULT_INPUT,
            searchEngine,
            handlers: SEARCH_HANDLERS,
            em,
        });
        const message = mapSearchFeatureReturnToMessages<TSearchableEntity>(result, SEARCH_HANDLERS);

        typedGuardExpectToBe(message.reply.kind, EMessageKind.NEGATIVE);
        expect(message.reply.embeds?.[0]).toMatchObject({
            title: INPUT_TITLE,
            description: SEARCH_YIELDED_NO_RESULT_DESCRIPTION,
        });
    });

    test("maps a database miss to an error message", async () => {
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
        const mockedEntityManager = {
            findOne: vi.fn().mockResolvedValue(null),
        } as unknown as EntityManager;
        const result = await searchFeature<TSearchableEntity>({
            input: "Missing Weapon",
            searchEngine: mockedSearchEngine,
            handlers: SEARCH_HANDLERS,
            em: mockedEntityManager,
        });
        const message = mapSearchFeatureReturnToMessages<TSearchableEntity>(result, SEARCH_HANDLERS);

        typedGuardExpectToBe(message.reply.kind, EMessageKind.ERROR);
        expect(message.reply.content).toBeDefined();
        expect(message.reply.embeds?.[0]).toMatchObject({
            title: MISSING_DATABASE_RESULT_TITLE,
            fields: [
                { name: ENTITY_KIND_FIELD_NAME, value: missingSearchItem.kind, inline: true },
                { name: ID_FIELD_NAME, value: missingSearchItem.id, inline: true },
            ],
        });
    });

    test("maps input too long to an error message", async () => {
        const result = await searchFeature<TSearchableEntity>({
            input: "x".repeat(SEARCH_MAX_INPUT_LENGTH + 1),
            searchEngine,
            handlers: SEARCH_HANDLERS,
            em,
        });
        const message = mapSearchFeatureReturnToMessages<TSearchableEntity>(result, SEARCH_HANDLERS);

        typedGuardExpectToBe(message.reply.kind, EMessageKind.NEGATIVE);
        expect(message.reply.embeds?.[0]).toMatchObject({
            title: INVALID_INPUT_TITLE,
            description: INPUT_TOO_LONG_DESCRIPTION,
        });
    });

    test("maps success to a success message", async () => {
        const result = await searchFeature<TSearchableEntity>({
            input: "Royal Sword",
            searchEngine,
            handlers: SEARCH_HANDLERS,
            em,
        });
        const message = mapSearchFeatureReturnToMessages<TSearchableEntity>(result, SEARCH_HANDLERS);

        typedGuardExpectToBe(message.reply.kind, EMessageKind.POSITIVE);
    });

    test("preserves follow-ups returned by the search handler", async () => {
        const followUps = [{ content: "Follow-up" }];
        const originalMessage = SEARCH_HANDLERS.weapon.message;
        vi.spyOn(SEARCH_HANDLERS.weapon, "message").mockImplementationOnce((weapon) => ({
            ...originalMessage(weapon),
            followUps,
        }));
        const result = await searchFeature<TSearchableEntity>({
            input: "Royal Sword",
            searchEngine,
            handlers: SEARCH_HANDLERS,
            em,
        });

        const messages = mapSearchFeatureReturnToMessages<TSearchableEntity>(result, SEARCH_HANDLERS);

        expect(messages.followUps).toEqual(followUps);
    });

    describe("footer", () => {
        test("multiple aliases => footer present", async () => {
            const input = "TSBPC";
            const searchItem = searchEngine.searchOne(input);
            expect(searchItem?.aliases.length).toBeGreaterThan(1);

            const result = await searchFeature<TSearchableEntity>({
                input,
                searchEngine,
                handlers: SEARCH_HANDLERS,
                em,
            });
            const message = mapSearchFeatureReturnToMessages<TSearchableEntity>(result, SEARCH_HANDLERS);

            typedGuardExpectToBe(message.reply.kind, EMessageKind.POSITIVE);
            expect(message.reply.embeds?.[0]?.footer?.text).toBe(
                `${SEARCH_ALIASES_FOOTER_PREFIX} ${searchItem?.aliases.join(", ")}`,
            );
        });

        test("single alias => footer absent", async () => {
            const input = "Royal Sword";
            const searchItem = searchEngine.searchOne(input);
            expect(searchItem?.aliases).toHaveLength(1);

            const result = await searchFeature<TSearchableEntity>({
                input,
                searchEngine,
                handlers: SEARCH_HANDLERS,
                em,
            });
            const message = mapSearchFeatureReturnToMessages<TSearchableEntity>(result, SEARCH_HANDLERS);

            typedGuardExpectToBe(message.reply.kind, EMessageKind.POSITIVE);
            expect(message.reply.embeds?.[0]?.footer).toBeUndefined();
        });
    });
});
