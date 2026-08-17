import type { EntityManager } from "@mikro-orm/sqlite";
import { MikroORM } from "@mikro-orm/sqlite";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { ELfgResultKind } from "../../../src/application/lfg/types.ts";
import { changeOwnedRoomCode } from "../../../src/application/lfg/useCases/changeOwnedRoomCode.ts";
import { changeRoomCode } from "../../../src/application/lfg/useCases/changeRoomCode.ts";
import { create } from "../../../src/application/lfg/useCases/create.ts";
import { disband } from "../../../src/application/lfg/useCases/disband.ts";
import { disbandOwnedRoom } from "../../../src/application/lfg/useCases/disbandOwnedRoom.ts";
import { kick } from "../../../src/application/lfg/useCases/kick.ts";
import { kickFromOwnedRoom } from "../../../src/application/lfg/useCases/kickFromOwnedRoom.ts";
import { leave } from "../../../src/application/lfg/useCases/leave.ts";
import { move } from "../../../src/application/lfg/useCases/move.ts";
import { status } from "../../../src/application/lfg/useCases/status.ts";
import { transfer } from "../../../src/application/lfg/useCases/transfer.ts";
import { transferOwnedRoom } from "../../../src/application/lfg/useCases/transferOwnedRoom.ts";
import { FRIEND_BATTLE_CODE_MAXIMUM_LENGTH } from "../../../src/domain/game/constants.ts";
import { ELfgPlayerRemovalKind } from "../../../src/domain/lfg/models/playerRemoval.types.ts";
import type { IUser } from "../../../src/domain/lfg/models/user.types.ts";
import { LfgRoom } from "../../../src/infrastructure/lfg/models/room.ts";
import { getWithLfgUnitOfWork } from "../../../src/loaders/lfgUnitOfWork.ts";
import { migrationMikroOrmConfig } from "../../mikro-orm.test.config.ts";
import getSameConfigInMemory from "../../utils/getSameConfigInMemory.ts";

const GUILD_ID = "guild-1";
const OTHER_GUILD_ID = "guild-2";
const NEW_ROOM_CODE = "new";
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
let feature: LfgUseCases;

class LfgUseCases {
    private readonly changeOwnedLfgRoomCode;
    private readonly changeLfgRoomCode;
    private readonly createLfgRoom;
    private readonly disbandLfgRoom;
    private readonly disbandOwnedLfgRoom;
    private readonly getLfgStatus;
    private readonly kickFromLfgRoom;
    private readonly kickFromOwnedLfgRoom;
    private readonly leaveLfgRoom;
    private readonly moveLfgUser;
    private readonly transferLfgRoom;
    private readonly transferOwnedLfgRoom;

    public constructor({ em }: { readonly em: EntityManager }) {
        const withLfgUnitOfWork = getWithLfgUnitOfWork(em);
        this.changeOwnedLfgRoomCode = withLfgUnitOfWork(changeOwnedRoomCode);
        this.changeLfgRoomCode = withLfgUnitOfWork(changeRoomCode);
        this.createLfgRoom = withLfgUnitOfWork(create);
        this.disbandLfgRoom = withLfgUnitOfWork(disband);
        this.disbandOwnedLfgRoom = withLfgUnitOfWork(disbandOwnedRoom);
        this.getLfgStatus = withLfgUnitOfWork(status);
        this.kickFromLfgRoom = withLfgUnitOfWork(kick);
        this.kickFromOwnedLfgRoom = withLfgUnitOfWork(kickFromOwnedRoom);
        this.leaveLfgRoom = withLfgUnitOfWork(leave);
        this.moveLfgUser = withLfgUnitOfWork(move);
        this.transferLfgRoom = withLfgUnitOfWork(transfer);
        this.transferOwnedLfgRoom = withLfgUnitOfWork(transferOwnedRoom);
    }

    private toPublicRoom(room: { readonly code: string; readonly ownerId: string; readonly playerIds: readonly string[] }) {
        return { code: room.code, ownerId: room.ownerId, playerIds: room.playerIds };
    }

    public async status(guildId: string) {
        const result = await this.getLfgStatus({ guildId });
        return {
            ...result,
            value: { rooms: result.value.rooms.map((room) => this.toPublicRoom(room)) },
        };
    }

    public async create(guildId: string, owner: IUser, code: string) {
        const result = await this.createLfgRoom({ guildId, owner, code });
        return result.kind === ELfgResultKind.ROOM_CREATED
            ? { ...result, value: { ...result.value, room: this.toPublicRoom(result.value.room) } }
            : result;
    }

    public changeOwnedRoomCode(guildId: string, owner: IUser, newCode: string) {
        return this.changeOwnedLfgRoomCode({ guildId, owner, newCode });
    }

    public changeRoomCode(guildId: string, code: string, newCode: string) {
        return this.changeLfgRoomCode({ guildId, code, newCode });
    }

    public async move(guildId: string, user: IUser, code: string) {
        const result = await this.moveLfgUser({ guildId, user, code });
        return result.kind === ELfgResultKind.ROOM_JOINED ||
            result.kind === ELfgResultKind.ALREADY_IN_TARGET_ROOM
            ? { ...result, value: { ...result.value, room: this.toPublicRoom(result.value.room) } }
            : result;
    }

    public async transferOwnedRoom(guildId: string, owner: IUser, target: IUser) {
        const result = await this.transferOwnedLfgRoom({ guildId, owner, target });
        return result.kind === ELfgResultKind.OWNERSHIP_TRANSFERRED
            ? { ...result, value: { ...result.value, room: this.toPublicRoom(result.value.room) } }
            : result;
    }

    public async transfer(guildId: string, code: string, target: IUser) {
        const result = await this.transferLfgRoom({ guildId, code, target });
        return result.kind === ELfgResultKind.OWNERSHIP_TRANSFERRED
            ? { ...result, value: { ...result.value, room: this.toPublicRoom(result.value.room) } }
            : result;
    }

    public async kickFromOwnedRoom(guildId: string, owner: IUser, target: IUser) {
        const result = await this.kickFromOwnedLfgRoom({ guildId, owner, target });
        return result.kind === ELfgResultKind.PLAYER_KICKED
            ? { ...result, value: { ...result.value, room: this.toPublicRoom(result.value.room) } }
            : result;
    }

    public async kick(guildId: string, code: string, target: IUser) {
        const result = await this.kickFromLfgRoom({ guildId, code, target });
        return result.kind === ELfgResultKind.PLAYER_KICKED
            ? { ...result, value: { ...result.value, room: this.toPublicRoom(result.value.room) } }
            : result;
    }

    public leave(guildId: string, user: IUser) {
        return this.leaveLfgRoom({ guildId, user });
    }

    public disbandOwnedRoom(guildId: string, owner: IUser) {
        return this.disbandOwnedLfgRoom({ guildId, owner });
    }

    public disband(guildId: string, code: string) {
        return this.disbandLfgRoom({ guildId, code });
    }
}

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

const config = getSameConfigInMemory(migrationMikroOrmConfig);

// Tests recreate dbs. Simultaneous recreations cause errors. Therefore `concurrent: false`.
describe(LfgUseCases.name, { concurrent: false }, () => {
    beforeEach(async () => {
        // Runtime entities only
        orm = await MikroORM.init(config);
        await orm.schema.create();
        feature = new LfgUseCases({ em: orm.em.fork() });
    });

    afterEach(async () => {
        await orm.close(true);
    });

    describe(LfgUseCases.prototype.create.name, () => {
        test("creates a room with the creator as owner", async () => {
            const response = await feature.create(GUILD_ID, OWNER, "AbC");

            expect(response).toEqual({
                kind: ELfgResultKind.ROOM_CREATED,
                value: { userId: OWNER.id, room: { code: "AbC", ownerId: OWNER.id, playerIds: [OWNER.id] } },
            });
            expect(await getRooms(GUILD_ID)).toEqual([{ code: "AbC", ownerId: OWNER.id, playerIds: [OWNER.id] }]);
        });

        test("rejects duplicate room codes in the same guild", async () => {
            await feature.create(GUILD_ID, OWNER, "room");

            const response = await feature.create(GUILD_ID, PLAYER_1, "room");

            expect(response).toEqual({
                kind: ELfgResultKind.ROOM_ALREADY_EXISTS,
                value: { code: "room" },
            });
        });

        test("allows the same exact room code in another guild", async () => {
            await feature.create(GUILD_ID, OWNER, "room");

            const response = await feature.create(OTHER_GUILD_ID, OWNER, "room");

            expect(response.kind).toBe(ELfgResultKind.ROOM_CREATED);
            expect(await getRooms(GUILD_ID)).toHaveLength(1);
            expect(await getRooms(OTHER_GUILD_ID)).toHaveLength(1);
        });

        test("rejects invalid room code length", async () => {
            const response = await feature.create(GUILD_ID, OWNER, "x".repeat(FRIEND_BATTLE_CODE_MAXIMUM_LENGTH + 1));

            expect(response).toEqual({ kind: ELfgResultKind.INVALID_ROOM_CODE });
        });

        test("rejects users already in a room", async () => {
            await feature.create(GUILD_ID, OWNER, "room-1");

            const response = await feature.create(GUILD_ID, OWNER, "room-2");

            expect(response).toEqual({
                kind: ELfgResultKind.ALREADY_IN_A_ROOM,
                value: { userId: OWNER.id },
            });
        });
    });

    describe(LfgUseCases.prototype.changeOwnedRoomCode.name, () => {
        test("changes an owned room's code", async () => {
            await feature.create(GUILD_ID, OWNER, "old");
            await feature.move(GUILD_ID, PLAYER_1, "old");

            const response = await feature.changeOwnedRoomCode(GUILD_ID, OWNER, NEW_ROOM_CODE);

            expect(response).toEqual({
                kind: ELfgResultKind.ROOM_CODE_CHANGED,
                value: {
                    oldCode: "old",
                    newCode: NEW_ROOM_CODE,
                },
            });
            expect(await getRooms(GUILD_ID)).toEqual([
                { code: NEW_ROOM_CODE, ownerId: OWNER.id, playerIds: [OWNER.id, PLAYER_1.id] },
            ]);
        });

        test("rejects invalid room code length", async () => {
            await feature.create(GUILD_ID, OWNER, "old");

            const response = await feature.changeOwnedRoomCode(
                GUILD_ID,
                OWNER,
                "x".repeat(FRIEND_BATTLE_CODE_MAXIMUM_LENGTH + 1),
            );

            expect(response).toEqual({ kind: ELfgResultKind.INVALID_ROOM_CODE });
            expect(await getRooms(GUILD_ID)).toEqual([{ code: "old", ownerId: OWNER.id, playerIds: [OWNER.id] }]);
        });

        test("rejects duplicate room codes in the same guild", async () => {
            await feature.create(GUILD_ID, OWNER, "old");
            await feature.create(GUILD_ID, PLAYER_1, NEW_ROOM_CODE);

            const response = await feature.changeOwnedRoomCode(GUILD_ID, OWNER, NEW_ROOM_CODE);

            expect(response).toEqual({
                kind: ELfgResultKind.ROOM_ALREADY_EXISTS,
                value: { code: NEW_ROOM_CODE },
            });
            expect(await getRooms(GUILD_ID)).toEqual([
                { code: "old", ownerId: OWNER.id, playerIds: [OWNER.id] },
                { code: NEW_ROOM_CODE, ownerId: PLAYER_1.id, playerIds: [PLAYER_1.id] },
            ]);
        });

        test("rejects non-owners", async () => {
            await feature.create(GUILD_ID, OWNER, "old");
            await feature.move(GUILD_ID, PLAYER_1, "old");

            const response = await feature.changeOwnedRoomCode(GUILD_ID, PLAYER_1, NEW_ROOM_CODE);

            expect(response).toEqual({ kind: ELfgResultKind.NOT_ROOM_OWNER });
            expect(await getRooms(GUILD_ID)).toEqual([
                { code: "old", ownerId: OWNER.id, playerIds: [OWNER.id, PLAYER_1.id] },
            ]);
        });

        test("rejects users who are not in a room", async () => {
            const response = await feature.changeOwnedRoomCode(GUILD_ID, OWNER, NEW_ROOM_CODE);

            expect(response).toEqual({ kind: ELfgResultKind.NOT_IN_A_ROOM });
        });
    });

    describe(LfgUseCases.prototype.changeRoomCode.name, () => {
        test("changes the room code identified by code", async () => {
            await feature.create(GUILD_ID, OWNER, "old");
            await feature.move(GUILD_ID, PLAYER_1, "old");

            const response = await feature.changeRoomCode(GUILD_ID, "old", NEW_ROOM_CODE);

            expect(response).toEqual({
                kind: ELfgResultKind.ROOM_CODE_CHANGED,
                value: {
                    oldCode: "old",
                    newCode: NEW_ROOM_CODE,
                },
            });
            expect(await getRooms(GUILD_ID)).toEqual([
                { code: NEW_ROOM_CODE, ownerId: OWNER.id, playerIds: [OWNER.id, PLAYER_1.id] },
            ]);
        });

        test("rejects missing rooms", async () => {
            const response = await feature.changeRoomCode(GUILD_ID, "missing", NEW_ROOM_CODE);

            expect(response).toEqual({
                kind: ELfgResultKind.ROOM_NOT_FOUND,
                value: { code: "missing" },
            });
        });

        test("rejects invalid room code length", async () => {
            await feature.create(GUILD_ID, OWNER, "old");

            const response = await feature.changeRoomCode(
                GUILD_ID,
                "old",
                "x".repeat(FRIEND_BATTLE_CODE_MAXIMUM_LENGTH + 1),
            );

            expect(response).toEqual({ kind: ELfgResultKind.INVALID_ROOM_CODE });
            expect(await getRooms(GUILD_ID)).toEqual([{ code: "old", ownerId: OWNER.id, playerIds: [OWNER.id] }]);
        });

        test("rejects duplicate room codes in the same guild", async () => {
            await feature.create(GUILD_ID, OWNER, "old");
            await feature.create(GUILD_ID, PLAYER_1, NEW_ROOM_CODE);

            const response = await feature.changeRoomCode(GUILD_ID, "old", NEW_ROOM_CODE);

            expect(response).toEqual({
                kind: ELfgResultKind.ROOM_ALREADY_EXISTS,
                value: { code: NEW_ROOM_CODE },
            });
            expect(await getRooms(GUILD_ID)).toEqual([
                { code: "old", ownerId: OWNER.id, playerIds: [OWNER.id] },
                { code: NEW_ROOM_CODE, ownerId: PLAYER_1.id, playerIds: [PLAYER_1.id] },
            ]);
        });
    });

    describe(LfgUseCases.prototype.move.name, () => {
        test("joins an existing room", async () => {
            await feature.create(GUILD_ID, OWNER, "room");

            const response = await feature.move(GUILD_ID, PLAYER_1, "room");

            expect(response).toEqual({
                kind: ELfgResultKind.ROOM_JOINED,
                value: {
                    userId: PLAYER_1.id,
                    leftRoomCode: undefined,
                    removalResult: undefined,
                    room: { code: "room", ownerId: OWNER.id, playerIds: [OWNER.id, PLAYER_1.id] },
                },
            });
            expect((await getRooms(GUILD_ID))[0]?.playerIds).toEqual([OWNER.id, PLAYER_1.id]);
        });

        test("rejects missing rooms", async () => {
            const response = await feature.move(GUILD_ID, PLAYER_1, "missing");

            expect(response).toEqual({
                kind: ELfgResultKind.ROOM_NOT_FOUND,
                value: { code: "missing" },
            });
        });

        test("rejects full rooms", async () => {
            await feature.create(GUILD_ID, OWNER, "room");
            await feature.move(GUILD_ID, PLAYER_1, "room");
            await feature.move(GUILD_ID, PLAYER_2, "room");

            const response = await feature.move(GUILD_ID, PLAYER_3, "room");

            expect(response).toEqual({
                kind: ELfgResultKind.ROOM_IS_FULL,
                value: { code: "room" },
            });
        });

        test("moves a player out of their previous room", async () => {
            await feature.create(GUILD_ID, OWNER, "one");
            await feature.create(GUILD_ID, PLAYER_1, "two");

            const response = await feature.move(GUILD_ID, PLAYER_1, "one");

            expect(response).toEqual({
                kind: ELfgResultKind.ROOM_JOINED,
                value: {
                    userId: PLAYER_1.id,
                    leftRoomCode: "two",
                    removalResult: { kind: ELfgPlayerRemovalKind.ROOM_DELETED },
                    room: { code: "one", ownerId: OWNER.id, playerIds: [OWNER.id, PLAYER_1.id] },
                },
            });
            expect(await getRooms(GUILD_ID)).toEqual([
                { code: "one", ownerId: OWNER.id, playerIds: [OWNER.id, PLAYER_1.id] },
            ]);
        });

        test("transfers ownership when the owner changes room", async () => {
            await feature.create(GUILD_ID, OWNER, "one");
            await feature.move(GUILD_ID, PLAYER_1, "one");
            await feature.create(GUILD_ID, PLAYER_2, "two");

            const response = await feature.move(GUILD_ID, OWNER, "two");

            expect(response).toMatchObject({
                kind: ELfgResultKind.ROOM_JOINED,
                value: {
                    removalResult: {
                        kind: ELfgPlayerRemovalKind.OWNERSHIP_TRANSFERRED,
                        newOwnerId: PLAYER_1.id,
                    },
                },
            });
            expect(await getRooms(GUILD_ID)).toEqual([
                { code: "one", ownerId: PLAYER_1.id, playerIds: [PLAYER_1.id] },
                { code: "two", ownerId: PLAYER_2.id, playerIds: [PLAYER_2.id, OWNER.id] },
            ]);
        });

        test("deletes the previous room when the owner was the last player", async () => {
            await feature.create(GUILD_ID, OWNER, "one");
            await feature.create(GUILD_ID, PLAYER_1, "two");

            const response = await feature.move(GUILD_ID, OWNER, "two");

            expect(response).toMatchObject({
                kind: ELfgResultKind.ROOM_JOINED,
                value: {
                    removalResult: { kind: ELfgPlayerRemovalKind.ROOM_DELETED },
                },
            });
            expect(await getRooms(GUILD_ID)).toEqual([
                { code: "two", ownerId: PLAYER_1.id, playerIds: [PLAYER_1.id, OWNER.id] },
            ]);
        });

        test("returns error response when already in the target room", async () => {
            await feature.create(GUILD_ID, OWNER, "room");

            const response = await feature.move(GUILD_ID, OWNER, "room");

            expect(response).toEqual({
                kind: ELfgResultKind.ALREADY_IN_TARGET_ROOM,
                value: {
                    userId: OWNER.id,
                    room: { code: "room", ownerId: OWNER.id, playerIds: [OWNER.id] },
                },
            });
        });
    });

    describe(LfgUseCases.prototype.transferOwnedRoom.name, () => {
        test("transfers ownership to another room player", async () => {
            await feature.create(GUILD_ID, OWNER, "room");
            await feature.move(GUILD_ID, PLAYER_1, "room");

            const response = await feature.transferOwnedRoom(GUILD_ID, OWNER, PLAYER_1);

            expect(response.kind).toBe(ELfgResultKind.OWNERSHIP_TRANSFERRED);
            expect((await getRooms(GUILD_ID))[0]?.ownerId).toBe(PLAYER_1.id);
        });

        test("rejects targets outside the room", async () => {
            await feature.create(GUILD_ID, OWNER, "room");

            const response = await feature.transferOwnedRoom(GUILD_ID, OWNER, PLAYER_1);

            expect(response).toEqual({
                kind: ELfgResultKind.PLAYER_NOT_IN_ROOM,
                value: { ownerId: OWNER.id, targetId: PLAYER_1.id, code: "room" },
            });
        });

        test("rejects self-transfer", async () => {
            await feature.create(GUILD_ID, OWNER, "room");

            const response = await feature.transferOwnedRoom(GUILD_ID, OWNER, OWNER);

            expect(response).toEqual({
                kind: ELfgResultKind.CANNOT_TRANSFER_TO_YOURSELF,
                value: { userId: OWNER.id, code: "room" },
            });
        });

        test("rejects non-owners", async () => {
            await feature.create(GUILD_ID, OWNER, "room");
            await feature.move(GUILD_ID, PLAYER_1, "room");

            const response = await feature.transferOwnedRoom(GUILD_ID, PLAYER_1, OWNER);

            expect(response).toEqual({ kind: ELfgResultKind.NOT_ROOM_OWNER });
        });
    });

    describe(LfgUseCases.prototype.transfer.name, () => {
        test("transfers ownership in the room identified by code", async () => {
            await feature.create(GUILD_ID, OWNER, "room");
            await feature.move(GUILD_ID, PLAYER_1, "room");

            const response = await feature.transfer(GUILD_ID, "room", PLAYER_1);

            expect(response).toEqual({
                kind: ELfgResultKind.OWNERSHIP_TRANSFERRED,
                value: {
                    userId: OWNER.id,
                    targetId: PLAYER_1.id,
                    room: { code: "room", ownerId: PLAYER_1.id, playerIds: [OWNER.id, PLAYER_1.id] },
                },
            });
        });

        test("rejects missing rooms", async () => {
            const response = await feature.transfer(GUILD_ID, "missing", PLAYER_1);

            expect(response).toEqual({
                kind: ELfgResultKind.ROOM_NOT_FOUND,
                value: { code: "missing" },
            });
        });

        test("rejects targets outside the room", async () => {
            await feature.create(GUILD_ID, OWNER, "room");

            const response = await feature.transfer(GUILD_ID, "room", PLAYER_1);

            expect(response).toEqual({
                kind: ELfgResultKind.PLAYER_NOT_IN_ROOM,
                value: { ownerId: OWNER.id, targetId: PLAYER_1.id, code: "room" },
            });
        });

        test("rejects transferring ownership to the current owner", async () => {
            await feature.create(GUILD_ID, OWNER, "room");

            const response = await feature.transfer(GUILD_ID, "room", OWNER);

            expect(response).toEqual({
                kind: ELfgResultKind.CANNOT_TRANSFER_TO_YOURSELF,
                value: { userId: OWNER.id, code: "room" },
            });
        });
    });

    describe(LfgUseCases.prototype.kickFromOwnedRoom.name, () => {
        test("kicks another room player", async () => {
            await feature.create(GUILD_ID, OWNER, "room");
            await feature.move(GUILD_ID, PLAYER_1, "room");

            const response = await feature.kickFromOwnedRoom(GUILD_ID, OWNER, PLAYER_1);

            expect(response).toEqual({
                kind: ELfgResultKind.PLAYER_KICKED,
                value: {
                    userId: OWNER.id,
                    targetId: PLAYER_1.id,
                    room: { code: "room", ownerId: OWNER.id, playerIds: [OWNER.id] },
                    removalResult: { kind: ELfgPlayerRemovalKind.LEFT_ROOM_NORMALLY },
                },
            });
            expect((await getRooms(GUILD_ID))[0]?.playerIds).toEqual([OWNER.id]);
        });

        test("rejects targets outside the room", async () => {
            await feature.create(GUILD_ID, OWNER, "room");

            const response = await feature.kickFromOwnedRoom(GUILD_ID, OWNER, PLAYER_1);

            expect(response).toEqual({
                kind: ELfgResultKind.PLAYER_NOT_IN_ROOM,
                value: { ownerId: OWNER.id, targetId: PLAYER_1.id, code: "room" },
            });
        });

        test("rejects self-kick", async () => {
            await feature.create(GUILD_ID, OWNER, "room");

            const response = await feature.kickFromOwnedRoom(GUILD_ID, OWNER, OWNER);

            expect(response).toEqual({ kind: ELfgResultKind.CANNOT_KICK_YOURSELF });
        });

        test("rejects non-owners", async () => {
            await feature.create(GUILD_ID, OWNER, "room");
            await feature.move(GUILD_ID, PLAYER_1, "room");

            const response = await feature.kickFromOwnedRoom(GUILD_ID, PLAYER_1, OWNER);

            expect(response).toEqual({ kind: ELfgResultKind.NOT_ROOM_OWNER });
        });
    });

    describe(LfgUseCases.prototype.kick.name, () => {
        test("removes a player from the room identified by code", async () => {
            await feature.create(GUILD_ID, OWNER, "room");
            await feature.move(GUILD_ID, PLAYER_1, "room");

            const response = await feature.kick(GUILD_ID, "room", PLAYER_1);

            expect(response).toEqual({
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
            await feature.create(GUILD_ID, OWNER, "room");
            await feature.move(GUILD_ID, PLAYER_1, "room");

            const response = await feature.kick(GUILD_ID, "room", OWNER);

            expect(response).toEqual({
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
            expect(await getRooms(GUILD_ID)).toEqual([
                { code: "room", ownerId: PLAYER_1.id, playerIds: [PLAYER_1.id] },
            ]);
        });

        test("removes the last player and deletes the room", async () => {
            await feature.create(GUILD_ID, OWNER, "room");

            const response = await feature.kick(GUILD_ID, "room", OWNER);

            expect(response).toEqual({
                kind: ELfgResultKind.PLAYER_KICKED,
                value: {
                    userId: OWNER.id,
                    targetId: OWNER.id,
                    room: { code: "room", ownerId: OWNER.id, playerIds: [] },
                    removalResult: { kind: ELfgPlayerRemovalKind.ROOM_DELETED },
                },
            });
            expect(await getRooms(GUILD_ID)).toEqual([]);
        });

        test("rejects missing rooms", async () => {
            const response = await feature.kick(GUILD_ID, "missing", PLAYER_1);

            expect(response).toEqual({
                kind: ELfgResultKind.ROOM_NOT_FOUND,
                value: { code: "missing" },
            });
        });

        test("rejects targets outside the room", async () => {
            await feature.create(GUILD_ID, OWNER, "room");

            const response = await feature.kick(GUILD_ID, "room", PLAYER_1);

            expect(response).toEqual({
                kind: ELfgResultKind.PLAYER_NOT_IN_ROOM,
                value: { ownerId: OWNER.id, targetId: PLAYER_1.id, code: "room" },
            });
        });
    });

    describe(LfgUseCases.prototype.leave.name, () => {
        test("deletes the room when the last player leaves", async () => {
            await feature.create(GUILD_ID, OWNER, "room");

            const response = await feature.leave(GUILD_ID, OWNER);

            expect(response).toEqual({
                kind: ELfgResultKind.ROOM_LEFT,
                value: { kind: ELfgPlayerRemovalKind.ROOM_DELETED, userId: OWNER.id, code: "room" },
            });
            expect(await getRooms(GUILD_ID)).toEqual([]);
        });

        test("transfers ownership to the earliest remaining player", async () => {
            await feature.create(GUILD_ID, OWNER, "room");
            await feature.move(GUILD_ID, PLAYER_1, "room");
            await feature.move(GUILD_ID, PLAYER_2, "room");

            const response = await feature.leave(GUILD_ID, OWNER);

            expect(response).toEqual({
                kind: ELfgResultKind.ROOM_LEFT,
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

            expect(response).toEqual({ kind: ELfgResultKind.NOT_IN_A_ROOM });
        });
    });

    describe(LfgUseCases.prototype.disbandOwnedRoom.name, () => {
        test("deletes the room when called by the owner", async () => {
            await feature.create(GUILD_ID, OWNER, "room");
            await feature.move(GUILD_ID, PLAYER_1, "room");

            const response = await feature.disbandOwnedRoom(GUILD_ID, OWNER);

            expect(response).toEqual({
                kind: ELfgResultKind.ROOM_DISBANDED,
                value: { userId: OWNER.id, code: "room" },
            });
            expect(await getRooms(GUILD_ID)).toEqual([]);
        });

        test("rejects non-owners", async () => {
            await feature.create(GUILD_ID, OWNER, "room");
            await feature.move(GUILD_ID, PLAYER_1, "room");

            const response = await feature.disbandOwnedRoom(GUILD_ID, PLAYER_1);

            expect(response).toEqual({ kind: ELfgResultKind.NOT_ROOM_OWNER });
            expect(await getRooms(GUILD_ID)).toEqual([
                { code: "room", ownerId: OWNER.id, playerIds: [OWNER.id, PLAYER_1.id] },
            ]);
        });

        test("rejects users who are not in a room", async () => {
            const response = await feature.disbandOwnedRoom(GUILD_ID, OWNER);

            expect(response).toEqual({ kind: ELfgResultKind.NOT_IN_A_ROOM });
        });
    });

    describe(LfgUseCases.prototype.disband.name, () => {
        test("deletes the room identified by code", async () => {
            await feature.create(GUILD_ID, OWNER, "room");
            await feature.move(GUILD_ID, PLAYER_1, "room");

            const response = await feature.disband(GUILD_ID, "room");

            expect(response).toEqual({
                kind: ELfgResultKind.ROOM_DISBANDED,
                value: { userId: OWNER.id, code: "room" },
            });
            expect(await getRooms(GUILD_ID)).toEqual([]);
        });

        test("rejects missing rooms", async () => {
            const response = await feature.disband(GUILD_ID, "missing");

            expect(response).toEqual({
                kind: ELfgResultKind.ROOM_NOT_FOUND,
                value: { code: "missing" },
            });
        });
    });

    test("status only displays rooms from the requested guild", async () => {
        await feature.create(GUILD_ID, OWNER, "one");
        await feature.create(OTHER_GUILD_ID, PLAYER_1, "two");

        const response = await feature.status(GUILD_ID);

        expect(response).toEqual({
            kind: ELfgResultKind.ROOMS_LISTED,
            value: { rooms: [{ code: "one", ownerId: OWNER.id, playerIds: [OWNER.id] }] },
        });
    });
});
