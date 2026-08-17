import { ELfgResultKind } from "../types.ts";
import type { TListLfgRooms, TGetLfgStatusArg } from "../types.ts";

export async function status({ listRooms }: { readonly listRooms: TListLfgRooms }, { guildId }: TGetLfgStatusArg) {
    return {
        kind: ELfgResultKind.ROOMS_LISTED,
        value: { rooms: await listRooms({ guildId }) },
    } as const;
}
