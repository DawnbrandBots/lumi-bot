import { ELfgResultKind } from "../types.ts";
import type { TLfgUseCaseBase } from "../types.ts";

export const leaveRoom: TLfgUseCaseBase<"leaveRoom", "persistence.findRoomByUser" | "services.removePlayerFromRoom"> =
    async function (dependencies, { guildId, user }) {
        const room = await dependencies.persistence.findRoomByUser({ guildId, userId: user.id });
        if (!room) {
            return { kind: ELfgResultKind.NOT_IN_A_ROOM } as const;
        }

        const removalResult = await dependencies.services.removePlayerFromRoom({ room, userId: user.id });
        return {
            kind: ELfgResultKind.ROOM_LEFT,
            value: { ...removalResult, code: room.code, userId: user.id },
        } as const;
    };
