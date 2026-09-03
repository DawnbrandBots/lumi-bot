import { describe, expect, test } from "vitest";
import { ELfgResultKind } from "../../../../src/application/lfg/types.ts";
import { kickPlayerFromRoom } from "../../../../src/application/lfg/useCases/kickPlayerFromRoom.ts";
import { ELfgPlayerRemovalKind } from "../../../../src/domain/lfg/models/playerRemoval.types.ts";
import { GUILD_ID, OWNER, PLAYER_1, useLfgUseCases } from "./shared.ts";

describe(kickPlayerFromRoom.name, () => {
    const lfg = useLfgUseCases();

    test("removes a player from the room identified by code", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "room" });
        await lfg.useCases.movePlayerToRoom({ guildId: GUILD_ID, user: PLAYER_1, code: "room" });

        const response = await lfg.useCases.kickPlayerFromRoom({ guildId: GUILD_ID, code: "room", target: PLAYER_1 });

        expect(response).toMatchObject({
            kind: ELfgResultKind.PLAYER_KICKED,
            value: {
                userId: OWNER.id,
                targetId: PLAYER_1.id,
                room: { code: "room", ownerId: OWNER.id, playerIds: [OWNER.id] },
                removalResult: { kind: ELfgPlayerRemovalKind.LEFT_ROOM_NORMALLY },
            },
        });
    });

    test("removes the owner and transfers ownership", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "room" });
        await lfg.useCases.movePlayerToRoom({ guildId: GUILD_ID, user: PLAYER_1, code: "room" });

        const response = await lfg.useCases.kickPlayerFromRoom({ guildId: GUILD_ID, code: "room", target: OWNER });

        expect(response).toMatchObject({
            kind: ELfgResultKind.PLAYER_KICKED,
            value: {
                userId: OWNER.id,
                targetId: OWNER.id,
                room: { code: "room", ownerId: PLAYER_1.id, playerIds: [PLAYER_1.id] },
                removalResult: {
                    kind: ELfgPlayerRemovalKind.OWNERSHIP_TRANSFERRED,
                    newOwnerId: PLAYER_1.id,
                },
            },
        });
        expect(await lfg.getRooms(GUILD_ID)).toEqual([
            { code: "room", ownerId: PLAYER_1.id, playerIds: [PLAYER_1.id] },
        ]);
    });

    test("removes the last player and deletes the room", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "room" });

        const response = await lfg.useCases.kickPlayerFromRoom({ guildId: GUILD_ID, code: "room", target: OWNER });

        expect(response).toMatchObject({
            kind: ELfgResultKind.PLAYER_KICKED,
            value: {
                userId: OWNER.id,
                targetId: OWNER.id,
                room: { code: "room", ownerId: OWNER.id, playerIds: [] },
                removalResult: { kind: ELfgPlayerRemovalKind.ROOM_DELETED },
            },
        });
        expect(await lfg.getRooms(GUILD_ID)).toEqual([]);
    });

    test("rejects missing rooms", async () => {
        const response = await lfg.useCases.kickPlayerFromRoom({
            guildId: GUILD_ID,
            code: "missing",
            target: PLAYER_1,
        });

        expect(response).toEqual({
            kind: ELfgResultKind.ROOM_NOT_FOUND,
            value: { code: "missing" },
        });
    });

    test("rejects targets outside the room", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "room" });

        const response = await lfg.useCases.kickPlayerFromRoom({ guildId: GUILD_ID, code: "room", target: PLAYER_1 });

        expect(response).toEqual({
            kind: ELfgResultKind.PLAYER_NOT_IN_ROOM,
            value: { ownerId: OWNER.id, targetId: PLAYER_1.id, code: "room" },
        });
    });
});
