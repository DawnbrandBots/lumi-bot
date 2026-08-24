import type { TAdminUseCases } from "../../../../application/admin/types.ts";
import type { TLfgUseCases } from "../../../../application/lfg/types.ts";

export type TLfgManageCommandArgs = {
    readonly getGuildConfig: TAdminUseCases["getGuildConfig"];
    readonly changeRoomCode: TLfgUseCases["changeRoomCode"];
    readonly createRoom: TLfgUseCases["createRoom"];
    readonly disbandRoom: TLfgUseCases["disbandRoom"];
    readonly kickPlayerFromRoom: TLfgUseCases["kickPlayerFromRoom"];
    readonly movePlayerToRoom: TLfgUseCases["movePlayerToRoom"];
    readonly transferRoomToPlayer: TLfgUseCases["transferRoomToPlayer"];
};
