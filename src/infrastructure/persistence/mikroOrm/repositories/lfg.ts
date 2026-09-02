import type { TLfgRepository } from "../../../../application/lfg/repositories.types.ts";
import { changeRoomCode } from "./lfg/changeRoomCode.ts";
import { createRoom } from "./lfg/createRoom.ts";
import { findRoomByCode } from "./lfg/findRoomByCode.ts";
import { findRoomByUser } from "./lfg/findRoomByUser.ts";
import { listRooms } from "./lfg/listRooms.ts";
import { moveUserToRoom } from "./lfg/moveUserToRoom.ts";
import { removeRoom } from "./lfg/removeRoom.ts";
import { removeRoomPlayer } from "./lfg/removeRoomPlayer.ts";
import { setRoomOwner } from "./lfg/setRoomOwner.ts";
import type { TLfgRepositoryFunction } from "./lfg/types.ts";

const LFG: { [K in keyof TLfgRepository]: TLfgRepositoryFunction<TLfgRepository[K]> } = {
    changeRoomCode,
    createRoom,
    findRoomByCode,
    findRoomByUser,
    listRooms,
    moveUserToRoom,
    removeRoom,
    removeRoomPlayer,
    setRoomOwner,
};
export default LFG;
