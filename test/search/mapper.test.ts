import type { EntityManager } from "@mikro-orm/sqlite";
import { Collection } from "@mikro-orm/sqlite";
import { subtext } from "discord.js";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { DISCORD_ERROR_MESSAGE_DEFAULT_CONTENT, SEARCH_MAX_INPUT_LENGTH } from "../../src/bot/constants.ts";
import { EMessageKind } from "../../src/bot/types.ts";
import type { Disciple } from "../../src/game/models/disciple.ts";
import SEARCH_HANDLERS from "../../src/loaders/searchHandlers.ts";
import getSearchItems from "../../src/loaders/searchItems.ts";
import {
    SEARCH_ALIASES_FOOTER_PREFIX,
    SEARCH_ENTITY_KIND_FIELD_NAME,
    SEARCH_ID_FIELD_NAME,
    SEARCH_INPUT_TITLE,
    SEARCH_INPUT_TOO_LONG_DESCRIPTION,
    SEARCH_INVALID_INPUT_TITLE,
    SEARCH_MISSING_DATABASE_RESULT_TITLE,
    SEARCH_MUSIC_HANDLE_NO_KNOWN_SOURCE_MEDIA,
    SEARCH_YIELDED_NO_RESULT_DESCRIPTION,
} from "../../src/search/constants.ts";
import { FuseSearchEngine } from "../../src/search/engine.ts";
import searchFeature from "../../src/search/feature.ts";
import mapSearchFeatureReturnToMessages from "../../src/search/mapper.ts";
import type { ISearchEngine, ISearchItem, TSearchableEntity } from "../../src/search/types.ts";
import { ESearchFeatureReturnKind } from "../../src/search/types.ts";
import { initTestGameOrm } from "../orm.ts";
import { NO_SEARCH_RESULT_INPUT } from "./constants.ts";

let orm: Awaited<ReturnType<typeof initTestGameOrm>>;
let em: EntityManager;
type SearchItem = ISearchItem & { kind: TSearchableEntity["kind"] };
let searchEngine: ISearchEngine<SearchItem>;

beforeAll(async () => {
    orm = await initTestGameOrm();
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

        expect(message).toMatchObject({
            reply: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        title: SEARCH_INPUT_TITLE,
                        description: SEARCH_YIELDED_NO_RESULT_DESCRIPTION,
                    },
                ],
            },
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

        expect(message).toMatchObject({
            reply: {
                kind: EMessageKind.ERROR,

                content: DISCORD_ERROR_MESSAGE_DEFAULT_CONTENT,
                embeds: [
                    {
                        title: SEARCH_MISSING_DATABASE_RESULT_TITLE,
                        fields: [
                            { name: SEARCH_ENTITY_KIND_FIELD_NAME, value: missingSearchItem.kind, inline: true },
                            { name: SEARCH_ID_FIELD_NAME, value: missingSearchItem.id, inline: true },
                        ],
                    },
                ],
            },
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

        expect(message).toMatchObject({
            reply: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        title: SEARCH_INVALID_INPUT_TITLE,
                        description: SEARCH_INPUT_TOO_LONG_DESCRIPTION,
                    },
                ],
            },
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

        expect(message).toMatchObject({
            reply: {
                kind: EMessageKind.POSITIVE,
            },
        });
    });

    // TODO: need to add tests for all search result kinds in a separate PR

    describe("music search result", () => {
        test("source medial url exists", async () => {
            const MUSIC_SEARCH_INPUT = "Betrayal – The Exiled Prince";

            const result = await searchFeature<TSearchableEntity>({
                input: MUSIC_SEARCH_INPUT,
                searchEngine,
                handlers: SEARCH_HANDLERS,
                em,
            });
            const message = mapSearchFeatureReturnToMessages<TSearchableEntity>(result, SEARCH_HANDLERS);

            expect(message).toMatchObject({
                reply: {
                    kind: EMessageKind.POSITIVE,
                    embeds: [
                        {
                            title: MUSIC_SEARCH_INPUT,
                            description: undefined,
                            fields: [
                                {
                                    name: "Shadow music for",
                                    value: "Kurt, Gotthold, Carina, Alberta, Zasha, Rose",
                                },
                            ],
                        },
                    ],
                },
                followUps: [
                    {
                        content: subtext("https://www.youtube.com/watch?v=I4g29E9Oero&t=684s"),
                    },
                ],
            });
        });
        test("source medial url doesn't exist", () => {
            const result = {
                // const result: Extract<Awaited<ReturnType<typeof searchFeature<TSearchableEntity>>>, {kind: ESearchFeatureReturnKind.SUCCESS}> & {value: {kind: "music"}} = {
                kind: ESearchFeatureReturnKind.SUCCESS as const,
                value: {
                    entity: {
                        id: "MISSING_URL_SONG",
                        name: "Missing Url Song",
                        shadowMusicFor: new Collection<Disciple, object>(
                            {},
                            [{ id: "MYSTERIOUS_DISCIPLE", name: "Mysterious Disciple" } as Disciple],
                            true,
                        ),
                        shadowResultsScreenMusicFor: undefined,
                        url: undefined,
                        kind: "music" as const,
                    },
                    searchItem: {
                        id: "MISSING_URL_SONG",
                        kind: "music" as const,
                        aliases: ["Missing Url Song"],
                        name: "Missing Url Song",
                    },
                },
            };
            const message = mapSearchFeatureReturnToMessages<TSearchableEntity>(result, SEARCH_HANDLERS);

            expect(message).toMatchObject({
                reply: {
                    kind: EMessageKind.POSITIVE,
                    embeds: [
                        {
                            title: "Missing Url Song",
                            description: SEARCH_MUSIC_HANDLE_NO_KNOWN_SOURCE_MEDIA,
                            fields: [
                                {
                                    name: "Shadow music for",
                                    value: "Mysterious Disciple",
                                },
                            ],
                        },
                    ],
                },
            });
        });
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

            expect(message).toMatchObject({
                reply: {
                    kind: EMessageKind.POSITIVE,
                    embeds: [
                        {
                            footer: {
                                text: `${SEARCH_ALIASES_FOOTER_PREFIX} ${searchItem?.aliases.join(", ")}`,
                            },
                        },
                    ],
                },
            });
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

            expect(message).toMatchObject({
                reply: {
                    kind: EMessageKind.POSITIVE,
                    embeds: [
                        expect.not.objectContaining({
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                            footer: expect.anything(),
                        }),
                    ],
                },
            });
        });
    });
});
