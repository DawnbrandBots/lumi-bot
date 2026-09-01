import { describe, expect, test } from "vitest";
import { ELfgResultKind } from "../../../../src/application/lfg/types.ts";
import { movePlayerToRoom } from "../../../../src/application/lfg/useCases/movePlayerToRoom.ts";
import { ELfgPlayerRemovalKind } from "../../../../src/domain/lfg/models/playerRemoval.types.ts";
import { GUILD_ID, OWNER, PLAYER_1, PLAYER_2, PLAYER_3, useLfgUseCases } from "./shared.ts";

describe(movePlayerToRoom.name, () => {
    const lfg = useLfgUseCases();

    test("joins an existing room", async () => {
        await lfg.useCases.createRoom(GUILD_ID, OWNER, "room");

        const response = await lfg.useCases.movePlayerToRoom(GUILD_ID, PLAYER_1, "room");

        expect(response).toEqual({
            kind: ELfgResultKind.ROOM_JOINED,
            value: {
                userId: PLAYER_1.id,
                leftRoomCode: undefined,
                removalResult: undefined,
                room: { code: "room", ownerId: OWNER.id, playerIds: [OWNER.id, PLAYER_1.id] },
            },
        });
        expect((await lfg.getRooms(GUILD_ID))[0]?.playerIds).toEqual([OWNER.id, PLAYER_1.id]);
    });

    test("rejects missing rooms", async () => {
        const response = await lfg.useCases.movePlayerToRoom(GUILD_ID, PLAYER_1, "missing");

        expect(response).toEqual({
            kind: ELfgResultKind.ROOM_NOT_FOUND,
            value: { code: "missing" },
        });
    });

    test("rejects full rooms", async () => {
        await lfg.useCases.createRoom(GUILD_ID, OWNER, "room");
        await lfg.useCases.movePlayerToRoom(GUILD_ID, PLAYER_1, "room");
        await lfg.useCases.movePlayerToRoom(GUILD_ID, PLAYER_2, "room");

        const response = await lfg.useCases.movePlayerToRoom(GUILD_ID, PLAYER_3, "room");

        expect(response).toEqual({
            kind: ELfgResultKind.ROOM_IS_FULL,
            value: { code: "room" },
        });
    });

    test("moves a player out of their previous room", async () => {
        await lfg.useCases.createRoom(GUILD_ID, OWNER, "one");
        await lfg.useCases.createRoom(GUILD_ID, PLAYER_1, "two");

        const response = await lfg.useCases.movePlayerToRoom(GUILD_ID, PLAYER_1, "one");

        expect(response).toEqual({
            kind: ELfgResultKind.ROOM_JOINED,
            value: {
                userId: PLAYER_1.id,
                leftRoomCode: "two",
                removalResult: { kind: ELfgPlayerRemovalKind.ROOM_DELETED },
                room: { code: "one", ownerId: OWNER.id, playerIds: [OWNER.id, PLAYER_1.id] },
            },
        });
        expect(await lfg.getRooms(GUILD_ID)).toEqual([
            { code: "one", ownerId: OWNER.id, playerIds: [OWNER.id, PLAYER_1.id] },
        ]);
    });

    test("transfers ownership when the owner changes room", async () => {
        await lfg.useCases.createRoom(GUILD_ID, OWNER, "one");
        await lfg.useCases.movePlayerToRoom(GUILD_ID, PLAYER_1, "one");
        await lfg.useCases.createRoom(GUILD_ID, PLAYER_2, "two");

        const response = await lfg.useCases.movePlayerToRoom(GUILD_ID, OWNER, "two");

        expect(response).toMatchObject({
            kind: ELfgResultKind.ROOM_JOINED,
            value: {
                removalResult: {
                    kind: ELfgPlayerRemovalKind.OWNERSHIP_TRANSFERRED,
                    newOwnerId: PLAYER_1.id,
                },
            },
        });
        expect(await lfg.getRooms(GUILD_ID)).toEqual([
            { code: "one", ownerId: PLAYER_1.id, playerIds: [PLAYER_1.id] },
            { code: "two", ownerId: PLAYER_2.id, playerIds: [PLAYER_2.id, OWNER.id] },
        ]);
    });

    test("deletes the previous room when the owner was the last player", async () => {
        await lfg.useCases.createRoom(GUILD_ID, OWNER, "one");
        await lfg.useCases.createRoom(GUILD_ID, PLAYER_1, "two");

        const response = await lfg.useCases.movePlayerToRoom(GUILD_ID, OWNER, "two");

        expect(response).toMatchObject({
            kind: ELfgResultKind.ROOM_JOINED,
            value: {
                removalResult: { kind: ELfgPlayerRemovalKind.ROOM_DELETED },
            },
        });
        expect(await lfg.getRooms(GUILD_ID)).toEqual([
            { code: "two", ownerId: PLAYER_1.id, playerIds: [PLAYER_1.id, OWNER.id] },
        ]);
    });

    test("returns error response when already in the target room", async () => {
        await lfg.useCases.createRoom(GUILD_ID, OWNER, "room");

        const response = await lfg.useCases.movePlayerToRoom(GUILD_ID, OWNER, "room");

        expect(response).toEqual({
            kind: ELfgResultKind.ALREADY_IN_TARGET_ROOM,
            value: {
                userId: OWNER.id,
                room: { code: "room", ownerId: OWNER.id, playerIds: [OWNER.id] },
            },
        });
    });
});
