import { ELfgResultKind } from "../types.ts";
import type { TGetLfgStatusArg, TLfgUseCaseDependencies } from "../types.ts";

export async function status(dependencies: TLfgUseCaseDependencies, { guildId }: TGetLfgStatusArg) {
    return {
        kind: ELfgResultKind.ROOMS_LISTED,
        value: { rooms: await dependencies.persistence.listRooms({ guildId }) },
    } as const;
}
