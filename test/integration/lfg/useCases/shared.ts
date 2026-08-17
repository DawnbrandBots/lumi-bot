import type { EntityManager } from "@mikro-orm/sqlite";
import { MikroORM } from "@mikro-orm/sqlite";
import { afterEach, beforeEach } from "vitest";
import { ELfgResultKind } from "../../../../src/application/lfg/types.ts";
import { changeOwnedRoomCode } from "../../../../src/application/lfg/useCases/changeOwnedRoomCode.ts";
import { changeRoomCode } from "../../../../src/application/lfg/useCases/changeRoomCode.ts";
import { create } from "../../../../src/application/lfg/useCases/create.ts";
import { disband } from "../../../../src/application/lfg/useCases/disband.ts";
import { disbandOwnedRoom } from "../../../../src/application/lfg/useCases/disbandOwnedRoom.ts";
import { kick } from "../../../../src/application/lfg/useCases/kick.ts";
import { kickFromOwnedRoom } from "../../../../src/application/lfg/useCases/kickFromOwnedRoom.ts";
import { leave } from "../../../../src/application/lfg/useCases/leave.ts";
import { move } from "../../../../src/application/lfg/useCases/move.ts";
import { status } from "../../../../src/application/lfg/useCases/status.ts";
import { transfer } from "../../../../src/application/lfg/useCases/transfer.ts";
import { transferOwnedRoom } from "../../../../src/application/lfg/useCases/transferOwnedRoom.ts";
import type { IUser } from "../../../../src/domain/lfg/models/user.types.ts";
import { LfgRoom } from "../../../../src/infrastructure/lfg/models/room.ts";
import { getWithLfgUnitOfWork } from "../../../../src/loaders/lfgUnitOfWork.ts";
import { migrationMikroOrmConfig } from "../../../mikro-orm.test.config.ts";
import getSameConfigInMemory from "../../../utils/getSameConfigInMemory.ts";

export const GUILD_ID = "guild-1";
export const OTHER_GUILD_ID = "guild-2";
export const NEW_ROOM_CODE = "new";
export const OWNER: IUser = { id: "owner" };
export const PLAYER_1: IUser = { id: "player-1" };
export const PLAYER_2: IUser = { id: "player-2" };
export const PLAYER_3: IUser = { id: "player-3" };

type TestRoom = {
    readonly code: string;
    readonly ownerId: string;
    readonly playerIds: string[];
};

const config = getSameConfigInMemory(migrationMikroOrmConfig);

function timestamp(value: Date | string): number {
    return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

function toPublicRoom(room: { readonly code: string; readonly ownerId: string; readonly playerIds: readonly string[] }) {
    return { code: room.code, ownerId: room.ownerId, playerIds: room.playerIds };
}

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

    public async status(guildId: string) {
        const result = await this.getLfgStatus({ guildId });
        return {
            ...result,
            value: { rooms: result.value.rooms.map((room) => toPublicRoom(room)) },
        };
    }

    public async create(guildId: string, owner: IUser, code: string) {
        const result = await this.createLfgRoom({ guildId, owner, code });
        return result.kind === ELfgResultKind.ROOM_CREATED
            ? { ...result, value: { ...result.value, room: toPublicRoom(result.value.room) } }
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
            ? { ...result, value: { ...result.value, room: toPublicRoom(result.value.room) } }
            : result;
    }

    public async transferOwnedRoom(guildId: string, owner: IUser, target: IUser) {
        const result = await this.transferOwnedLfgRoom({ guildId, owner, target });
        return result.kind === ELfgResultKind.OWNERSHIP_TRANSFERRED
            ? { ...result, value: { ...result.value, room: toPublicRoom(result.value.room) } }
            : result;
    }

    public async transfer(guildId: string, code: string, target: IUser) {
        const result = await this.transferLfgRoom({ guildId, code, target });
        return result.kind === ELfgResultKind.OWNERSHIP_TRANSFERRED
            ? { ...result, value: { ...result.value, room: toPublicRoom(result.value.room) } }
            : result;
    }

    public async kickFromOwnedRoom(guildId: string, owner: IUser, target: IUser) {
        const result = await this.kickFromOwnedLfgRoom({ guildId, owner, target });
        return result.kind === ELfgResultKind.PLAYER_KICKED
            ? { ...result, value: { ...result.value, room: toPublicRoom(result.value.room) } }
            : result;
    }

    public async kick(guildId: string, code: string, target: IUser) {
        const result = await this.kickFromLfgRoom({ guildId, code, target });
        return result.kind === ELfgResultKind.PLAYER_KICKED
            ? { ...result, value: { ...result.value, room: toPublicRoom(result.value.room) } }
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

export function useLfgUseCases() {
    let orm: MikroORM;
    let useCases: LfgUseCases;

    beforeEach(async () => {
        orm = await MikroORM.init(config);
        await orm.schema.create();
        useCases = new LfgUseCases({ em: orm.em.fork() });
    });

    afterEach(async () => {
        await orm.close(true);
    });

    return {
        get useCases() {
            return useCases;
        },
        getRooms: async (guildId: string): Promise<TestRoom[]> => {
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
        },
    };
}
