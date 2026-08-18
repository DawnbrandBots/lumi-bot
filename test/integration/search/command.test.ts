import type { EntityManager } from "@mikro-orm/sqlite";
import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import type { TGetBestSearchIndexEntry, TGetEntityByKindAndId } from "../../../src/application/search/ports.ts";
import { resolveSearchInput } from "../../../src/application/search/resolveSearchInput.ts";
import { generateSearchIndexEntries } from "../../../src/application/search/searchAliases.ts";
import type { TSearchIndexEntry } from "../../../src/domain/search/types.ts";
import { searchItemInDb } from "../../../src/infrastructure/game/persistence/searchItemInDb.ts";
import type { ISearchEngine } from "../../../src/infrastructure/search/engine.ts";
import { FuseSearchEngine } from "../../../src/infrastructure/search/engine.ts";
import SEARCH_CONFIGS from "../../../src/infrastructure/search/configs.ts";
import { getEntitiesForGeneratingSearchAliases } from "../../../src/infrastructure/search/getEntitiesForGeneratingSearchAliases.ts";
import { getSearchCommand } from "../../../src/presentation/discord/commands/search.ts";
import { SEARCH_TERMS_OPTION_NAME } from "../../../src/presentation/discord/commands/search/constants.ts";
import { initTestGameOrm } from "../../utils/orm.ts";

let orm: Awaited<ReturnType<typeof initTestGameOrm>>;
let em: EntityManager;
let searchEngine: ISearchEngine<TSearchIndexEntry>;
let searchCommand: ReturnType<typeof getSearchCommand>;

beforeAll(async () => {
    orm = await initTestGameOrm();
    em = orm.em.fork();
    searchEngine = new FuseSearchEngine<TSearchIndexEntry>({
        items: generateSearchIndexEntries(await getEntitiesForGeneratingSearchAliases({ em })),
    });
    const getBestSearchIndexEntry: TGetBestSearchIndexEntry = searchEngine.searchOne.bind(searchEngine);
    const getEntityByKindAndId: TGetEntityByKindAndId = (arg) => searchItemInDb({ configs: SEARCH_CONFIGS, em }, arg);
    searchCommand = getSearchCommand({
        resolveSearchInput: (input) => resolveSearchInput({ getBestSearchIndexEntry, getEntityByKindAndId }, input),
    });
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
        ["Tetrathunder Wall EX", "obstacles"],
        ["Dark Cross Poison Patch", "tile"],
        ["Slow Self Shield EX", "cooldown increasing spell effect"],
        ["Dark Harm Sword Fighter", "damage-over-time effect dealing damage only once"],
        ["Crosswind Lock EX", "conditional rock obstacle summon on shape different than damaging effect's"],
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

        await searchCommand(interaction);

        expect(reply).toHaveBeenCalledOnce();
        expect(followUp).not.toHaveBeenCalled();
        expect(reply.mock.calls[0]?.[0]).toMatchSnapshot();
    });
});
