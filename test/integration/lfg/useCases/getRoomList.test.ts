import { describe, expect, test } from "vitest";
import { ELfgResultKind } from "../../../../src/application/lfg/types.ts";
import { getRoomList } from "../../../../src/application/lfg/useCases/getRoomList.ts";
import { GUILD_ID, OTHER_GUILD_ID, OWNER, PLAYER_1, PLAYER_2, PLAYER_3, useLfgUseCases } from "./shared.ts";

describe(getRoomList.name, () => {
    const lfg = useLfgUseCases();

    test("only displays rooms from the requested guild", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "one" });
        await lfg.useCases.createRoom({ guildId: OTHER_GUILD_ID, owner: PLAYER_1, code: "two" });

        const response = await lfg.useCases.getRoomList({ guildId: GUILD_ID });

        expect(response).toMatchObject({
            kind: ELfgResultKind.ROOM_LIST,
            value: [{ code: "one", ownerId: OWNER.id, playerIds: [OWNER.id] }],
        });
    });

    test("doens't list full rooms when omitFullRooms: true", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "one" });
        await lfg.useCases.movePlayerToRoomByCode({ guildId: GUILD_ID, code: "one", user: PLAYER_2 });
        const roomListBeforeRoomIsFull = await lfg.useCases.getRoomList({ guildId: GUILD_ID, omitFullRooms: true });
        expect(roomListBeforeRoomIsFull).toMatchObject({
            kind: ELfgResultKind.ROOM_LIST,
            value: [{ code: "one", ownerId: OWNER.id, playerIds: [OWNER.id, PLAYER_2.id] }],
        });

        await lfg.useCases.movePlayerToRoomByCode({ guildId: GUILD_ID, code: "one", user: PLAYER_3 });
        const roomListWhenRoomIsFull = await lfg.useCases.getRoomList({ guildId: GUILD_ID, omitFullRooms: true });
        expect(roomListWhenRoomIsFull).toMatchObject({ kind: ELfgResultKind.ROOM_LIST, value: [] });
    });
});
