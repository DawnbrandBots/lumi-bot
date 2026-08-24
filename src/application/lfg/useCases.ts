import { changeOwnedRoomCode } from "./useCases/changeOwnedRoomCode.ts";
import { changeRoomCode } from "./useCases/changeRoomCode.ts";
import { createRoom } from "./useCases/createRoom.ts";
import { disbandRoom } from "./useCases/disbandRoom.ts";
import { disbandOwnedRoom } from "./useCases/disbandOwnedRoom.ts";
import { getLfgStatus } from "./useCases/getLfgStatus.ts";
import { kickPlayerFromOwnedRoom } from "./useCases/kickPlayerFromOwnedRoom.ts";
import { kickPlayerFromRoom } from "./useCases/kickPlayerFromRoom.ts";
import { leaveRoom } from "./useCases/leaveRoom.ts";
import { movePlayerToRoom } from "./useCases/movePlayerToRoom.ts";
import { transferOwnedRoomToPlayer } from "./useCases/transferOwnedRoomToPlayer.ts";
import { transferRoomToPlayer } from "./useCases/transferRoomToPlayer.ts";
export type { TLfgUseCases } from "./useCases.types.ts";

const USE_CASES = {
    changeRoomCode: changeRoomCode,
    changeOwnedRoomCode: changeOwnedRoomCode,
    createRoom: createRoom,
    disbandRoom: disbandRoom,
    disbandOwnedRoom: disbandOwnedRoom,
    getLfgStatus: getLfgStatus,
    kickPlayerFromRoom: kickPlayerFromRoom,
    kickPlayerFromOwnedRoom: kickPlayerFromOwnedRoom,
    leaveRoom: leaveRoom,
    movePlayerToRoom: movePlayerToRoom,
    transferRoomToPlayer: transferRoomToPlayer,
    transferOwnedRoomToPlayer: transferOwnedRoomToPlayer,
};
export default USE_CASES;
