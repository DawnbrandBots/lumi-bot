import type { EntityManager } from "@mikro-orm/sqlite";
import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { SEARCH_TERMS_OPTION_NAME } from "../../../src/bot/constants.ts";
import SEARCH_CONFIGS from "../../../src/loaders/searchConfigs.ts";
import getSearchItems from "../../../src/loaders/searchItems.ts";
import { getSearchCommand } from "../../../src/search/command/handlers.ts";
import { FuseSearchEngine } from "../../../src/search/engine.ts";
import type { ISearchEngine, TSearchItem } from "../../../src/search/types.ts";
import { initTestOrm } from "../../utils/orm.ts";

let orm: Awaited<ReturnType<typeof initTestOrm>>;
let em: EntityManager;
let searchEngine: ISearchEngine<TSearchItem>;
let searchCommand: ReturnType<typeof getSearchCommand>;

beforeAll(async () => {
    orm = await initTestOrm();
    em = orm.em.fork();
    searchEngine = new FuseSearchEngine<TSearchItem>({ items: await getSearchItems(em) });
    searchCommand = getSearchCommand({ searchEngine, em, configs: SEARCH_CONFIGS });
});

afterAll(async () => {
    await orm.close();
});

describe("search command messages", () => {
    test.each([
        ["Elfire", "plain damage"],
        ["Dark Tetrafire", "countdown before damage"],
        ["Self Mend", "single-tile self heal"],
        ["Self Cross Shield", "area self-targeted status"],
        ["Trinity Shield Edge EX", "shared status intro"],
        ["Dark Crossfire + Tome", "countdown with shared status intro"],
        ["Thunder Self Edge EX", "mixed damage and status"],
        ["Crosswind Grav EX", "limits stat status effect"],
        ["Dual Invigorate EX", "dual spell"],
        ["Axe Fighter + Infantry", "summon"],
        ["Heal Warp EX", "warp"],
        ["Tetrathunder Wall EX", "ice blocks"],
        ["Dark Cross Poison Patch", "tile"],
        ["Slow Self Shield EX", "cooldown increasing spell effect"],
    ])("returns the complete %s message (%s)", async (name) => {
        const reply = vi.fn();
        const followUp = vi.fn();
        const interaction = {
            options: {
                getString: (optionName: string) => (optionName === SEARCH_TERMS_OPTION_NAME ? name : null),
            },
            reply,
            followUp,
        } as unknown as ChatInputCommandInteraction<CacheType>;

        await searchCommand.run(interaction);

        expect(reply).toHaveBeenCalledOnce();
        expect(followUp).not.toHaveBeenCalled();
        expect(reply.mock.calls[0]?.[0]).toMatchSnapshot();
    });
});
