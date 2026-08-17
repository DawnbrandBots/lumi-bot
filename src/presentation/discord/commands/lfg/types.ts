import type { TAdminFeature as AdminFeature } from "../../../../application/admin/types.ts";
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
    readonly adminFeature: Pick<AdminFeature, "getGuildConfig" | "getLfgRoleConfig" | "setLfgRoleLastPingedAt">;
    readonly changeOwnedLfgRoomCode: TChangeOwnedLfgRoomCodeUseCase;
    readonly createLfgRoom: TCreateLfgRoomUseCase;
    readonly disbandOwnedLfgRoom: TDisbandOwnedLfgRoomUseCase;
    readonly getLfgStatus: TGetLfgStatus;
    readonly kickFromOwnedLfgRoom: TKickFromOwnedLfgRoomUseCase;
    readonly leaveLfgRoom: TLeaveLfgRoom;
    readonly moveLfgUser: TMoveLfgUser;
    readonly transferOwnedLfgRoom: TTransferOwnedLfgRoomUseCase;
};
