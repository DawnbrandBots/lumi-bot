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
import type { TLfgFeature, TLfgPersistence } from "./types.ts";

export function getLfgFeature(persistence: TLfgPersistence): TLfgFeature {
    return {
        changeOwnedRoomCode: (arg) => changeOwnedRoomCode(persistence, arg),
        changeRoomCode: (arg) => changeRoomCode(persistence, arg),
        create: (arg) => create(persistence, arg),
        disband: (arg) => disband(persistence, arg),
        disbandOwnedRoom: (arg) => disbandOwnedRoom(persistence, arg),
        kick: (arg) => kick(persistence, arg),
        kickFromOwnedRoom: (arg) => kickFromOwnedRoom(persistence, arg),
        leave: (arg) => leave(persistence, arg),
        move: (arg) => move(persistence, arg),
        status: (arg) => status(persistence, arg),
        transfer: (arg) => transfer(persistence, arg),
        transferOwnedRoom: (arg) => transferOwnedRoom(persistence, arg),
    };
}
