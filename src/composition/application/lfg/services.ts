import type { TLfgPersistence } from "../../../application/lfg/persistence.types.ts";
import { changeRoomCodeInRoom } from "../../../application/lfg/services/changeRoomCodeInRoom.ts";
import { getOwnedRoom } from "../../../application/lfg/services/getOwnedRoom.ts";
import { kickFromRoom } from "../../../application/lfg/services/kickFromRoom.ts";
import { removePlayerFromRoom } from "../../../application/lfg/services/removePlayerFromRoom.ts";
import { transferRoom } from "../../../application/lfg/services/transferRoom.ts";
import type { TLfgDependencies, TLfgServices } from "../../../application/lfg/types.ts";

export function composeLfgServices(persistence: TLfgPersistence): TLfgServices {
    const getDependencies = (): TLfgDependencies => ({ persistence, services });
    const services: TLfgServices = {
        changeRoomCodeInRoom: (arg) => changeRoomCodeInRoom(getDependencies(), arg),
        getOwnedRoom: (arg) => getOwnedRoom(getDependencies(), arg),
        kickFromRoom: (arg) => kickFromRoom(getDependencies(), arg),
        removePlayerFromRoom: (arg) => removePlayerFromRoom(getDependencies(), arg),
        transferRoom: (arg) => transferRoom(getDependencies(), arg),
    };

    return services;
}
