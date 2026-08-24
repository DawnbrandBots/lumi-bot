import type { TAdminUseCases } from "../../../../application/admin/types.ts";
import type { TLfgUseCases } from "../../../../application/lfg/types.ts";

export type TLfgCommandArgs = {
    readonly getGuildConfig: TAdminUseCases["getGuildConfig"];
    readonly getLfgRoleConfig: TAdminUseCases["getLfgRoleConfig"];
    readonly setLfgRoleLastPingedAt: TAdminUseCases["setLfgRoleLastPingedAt"];
    readonly changeOwnedLfgRoomCode: TLfgUseCases["changeOwnedLfgRoomCode"];
    readonly createLfgRoom: TLfgUseCases["createLfgRoom"];
    readonly disbandOwnedLfgRoom: TLfgUseCases["disbandOwnedLfgRoom"];
    readonly getLfgStatus: TLfgUseCases["getLfgStatus"];
    readonly kickFromOwnedLfgRoom: TLfgUseCases["kickFromOwnedLfgRoom"];
    readonly leaveLfgRoom: TLfgUseCases["leaveLfgRoom"];
    readonly moveLfgUser: TLfgUseCases["moveLfgUser"];
    readonly transferOwnedLfgRoom: TLfgUseCases["transferOwnedLfgRoom"];
};
