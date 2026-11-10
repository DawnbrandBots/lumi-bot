import type { TLfgUseCaseBase } from "../types.ts";
import { ELfgResultKind } from "../types.ts";

export const swapPlayers: TLfgUseCaseBase<
    "swapPlayers",
    "repositories.lfg.findRoomByUser" | "repositories.lfg.swapPlayers"
> = async function (dependencies, { guildId, firstUser, secondUser }) {
    if (firstUser.id === secondUser.id) {
        return { kind: ELfgResultKind.ATTEMPTED_TO_SWAP_THE_SAME_PLAYER };
    }

    const firstRoom = await dependencies.repositories.lfg.findRoomByUser({ guildId, userId: firstUser.id });
    const secondRoom = await dependencies.repositories.lfg.findRoomByUser({ guildId, userId: secondUser.id });

    if (!firstRoom && !secondRoom) {
        return { kind: ELfgResultKind.CANNOT_SWAP_TWO_PLAYERS_NOT_IN_A_ROOM };
    }

    if (firstRoom?.id === secondRoom?.id) {
        return { kind: ELfgResultKind.CANNOT_SWAP_PLAYERS_IN_SAME_ROOM };
    }

    const ownershipTransfers = await dependencies.repositories.lfg.swapPlayers({
        guildId,
        firstUserId: firstUser.id,
        secondUserId: secondUser.id,
    });

    return {
        kind: ELfgResultKind.PLAYERS_SWAPPED,
        value: {
            firstUserId: firstUser.id,
            secondUserId: secondUser.id,
            firstRoomCode: firstRoom?.code,
            secondRoomCode: secondRoom?.code,
            ownershipTransfers,
        },
    };
};
