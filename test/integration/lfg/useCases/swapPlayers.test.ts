import { describe, expect, test } from "vitest";
import { ELfgResultKind } from "../../../../src/application/lfg/types.ts";
import { GUILD_ID, OTHER_GUILD_ID, OWNER, PLAYER_1, PLAYER_2, PLAYER_3, useLfgUseCases } from "./shared.ts";

describe("swapPlayers", () => {
    const lfg = useLfgUseCases();

    test("swaps players between rooms and transfers ownership", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "one" });
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: PLAYER_1, code: "two" });
        await lfg.useCases.movePlayerToRoomByCode({ guildId: GUILD_ID, user: PLAYER_2, code: "one" });
        await lfg.useCases.movePlayerToRoomByCode({ guildId: GUILD_ID, user: PLAYER_3, code: "two" });

        const result = await lfg.useCases.swapPlayers({ guildId: GUILD_ID, firstUser: OWNER, secondUser: PLAYER_1 });

        expect(result).toMatchObject({
            kind: ELfgResultKind.PLAYERS_SWAPPED,
            value: {
                ownershipTransfers: [
                    { roomCode: "one", newOwnerId: PLAYER_2.id },
                    { roomCode: "two", newOwnerId: PLAYER_3.id },
                ],
            },
        });
        expect(
            (await lfg.getRooms(GUILD_ID)).map((room) => ({ ...room, playerIds: room.playerIds.toSorted() })),
        ).toEqual([
            { code: "one", ownerId: PLAYER_2.id, playerIds: [PLAYER_1.id, PLAYER_2.id] },
            { code: "two", ownerId: PLAYER_3.id, playerIds: [OWNER.id, PLAYER_3.id] },
        ]);
    });

    test("preserves a single player room when another player replaces its owner", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "one" });
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: PLAYER_1, code: "two" });

        const result = await lfg.useCases.swapPlayers({
            guildId: GUILD_ID,
            firstUser: OWNER,
            secondUser: PLAYER_1,
        });

        expect(result).toMatchObject({
            kind: ELfgResultKind.PLAYERS_SWAPPED,
            value: {
                ownershipTransfers: [
                    { roomCode: "one", newOwnerId: PLAYER_1.id },
                    { roomCode: "two", newOwnerId: OWNER.id },
                ],
            },
        });

        expect(await lfg.getRooms(GUILD_ID)).toEqual([
            { code: "one", ownerId: PLAYER_1.id, playerIds: [PLAYER_1.id] },
            { code: "two", ownerId: OWNER.id, playerIds: [OWNER.id] },
        ]);
    });

    test("gives ownership to the earliest remaining member when the owner swaps with a roomless player", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "one" });
        await lfg.useCases.movePlayerToRoomByCode({ guildId: GUILD_ID, user: PLAYER_1, code: "one" });
        await lfg.useCases.movePlayerToRoomByCode({ guildId: GUILD_ID, user: PLAYER_2, code: "one" });

        const result = await lfg.useCases.swapPlayers({
            guildId: GUILD_ID,
            firstUser: OWNER,
            secondUser: PLAYER_3,
        });

        expect(result).toMatchObject({
            kind: ELfgResultKind.PLAYERS_SWAPPED,
            value: { ownershipTransfers: [{ roomCode: "one", newOwnerId: PLAYER_1.id }] },
        });

        const [room] = await lfg.getRooms(GUILD_ID);
        expect(room?.ownerId).toBe(PLAYER_1.id);
        expect(room?.playerIds.toSorted()).toEqual([PLAYER_1.id, PLAYER_2.id, PLAYER_3.id]);
    });

    test("moves a roomless player into the vacated room", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "one" });
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: PLAYER_1, code: "two" });

        await lfg.useCases.swapPlayers({ guildId: GUILD_ID, firstUser: OWNER, secondUser: PLAYER_2 });

        expect(await lfg.getRooms(GUILD_ID)).toEqual([
            { code: "one", ownerId: PLAYER_2.id, playerIds: [PLAYER_2.id] },
            { code: "two", ownerId: PLAYER_1.id, playerIds: [PLAYER_1.id] },
        ]);
    });

    test("looks up memberships only in the requested guild", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "one" });
        await lfg.useCases.createRoom({ guildId: OTHER_GUILD_ID, owner: OWNER, code: "other" });

        const result = await lfg.useCases.swapPlayers({ guildId: GUILD_ID, firstUser: OWNER, secondUser: PLAYER_1 });

        expect(result).toMatchObject({
            kind: ELfgResultKind.PLAYERS_SWAPPED,
            value: { ownershipTransfers: [{ roomCode: "one", newOwnerId: PLAYER_1.id }] },
        });
        expect(await lfg.getRooms(GUILD_ID)).toEqual([{ code: "one", ownerId: PLAYER_1.id, playerIds: [PLAYER_1.id] }]);
        expect(await lfg.getRooms(OTHER_GUILD_ID)).toEqual([
            { code: "other", ownerId: OWNER.id, playerIds: [OWNER.id] },
        ]);
    });

    test("rejects the same player and two roomless players", async () => {
        expect(await lfg.useCases.swapPlayers({ guildId: GUILD_ID, firstUser: OWNER, secondUser: OWNER })).toEqual({
            kind: ELfgResultKind.ATTEMPTED_TO_SWAP_THE_SAME_PLAYER,
        });
        expect(await lfg.useCases.swapPlayers({ guildId: GUILD_ID, firstUser: OWNER, secondUser: PLAYER_1 })).toEqual({
            kind: ELfgResultKind.CANNOT_SWAP_TWO_PLAYERS_NOT_IN_A_ROOM,
        });
    });

    test("keeps ownership when a non-owner swaps with a roomless player", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "one" });
        await lfg.useCases.movePlayerToRoomByCode({ guildId: GUILD_ID, user: PLAYER_1, code: "one" });

        const result = await lfg.useCases.swapPlayers({
            guildId: GUILD_ID,
            firstUser: PLAYER_1,
            secondUser: PLAYER_2,
        });

        expect(result).toMatchObject({
            kind: ELfgResultKind.PLAYERS_SWAPPED,
            value: { ownershipTransfers: [] },
        });

        expect(await lfg.getRooms(GUILD_ID)).toEqual([
            { code: "one", ownerId: OWNER.id, playerIds: [OWNER.id, PLAYER_2.id] },
        ]);
    });

    test("rejects swapping players already in the same room", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "one" });
        await lfg.useCases.movePlayerToRoomByCode({ guildId: GUILD_ID, user: PLAYER_1, code: "one" });

        const result = await lfg.useCases.swapPlayers({ guildId: GUILD_ID, firstUser: OWNER, secondUser: PLAYER_1 });

        expect(result).toMatchObject({
            kind: ELfgResultKind.CANNOT_SWAP_PLAYERS_IN_SAME_ROOM,
        });
        expect(await lfg.getRooms(GUILD_ID)).toEqual([
            { code: "one", ownerId: OWNER.id, playerIds: [OWNER.id, PLAYER_1.id] },
        ]);
    });
});
