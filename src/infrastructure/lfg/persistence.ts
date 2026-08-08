import type { TLfgPersistence } from "../../application/lfg/types.ts";
import { changeRoomCode } from "./changeRoomCode.ts";
import { createRoom } from "./createRoom.ts";
import { disbandRoom } from "./disbandRoom.ts";
import { findRoomByCode } from "./findRoomByCode.ts";
import { findRoomByUser } from "./findRoomByUser.ts";
import { kickUserFromRoom } from "./kickUserFromRoom.ts";
import { leaveRoom } from "./leaveRoom.ts";
import { listRooms } from "./listRooms.ts";
import { moveUserToRoom } from "./moveUserToRoom.ts";
import { transferRoom } from "./transferRoom.ts";
import type { TLfgPersistenceContext } from "./types.ts";

export function getLfgPersistence(context: TLfgPersistenceContext): TLfgPersistence {
    return {
        changeRoomCode: (arg) => changeRoomCode(context, arg),
        createRoom: (arg) => createRoom(context, arg),
        disbandRoom: (arg) => disbandRoom(context, arg),
        findRoomByCode: (arg) => findRoomByCode(context, arg),
        findRoomByUser: (arg) => findRoomByUser(context, arg),
        kickUserFromRoom: (arg) => kickUserFromRoom(context, arg),
        leaveRoom: (arg) => leaveRoom(context, arg),
        listRooms: (arg) => listRooms(context, arg),
        moveUserToRoom: (arg) => moveUserToRoom(context, arg),
        transferRoom: (arg) => transferRoom(context, arg),
    };
}
