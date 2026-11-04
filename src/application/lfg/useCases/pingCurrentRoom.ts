import { ELfgResultKind, type TLfgUseCaseBase } from "../types.ts";

export const pingCurrentRoom: TLfgUseCaseBase<"pingCurrentRoom", "repositories.lfg.findRoomByUser"> = async function (
    dependencies,
    { guildId, user },
) {
    const room = await dependencies.repositories.lfg.findRoomByUser({ guildId, userId: user.id });
    if (!room) {
        return { kind: ELfgResultKind.NOT_IN_A_ROOM };
    }
    return { kind: ELfgResultKind.ROOM_PINGED, value: { room } };
};
