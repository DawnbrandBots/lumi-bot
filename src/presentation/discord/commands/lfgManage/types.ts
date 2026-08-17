import type { TGetAdminGuildConfig } from "../../../../application/admin/types.ts";
import type {
    TChangeLfgRoomCodeUseCase,
    TCreateLfgRoomUseCase,
    TDisbandLfgRoomUseCase,
    TKickFromLfgRoomByCode,
    TMoveLfgUser,
    TTransferLfgRoomUseCase,
} from "../../../../application/lfg/types.ts";

export type TLfgManageCommandArgs = {
    readonly getGuildConfig: TGetAdminGuildConfig;
    readonly changeLfgRoomCode: TChangeLfgRoomCodeUseCase;
    readonly createLfgRoom: TCreateLfgRoomUseCase;
    readonly disbandLfgRoom: TDisbandLfgRoomUseCase;
    readonly kickFromLfgRoom: TKickFromLfgRoomByCode;
    readonly moveLfgUser: TMoveLfgUser;
    readonly transferLfgRoom: TTransferLfgRoomUseCase;
};
