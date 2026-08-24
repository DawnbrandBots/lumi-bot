import { ELfgResultKind } from "../types.ts";
import type { TLfgUseCaseBase } from "../types.ts";

export const disbandOwnedRoom: TLfgUseCaseBase<"disbandOwnedRoom", "services.getOwnedRoom" | "persistence.removeRoom"> =
    async function (dependencies, { guildId, owner }) {
        const result = await dependencies.services.getOwnedRoom({ guildId, owner });
        if (!result.success) {
            return result.value;
        }
        await dependencies.persistence.removeRoom({ roomId: result.value.room.id });
        return {
            kind: ELfgResultKind.ROOM_DISBANDED,
            value: { userId: result.value.room.ownerId, code: result.value.room.code },
        } as const;
    };
