import type { TLfgPersistence } from "../../application/lfg/persistence.types.ts";
import { changeRoomCode } from "./lfg/changeRoomCode.ts";
import { createRoom } from "./lfg/createRoom.ts";
import { findRoomByCode } from "./lfg/findRoomByCode.ts";
import { findRoomByUser } from "./lfg/findRoomByUser.ts";
import { listRooms } from "./lfg/listRooms.ts";
import { moveUserToRoom } from "./lfg/moveUserToRoom.ts";
import { removeRoom } from "./lfg/removeRoom.ts";
import { removeRoomPlayer } from "./lfg/removeRoomPlayer.ts";
import { setRoomOwner } from "./lfg/setRoomOwner.ts";
import type { TLfgPersistenceFunction } from "./lfg/types.ts";

const LFG: { [K in keyof TLfgPersistence]: TLfgPersistenceFunction<TLfgPersistence[K]> } = {
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
