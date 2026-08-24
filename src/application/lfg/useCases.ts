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
    changeLfgRoomCode: changeRoomCode,
    changeOwnedLfgRoomCode: changeOwnedRoomCode,
    createLfgRoom: create,
    disbandLfgRoom: disband,
    disbandOwnedLfgRoom: disbandOwnedRoom,
    getLfgStatus: status,
    kickFromLfgRoom: kick,
    kickFromOwnedLfgRoom: kickFromOwnedRoom,
    leaveLfgRoom: leave,
    moveLfgUser: move,
    transferLfgRoom: transfer,
    transferOwnedLfgRoom: transferOwnedRoom,
};
export default USE_CASES;
