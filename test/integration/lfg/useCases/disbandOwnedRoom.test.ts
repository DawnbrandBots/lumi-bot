import { describe, expect, test } from "vitest";
import { ELfgResultKind } from "../../../../src/application/lfg/types.ts";
import { disbandOwnedRoom } from "../../../../src/application/lfg/useCases/disbandOwnedRoom.ts";
import { GUILD_ID, OWNER, PLAYER_1, useLfgUseCases } from "./shared.ts";

describe(disbandOwnedRoom.name, () => {
    const lfg = useLfgUseCases();

    test("deletes the room when called by the owner", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "room" });
        await lfg.useCases.movePlayerToRoom({ guildId: GUILD_ID, user: PLAYER_1, code: "room" });

        const response = await lfg.useCases.disbandOwnedRoom({ guildId: GUILD_ID, owner: OWNER });

        expect(response).toEqual({
            kind: ELfgResultKind.ROOM_DISBANDED,
            value: { userId: OWNER.id, code: "room" },
        });
        expect(await lfg.getRooms(GUILD_ID)).toEqual([]);
    });

    test("rejects non-owners", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "room" });
        await lfg.useCases.movePlayerToRoom({ guildId: GUILD_ID, user: PLAYER_1, code: "room" });

        const response = await lfg.useCases.disbandOwnedRoom({ guildId: GUILD_ID, owner: PLAYER_1 });

        expect(response).toEqual({ kind: ELfgResultKind.NOT_ROOM_OWNER });
        expect(await lfg.getRooms(GUILD_ID)).toEqual([
            { code: "room", ownerId: OWNER.id, playerIds: [OWNER.id, PLAYER_1.id] },
        ]);
    });

    test("rejects users who are not in a room", async () => {
        const response = await lfg.useCases.disbandOwnedRoom({ guildId: GUILD_ID, owner: OWNER });

        expect(response).toEqual({ kind: ELfgResultKind.NOT_IN_A_ROOM });
    });
});
