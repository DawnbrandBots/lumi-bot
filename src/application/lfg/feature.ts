import { changeOwnedRoomCode } from "./useCases/changeOwnedRoomCode.ts";
import { changeRoomCode } from "./useCases/changeRoomCode.ts";
import { create } from "./useCases/create.ts";
import { disband } from "./useCases/disband.ts";
import { disbandOwnedRoom } from "./useCases/disbandOwnedRoom.ts";
import { kick } from "./useCases/kick.ts";
import { kickFromOwnedRoom } from "./useCases/kickFromOwnedRoom.ts";
import { leave } from "./useCases/leave.ts";
import { move } from "./useCases/move.ts";
import { status } from "./useCases/status.ts";
import { transfer } from "./useCases/transfer.ts";
import { transferOwnedRoom } from "./useCases/transferOwnedRoom.ts";
import type { TLfgFeature, TWithLfgUnitOfWork } from "./types.ts";

export function getLfgFeature(withLfgUnitOfWork: TWithLfgUnitOfWork): TLfgFeature {
    return {
        changeOwnedRoomCode: withLfgUnitOfWork(changeOwnedRoomCode),
        changeRoomCode: withLfgUnitOfWork(changeRoomCode),
        create: withLfgUnitOfWork(create),
        disband: withLfgUnitOfWork(disband),
        disbandOwnedRoom: withLfgUnitOfWork(disbandOwnedRoom),
        kick: withLfgUnitOfWork(kick),
        kickFromOwnedRoom: withLfgUnitOfWork(kickFromOwnedRoom),
        leave: withLfgUnitOfWork(leave),
        move: withLfgUnitOfWork(move),
        status: withLfgUnitOfWork(status),
        transfer: withLfgUnitOfWork(transfer),
        transferOwnedRoom: withLfgUnitOfWork(transferOwnedRoom),
    };
}
