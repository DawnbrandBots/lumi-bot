import type { TAdminUseCases } from "../../../../application/admin/types.ts";
import type { TLfgUseCases } from "../../../../application/lfg/types.ts";

export type TLfgCommandArgs = {
    readonly getGuildConfig: TAdminUseCases["getGuildConfig"];
    readonly getLfgRoleConfig: TAdminUseCases["getLfgRoleConfig"];
    readonly setLfgRoleLastPingedAt: TAdminUseCases["setLfgRoleLastPingedAt"];
    readonly changeOwnedRoomCode: TLfgUseCases["changeOwnedRoomCode"];
    readonly create: TLfgUseCases["create"];
    readonly disbandOwnedRoom: TLfgUseCases["disbandOwnedRoom"];
    readonly status: TLfgUseCases["status"];
    readonly kickFromOwnedRoom: TLfgUseCases["kickFromOwnedRoom"];
    readonly leave: TLfgUseCases["leave"];
    readonly move: TLfgUseCases["move"];
    readonly transferOwnedRoom: TLfgUseCases["transferOwnedRoom"];
};
