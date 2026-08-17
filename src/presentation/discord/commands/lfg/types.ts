import type {
    TGetAdminGuildConfig,
    TGetAdminLfgRoleConfig,
    TSetAdminLfgRoleLastPingedAt,
} from "../../../../application/admin/types.ts";
import type {
    TChangeOwnedLfgRoomCodeUseCase,
    TCreateLfgRoomUseCase,
    TDisbandOwnedLfgRoomUseCase,
    TGetLfgStatus,
    TKickFromOwnedLfgRoomUseCase,
    TLeaveLfgRoom,
    TMoveLfgUser,
    TTransferOwnedLfgRoomUseCase,
} from "../../../../application/lfg/types.ts";

export type TLfgCommandArgs = {
    readonly getGuildConfig: TGetAdminGuildConfig;
    readonly getLfgRoleConfig: TGetAdminLfgRoleConfig;
    readonly setLfgRoleLastPingedAt: TSetAdminLfgRoleLastPingedAt;
    readonly changeOwnedLfgRoomCode: TChangeOwnedLfgRoomCodeUseCase;
    readonly createLfgRoom: TCreateLfgRoomUseCase;
    readonly disbandOwnedLfgRoom: TDisbandOwnedLfgRoomUseCase;
    readonly getLfgStatus: TGetLfgStatus;
    readonly kickFromOwnedLfgRoom: TKickFromOwnedLfgRoomUseCase;
    readonly leaveLfgRoom: TLeaveLfgRoom;
    readonly moveLfgUser: TMoveLfgUser;
    readonly transferOwnedLfgRoom: TTransferOwnedLfgRoomUseCase;
};
