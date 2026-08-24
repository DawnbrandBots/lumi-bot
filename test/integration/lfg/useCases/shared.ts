import type { EntityManager } from "@mikro-orm/sqlite";
import { MikroORM } from "@mikro-orm/sqlite";
import { afterEach, beforeEach } from "vitest";
import { getLfgApplicationDependencies } from "../../../../src/application/lfg/dependencies.ts";
import type { TLfgPersistence } from "../../../../src/application/lfg/persistence.types.ts";
import { ELfgResultKind } from "../../../../src/application/lfg/types.ts";
import LFG_USE_CASES from "../../../../src/application/lfg/useCases.ts";
import type { TLfgUseCases } from "../../../../src/application/lfg/useCases.types.ts";
import {
    getPersistenceWithContext,
    getUseCasesWithUnitOfWork,
} from "../../../../src/composition/application/useCases.ts";
import { getWithUnitOfWork } from "../../../../src/composition/application/unitOfWork.ts";
import type { IUser } from "../../../../src/domain/lfg/models/user.types.ts";
import { LfgRoom } from "../../../../src/infrastructure/database/mikroOrm/models/lfg/room.ts";
import LFG_REPOSITORIES from "../../../../src/infrastructure/database/mikroOrm/repositories/lfg.ts";
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

function toPublicRoom(room: {
    readonly code: string;
    readonly ownerId: string;
    readonly playerIds: readonly string[];
}) {
    return { code: room.code, ownerId: room.ownerId, playerIds: room.playerIds };
}

class LfgUseCases {
    private readonly changeOwnedRoomCodeUseCase;
    private readonly changeRoomCodeUseCase;
    private readonly createUseCase;
    private readonly disbandUseCase;
    private readonly disbandOwnedRoomUseCase;
    private readonly statusUseCase;
    private readonly kickUseCase;
    private readonly kickFromOwnedRoomUseCase;
    private readonly leaveUseCase;
    private readonly moveUseCase;
    private readonly transferUseCase;
    private readonly transferOwnedRoomUseCase;

    public constructor({ em }: { readonly em: EntityManager }) {
        const withLfgUnitOfWork = getWithUnitOfWork({
            em,
            getDependencies: (em) =>
                getLfgApplicationDependencies(
                    getPersistenceWithContext<TLfgPersistence>({
                        em,
                        repositories: LFG_REPOSITORIES,
                    }),
                ),
        });
        const useCases = getUseCasesWithUnitOfWork<TLfgUseCases>({
            useCases: LFG_USE_CASES,
            withUnitOfWork: withLfgUnitOfWork,
        });
        this.changeOwnedRoomCodeUseCase = useCases.changeOwnedRoomCode;
        this.changeRoomCodeUseCase = useCases.changeRoomCode;
        this.createUseCase = useCases.create;
        this.disbandUseCase = useCases.disband;
        this.disbandOwnedRoomUseCase = useCases.disbandOwnedRoom;
        this.statusUseCase = useCases.status;
        this.kickUseCase = useCases.kick;
        this.kickFromOwnedRoomUseCase = useCases.kickFromOwnedRoom;
        this.leaveUseCase = useCases.leave;
        this.moveUseCase = useCases.move;
        this.transferUseCase = useCases.transfer;
        this.transferOwnedRoomUseCase = useCases.transferOwnedRoom;
    }

    public async status(guildId: string) {
        const result = await this.statusUseCase({ guildId });
        return {
            ...result,
            value: { rooms: result.value.rooms.map((room) => toPublicRoom(room)) },
        };
    }

    public async create(guildId: string, owner: IUser, code: string) {
        const result = await this.createUseCase({ guildId, owner, code });
        return result.kind === ELfgResultKind.ROOM_CREATED
            ? { ...result, value: { ...result.value, room: toPublicRoom(result.value.room) } }
            : result;
    }

    public changeOwnedRoomCode(guildId: string, owner: IUser, newCode: string) {
        return this.changeOwnedRoomCodeUseCase({ guildId, owner, newCode });
    }

    public changeRoomCode(guildId: string, code: string, newCode: string) {
        return this.changeRoomCodeUseCase({ guildId, code, newCode });
    }

    public async move(guildId: string, user: IUser, code: string) {
        const result = await this.moveUseCase({ guildId, user, code });
        return result.kind === ELfgResultKind.ROOM_JOINED || result.kind === ELfgResultKind.ALREADY_IN_TARGET_ROOM
            ? { ...result, value: { ...result.value, room: toPublicRoom(result.value.room) } }
            : result;
    }

    public async transferOwnedRoom(guildId: string, owner: IUser, target: IUser) {
        const result = await this.transferOwnedRoomUseCase({ guildId, owner, target });
        return result.kind === ELfgResultKind.OWNERSHIP_TRANSFERRED
            ? { ...result, value: { ...result.value, room: toPublicRoom(result.value.room) } }
            : result;
    }

    public async transfer(guildId: string, code: string, target: IUser) {
        const result = await this.transferUseCase({ guildId, code, target });
        return result.kind === ELfgResultKind.OWNERSHIP_TRANSFERRED
            ? { ...result, value: { ...result.value, room: toPublicRoom(result.value.room) } }
            : result;
    }

    public async kickFromOwnedRoom(guildId: string, owner: IUser, target: IUser) {
        const result = await this.kickFromOwnedRoomUseCase({ guildId, owner, target });
        return result.kind === ELfgResultKind.PLAYER_KICKED
            ? { ...result, value: { ...result.value, room: toPublicRoom(result.value.room) } }
            : result;
    }

    public async kick(guildId: string, code: string, target: IUser) {
        const result = await this.kickUseCase({ guildId, code, target });
        return result.kind === ELfgResultKind.PLAYER_KICKED
            ? { ...result, value: { ...result.value, room: toPublicRoom(result.value.room) } }
            : result;
    }

    public leave(guildId: string, user: IUser) {
        return this.leaveUseCase({ guildId, user });
    }

    public disbandOwnedRoom(guildId: string, owner: IUser) {
        return this.disbandOwnedRoomUseCase({ guildId, owner });
    }

    public disband(guildId: string, code: string) {
        return this.disbandUseCase({ guildId, code });
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
