import { ELfgResultKind } from "../types.ts";
import type { TLfgUseCaseArgs, TLfgUseCaseDependencies } from "../types.ts";

export async function status(dependencies: TLfgUseCaseDependencies, { guildId }: TLfgUseCaseArgs["status"]) {
    return {
        kind: ELfgResultKind.ROOMS_LISTED,
        value: { rooms: await dependencies.persistence.listRooms({ guildId }) },
    } as const;
}
