import { ELfgResultKind } from "../types.ts";
import type { TLfgUseCaseArgs, TLfgUseCaseDependencies } from "../types.ts";

export async function getLfgStatus(
    dependencies: TLfgUseCaseDependencies,
    { guildId }: TLfgUseCaseArgs["getLfgStatus"],
) {
    return {
        kind: ELfgResultKind.ROOMS_LISTED,
        value: { rooms: await dependencies.persistence.listRooms({ guildId }) },
    } as const;
}
