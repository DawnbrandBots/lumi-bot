import { describe, expect, test } from "vitest";
import { ELfgResultKind } from "../../../../src/application/lfg/types.ts";
import { kickPlayerFromOwnedRoom } from "../../../../src/application/lfg/useCases/kickPlayerFromOwnedRoom.ts";
import { ELfgPlayerRemovalKind } from "../../../../src/domain/lfg/models/playerRemoval.types.ts";
import { GUILD_ID, OWNER, PLAYER_1, useLfgUseCases } from "./shared.ts";

describe(kickPlayerFromOwnedRoom.name, { concurrent: false }, () => {
    const lfg = useLfgUseCases();

    test("kicks another room player", async () => {
        await lfg.useCases.createRoom(GUILD_ID, OWNER, "room");
        await lfg.useCases.movePlayerToRoom(GUILD_ID, PLAYER_1, "room");

        const response = await lfg.useCases.kickPlayerFromOwnedRoom(GUILD_ID, OWNER, PLAYER_1);

        expect(response).toEqual({
            kind: ELfgResultKind.PLAYER_KICKED,
            value: {
                userId: OWNER.id,
                targetId: PLAYER_1.id,
                room: { code: "room", ownerId: OWNER.id, playerIds: [OWNER.id] },
                removalResult: { kind: ELfgPlayerRemovalKind.LEFT_ROOM_NORMALLY },
            },
        });
        expect((await lfg.getRooms(GUILD_ID))[0]?.playerIds).toEqual([OWNER.id]);
    });

    test("rejects targets outside the room", async () => {
        await lfg.useCases.createRoom(GUILD_ID, OWNER, "room");

        const response = await lfg.useCases.kickPlayerFromOwnedRoom(GUILD_ID, OWNER, PLAYER_1);

        expect(response).toEqual({
            kind: ELfgResultKind.PLAYER_NOT_IN_ROOM,
            value: { ownerId: OWNER.id, targetId: PLAYER_1.id, code: "room" },
        });
    });

    test("rejects self-kick", async () => {
        await lfg.useCases.createRoom(GUILD_ID, OWNER, "room");

        const response = await lfg.useCases.kickPlayerFromOwnedRoom(GUILD_ID, OWNER, OWNER);

        expect(response).toEqual({ kind: ELfgResultKind.CANNOT_KICK_YOURSELF });
    });

    test("rejects non-owners", async () => {
        await lfg.useCases.createRoom(GUILD_ID, OWNER, "room");
        await lfg.useCases.movePlayerToRoom(GUILD_ID, PLAYER_1, "room");

        const response = await lfg.useCases.kickPlayerFromOwnedRoom(GUILD_ID, PLAYER_1, OWNER);

        expect(response).toEqual({ kind: ELfgResultKind.NOT_ROOM_OWNER });
    });
});
