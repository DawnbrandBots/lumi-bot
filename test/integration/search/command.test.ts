import type { EntityManager } from "@mikro-orm/sqlite";
import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import type {
    TGetBestSearchIndexEntry,
    TGetEntityByKindAndId,
    TSearchPersistence,
} from "../../../src/application/search/persistence.types.ts";
import type { TAdminPersistence } from "../../../src/application/admin/persistence.types.ts";
import type { TLfgPersistence } from "../../../src/application/lfg/persistence.types.ts";
import type { TApplicationPersistence } from "../../../src/application/persistence.types.ts";
import type { TApplicationUseCases } from "../../../src/application/useCases.types.ts";
import { generateSearchIndexEntries } from "../../../src/application/search/searchAliases.ts";
import resolveSearchInput from "../../../src/application/search/useCases/resolveSearchInput.ts";
import type { TSearchUseCaseDependencies } from "../../../src/application/search/useCases.types.ts";
import type { TSearchIndexEntry } from "../../../src/domain/search/types.ts";
import { getEntitiesForGeneratingSearchAliases } from "../../../src/infrastructure/database/mikroOrm/repositories/search/getEntitiesForGeneratingSearchAliases.ts";
import { getGameDataEntityForSearchResult } from "../../../src/infrastructure/database/mikroOrm/repositories/search/getGameDataEntityForSearchResult.ts";
import { getPersistenceWithContext } from "../../../src/composition/application/useCases.ts";
import ADMIN_REPOSITORIES from "../../../src/infrastructure/database/mikroOrm/repositories/admin.ts";
import LFG_REPOSITORIES from "../../../src/infrastructure/database/mikroOrm/repositories/lfg.ts";
import type { ISearchEngine } from "../../../src/infrastructure/search/engine.ts";
import { FuseSearchEngine } from "../../../src/infrastructure/search/engine.ts";
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
    const getEntityByKindAndId: TGetEntityByKindAndId = (arg) => getGameDataEntityForSearchResult({ em }, arg);
    const getSearchIndexEntries = (arg: { readonly input: string; readonly limit?: number }) =>
        searchEngine.search(arg.input, arg.limit);
    const persistence: TSearchPersistence = {
        getBestSearchIndexEntry,
        getEntityByKindAndId,
        getSearchIndexEntries,
    };
    const applicationPersistence: TApplicationPersistence = {
        admin: getPersistenceWithContext<TAdminPersistence>({ em, repositories: ADMIN_REPOSITORIES }),
        lfg: getPersistenceWithContext<TLfgPersistence>({ em, repositories: LFG_REPOSITORIES }),
        search: persistence,
    };
    const dependencies: TSearchUseCaseDependencies = { persistence: applicationPersistence };

    const useCases: TApplicationUseCases = {
        admin: {
            addLfgRole: vi.fn(),
            clearLfgChannel: vi.fn(),
            clearLfgRolePingCooldown: vi.fn(),
            getGuildConfig: vi.fn(),
            getLfgRoleConfig: vi.fn(),
            removeLfgRole: vi.fn(),
            setLfgChannel: vi.fn(),
            setLfgRoleLastPingedAt: vi.fn(),
            setLfgRolePingCooldown: vi.fn(),
        },
        lfg: {
            changeRoomCode: vi.fn(),
            changeOwnedRoomCode: vi.fn(),
            createRoom: vi.fn(),
            disbandRoom: vi.fn(),
            disbandOwnedRoom: vi.fn(),
            getLfgStatus: vi.fn(),
            kickPlayerFromRoom: vi.fn(),
            kickPlayerFromOwnedRoom: vi.fn(),
            leaveRoom: vi.fn(),
            movePlayerToRoom: vi.fn(),
            transferRoomToPlayer: vi.fn(),
            transferOwnedRoomToPlayer: vi.fn(),
        },
        search: {
            resolveSearchInput: (input) => resolveSearchInput(dependencies, input),
            suggestSearchResults: vi.fn().mockResolvedValue([]),
        },
    };
    searchCommand = getSearchCommand({ useCases });
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
