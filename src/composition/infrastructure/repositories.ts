import type { EntityManager } from "@mikro-orm/sqlite";
import type { TAdminRepository } from "../../application/admin/repositories.types.ts";
import type { TLfgRepository } from "../../application/lfg/repositories.types.ts";
import type { TApplicationRepositories } from "../../application/repositories.types.ts";
import { addLfgRole } from "../../infrastructure/persistence/mikroOrm/repositories/admin/addLfgRole.ts";
import { clearLfgChannel } from "../../infrastructure/persistence/mikroOrm/repositories/admin/clearLfgChannel.ts";
import { clearLfgRolePingCooldown } from "../../infrastructure/persistence/mikroOrm/repositories/admin/clearLfgRolePingCooldown.ts";
import { getGuildConfig } from "../../infrastructure/persistence/mikroOrm/repositories/admin/getGuildConfig.ts";
import { getLfgRole } from "../../infrastructure/persistence/mikroOrm/repositories/admin/getLfgRole.ts";
import { listLfgRoles } from "../../infrastructure/persistence/mikroOrm/repositories/admin/listLfgRoles.ts";
import { removeLfgRole } from "../../infrastructure/persistence/mikroOrm/repositories/admin/removeLfgRole.ts";
import { setLfgChannel } from "../../infrastructure/persistence/mikroOrm/repositories/admin/setLfgChannel.ts";
import { setLfgRoleLastPingedAt } from "../../infrastructure/persistence/mikroOrm/repositories/admin/setLfgRoleLastPingedAt.ts";
import { setLfgRolePingCooldown } from "../../infrastructure/persistence/mikroOrm/repositories/admin/setLfgRolePingCooldown.ts";
import type { TAdminRepositoryFunction } from "../../infrastructure/persistence/mikroOrm/repositories/admin/types.ts";
import { changeRoomCode } from "../../infrastructure/persistence/mikroOrm/repositories/lfg/changeRoomCode.ts";
import { createRoom } from "../../infrastructure/persistence/mikroOrm/repositories/lfg/createRoom.ts";
import { findRoomByCode } from "../../infrastructure/persistence/mikroOrm/repositories/lfg/findRoomByCode.ts";
import { findRoomByUser } from "../../infrastructure/persistence/mikroOrm/repositories/lfg/findRoomByUser.ts";
import { listRooms } from "../../infrastructure/persistence/mikroOrm/repositories/lfg/listRooms.ts";
import { moveUserToRoom } from "../../infrastructure/persistence/mikroOrm/repositories/lfg/moveUserToRoom.ts";
import { removeRoom } from "../../infrastructure/persistence/mikroOrm/repositories/lfg/removeRoom.ts";
import { removeRoomPlayer } from "../../infrastructure/persistence/mikroOrm/repositories/lfg/removeRoomPlayer.ts";
import { setRoomOwner } from "../../infrastructure/persistence/mikroOrm/repositories/lfg/setRoomOwner.ts";
import type { TLfgRepositoryFunction } from "../../infrastructure/persistence/mikroOrm/repositories/lfg/types.ts";
import { buildDependentFunctionsRecord } from "../utils/buildDependentFunctionsRecord.ts";

const ADMIN_REPOSITORY: { [K in keyof TAdminRepository]: TAdminRepositoryFunction<TAdminRepository[K]> } = {
    addLfgRole,
    clearLfgChannel,
    clearLfgRolePingCooldown,
    getGuildConfig,
    getLfgRole,
    listLfgRoles,
    removeLfgRole,
    setLfgChannel,
    setLfgRoleLastPingedAt,
    setLfgRolePingCooldown,
};

const LFG_REPOSITORY: { [K in keyof TLfgRepository]: TLfgRepositoryFunction<TLfgRepository[K]> } = {
    changeRoomCode,
    createRoom,
    findRoomByCode,
    findRoomByUser,
    listRooms,
    moveUserToRoom,
    removeRoom,
    removeRoomPlayer,
    setRoomOwner,
};

const REPOSITORIES = {
    // TODO: might be better if repositories are organized by aggregate instead of "feature"
    admin: ADMIN_REPOSITORY,
    lfg: LFG_REPOSITORY,
} as const;

export function composeRepositories({ em }: { readonly em: EntityManager }): TApplicationRepositories {
    return {
        admin: buildDependentFunctionsRecord({ em }, REPOSITORIES.admin),
        lfg: buildDependentFunctionsRecord({ em }, REPOSITORIES.lfg),
    };
}
