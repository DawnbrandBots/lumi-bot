import { ELfgFeatureReturnKind } from "../../lfg/types.ts";
import type { TListLfgRooms, TLfgFeature } from "./types.ts";

export async function status(
    { listRooms }: { readonly listRooms: TListLfgRooms },
    { guildId }: Parameters<TLfgFeature["status"]>[0],
) {
    return {
        kind: ELfgFeatureReturnKind.ROOMS_LISTED,
        value: { rooms: await listRooms({ guildId }) },
    } as const;
}
