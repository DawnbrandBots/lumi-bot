import type { TLfgPersistence } from "./persistence.types.ts";
import { changeRoomCodeInRoom } from "./services/changeRoomCodeInRoom.ts";
import { getOwnedRoom } from "./services/getOwnedRoom.ts";
import { kickFromRoom } from "./services/kickFromRoom.ts";
import { removePlayerFromRoom } from "./services/removePlayerFromRoom.ts";
import { transferRoom } from "./services/transferRoom.ts";
import type { TLfgServices } from "./types.ts";

export function getLfgServices(persistence: TLfgPersistence): TLfgServices {
    return {
        changeRoomCodeInRoom: (arg) => changeRoomCodeInRoom(persistence, arg),
        getOwnedRoom: (arg) => getOwnedRoom(persistence, arg),
        kickFromRoom: (arg) =>
            kickFromRoom(
                {
                    findRoomByUser: persistence.findRoomByUser,
                    removePlayerFromRoom: (removePlayerArg) => removePlayerFromRoom(persistence, removePlayerArg),
                },
                arg,
            ),
        removePlayerFromRoom: (arg) => removePlayerFromRoom(persistence, arg),
        transferRoom: (arg) => transferRoom(persistence, arg),
    };
}
