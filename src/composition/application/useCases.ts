import { addLfgRole } from "../../application/admin/useCases/addLfgRole.ts";
import { clearLfgChannel } from "../../application/admin/useCases/clearLfgChannel.ts";
import { clearLfgRolePingCooldown } from "../../application/admin/useCases/clearLfgRolePingCooldown.ts";
import { getGuildConfig } from "../../application/admin/useCases/getGuildConfig.ts";
import { getLfgRoleConfig } from "../../application/admin/useCases/getLfgRoleConfig.ts";
import { removeLfgRole } from "../../application/admin/useCases/removeLfgRole.ts";
import { setLfgChannel } from "../../application/admin/useCases/setLfgChannel.ts";
import { setLfgRoleLastPingedAt } from "../../application/admin/useCases/setLfgRoleLastPingedAt.ts";
import { setLfgRolePingCooldown } from "../../application/admin/useCases/setLfgRolePingCooldown.ts";
import { changeOwnedRoomCode } from "../../application/lfg/useCases/changeOwnedRoomCode.ts";
import { changeRoomCode } from "../../application/lfg/useCases/changeRoomCode.ts";
import { createRoom } from "../../application/lfg/useCases/createRoom.ts";
import { disbandOwnedRoom } from "../../application/lfg/useCases/disbandOwnedRoom.ts";
import { disbandRoom } from "../../application/lfg/useCases/disbandRoom.ts";
import { getLfgStatus } from "../../application/lfg/useCases/getLfgStatus.ts";
import { kickPlayerFromOwnedRoom } from "../../application/lfg/useCases/kickPlayerFromOwnedRoom.ts";
import { kickPlayerFromRoom } from "../../application/lfg/useCases/kickPlayerFromRoom.ts";
import { leaveRoom } from "../../application/lfg/useCases/leaveRoom.ts";
import { movePlayerToRoom } from "../../application/lfg/useCases/movePlayerToRoom.ts";
import { transferOwnedRoomToPlayer } from "../../application/lfg/useCases/transferOwnedRoomToPlayer.ts";
import { transferRoomToPlayer } from "../../application/lfg/useCases/transferRoomToPlayer.ts";
import type { TApplicationQueries } from "../../application/queries.types.ts";
import type { TApplicationRepositories } from "../../application/repositories.types.ts";
import { resolveSearchInput } from "../../application/search/useCases/resolveSearchInput.ts";
import { suggestSearchResults } from "../../application/search/useCases/suggestSearchResults.ts";
import type { TApplicationUseCases } from "../../application/useCases.types.ts";
import {
    buildDependentFunctionsRecord,
    type TBuildableFunctionMiddleware,
} from "../utils/buildDependentFunctionsRecord.ts";
import type { TApplicationServices } from "./services.ts";

export const SEARCH_USE_CASES = {
    resolveSearchInput,
    suggestSearchResults,
};

const LFG_USE_CASES = {
    changeRoomCode: changeRoomCode,
    changeOwnedRoomCode: changeOwnedRoomCode,
    createRoom: createRoom,
    disbandRoom: disbandRoom,
    disbandOwnedRoom: disbandOwnedRoom,
    getLfgStatus: getLfgStatus,
    kickPlayerFromRoom: kickPlayerFromRoom,
    kickPlayerFromOwnedRoom: kickPlayerFromOwnedRoom,
    leaveRoom: leaveRoom,
    movePlayerToRoom: movePlayerToRoom,
    transferRoomToPlayer: transferRoomToPlayer,
    transferOwnedRoomToPlayer: transferOwnedRoomToPlayer,
};

const ADMIN_USE_CASES = {
    addLfgRole,
    clearLfgChannel,
    clearLfgRolePingCooldown,
    getGuildConfig,
    getLfgRoleConfig,
    removeLfgRole,
    setLfgChannel,
    setLfgRoleLastPingedAt,
    setLfgRolePingCooldown,
};

const USE_CASES = {
    admin: ADMIN_USE_CASES,
    lfg: LFG_USE_CASES,
    search: SEARCH_USE_CASES,
} as const;

export function composeUseCases({
    queries,
    repositories,
    services,
    middleware,
}: {
    readonly queries: TApplicationQueries;
    readonly repositories: TApplicationRepositories;
    readonly services: TApplicationServices;
    readonly middleware: TBuildableFunctionMiddleware;
}): TApplicationUseCases {
    // TODO: ultimately, there should be a function that takes a record of record of useCases and builds all at once.
    // TODO: should composed types be introduced for objects like builtUseCases?
    return {
        admin: buildDependentFunctionsRecord({ repositories }, USE_CASES.admin, middleware),
        lfg: buildDependentFunctionsRecord({ repositories, services: services.lfg }, USE_CASES.lfg, middleware),
        search: buildDependentFunctionsRecord({ queries }, USE_CASES.search, middleware),
    };
}
