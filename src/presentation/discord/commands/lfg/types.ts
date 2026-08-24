import type { TAdminUseCases } from "../../../../application/admin/types.ts";
import type { TLfgUseCases } from "../../../../application/lfg/types.ts";

export type TLfgCommandArgs = {
    readonly getGuildConfig: TAdminUseCases["getGuildConfig"];
    readonly getLfgRoleConfig: TAdminUseCases["getLfgRoleConfig"];
    readonly setLfgRoleLastPingedAt: TAdminUseCases["setLfgRoleLastPingedAt"];
    readonly changeOwnedRoomCode: TLfgUseCases["changeOwnedRoomCode"];
    readonly createRoom: TLfgUseCases["createRoom"];
    readonly disbandOwnedRoom: TLfgUseCases["disbandOwnedRoom"];
    readonly getLfgStatus: TLfgUseCases["getLfgStatus"];
    readonly kickPlayerFromOwnedRoom: TLfgUseCases["kickPlayerFromOwnedRoom"];
    readonly leaveRoom: TLfgUseCases["leaveRoom"];
    readonly movePlayerToRoom: TLfgUseCases["movePlayerToRoom"];
    readonly transferOwnedRoomToPlayer: TLfgUseCases["transferOwnedRoomToPlayer"];
};
