import { changeRoomCodeInRoom } from "./services/changeRoomCodeInRoom.ts";
import { getOwnedRoom } from "./services/getOwnedRoom.ts";
import { kickFromRoom } from "./services/kickFromRoom.ts";
import { removePlayerFromRoom } from "./services/removePlayerFromRoom.ts";
import { transferRoom } from "./services/transferRoom.ts";
import type { TLfgPersistence } from "./persistence.types.ts";
import type { TLfgApplicationDependencies } from "./types.ts";

export function getLfgApplicationDependencies(persistence: TLfgPersistence): TLfgApplicationDependencies {
    return {
        ...persistence,
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
