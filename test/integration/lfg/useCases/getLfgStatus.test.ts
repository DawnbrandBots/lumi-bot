import { describe, expect, test } from "vitest";
import { ELfgResultKind } from "../../../../src/application/lfg/types.ts";
import { getLfgStatus } from "../../../../src/application/lfg/useCases/getLfgStatus.ts";
import { GUILD_ID, OTHER_GUILD_ID, OWNER, PLAYER_1, useLfgUseCases } from "./shared.ts";

describe(getLfgStatus.name, { concurrent: false }, () => {
    const lfg = useLfgUseCases();

    test("only displays rooms from the requested guild", async () => {
        await lfg.useCases.createRoom(GUILD_ID, OWNER, "one");
        await lfg.useCases.createRoom(OTHER_GUILD_ID, PLAYER_1, "two");

        const response = await lfg.useCases.getLfgStatus(GUILD_ID);

        expect(response).toEqual({
            kind: ELfgResultKind.ROOMS_LISTED,
            value: { rooms: [{ code: "one", ownerId: OWNER.id, playerIds: [OWNER.id] }] },
        });
    });
});
