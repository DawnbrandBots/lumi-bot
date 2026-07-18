import type { MikroORM } from "@mikro-orm/sqlite";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import recreateDb from "../../scripts/utils/recreateDb.ts";
import { LFG_MAX_ROOM_CODE_LENGTH } from "../../src/lfg/constants.ts";
import { LfgFeature } from "../../src/lfg/feature.ts";
import { LfgRoom } from "../../src/lfg/models/room.ts";
import { ELfgFeatureReturnKind, ELfgPlayerRemovalKind, type IUser } from "../../src/lfg/types.ts";
import { migrationMikroOrmConfig } from "../mikro-orm.test.config.ts";

const GUILD_ID = "guild-1";
const OTHER_GUILD_ID = "guild-2";
const OWNER: IUser = { id: "owner" };
const PLAYER_1: IUser = { id: "player-1" };
const PLAYER_2: IUser = { id: "player-2" };
const PLAYER_3: IUser = { id: "player-3" };

type TestRoom = {
    readonly code: string;
    readonly ownerId: string;
    readonly playerIds: string[];
};

let orm: MikroORM;
let feature: LfgFeature;

function timestamp(value: Date | string): number {
    return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

async function getRooms(guildId: string): Promise<TestRoom[]> {
    const em = orm.em.fork();
    const rooms = await em.find(LfgRoom, { guildId }, { orderBy: { createdAt: "asc" }, populate: ["players"] });

    return rooms.map((room) => ({
        code: room.code,
        ownerId: room.ownerId,
        playerIds: room.players
            .toArray()
            .toSorted((a, b) => timestamp(a.joinedAt) - timestamp(b.joinedAt))
            .map((player) => player.userId),
    }));
}

// Tests recreate dbs. Simultaneous recreations cause errors. Therefore `concurrent: false`.
describe(LfgFeature.name, { concurrent: false }, () => {
    beforeEach(async () => {
        // Runtime entities only
        orm = await recreateDb(migrationMikroOrmConfig);
        feature = new LfgFeature({ em: orm.em.fork() });
    });

    afterEach(async () => {
        await orm.close(true);
    });

    describe(LfgFeature.prototype.create.name, () => {
        test("creates a room with the creator as owner", async () => {
            const response = await feature.create(GUILD_ID, OWNER, "AbC");

            expect(response).toEqual({
                kind: ELfgFeatureReturnKind.ROOM_CREATED,
                value: { userId: OWNER.id, room: { code: "AbC", ownerId: OWNER.id, playerIds: [OWNER.id] } },
            });
            expect(await getRooms(GUILD_ID)).toEqual([{ code: "AbC", ownerId: OWNER.id, playerIds: [OWNER.id] }]);
        });

        test("rejects duplicate room codes in the same guild", async () => {
            await feature.create(GUILD_ID, OWNER, "room");

            const response = await feature.create(GUILD_ID, PLAYER_1, "room");

            expect(response).toEqual({
                kind: ELfgFeatureReturnKind.ROOM_ALREADY_EXISTS,
                value: { code: "room" },
            });
        });

        test("allows the same exact room code in another guild", async () => {
            await feature.create(GUILD_ID, OWNER, "room");

            const response = await feature.create(OTHER_GUILD_ID, OWNER, "room");

            expect(response.kind).toBe(ELfgFeatureReturnKind.ROOM_CREATED);
            expect(await getRooms(GUILD_ID)).toHaveLength(1);
            expect(await getRooms(OTHER_GUILD_ID)).toHaveLength(1);
        });

        test("rejects invalid room code length", async () => {
            const response = await feature.create(GUILD_ID, OWNER, "x".repeat(LFG_MAX_ROOM_CODE_LENGTH + 1));

            expect(response).toEqual({ kind: ELfgFeatureReturnKind.INVALID_ROOM_CODE });
        });

        test("rejects users already in a room", async () => {
            await feature.create(GUILD_ID, OWNER, "room-1");

            const response = await feature.create(GUILD_ID, OWNER, "room-2");

            expect(response).toEqual({ kind: ELfgFeatureReturnKind.ALREADY_IN_A_ROOM });
        });
    });

    describe(LfgFeature.prototype.join.name, () => {
        test("joins an existing room", async () => {
            await feature.create(GUILD_ID, OWNER, "room");

            const response = await feature.join(GUILD_ID, PLAYER_1, "room");

            expect(response).toEqual({
                kind: ELfgFeatureReturnKind.ROOM_JOINED,
                value: {
                    userId: PLAYER_1.id,
                    leftRoomCode: undefined,
                    room: { code: "room", ownerId: OWNER.id, playerIds: [OWNER.id, PLAYER_1.id] },
                },
            });
            expect((await getRooms(GUILD_ID))[0]?.playerIds).toEqual([OWNER.id, PLAYER_1.id]);
        });

        test("rejects missing rooms", async () => {
            const response = await feature.join(GUILD_ID, PLAYER_1, "missing");

            expect(response).toEqual({
                kind: ELfgFeatureReturnKind.ROOM_NOT_FOUND,
                value: { code: "missing" },
            });
        });

        test("rejects full rooms", async () => {
            await feature.create(GUILD_ID, OWNER, "room");
            await feature.join(GUILD_ID, PLAYER_1, "room");
            await feature.join(GUILD_ID, PLAYER_2, "room");

            const response = await feature.join(GUILD_ID, PLAYER_3, "room");

            expect(response).toEqual({
                kind: ELfgFeatureReturnKind.ROOM_IS_FULL,
                value: { code: "room" },
            });
        });

        test("moves a player out of their previous room", async () => {
            await feature.create(GUILD_ID, OWNER, "one");
            await feature.create(GUILD_ID, PLAYER_1, "two");

            const response = await feature.join(GUILD_ID, PLAYER_1, "one");

            expect(response).toEqual({
                kind: ELfgFeatureReturnKind.ROOM_JOINED,
                value: {
                    userId: PLAYER_1.id,
                    leftRoomCode: "two",
                    room: { code: "one", ownerId: OWNER.id, playerIds: [OWNER.id, PLAYER_1.id] },
                },
            });
            expect(await getRooms(GUILD_ID)).toEqual([
                { code: "one", ownerId: OWNER.id, playerIds: [OWNER.id, PLAYER_1.id] },
            ]);
        });

        test("transfers ownership when the owner changes room", async () => {
            await feature.create(GUILD_ID, OWNER, "one");
            await feature.join(GUILD_ID, PLAYER_1, "one");
            await feature.create(GUILD_ID, PLAYER_2, "two");

            const response = await feature.join(GUILD_ID, OWNER, "two");

            expect(response.kind).toBe(ELfgFeatureReturnKind.ROOM_JOINED);
            expect(await getRooms(GUILD_ID)).toEqual([
                { code: "one", ownerId: PLAYER_1.id, playerIds: [PLAYER_1.id] },
                { code: "two", ownerId: PLAYER_2.id, playerIds: [PLAYER_2.id, OWNER.id] },
            ]);
        });

        test("deletes the previous room when the owner was the last player", async () => {
            await feature.create(GUILD_ID, OWNER, "one");
            await feature.create(GUILD_ID, PLAYER_1, "two");

            const response = await feature.join(GUILD_ID, OWNER, "two");

            expect(response.kind).toBe(ELfgFeatureReturnKind.ROOM_JOINED);
            expect(await getRooms(GUILD_ID)).toEqual([
                { code: "two", ownerId: PLAYER_1.id, playerIds: [PLAYER_1.id, OWNER.id] },
            ]);
        });

        test("returns error response when already in the target room", async () => {
            await feature.create(GUILD_ID, OWNER, "room");

            const response = await feature.join(GUILD_ID, OWNER, "room");

            expect(response.kind).toBe(ELfgFeatureReturnKind.ALREADY_IN_TARGET_ROOM);
        });
    });

    describe(LfgFeature.prototype.transfer.name, () => {
        test("transfers ownership to another room player", async () => {
            await feature.create(GUILD_ID, OWNER, "room");
            await feature.join(GUILD_ID, PLAYER_1, "room");

            const response = await feature.transfer(GUILD_ID, OWNER, PLAYER_1);

            expect(response.kind).toBe(ELfgFeatureReturnKind.OWNERSHIP_TRANSFERRED);
            expect((await getRooms(GUILD_ID))[0]?.ownerId).toBe(PLAYER_1.id);
        });

        test("rejects targets outside the room", async () => {
            await feature.create(GUILD_ID, OWNER, "room");

            const response = await feature.transfer(GUILD_ID, OWNER, PLAYER_1);

            expect(response).toEqual({
                kind: ELfgFeatureReturnKind.PLAYER_NOT_IN_ROOM,
                value: { targetId: PLAYER_1.id },
            });
        });

        test("rejects self-transfer", async () => {
            await feature.create(GUILD_ID, OWNER, "room");

            const response = await feature.transfer(GUILD_ID, OWNER, OWNER);

            expect(response).toEqual({ kind: ELfgFeatureReturnKind.CANNOT_TRANSFER_TO_YOURSELF });
        });

        test("rejects non-owners", async () => {
            await feature.create(GUILD_ID, OWNER, "room");
            await feature.join(GUILD_ID, PLAYER_1, "room");

            const response = await feature.transfer(GUILD_ID, PLAYER_1, OWNER);

            expect(response).toEqual({ kind: ELfgFeatureReturnKind.NOT_ROOM_OWNER });
        });
    });

    describe(LfgFeature.prototype.kick.name, () => {
        test("kicks another room player", async () => {
            await feature.create(GUILD_ID, OWNER, "room");
            await feature.join(GUILD_ID, PLAYER_1, "room");

            const response = await feature.kick(GUILD_ID, OWNER, PLAYER_1);

            expect(response.kind).toBe(ELfgFeatureReturnKind.PLAYER_KICKED);
            expect((await getRooms(GUILD_ID))[0]?.playerIds).toEqual([OWNER.id]);
        });

        test("rejects targets outside the room", async () => {
            await feature.create(GUILD_ID, OWNER, "room");

            const response = await feature.kick(GUILD_ID, OWNER, PLAYER_1);

            expect(response).toEqual({
                kind: ELfgFeatureReturnKind.PLAYER_NOT_IN_ROOM,
                value: { targetId: PLAYER_1.id },
            });
        });

        test("rejects self-kick", async () => {
            await feature.create(GUILD_ID, OWNER, "room");

            const response = await feature.kick(GUILD_ID, OWNER, OWNER);

            expect(response).toEqual({ kind: ELfgFeatureReturnKind.CANNOT_KICK_YOURSELF });
        });

        test("rejects non-owners", async () => {
            await feature.create(GUILD_ID, OWNER, "room");
            await feature.join(GUILD_ID, PLAYER_1, "room");

            const response = await feature.kick(GUILD_ID, PLAYER_1, OWNER);

            expect(response).toEqual({ kind: ELfgFeatureReturnKind.NOT_ROOM_OWNER });
        });
    });

    describe(LfgFeature.prototype.leave.name, () => {
        test("deletes the room when the last player leaves", async () => {
            await feature.create(GUILD_ID, OWNER, "room");

            const response = await feature.leave(GUILD_ID, OWNER);

            expect(response).toEqual({
                kind: ELfgFeatureReturnKind.ROOM_LEFT,
                value: { kind: ELfgPlayerRemovalKind.ROOM_DELETED, userId: OWNER.id, code: "room" },
            });
            expect(await getRooms(GUILD_ID)).toEqual([]);
        });

        test("transfers ownership to the earliest remaining player", async () => {
            await feature.create(GUILD_ID, OWNER, "room");
            await feature.join(GUILD_ID, PLAYER_1, "room");
            await feature.join(GUILD_ID, PLAYER_2, "room");

            const response = await feature.leave(GUILD_ID, OWNER);

            expect(response).toEqual({
                kind: ELfgFeatureReturnKind.ROOM_LEFT,
                value: {
                    kind: ELfgPlayerRemovalKind.OWNERSHIP_TRANSFERRED,
                    userId: OWNER.id,
                    code: "room",
                    newOwnerId: PLAYER_1.id,
                },
            });
            expect((await getRooms(GUILD_ID))[0]).toEqual({
                code: "room",
                ownerId: PLAYER_1.id,
                playerIds: [PLAYER_1.id, PLAYER_2.id],
            });
        });

        test("rejects users who are not in a room", async () => {
            const response = await feature.leave(GUILD_ID, OWNER);

            expect(response).toEqual({ kind: ELfgFeatureReturnKind.NOT_IN_A_ROOM });
        });
    });

    describe(LfgFeature.prototype.disband.name, () => {
        test("deletes the room when called by the owner", async () => {
            await feature.create(GUILD_ID, OWNER, "room");
            await feature.join(GUILD_ID, PLAYER_1, "room");

            const response = await feature.disband(GUILD_ID, OWNER);

            expect(response).toEqual({
                kind: ELfgFeatureReturnKind.ROOM_DISBANDED,
                value: { userId: OWNER.id, code: "room" },
            });
            expect(await getRooms(GUILD_ID)).toEqual([]);
        });

        test("rejects non-owners", async () => {
            await feature.create(GUILD_ID, OWNER, "room");
            await feature.join(GUILD_ID, PLAYER_1, "room");

            const response = await feature.disband(GUILD_ID, PLAYER_1);

            expect(response).toEqual({ kind: ELfgFeatureReturnKind.NOT_ROOM_OWNER });
            expect(await getRooms(GUILD_ID)).toEqual([
                { code: "room", ownerId: OWNER.id, playerIds: [OWNER.id, PLAYER_1.id] },
            ]);
        });

        test("rejects users who are not in a room", async () => {
            const response = await feature.disband(GUILD_ID, OWNER);

            expect(response).toEqual({ kind: ELfgFeatureReturnKind.NOT_IN_A_ROOM });
        });
    });

    test("status only displays rooms from the requested guild", async () => {
        await feature.create(GUILD_ID, OWNER, "one");
        await feature.create(OTHER_GUILD_ID, PLAYER_1, "two");

        const response = await feature.status(GUILD_ID);

        expect(response).toEqual({
            kind: ELfgFeatureReturnKind.ROOMS_LISTED,
            value: { rooms: [{ code: "one", ownerId: OWNER.id, playerIds: [OWNER.id] }] },
        });
    });
});
