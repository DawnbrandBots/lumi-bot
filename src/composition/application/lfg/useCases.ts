import type { EntityManager } from "@mikro-orm/sqlite";
import type {
    TChangeLfgRoomCodeUseCase,
    TChangeOwnedLfgRoomCodeUseCase,
    TCreateLfgRoomUseCase,
    TDisbandLfgRoomUseCase,
    TDisbandOwnedLfgRoomUseCase,
    TGetLfgStatus,
    TKickFromLfgRoomByCode,
    TKickFromOwnedLfgRoomUseCase,
    TLeaveLfgRoom,
    TMoveLfgUser,
    TTransferLfgRoomUseCase,
    TTransferOwnedLfgRoomUseCase,
} from "../../../application/lfg/types.ts";
import { changeOwnedRoomCode } from "../../../application/lfg/useCases/changeOwnedRoomCode.ts";
import { changeRoomCode } from "../../../application/lfg/useCases/changeRoomCode.ts";
import { create } from "../../../application/lfg/useCases/create.ts";
import { disband } from "../../../application/lfg/useCases/disband.ts";
import { disbandOwnedRoom } from "../../../application/lfg/useCases/disbandOwnedRoom.ts";
import { kick } from "../../../application/lfg/useCases/kick.ts";
import { kickFromOwnedRoom } from "../../../application/lfg/useCases/kickFromOwnedRoom.ts";
import { leave } from "../../../application/lfg/useCases/leave.ts";
import { move } from "../../../application/lfg/useCases/move.ts";
import { status } from "../../../application/lfg/useCases/status.ts";
import { transfer } from "../../../application/lfg/useCases/transfer.ts";
import { transferOwnedRoom } from "../../../application/lfg/useCases/transferOwnedRoom.ts";
import { getWithLfgUnitOfWork } from "../../../loaders/lfgUnitOfWork.ts";

export type TLfgUseCases = {
    readonly changeLfgRoomCode: TChangeLfgRoomCodeUseCase;
    readonly changeOwnedLfgRoomCode: TChangeOwnedLfgRoomCodeUseCase;
    readonly createLfgRoom: TCreateLfgRoomUseCase;
    readonly disbandLfgRoom: TDisbandLfgRoomUseCase;
    readonly disbandOwnedLfgRoom: TDisbandOwnedLfgRoomUseCase;
    readonly getLfgStatus: TGetLfgStatus;
    readonly kickFromLfgRoom: TKickFromLfgRoomByCode;
    readonly kickFromOwnedLfgRoom: TKickFromOwnedLfgRoomUseCase;
    readonly leaveLfgRoom: TLeaveLfgRoom;
    readonly moveLfgUser: TMoveLfgUser;
    readonly transferLfgRoom: TTransferLfgRoomUseCase;
    readonly transferOwnedLfgRoom: TTransferOwnedLfgRoomUseCase;
};

export function composeLfgUseCases(em: EntityManager): TLfgUseCases {
    const withLfgUnitOfWork = getWithLfgUnitOfWork(em);

    return {
        changeLfgRoomCode: withLfgUnitOfWork(changeRoomCode),
        changeOwnedLfgRoomCode: withLfgUnitOfWork(changeOwnedRoomCode),
        createLfgRoom: withLfgUnitOfWork(create),
        disbandLfgRoom: withLfgUnitOfWork(disband),
        disbandOwnedLfgRoom: withLfgUnitOfWork(disbandOwnedRoom),
        getLfgStatus: withLfgUnitOfWork(status),
        kickFromLfgRoom: withLfgUnitOfWork(kick),
        kickFromOwnedLfgRoom: withLfgUnitOfWork(kickFromOwnedRoom),
        leaveLfgRoom: withLfgUnitOfWork(leave),
        moveLfgUser: withLfgUnitOfWork(move),
        transferLfgRoom: withLfgUnitOfWork(transfer),
        transferOwnedLfgRoom: withLfgUnitOfWork(transferOwnedRoom),
    };
}
