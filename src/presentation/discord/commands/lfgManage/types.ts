import type { TAdminFeature as AdminFeature } from "../../../../application/admin/types.ts";
import type {
    TChangeLfgRoomCodeUseCase,
    TCreateLfgRoomUseCase,
    TDisbandLfgRoomUseCase,
    TKickFromLfgRoomByCode,
    TMoveLfgUser,
    TTransferLfgRoomUseCase,
} from "../../../../application/lfg/types.ts";

export type TLfgManageCommandArgs = {
    readonly adminFeature: Pick<AdminFeature, "getGuildConfig">;
    readonly changeLfgRoomCode: TChangeLfgRoomCodeUseCase;
    readonly createLfgRoom: TCreateLfgRoomUseCase;
    readonly disbandLfgRoom: TDisbandLfgRoomUseCase;
    readonly kickFromLfgRoom: TKickFromLfgRoomByCode;
    readonly moveLfgUser: TMoveLfgUser;
    readonly transferLfgRoom: TTransferLfgRoomUseCase;
};
