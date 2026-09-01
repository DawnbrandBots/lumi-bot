import { describe, expect, test } from "vitest";
import { ELfgResultKind } from "../../../../src/application/lfg/types.ts";
import { getLfgStatus } from "../../../../src/application/lfg/useCases/getLfgStatus.ts";
import { GUILD_ID, OTHER_GUILD_ID, OWNER, PLAYER_1, useLfgUseCases } from "./shared.ts";

describe(getLfgStatus.name, () => {
    const lfg = useLfgUseCases();

    test("only displays rooms from the requested guild", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "one" });
        await lfg.useCases.createRoom({ guildId: OTHER_GUILD_ID, owner: PLAYER_1, code: "two" });

        const response = await lfg.useCases.getLfgStatus({ guildId: GUILD_ID });

        expect(response).toMatchObject({
            kind: ELfgResultKind.ROOMS_LISTED,
            value: {
                guildConfig: null,
                rooms: [{ code: "one", ownerId: OWNER.id, playerIds: [OWNER.id] }],
            },
        });
    });
});
