import type { TAdminUseCases } from "../../../../application/admin/types.ts";
import type { TLfgUseCases } from "../../../../application/lfg/types.ts";

export type TLfgManageCommandArgs = {
    readonly getGuildConfig: TAdminUseCases["getGuildConfig"];
    readonly changeLfgRoomCode: TLfgUseCases["changeLfgRoomCode"];
    readonly createLfgRoom: TLfgUseCases["createLfgRoom"];
    readonly disbandLfgRoom: TLfgUseCases["disbandLfgRoom"];
    readonly kickFromLfgRoom: TLfgUseCases["kickFromLfgRoom"];
    readonly moveLfgUser: TLfgUseCases["moveLfgUser"];
    readonly transferLfgRoom: TLfgUseCases["transferLfgRoom"];
};
