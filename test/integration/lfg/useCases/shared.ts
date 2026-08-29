import type { EntityManager } from "@mikro-orm/sqlite";
import { MikroORM } from "@mikro-orm/sqlite";
import { afterEach, beforeEach } from "vitest";
import type { TAdminPersistence } from "../../../../src/application/admin/persistence.types.ts";
import type { TLfgPersistence } from "../../../../src/application/lfg/persistence.types.ts";
import { ELfgResultKind } from "../../../../src/application/lfg/types.ts";
import LFG_USE_CASES from "../../../../src/application/lfg/useCases.ts";
import type { TLfgUseCases } from "../../../../src/application/lfg/useCases.types.ts";
import type { TApplicationPersistence } from "../../../../src/application/persistence.types.ts";
import type { TSearchPersistence } from "../../../../src/application/search/persistence.types.ts";
import { composeLfgServices } from "../../../../src/composition/application/lfg/services.ts";
import { getWithUnitOfWork } from "../../../../src/composition/application/unitOfWork.ts";
import {
    getPersistenceWithContext,
    getUseCasesWithUnitOfWork,
} from "../../../../src/composition/application/useCases.ts";
import type { IUser } from "../../../../src/domain/lfg/models/user.types.ts";
import { LfgRoom } from "../../../../src/infrastructure/database/mikroOrm/models/lfg/room.ts";
import ADMIN_REPOSITORIES from "../../../../src/infrastructure/database/mikroOrm/repositories/admin.ts";
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

const SEARCH_PERSISTENCE: TSearchPersistence = {
    getBestSearchIndexEntry: () => null,
    getEntityByKindAndId: () => null,
    getSearchIndexEntries: () => [],
};

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
    private readonly createRoomUseCase;
    private readonly disbandRoomUseCase;
    private readonly disbandOwnedRoomUseCase;
    private readonly getLfgStatusUseCase;
    private readonly kickPlayerFromRoomUseCase;
    private readonly kickPlayerFromOwnedRoomUseCase;
    private readonly leaveRoomUseCase;
    private readonly movePlayerToRoomUseCase;
    private readonly transferRoomToPlayerUseCase;
    private readonly transferOwnedRoomToPlayerUseCase;

    public constructor({ em }: { readonly em: EntityManager }) {
        const withLfgUnitOfWork = getWithUnitOfWork({
            em,
            getDependencies: (em) => {
                const lfgPersistence = getPersistenceWithContext<TLfgPersistence>({
                    em,
                    repositories: LFG_REPOSITORIES,
                });
                const adminPersistence = getPersistenceWithContext<TAdminPersistence>({
                    em,
                    repositories: ADMIN_REPOSITORIES,
                });
                const persistence: TApplicationPersistence = {
                    admin: adminPersistence,
                    lfg: lfgPersistence,
                    search: SEARCH_PERSISTENCE,
                };
                const services = composeLfgServices(persistence);
                return { persistence, services };
            },
        });
        const useCases = getUseCasesWithUnitOfWork<TLfgUseCases>({
            useCases: LFG_USE_CASES,
            withUnitOfWork: withLfgUnitOfWork,
        });
        this.changeOwnedRoomCodeUseCase = useCases.changeOwnedRoomCode;
        this.changeRoomCodeUseCase = useCases.changeRoomCode;
        this.createRoomUseCase = useCases.createRoom;
        this.disbandRoomUseCase = useCases.disbandRoom;
        this.disbandOwnedRoomUseCase = useCases.disbandOwnedRoom;
        this.getLfgStatusUseCase = useCases.getLfgStatus;
        this.kickPlayerFromRoomUseCase = useCases.kickPlayerFromRoom;
        this.kickPlayerFromOwnedRoomUseCase = useCases.kickPlayerFromOwnedRoom;
        this.leaveRoomUseCase = useCases.leaveRoom;
        this.movePlayerToRoomUseCase = useCases.movePlayerToRoom;
        this.transferRoomToPlayerUseCase = useCases.transferRoomToPlayer;
        this.transferOwnedRoomToPlayerUseCase = useCases.transferOwnedRoomToPlayer;
    }

    public async getLfgStatus(guildId: string) {
        const result = await this.getLfgStatusUseCase({ guildId });
        return {
            ...result,
            value: { ...result.value, rooms: result.value.rooms.map((room) => toPublicRoom(room)) },
        };
    }

    public async createRoom(guildId: string, owner: IUser, code: string) {
        const result = await this.createRoomUseCase({ guildId, owner, code });
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

    public async movePlayerToRoom(guildId: string, user: IUser, code: string) {
        const result = await this.movePlayerToRoomUseCase({ guildId, user, code });
        return result.kind === ELfgResultKind.ROOM_JOINED || result.kind === ELfgResultKind.ALREADY_IN_TARGET_ROOM
            ? { ...result, value: { ...result.value, room: toPublicRoom(result.value.room) } }
            : result;
    }

    public async transferOwnedRoomToPlayer(guildId: string, owner: IUser, target: IUser) {
        const result = await this.transferOwnedRoomToPlayerUseCase({ guildId, owner, target });
        return result.kind === ELfgResultKind.OWNERSHIP_TRANSFERRED
            ? { ...result, value: { ...result.value, room: toPublicRoom(result.value.room) } }
            : result;
    }

    public async transferRoomToPlayer(guildId: string, code: string, target: IUser) {
        const result = await this.transferRoomToPlayerUseCase({ guildId, code, target });
        return result.kind === ELfgResultKind.OWNERSHIP_TRANSFERRED
            ? { ...result, value: { ...result.value, room: toPublicRoom(result.value.room) } }
            : result;
    }

    public async kickPlayerFromOwnedRoom(guildId: string, owner: IUser, target: IUser) {
        const result = await this.kickPlayerFromOwnedRoomUseCase({ guildId, owner, target });
        return result.kind === ELfgResultKind.PLAYER_KICKED
            ? { ...result, value: { ...result.value, room: toPublicRoom(result.value.room) } }
            : result;
    }

    public async kickPlayerFromRoom(guildId: string, code: string, target: IUser) {
        const result = await this.kickPlayerFromRoomUseCase({ guildId, code, target });
        return result.kind === ELfgResultKind.PLAYER_KICKED
            ? { ...result, value: { ...result.value, room: toPublicRoom(result.value.room) } }
            : result;
    }

    public leaveRoom(guildId: string, user: IUser) {
        return this.leaveRoomUseCase({ guildId, user });
    }

    public disbandOwnedRoom(guildId: string, owner: IUser) {
        return this.disbandOwnedRoomUseCase({ guildId, owner });
    }

    public disbandRoom(guildId: string, code: string) {
        return this.disbandRoomUseCase({ guildId, code });
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
