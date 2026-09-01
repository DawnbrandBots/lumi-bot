import { describe, expect, test } from "vitest";
import { ELfgResultKind } from "../../../../src/application/lfg/types.ts";
import { kickPlayerFromOwnedRoom } from "../../../../src/application/lfg/useCases/kickPlayerFromOwnedRoom.ts";
import { ELfgPlayerRemovalKind } from "../../../../src/domain/lfg/models/playerRemoval.types.ts";
import { GUILD_ID, OWNER, PLAYER_1, useLfgUseCases } from "./shared.ts";

describe(kickPlayerFromOwnedRoom.name, () => {
    const lfg = useLfgUseCases();

    test("kicks another room player", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "room" });
        await lfg.useCases.movePlayerToRoom({ guildId: GUILD_ID, user: PLAYER_1, code: "room" });

        const response = await lfg.useCases.kickPlayerFromOwnedRoom({
            guildId: GUILD_ID,
            owner: OWNER,
            target: PLAYER_1,
        });

        expect(response).toMatchObject({
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
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "room" });

        const response = await lfg.useCases.kickPlayerFromOwnedRoom({
            guildId: GUILD_ID,
            owner: OWNER,
            target: PLAYER_1,
        });

        expect(response).toEqual({
            kind: ELfgResultKind.PLAYER_NOT_IN_ROOM,
            value: { ownerId: OWNER.id, targetId: PLAYER_1.id, code: "room" },
        });
    });

    test("rejects self-kick", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "room" });

        const response = await lfg.useCases.kickPlayerFromOwnedRoom({ guildId: GUILD_ID, owner: OWNER, target: OWNER });

        expect(response).toEqual({ kind: ELfgResultKind.CANNOT_KICK_YOURSELF });
    });

    test("rejects non-owners", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "room" });
        await lfg.useCases.movePlayerToRoom({ guildId: GUILD_ID, user: PLAYER_1, code: "room" });

        const response = await lfg.useCases.kickPlayerFromOwnedRoom({
            guildId: GUILD_ID,
            owner: PLAYER_1,
            target: OWNER,
        });

        expect(response).toEqual({ kind: ELfgResultKind.NOT_ROOM_OWNER });
    });
});
