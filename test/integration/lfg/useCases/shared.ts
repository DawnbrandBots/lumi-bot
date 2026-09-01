import { MikroORM } from "@mikro-orm/sqlite";
import { afterEach, beforeEach } from "vitest";
import { changeRoomCodeInRoom } from "../../../../src/application/lfg/services/changeRoomCodeInRoom.ts";
import { getOwnedRoom } from "../../../../src/application/lfg/services/getOwnedRoom.ts";
import { kickFromRoom } from "../../../../src/application/lfg/services/kickFromRoom.ts";
import { removePlayerFromRoom } from "../../../../src/application/lfg/services/removePlayerFromRoom.ts";
import { transferRoom } from "../../../../src/application/lfg/services/transferRoom.ts";
import LFG_USE_CASES, { type TLfgUseCases } from "../../../../src/application/lfg/useCases.ts";
import type { TApplicationPersistence } from "../../../../src/application/persistence.types.ts";
import type { TSearchPersistence } from "../../../../src/application/search/persistence.types.ts";
import getWithinTransaction from "../../../../src/composition/infrastructure/withinTransaction.ts";
import { build } from "../../../../src/composition/utils/proxify.ts";
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

const APPLICATION_SERVICES = {
    changeRoomCodeInRoom,
    getOwnedRoom,
    kickFromRoom,
    removePlayerFromRoom,
    transferRoom,
} as const;

function timestamp(value: Date | string): number {
    return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

export function useLfgUseCases() {
    let orm: MikroORM;
    let useCases: TLfgUseCases;

    beforeEach(async () => {
        orm = await MikroORM.init(config);
        await orm.schema.create();
        const em = orm.em.fork({ useContext: true });
        const persistence: TApplicationPersistence = {
            admin: build({ em }, ADMIN_REPOSITORIES),
            lfg: build({ em }, LFG_REPOSITORIES),
            search: SEARCH_PERSISTENCE,
        };
        const servicesDependencies = {
            persistence,
            get services() {
                return builtLfgServices;
            },
        };
        const builtLfgServices = build(servicesDependencies, APPLICATION_SERVICES);
        useCases = build({ persistence, services: builtLfgServices }, LFG_USE_CASES, getWithinTransaction(em));
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
