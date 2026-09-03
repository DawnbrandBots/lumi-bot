import type { EntityManager } from "@mikro-orm/sqlite";
import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { composeApplication } from "../../../src/composition/application.ts";
import { composeInfrastructure } from "../../../src/composition/infrastructure.ts";
import { createSearchEngine } from "../../../src/composition/infrastructure/search.ts";
import { COMMANDS } from "../../../src/composition/presentation/commands.ts";
import { buildDependentFunctionsRecord } from "../../../src/composition/utils/buildDependentFunctionsRecord.ts";
import type { TSearchIndexEntry } from "../../../src/domain/search/types.ts";
import type { ISearchEngine } from "../../../src/infrastructure/search/types.ts";
import { getCommandRunHandler } from "../../../src/presentation/discord/commands/handlers.ts";
import { SEARCH_TERMS_OPTION_NAME } from "../../../src/presentation/discord/commands/search/constants.ts";
import type { TBuiltCommandRunHandler } from "../../../src/presentation/discord/commands/types.ts";
import { initTestGameOrm } from "../../utils/orm.ts";

let orm: Awaited<ReturnType<typeof initTestGameOrm>>;
let em: EntityManager;
let searchEngine: ISearchEngine<TSearchIndexEntry>;
let searchCommand: TBuiltCommandRunHandler;

beforeAll(async () => {
    orm = await initTestGameOrm();
    em = orm.em.fork({ useContext: true });
    searchEngine = await createSearchEngine({ em });
    const { queries, repositories, withinTransaction } = composeInfrastructure({ em, searchEngine });
    const { useCases } = composeApplication({ queries, repositories, useCaseMiddleware: withinTransaction });
    const getRawCommandRunHandler = getCommandRunHandler(COMMANDS);
    searchCommand = (interaction) => {
        const command = getRawCommandRunHandler(interaction);
        if (!command) {
            throw new Error("No run handler found for test interaction.");
        }
        return buildDependentFunctionsRecord({ useCases }, { command }).command(interaction);
    };
});

afterAll(async () => {
    await orm.close();
});

// TODO: all that setup just to test some spells' descriptions feels wrong now
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
            commandName: "search",
            options: {
                getSubcommandGroup: () => null,
                getSubcommand: () => null,
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
