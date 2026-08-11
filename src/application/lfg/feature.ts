import { changeOwnedRoomCode } from "./changeOwnedRoomCode.ts";
import { changeRoomCode } from "./changeRoomCode.ts";
import { create } from "./create.ts";
import { disband } from "./disband.ts";
import { disbandOwnedRoom } from "./disbandOwnedRoom.ts";
import { kick } from "./kick.ts";
import { kickFromOwnedRoom } from "./kickFromOwnedRoom.ts";
import { leave } from "./leave.ts";
import { move } from "./move.ts";
import { status } from "./status.ts";
import { transfer } from "./transfer.ts";
import { transferOwnedRoom } from "./transferOwnedRoom.ts";
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
