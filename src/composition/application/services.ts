import { changeRoomCodeInRoom } from "../../application/lfg/services/changeRoomCodeInRoom.ts";
import { getOwnedRoom } from "../../application/lfg/services/getOwnedRoom.ts";
import { kickFromRoom } from "../../application/lfg/services/kickFromRoom.ts";
import { removePlayerFromRoom } from "../../application/lfg/services/removePlayerFromRoom.ts";
import { transferRoom } from "../../application/lfg/services/transferRoom.ts";
import type { TLfgServices } from "../../application/lfg/types.ts";
import type { TApplicationRepositories } from "../../application/repositories.types.ts";
import { build } from "../utils/proxify.ts";

const SERVICES = {
    lfg: {
        changeRoomCodeInRoom,
        getOwnedRoom,
        kickFromRoom,
        removePlayerFromRoom,
        transferRoom,
    },
} as const;

export type TApplicationServices = {
    readonly lfg: TLfgServices;
};

export function composeServices({
    repositories,
}: {
    readonly repositories: TApplicationRepositories;
}): TApplicationServices {
    const dependencies = {
        repositories,
        get services() {
            return lfgServices;
        },
    };
    const lfgServices: TLfgServices = build(dependencies, SERVICES.lfg);
    return { lfg: lfgServices };
}
