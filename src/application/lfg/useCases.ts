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
export type { TLfgUseCases } from "./useCases.types.ts";

const USE_CASES = {
    changeRoomCode: changeRoomCode,
    changeOwnedRoomCode: changeOwnedRoomCode,
    create: create,
    disband: disband,
    disbandOwnedRoom: disbandOwnedRoom,
    status: status,
    kick: kick,
    kickFromOwnedRoom: kickFromOwnedRoom,
    leave: leave,
    move: move,
    transfer: transfer,
    transferOwnedRoom: transferOwnedRoom,
};
export default USE_CASES;
