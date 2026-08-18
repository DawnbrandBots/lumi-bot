import type { TLfgPersistence } from "../../../../../application/lfg/types.ts";
import { changeRoomCode } from "./changeRoomCode.ts";
import { createRoom } from "./createRoom.ts";
import { findRoomByCode } from "./findRoomByCode.ts";
import { findRoomByUser } from "./findRoomByUser.ts";
import { listRooms } from "./listRooms.ts";
import { moveUserToRoom } from "./moveUserToRoom.ts";
import { removeRoom } from "./removeRoom.ts";
import { removeRoomPlayer } from "./removeRoomPlayer.ts";
import { setRoomOwner } from "./setRoomOwner.ts";
import type { TLfgPersistenceContext } from "./types.ts";

export function getLfgPersistence(context: TLfgPersistenceContext): TLfgPersistence {
    return {
        changeRoomCode: (arg) => changeRoomCode(context, arg),
        createRoom: (arg) => createRoom(context, arg),
        findRoomByCode: (arg) => findRoomByCode(context, arg),
        findRoomByUser: (arg) => findRoomByUser(context, arg),
        listRooms: (arg) => listRooms(context, arg),
        moveUserToRoom: (arg) => moveUserToRoom(context, arg),
        removeRoom: (arg) => removeRoom(context, arg),
        removeRoomPlayer: (arg) => removeRoomPlayer(context, arg),
        setRoomOwner: (arg) => setRoomOwner(context, arg),
    };
}
