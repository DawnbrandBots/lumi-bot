import type { TAdminUseCases } from "../../../../application/admin/types.ts";
import type { TLfgUseCases } from "../../../../application/lfg/types.ts";

export type TLfgManageCommandArgs = {
    readonly getGuildConfig: TAdminUseCases["getGuildConfig"];
    readonly changeRoomCode: TLfgUseCases["changeRoomCode"];
    readonly create: TLfgUseCases["create"];
    readonly disband: TLfgUseCases["disband"];
    readonly kick: TLfgUseCases["kick"];
    readonly move: TLfgUseCases["move"];
    readonly transfer: TLfgUseCases["transfer"];
};
