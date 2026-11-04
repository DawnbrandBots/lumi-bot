import { ELfgResultKind, type TLfgUseCaseBase } from "../types.ts";

export const pingRoom: TLfgUseCaseBase<"pingRoom", "repositories.lfg.findRoomByCode"> = async function (
    dependencies,
    { guildId, code },
) {
    const room = await dependencies.repositories.lfg.findRoomByCode({ guildId, code });
    if (!room) return { kind: ELfgResultKind.ROOM_NOT_FOUND, value: { code } };
    return { kind: ELfgResultKind.ROOM_PINGED, value: { room } };
};
