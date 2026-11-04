import { ELfgResultKind, type TLfgUseCaseBase } from "../types.ts";

export const pingOwnedRoom: TLfgUseCaseBase<"pingOwnedRoom", "services.getOwnedRoom"> = async function (
    dependencies,
    { guildId, owner },
) {
    const result = await dependencies.services.getOwnedRoom({ guildId, owner });
    if (!result.success) return result.value;
    return { kind: ELfgResultKind.ROOM_PINGED, value: { room: result.value.room } };
};
